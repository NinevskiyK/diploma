from dataclasses import dataclass, field
from typing import List

@dataclass
class KernelSettings:
    kernel_queue_size: int = -1

@dataclass
class SystemSettings:
    kernel_settings: KernelSettings
    core_num: int = 1
    queue_size: int = 20
    timeout: int = 20000
    process_mean_time: int = 10

@dataclass
class BalancerSettings:
    kernel_settings: KernelSettings
    queue_size: int = 20
    timeout: int = 30000

@dataclass
class StandSettings:
    wp_settings: SystemSettings
    nginx_settings: BalancerSettings
    haproxy_setting: BalancerSettings
    server_num: int = 1

@dataclass
class RequestSettings:
    new_users_per_step: List[int] = field(default_factory=lambda: [1 for _ in range(300)])
    step_time: int = 1000 * 10 * 60 // 300
    timeout: int = 10000
