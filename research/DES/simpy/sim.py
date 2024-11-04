import simpy
import click
import time

global_times = []

def user(env, service, latency):
    global global_times

    while True:
        arrive = env.now

        with service.request() as req:
            yield req
            yield env.timeout(latency)

            end = env.now
            global_times.append(end - arrive)

def source(env, number, service, latency):
    for _ in range(number):
        c = user(env, service, latency)
        env.process(c)

def run_experiment(number, latency, exp_time):
    env = simpy.Environment()
    service = simpy.Resource(env, capacity=1)
    source(env, number, service, latency)
    env.run(until=exp_time)

def process_results(number, exp_time):
    global global_times
    print(f'{number}: throughput: {len(global_times) / exp_time}, latency: {sum(global_times) / len(global_times)}')

def reset_counters():
    global global_times
    global_times = []

@click.command()
@click.argument('max-number', type=int)
@click.argument('exp_time', type=int)
@click.argument('latency', type=float)
def main(max_number, latency, exp_time):
    start = time.time()

    for i in range(1, max_number + 1):
        reset_counters()
        run_experiment(i, latency, exp_time)
        process_results(i, exp_time)

    print(f'Simulation time: {time.time() - start}')

if __name__ == "__main__":
    main()