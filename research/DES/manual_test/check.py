import random
import time

from threading import Thread, Event
import click
import requests

def make_request(url):
    query = random.choice(["get", "insert"])
    if query == "get":
        requests.get("{}/get/key".format(url))
    else:
        requests.post("{}/insert/key?value=value".format(url))

global_times = []

def user(start: Event, end: Event, url):
    start.wait()

    times = []
    while True:
        start_time = time.time()
        make_request(url)
        if not end.is_set():
            times.append(time.time() - start_time)
        else:
            break

    global global_times
    global_times += times

def run_experiment(count, epoch, url):
    threads = []
    start = Event()
    end = Event()

    for _ in range(count):
        t = Thread(target=user, args=(start, end, url))
        t.start()
        threads.append(t)

    start.set()
    time.sleep(epoch)
    end.set()

    for t in threads:
        t.join()

def process_results(number, exp_time):
    global global_times
    print(f'{number}: throughput: {len(global_times) / exp_time}, latency: {sum(global_times) / len(global_times)}')


def reset_counters():
    global global_times
    global_times = []

@click.command()
@click.argument("max-number", type=int)
@click.argument("exp-time", type=int)
@click.argument("url", type=str)
def run(max_number, exp_time, url):
    for i in range(1, max_number + 1):
        reset_counters()
        run_experiment(i, exp_time, url)
        process_results(i, exp_time)

if __name__ == "__main__":
    run()
