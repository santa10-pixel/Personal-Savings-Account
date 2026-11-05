import math
from typing import List, Dict, Any

def calculate_attendance_metrics(attended: int, total: int, required_threshold: float = 75.0) -> Dict[str, Any]:
    if total <= 0:
        return {
            "percentage": 100.0,
            "can_miss_classes": 0,
            "classes_needed_for_target": 0
        }

    pct = round((attended / total) * 100.0, 2)
    t = required_threshold / 100.0

    # How many future classes can you miss without dropping below threshold
    # (attended) / (total + x) >= t  =>  total + x <= attended / t  =>  x <= (attended - t * total) / t
    can_miss = 0
    if attended >= (t * total):
        can_miss = math.floor((attended - (t * total)) / t) if t > 0 else 0

    # How many consecutive classes must you attend to reach required threshold
    # (attended + y) / (total + y) >= t  =>  attended + y >= t*total + t*y  =>  y(1 - t) >= t*total - attended
    classes_needed = 0
    if pct < required_threshold and t < 1.0:
        classes_needed = math.ceil((t * total - attended) / (1.0 - t))

    return {
        "percentage": pct,
        "can_miss_classes": max(0, can_miss),
        "classes_needed_for_target": max(0, classes_needed)
    }

def map_score_to_grade(total_score: float) -> Dict[str, Any]:
    if total_score >= 90:
        return {"grade": "S", "points": 10.0}
    elif total_score >= 80:
        return {"grade": "A", "points": 9.0}
    elif total_score >= 70:
        return {"grade": "B", "points": 8.0}
    elif total_score >= 60:
        return {"grade": "C", "points": 7.0}
    elif total_score >= 50:
        return {"grade": "D", "points": 6.0}
    elif total_score >= 40:
        return {"grade": "E", "points": 5.0}
    else:
        return {"grade": "F", "points": 0.0}
