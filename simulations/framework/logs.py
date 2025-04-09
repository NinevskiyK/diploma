from dataclasses import dataclass
from typing import Literal

@dataclass(kw_only=True)
class LogBase:
    event: str
    start_time: int
    end_time: int

@dataclass(kw_only=True)
class LogRequest(LogBase):
    event: str='REQUEST'
    user: int
    name: str
    result: Literal['OK', 'KO']

    def __str__(self):
        return f"{self.event}\t{self.user}\t\t{self.name}\t{self.start_time}\t{self.end_time}\t{self.result}\t  "


@dataclass(kw_only=True)
class LogUser(LogBase):
    event: str = 'USER'
    name: str
    number: int
    type: Literal['START', 'END']

    def __str__(self):
        return f"{self.event}\t{self.name}\t{self.number}\t{self.type}\t{self.start_time}\t{self.end_time}"
