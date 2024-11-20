import json
import logging
import os
import time

import tqdm
import simpy
import numpy as np
import matplotlib.pyplot as plt

from framework.simple import SimpleSystem, Queue
from framework.logs import LogInfo, LogProcess

DIR_NAME = "logs/spherical_logs_"

def run(epoch_count: int, env: simpy.Environment, logger: logging.Logger, req_count_in_sec: int, timeout: float, process_time: float):
    queue = Queue(capacity=-1, resource=simpy.Resource(env))
    system = SimpleSystem(process_time=process_time, env=env, queue=queue, timeout=timeout, logger=logger)

    log = LogInfo(time=env.now, info={'event': 'info', 'epoch_count': epoch_count, 'req_count_in_sec': req_count_in_sec, 'timeout': timeout, 'process_time': process_time})
    logger.info(json.dumps(log.__dict__))

    for epoch in range(epoch_count):
        for i in range(req_count_in_sec):
            env.process(system.process_request(f"epoch: {epoch}, num: {i}"))
            yield env.timeout(np.random.exponential(scale=1_000 / req_count_in_sec))

def run_simulation():
    for i in tqdm.tqdm(range(1, 159)):
        logger = logging.getLogger(f'{i} per second')
        logger.setLevel(logging.INFO)
        fh = logging.FileHandler(f'{DIR_NAME}/{i}_per_second.json')
        fh.setLevel(logging.INFO)
        logger.addHandler(fh)

        env = simpy.Environment()
        env.process(run(120, env, logger, i, 200, 10))
        env.run()

def make_graph1():
    timeout = 0
    process_time = 0

    loads = []
    avg_latencies = []
    p95_latencies = []
    fails = []
    for i in tqdm.tqdm(range(1, 150)):
        logs = []
        with open(f'{DIR_NAME}/{i}_per_second.json', 'r') as f:
            for l in f.readlines():
                logs.append(json.loads(l))

        info = LogInfo(**logs[0]).info

        timeout = info["timeout"]
        process_time = info["process_time"]

        loads.append(info["req_count_in_sec"])

        latencies = []
        num_fails = 0
        for l in logs[1:]:
            log = LogProcess(**l)
            if log.result == 'fail':
                num_fails += 1
            else:
                latencies.append(log.latency)

        avg_latencies.append(np.average(latencies))
        p95_latencies.append(np.percentile(latencies, 95))
        fails.append(num_fails)

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 10))

    ax1.grid()
    ax2.grid()

    ax1.plot(loads, avg_latencies, color='blue', label='avg latency')
    ax1.plot(loads, p95_latencies, '--', color='blue', label='p95 latency')

    ax2.plot(loads, fails, color='red', label='fails')

    ax1.set_title('Latencies')
    ax1.set_xlabel('load (1/s)')
    ax1.set_ylabel('latency (ms)')
    ax1.scatter([], [], color="w", alpha=0, label=f'timeout: {timeout}ms, process_time: {process_time}ms')
    ax1.legend()

    ax2.set_title('Fails')
    ax2.set_xlabel('load (1/s)')
    ax2.set_ylabel('Fails num')
    ax2.scatter([], [], color="w", alpha=0, label=f'timeout: {timeout}ms, process_time: {process_time}ms')
    ax2.legend()

    plt.suptitle("simple system under different load")

    plt.savefig(f'{DIR_NAME}/graph1.png')


if __name__ == "__main__":
    DIR_NAME += time.strftime('%Y-%m-%d_%H:%M:%S')
    os.makedirs(DIR_NAME)
    run_simulation()
    make_graph1()