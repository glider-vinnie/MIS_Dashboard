from pydantic import BaseModel
from typing import List

class ZoneMetrics(BaseModel):
    zone: str
    month: str
    student_count: int
    avg_attendance: float
    dropout_rate: float
    academic_perf: float
    expenditure: float
    performance_score: float

class User(BaseModel):
    email: str
    role: str
    zones: List[str]
