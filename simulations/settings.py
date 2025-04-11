from dataclasses import dataclass, field
from typing import List

@dataclass
class KernelSettings:
    kernel_queue_size: int = 128

@dataclass
class SystemSettings:
    kernel_settings: KernelSettings
    core_num: int = 1
    queue_size: int = 1024
    timeout: int = 2000
    process_mean_time: int = 100

@dataclass
class BalancerSettings:
    kernel_settings: KernelSettings
    queue_size: int = 10
    max_conn: int = 20
    timeout: int = 3000

@dataclass
class StandSettings:
    wp_settings: SystemSettings
    nginx_settings: BalancerSettings
    haproxy_setting: BalancerSettings
    server_num: int = 1

@dataclass
class RequestSettings:
    new_users_per_step: List[int] = field(default_factory=lambda: [1 for _ in range(30)])
    step_time: int = 1000 * 10 * 60 // 30
    timeout: int = 1000
