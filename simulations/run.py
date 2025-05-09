from load_testing_sim import *
import time
import random

if __name__ == "__main__":
    # todo: random state
    dir_name = "logs/logs_" + time.strftime('%Y-%m-%d_%H:%M:%S') + "_" + str(random.randint(0, 100))

    kernel_settings = KernelSettings()
    wp_settings = SystemSettings(kernel_settings=kernel_settings)
    nginx_settings = BalancerSettings(kernel_settings=kernel_settings)
    haproxy_settings = BalancerSettings(kernel_settings=kernel_settings)
    stand_settings = StandSettings([wp_settings], [nginx_settings], haproxy_settings)
    stats = main(stand_settings, RequestSettings(), dir_name)
    print(stats)