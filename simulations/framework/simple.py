from dataclasses import dataclass, field
import inspect
from typing import Callable, List, Literal, Union
import logging
import simpy

from abc import ABC, abstractmethod

from . import logs
 
@dataclass
class Queue:
    capacity: int # -1 means unbounded
    resource: simpy.Resource

@dataclass
class KernelQueue:
    capacity: int # -1 means unbounded
    queue: List = field(default_factory= lambda: [])

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
        return
        # self.shared_data.debug_logger.info(f"on {self.shared_data.env.now} [{self.calling_function()}] [{self.name}_{self.number}]: {message}")

@dataclass
class WithKernelQueue(ABC):
    kernel_queue: KernelQueue

    def add_to_kernel_queue(self, request: Request):
        if len(self.kernel_queue.queue) == self.kernel_queue.capacity:
            request.log_debug("KO as no space in kernel queue") 
            yield from request.user.response(request, 'KO')
        else:
            request.log_debug("append") 
            self.kernel_queue.queue.append(request)

    def on_request_done(self):
        if len(self.kernel_queue.queue) > 0:
            request: Request = self.kernel_queue.queue.pop(0)
            request.log_debug("poped from kernel queue!")
            yield from self.process_request(request)
    
    @abstractmethod
    def process_request(self, request: Request):
        pass

@dataclass
class Service(WithKernelQueue):
    queue: Queue
    process_timeout: int
    shared_data: SharedData

    @abstractmethod
    def process_(self, request: Request):
        pass

    def process_request(self, request: Request):
        request.log_debug("Got request to process!")
        if self.queue.resource.count == self.queue.capacity:
            yield from self.add_to_kernel_queue(request)
        else:
            with self.queue.resource.request() as req:
                results = yield req | self.shared_data.env.timeout(self.process_timeout)
                if req in results:
                    request.log_debug("processing request!")
                    yield from self.process_(request)
                    request.log_debug("processed request!")
                    result = 'OK'
                else:
                    request.log_debug("KO as timeout")
                    result = 'KO'
            yield from request.user.response(request, result)
            yield from self.on_request_done()

@dataclass
class System(Service):
    process_time: Callable

    core_num: int = 1

    def process_(self, _: Request):
        yield self.shared_data.env.timeout(self.process_time() // self.core_num)

# todo: add another per server queue
@dataclass
class Balancer(Service):
    timeout: int

    @dataclass
    class RoundRobinStrategy:
        servers_count: int
        last_server: int = 0

        def get_server(self):
            self.last_server += 1
            self.last_server %= self.servers_count
            return self.last_server

    services: List[Service]
    strategy_type: Literal['Round-Robin'] = 'Round-Robin'

    def __post_init__(self):
        self.strategy = self.RoundRobinStrategy(len(self.services))

    def process_(self, request: Request):
        request.log_debug("balancer")
        system_num = self.strategy.get_server()
        system = self.services[system_num]

        yield self.shared_data.env.process(system.process_request(request)) | self.shared_data.env.timeout(self.timeout)
        request.log_debug("KO as timeout on balancer")
        yield from request.user.response(request, 'KO')

@dataclass
class User:
    shared_data: SharedData
    service: Union[Service]
    name: str
    request_time: Callable
    timeout: int
    last_response_time: int = 0

    number = 1

    def request(self, request: Request):
        self.request_done = self.shared_data.env.event()
        self.last_response_time = self.shared_data.env.now
        self.number = User.number
        User.number += 1
        request.number = self.number

        self.shared_data.logger.info(logs.LogUser(start_time=self.last_response_time, end_time=self.last_response_time, name=self.name, number=self.number, type='START'))
        yield self.shared_data.env.timeout(2) # network

        request.user = self
        request.start_time = self.shared_data.env.now

        request.log_debug("sending to processing with timeout " + str(self.timeout))
        self.shared_data.env.process(self.service.process_request(request))
        res = yield self.shared_data.env.timeout(self.timeout) | self.request_done
        if self.request_done not in res:
            request.log_debug("KO as timeout on client")
            yield from request.user.response(request, 'KO')

    def response(self, request: Request, result: Literal['OK', 'KO']):
        request.log_debug(f"got {result} as a result")
        yield self.shared_data.env.timeout(2) # network

        if request.end_time is not None:
            return # duplicate
        
        self.request_done.succeed()
        request.log_debug(f"{result} if first")
        request.result = result
        request.end_time = self.shared_data.env.now
        request.log()
        self.shared_data.logger.info(logs.LogUser(start_time=self.last_response_time, end_time=self.shared_data.env.now, name=self.name, number=request.number, type='END'))

    def request_many(self, request: Request):
        while True:
            request_ = Request(request.name, request.shared_data)
            yield from self.request(request_)
            yield self.shared_data.env.timeout(self.request_time())
