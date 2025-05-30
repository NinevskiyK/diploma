import json
import logging
import os
import numpy as np
import random
from typing import List, Union
from .settings import *

import simpy
import tqdm

from .framework.simple import Request, User, System, Queue, Balancer, SharedData, Service
from .process_time_sampler import wp_time, request_time

import resource, sys
resource.setrlimit(resource.RLIMIT_STACK, (2**29,-1))
sys.setrecursionlimit(10**6)

def create_shared_data(env: simpy.Environment, logger: logging.Logger, debug_logger: logging.Logger):
    return SharedData(env, logger, debug_logger)

def create_system(wp_settings: SystemSettings, balancer_settings: BalancerSettings, shared_data: SharedData):
    process_time = lambda: wp_time(mean_time=wp_settings.process_time.mean_time, std_dev=wp_settings.process_time.std_dev, dist_type=wp_settings.process_time.dist_type)
    wp = System(queue=Queue(wp_settings.queue_size + wp_settings.kernel_settings.kernel_queue_size, resource=simpy.Resource(shared_data.env)), process_timeout=wp_settings.timeout, process_time=process_time, shared_data=shared_data, core_num=wp_settings.core_num)
    nginx = Balancer(max_conn=balancer_settings.max_conn, shared_data=shared_data, timeout=balancer_settings.timeout, queue=Queue(capacity=balancer_settings.queue_size + balancer_settings.kernel_settings.kernel_queue_size, resource=simpy.Resource(shared_data.env, capacity=balancer_settings.queue_size)), process_timeout=balancer_settings.timeout, services=[wp])
    return nginx

def create_balancer(balancer_settings: BalancerSettings, services: List[Service], shared_data: SharedData):
    balancer = Balancer(max_conn=balancer_settings.max_conn, timeout=balancer_settings.timeout, queue=Queue(balancer_settings.queue_size + balancer_settings.kernel_settings.kernel_queue_size, resource=simpy.Resource(shared_data.env, capacity=balancer_settings.queue_size)), process_timeout=balancer_settings.timeout, services=services, shared_data=shared_data)
    return balancer

def create_stand(shared_data: SharedData, stand_settings: StandSettings):
    systems = [create_system(wp_setting, nginx_settings, shared_data) for wp_setting, nginx_settings in zip(stand_settings.wp_settings, stand_settings.nginx_settings)]
    haproxy = create_balancer(stand_settings.haproxy_setting, systems, shared_data)
    return haproxy

def create_logger(log_file):
    logger = logging.getLogger(log_file)
    logger.setLevel(logging.INFO)
    fh = logging.FileHandler(log_file)
    fh.setLevel(logging.INFO)
    fh.setFormatter(logging.Formatter(fmt='%(message)s'))
    logger.addHandler(fh)
    return logger

def run_steps(request_settings: RequestSettings, system: Union[System, Balancer], shared_data: SharedData, rps_per_second=1):
    if request_settings.type == 'opened':
        request_settings.new_users_per_step = np.cumsum(request_settings.new_users_per_step)
    num = 1
    for i in tqdm.tqdm(request_settings.new_users_per_step):
        if request_settings.type == 'closed':
            for _ in range(i):
                user = User(shared_data=shared_data, service=system, timeout=request_settings.timeout, name='user', request_time=lambda: request_time(rps_per_second))
                num += 1
                shared_data.env.process(user.request_many(request=Request(name=f"request", shared_data=shared_data, enable_tracing=request_settings.enable_tracing)))
                yield shared_data.env.timeout(request_settings.step_time)
        else:
            for seconds in range(request_settings.step_time // 1000):
                for j in range(i):
                    user = User(shared_data=shared_data, service=system, timeout=request_settings.timeout, name='user', request_time=lambda: request_time(rps_per_second))
                    shared_data.env.process(user.request(request=Request(name=f"request", shared_data=shared_data, enable_tracing=request_settings.enable_tracing), pre_wait=random.randint(0, 1000)))
                yield shared_data.env.timeout(1000)

def run_simulation(dir_name, stand_settings: StandSettings, request_settings: RequestSettings):
    with open(f"{dir_name}/settings.json", "w") as f:
        json.dump({"stand_settings": stand_settings.to_dict(), "request_settings": request_settings.to_dict()}, f)

    log_file = f'{dir_name}/simulation.log'
    debug_log_file = f'{dir_name}/debug.log'
    logger = create_logger(log_file)
    debug_logger = create_logger(debug_log_file)
    logger.info('RUN\tstand\tlinearrequestrategrowrun\t0\t\t3.1.2')

    env = simpy.Environment()

    shared_data = create_shared_data(env, logger, debug_logger)
    system = create_stand(shared_data, stand_settings)

    env.process(run_steps(request_settings, system, shared_data))
    env.run(until=request_settings.step_time * len(request_settings.new_users_per_step))


def main(stand_settings: StandSettings, request_settings: RequestSettings, dir_name):
    os.makedirs(dir_name, exist_ok=True)
    run_simulation(dir_name, stand_settings, request_settings)