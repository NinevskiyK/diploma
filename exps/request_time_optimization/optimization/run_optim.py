
from load_testing_sim.optimization.optimize import optimize_params, optimize_time
import json
import sys

if __name__ == '__main__':
    settings_file = sys.argv[1]
    dir_name = sys.argv[2]
    with open(settings_file, 'r') as f:
        settings = json.load(f)
    optimize_time(settings, dir_name)
