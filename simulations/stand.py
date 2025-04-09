import logging
import os
import time
from typing import List, Union
import random
from settings import *

import simpy
import tqdm

from framework.simple import Request, User, System, Queue, Balancer, SharedData, Service, KernelQueue
from process_time_sampler import wp_time, request_time
from framework.stats import get_stats

import resource, sys
resource.setrlimit(resource.RLIMIT_STACK, (2**29,-1))
sys.setrecursionlimit(10**6)

DIR_NAME = "logs/logs_"

def create_shared_data(env: simpy.Environment, logger: logging.Logger, debug_logger: logging.Logger):
    return SharedData(env, logger, debug_logger)

def create_system(wp_settings: SystemSettings, balancer_settings: BalancerSettings, shared_data: SharedData):
    kernel_queue = KernelQueue(capacity=wp_settings.kernel_settings.kernel_queue_size) # should be shared
    wp = System(kernel_queue=kernel_queue, queue=Queue(wp_settings.queue_size, resource=simpy.Resource(shared_data.env)), process_timeout=wp_settings.timeout, process_time=lambda: wp_time(wp_settings.process_mean_time), shared_data=shared_data, core_num=wp_settings.core_num)
    nginx = Balancer(shared_data=shared_data, timeout=balancer_settings.timeout, kernel_queue=kernel_queue, queue=Queue(capacity=balancer_settings.queue_size, resource=simpy.Resource(shared_data.env, capacity=balancer_settings.queue_size)), process_timeout=balancer_settings.timeout, services=[wp])
    return nginx

def create_balancer(balancer_settings: BalancerSettings, services: List[Service], shared_data: SharedData):
    balancer = Balancer(timeout=balancer_settings.timeout, kernel_queue=KernelQueue(capacity=balancer_settings.kernel_settings.kernel_queue_size), queue=Queue(balancer_settings.queue_size, resource=simpy.Resource(shared_data.env, capacity=balancer_settings.queue_size)), process_timeout=balancer_settings.timeout, services=services, shared_data=shared_data)
    return balancer

def create_stand(shared_data: SharedData, stand_settings: StandSettings):
    systems = [create_system(stand_settings.wp_settings, stand_settings.nginx_settings, shared_data) for _ in range(stand_settings.server_num)]
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
    num = 1
    for i in tqdm.tqdm(request_settings.new_users_per_step):
        for _ in range(i):
            user = User(shared_data=shared_data, service=system, timeout=request_settings.timeout, name='user', request_time=lambda: request_time(rps_per_second))
            num += 1
            shared_data.env.process(user.request_many(request=Request(name=f"request", shared_data=shared_data)))
            yield shared_data.env.timeout(request_settings.step_time)

def run_simulation(dir_name, stand_settings: StandSettings, request_settings: RequestSettings):
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


def main(stand_settings: StandSettings, request_settings: RequestSettings):
    global DIR_NAME
    dir_name = DIR_NAME

    dir_name += time.strftime('%Y-%m-%d_%H:%M:%S') + "_" + str(random.randint(0, 100))
    os.makedirs(dir_name, exist_ok=True)
    run_simulation(dir_name, stand_settings, request_settings)
    return get_stats(f'{dir_name}/simulation.log')

if __name__ == "__main__":
    kernel_settings = KernelSettings()
    wp_settings = SystemSettings(kernel_settings=kernel_settings)
    nginx_settings = BalancerSettings(kernel_settings=kernel_settings)
    haproxy_settings = BalancerSettings(kernel_settings=kernel_settings)
    stand_settings = StandSettings(wp_settings, nginx_settings, haproxy_settings)
    stats = main(stand_settings, RequestSettings())
    print(stats)