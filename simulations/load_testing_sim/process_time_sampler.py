import numpy as np
from scipy.stats import gamma, lognorm, weibull_min
from scipy.special import gamma as gamma_func

def wp_time(mean_time: float = 4, std_dev: float = 2, dist_type: str = 'gamma'):
    if dist_type == 'gamma':
        theta = std_dev**2 / mean_time
        k = mean_time / theta
        return round(gamma.rvs(k, scale=theta, size=1)[0])
    
    elif dist_type == 'lognorm':
        sigma_n2 = np.log((std_dev**2 / mean_time**2) + 1)
        mu_n = np.log(mean_time) - sigma_n2 / 2
        return round(lognorm.rvs(np.sqrt(sigma_n2), scale=np.exp(mu_n), size=1)[0])
    
    elif dist_type == 'weibull':
        k = 2.0
        lam = mean_time / gamma_func(1 + 1/k)
        return round(weibull_min.rvs(k, scale=lam, size=1)[0])
    
    else:
        raise ValueError("Unsupported distribution type.")

def request_time(rps_per_second):
    return poisson.rvs(1000/rps_per_second, size=1)[0]