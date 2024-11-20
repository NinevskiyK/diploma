from dataclasses import dataclass
from typing import Literal, Dict

@dataclass(kw_only=True)
class LogBase:
    event: str
    time: float

@dataclass(kw_only=True)
class LogProcess(LogBase):
    event: str= 'process'
    name: str
    result: Literal['ok', 'fail']
    latency: float

@dataclass(kw_only=True)
class LogInfo(LogBase):
    event: str = 'info'
    info: Dict
