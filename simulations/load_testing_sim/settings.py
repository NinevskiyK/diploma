from dataclasses import dataclass, field
from dataclasses_json import dataclass_json
from typing import List, Literal, Optional

@dataclass_json
@dataclass
class KernelSettings:
    kernel_queue_size: int = 0

@dataclass_json
@dataclass
class ProcessTime:
    mean_time: int
    std_dev: int
    dist_type: Literal['gamma', 'lognorm', 'weibull']

@dataclass_json
@dataclass
class SystemSettings:
    kernel_settings: KernelSettings
    process_time: ProcessTime
    core_num: int = 1
    queue_size: int = 1024
    max_conn: int = 1024
    timeout: int = 20000

@dataclass_json
@dataclass
class BalancerSettings:
    kernel_settings: KernelSettings
    queue_size: int = 20
    max_conn: int = 1024
    timeout: int = 30000

@dataclass_json
@dataclass
class StandSettings:
    wp_settings: List[SystemSettings]
    nginx_settings: List[BalancerSettings]
    haproxy_setting: BalancerSettings

@dataclass_json
@dataclass
class RequestSettings:
    max_users: Optional[int] = None
    new_users_per_step: List[int] = None
    step_time: int = 1000 * 10 * 60 // 200
    timeout: int = 10000
    type: Literal['opened', 'closed'] = 'opened'
    enable_tracing: bool = True

    def __post_init__(self):
        if self.new_users_per_step is None:
            self.new_users_per_step = [1] * self.max_users
