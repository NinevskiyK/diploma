import numpy as np
from scipy.stats import poisson


def wp_time(mean_time: int = 4):
    # return round(max(2, np.random.normal(loc=mean_time, scale=1, size=1)[0]))
    return mean_time

def request_time(rps_per_second):
    return poisson.rvs(1000/rps_per_second, size=1, random_state=42)[0]