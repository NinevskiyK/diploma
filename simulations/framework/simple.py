from dataclasses import dataclass
import json
import logging
import simpy

import numpy as np

from .logs import LogProcess


Latency = float

@dataclass
class Queue:
    capacity: int # -1 means unbounded
    resource: simpy.Resource

@dataclass
class SimpleSystem:
    process_time: float
    env: simpy.Environment
    queue: Queue
    timeout: float
    logger: logging.Logger

    def process_request(self, name: str):
        if self.queue.resource.count == self.queue.capacity:
            log = LogProcess(name=name, time=self.env.now, result='fail', latency=0)
            self.logger.info(json.dumps(log.__dict__))
        now = self.env.now
        with self.queue.resource.request() as req:
            results = yield req | self.env.timeout(self.timeout - self.process_time)
            if req in results:
                yield self.env.timeout(self.process_time)
                log = LogProcess(name=name, time=self.env.now, result='ok', latency=self.env.now - now)
                self.logger.info(json.dumps(log.__dict__))
            else:
                log = LogProcess(name=name, time=self.env.now, result='fail', latency=self.timeout)
                self.logger.info(json.dumps(log.__dict__))

@dataclass
class SimpleUser:
    system: SimpleSystem
    req_count_in_sec: int
    name: str

    def request(self, request_name):
        yield self.system.env.timeout(np.random.exponential(scale=1_000 / self.req_count_in_sec))
        self.system.env.process(self.system.process_request(f"client: {self.name}, request: {request_name}"))
