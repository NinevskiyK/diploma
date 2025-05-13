from dataclasses import dataclass, field
import inspect
from typing import Callable, List, Literal, Union
import logging
import simpy
import simpy.events

from abc import ABC, abstractmethod

from . import logs
 
@dataclass
class Queue:
    capacity: int # -1 means unbounded
    resource: simpy.Resource

@dataclass
class SharedData:
    env: simpy.Environment
    logger: logging.Logger
    debug_logger: logging.Logger

@dataclass
class Request:
    name: str
    shared_data: SharedData
    number: int = None
    start_time: int = None
    end_time: int = None
    result: Literal['OK', 'KO'] = None
    user: 'User' = None
    cancelled: simpy.events.Event = None
    enable_tracing: bool = False

    def log(self):
        self.shared_data.logger.info(logs.LogRequest(start_time=self.start_time, end_time=self.end_time, user=self.user.number, result=self.result, name=self.name))

    @staticmethod
    def calling_function():
        stack = inspect.stack()
        if len(stack) > 2:
            caller_frame = stack[2]
            caller_name = caller_frame.function
            caller_locals = caller_frame.frame.f_locals
            instance = str(caller_locals.get('self', None))
            instance = instance[:instance.find('(')]
            return f"{instance}.{caller_name}"
        else:
            return "__global__"

    def log_debug(self, message):
        if self.enable_tracing:
            self.shared_data.debug_logger.info(f"on {self.shared_data.env.now} [{self.calling_function()}] [{self.name}_{self.number}]: {message}")

@dataclass
class Service:
    queue: Queue
    process_timeout: int
    shared_data: SharedData

    @abstractmethod
    def process_(self, request: Request):
        pass

    def process_request(self, request: Request):
        request.log_debug("Got request to process!")
        if self.queue.resource.count == self.queue.capacity:
            request.log_debug("KO as no space in queue")
            yield from request.user.response(request, 'KO')
        else:
            with self.queue.resource.request() as req:
                request.log_debug("started waiting in the queue")
                results = yield req | self.shared_data.env.timeout(self.process_timeout) | request.cancelled
                result = None
                if req in results:
                    request.log_debug("processing request!")
                    yield from self.process_(request)
                    request.log_debug("processed request!")
                elif request.cancelled in results:
                    request.log_debug("stopping waiting as cancelled")
                else:
                    request.log_debug("KO as timeout")
                    result = 'KO'
            if result is not None:
                yield from request.user.response(request, result)

@dataclass
class System(Service):
    process_time: Callable

    core_num: int = 1

    def process_(self, request: Request):
        request.log_debug("started processing")
        yield self.shared_data.env.timeout(self.process_time() // self.core_num)
        request.log_debug("processed")
        yield from request.user.response(request, 'OK')
        request.log_debug("OK as processed")

# todo: add another per server queue
@dataclass
class Balancer(Service):
    timeout: int
    max_conn: int
    services: List[Service]
    strategy_type: Literal['Round-Robin'] = 'Round-Robin'
    conn_num: int = 0

    @dataclass
    class RoundRobinStrategy:
        servers_count: int
        last_server: int = 0

        def get_server(self):
            self.last_server += 1
            self.last_server %= self.servers_count
            return self.last_server

    def __post_init__(self):
        self.strategy = self.RoundRobinStrategy(len(self.services))

    def wait_for_results(self, request: Request, system: Service):
        request.log_debug("sending request to system")
        timeout = self.shared_data.env.timeout(self.timeout)
        req = yield self.shared_data.env.process(system.process_request(request)) | timeout
        if timeout in req:
            # TODO: timeout in processing?
            request.log_debug("KO as timeout on balancer")
            yield from request.user.response(request, 'KO')
        self.conn_num -= 1

    def process_(self, request: Request):
        request.log_debug("balancer")
        # TODO: перенести в service
        if self.conn_num == self.max_conn:
            request.log_debug("KO as max_conn exeeded")
            # yield from request.user.response(request, 'KO')
            return

        self.conn_num += 1
        system_num = self.strategy.get_server()
        system = self.services[system_num]
        yield self.shared_data.env.timeout(2 + 2) # network + processing
        self.shared_data.env.process(self.wait_for_results(request, system))


@dataclass
class User:
    shared_data: SharedData
    service: Union[Service]
    name: str
    request_time: Callable
    timeout: int

    number = 1

    def request(self, request: Request, pre_wait: int = 0):
        yield self.shared_data.env.timeout(pre_wait)
        self.request_done = self.shared_data.env.event()
        request.cancelled = self.shared_data.env.event()

        self.number = User.number
        User.number += 1
        request.number = self.number
        request.user = self
        request.start_time = self.shared_data.env.now

        self.shared_data.logger.info(logs.LogUser(start_time=request.start_time, end_time=request.start_time, name=self.name, number=self.number, type='START'))
        yield self.shared_data.env.timeout(2) # network

        request.log_debug("sending to processing with timeout " + str(self.timeout))
        self.shared_data.env.process(self.service.process_request(request))

        res = yield self.shared_data.env.timeout(self.timeout) | self.request_done
        if self.request_done not in res:
            request.log_debug("KO as timeout on client")
            yield from request.user.response(request, 'KO')

    def cancel(self, request: Request):
        yield self.shared_data.env.timeout(2)
        request.cancelled.succeed()

    def response(self, request: Request, result: Literal['OK', 'KO']):
        request.log_debug(f"got {result} as a result")
        yield self.shared_data.env.timeout(2) # network

        if request.end_time is not None:
            request.log_debug(f"{result} is not first")
            return # duplicate
        
        self.request_done.succeed()
        request.log_debug(f"{result} is first")
        request.result = result
        request.end_time = self.shared_data.env.now
        request.log()
        self.shared_data.logger.info(logs.LogUser(start_time=request.start_time, end_time=self.shared_data.env.now, name=self.name, number=request.number, type='END'))

        if result == 'KO':
            self.shared_data.env.process(self.cancel(request))

    def request_many(self, request: Request):
        while True:
            request_ = Request(request.name, request.shared_data)
            yield from self.request(request_)
            wait_time = self.request_time()
            wait_time -= request_.end_time - request_.start_time
            wait_time = max(0, wait_time)
            request_.log_debug(f"User is waiting {wait_time} before sending another request")
            yield self.shared_data.env.timeout(wait_time)
