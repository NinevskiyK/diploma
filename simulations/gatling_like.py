import json
import logging
import os
import time
from typing import List
import itertools

import tqdm
import simpy
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
# sns.set_theme()
from  matplotlib.colors import LinearSegmentedColormap

from framework.simple import SimpleUser, SimpleSystem, Queue
from framework.logs import LogInfo, LogProcess

DIR_NAME = "logs/logs_"

def add_user(user: SimpleUser):
    for i in range(1, 10000):
        for y in user.request(f"{i}"):
            yield y


def add_users(epoch: int, user_count: int, req_count_in_sec: int, system: SimpleSystem):
    log = LogInfo(time=system.env.now, info={'event': 'info', 'user_count': user_count, 'req_count_in_sec': req_count_in_sec, 'timeout': system.timeout, 'process_time': system.process_time})
    system.logger.info(json.dumps(log.__dict__))

    for i in range(user_count):
        user = SimpleUser(system, req_count_in_sec, f"epoch_{epoch}_user_{i}")
        system.env.process(add_user(user))


def run_steps(steps: List[int], epoch_duration: float, req_count_in_sec: int, system: SimpleSystem):
    for i, s in enumerate(tqdm.tqdm(steps)):
        add_users(i, s, req_count_in_sec, system)
        yield system.env.timeout(epoch_duration)


def create_system(env: simpy.Environment, logger: logging.Logger, process_time: float, timeout: float):
    queue = Queue(capacity=-1, resource=simpy.Resource(env))
    return SimpleSystem(process_time=process_time, env=env, queue=queue, timeout=timeout, logger=logger)


def create_user(system: SimpleSystem, req_count_in_sec: int, name: str):
    return SimpleUser(system, req_count_in_sec, name)


def create_logger(log_file):
    logger = logging.getLogger("logger")
    logger.setLevel(logging.INFO)
    fh = logging.FileHandler(log_file)
    fh.setLevel(logging.INFO)
    logger.addHandler(fh)
    return logger


def run_simulation():
    log_file = f'{DIR_NAME}/logs.json'
    logger = create_logger(log_file)

    env = simpy.Environment()

    system = create_system(env, logger, 10, 200)

    env.process(run_steps([1, 5, 10, 20, 50, 100], 5*60*1000, 1, system))
    env.run(until=5*60*1000*6 + 1)
    log = LogInfo(time=env.now, info={'event': 'info', 'user_count': 0, 'req_count_in_sec': 1, 'timeout': system.timeout, 'process_time': system.process_time})
    system.logger.info(json.dumps(log.__dict__))

def agg_events(events, agg_by):
    events = np.array(events)
    I = np.where(events[:-1,0]//agg_by != events[1:,0]//agg_by)[0] + 1
    splitted = np.split(events, I)

    seconds = []
    fails = []
    latencies = []

    for s in splitted:
        seconds.append(s[0,0]//1000)
        latencies.append(s[:,1])
        fails.append(s[:,2].sum())

    return seconds, fails, latencies

def agg_info(info):
    info = np.array(info)
    info[:,1] = np.cumsum(info[:,1])

    info[:,1] = np.roll(info[:,1], 1)

    info[0,0] = 0
    info[0,1] = 0

    return info

def draw_graph(notes, events, info, agg_by=30_000):
    fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(10, 10), sharex=True)

    seconds, fails, latencies = agg_events(events, agg_by)
    info = agg_info(info)

    ax1.grid()
    ax2.grid()
    ax3.grid()

    ax1.plot(seconds, fails, color='red', label='fails')
    ax1.set_title('Fails')
    ax1.set_xlabel('time')
    ax1.set_ylabel('Num of fails')

    for note in notes:
        ax1.scatter([], [], color="w", alpha=0, label=note)
        ax1.legend()

    ax1.legend()

    quantiles = [0, 0.1, 0.25, 0.5, 0.75, 0.8, 0.85, 0.9, 0.95, 0.99, 1]
    latencies_by_quantiles = []
    for l in latencies:
        latencies_by_quantiles.append(np.quantile(l, quantiles))

    latencies_by_quantiles = np.stack(latencies_by_quantiles).T

    latencies_by_quantiles = np.log(latencies_by_quantiles)

    cmap=LinearSegmentedColormap.from_list('rg',["g", "y", "r"], N=len(quantiles))
    for lat, lab, col in zip(latencies_by_quantiles, [f"{i*100}%" for i in quantiles], cmap([i for i in range(len(quantiles))])):
        ax2.plot(seconds, lat, label=lab, color=col)
    ax2.set_title('Latencies by quantiles (log)')
    ax2.set_xlabel('time')
    ax2.set_ylabel('Latency')
    ax2.legend(loc='upper left')

    ax3.step(info[:,0]//1000, info[:,1], color='green', label='user count')
    ax3.legend()

    plt.suptitle("simple system under load growth")

    plt.savefig(f'{DIR_NAME}/graph1.png')

def make_graph1():
    timeout = 0
    process_time = 0
    req_count_in_sec = 0

    events = [] # (time, latency, fail?)
    infos = [] # (time, user_added)

    def logs():
        with open(f'{DIR_NAME}/logs.json', 'r') as f:
            for l in f.readlines():
                yield json.loads(l)

    for l in tqdm.tqdm(logs()):
        if l["event"] == "info":
            info = LogInfo(**l)
            tm = info.time
            info = info.info

            timeout = info["timeout"]
            process_time = info["process_time"]
            req_count_in_sec = info["req_count_in_sec"]
            user_count = info["user_count"]

            infos.append([tm, user_count])
        else:
            process = LogProcess(**l)
            events.append([process.time, process.latency, process.result == 'fail'])

    notes = [f"timeout: {timeout}", f"process_time: {process_time}", f"req_count_in_sec: {req_count_in_sec}"]
    draw_graph(notes, events, infos)


if __name__ == "__main__":
    DIR_NAME += time.strftime('%Y-%m-%d_%H:%M:%S')
    # DIR_NAME += "test"
    os.makedirs(DIR_NAME, exist_ok=True)
    run_simulation()
    make_graph1()