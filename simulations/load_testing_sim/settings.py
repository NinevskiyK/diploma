from dataclasses import dataclass, field
from dataclasses_json import dataclass_json
from typing import List, Literal

@dataclass_json
@dataclass
class KernelSettings:
    kernel_queue_size: int = 0

@dataclass_json
@dataclass
class SystemSettings:
    kernel_settings: KernelSettings
    core_num: int = 1
    queue_size: int = 1024
    max_conn: int = 1024
    timeout: int = 20000
    process_mean_time: int = 10

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
    new_users_per_step: List[int] = field(default_factory=lambda: [1 for _ in range(200)])
    step_time: int = 1000 * 10 * 60 // 200
    timeout: int = 10000
    type: Literal['opened', 'closed'] = 'opened'
