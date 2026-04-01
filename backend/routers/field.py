from fastapi import APIRouter, Depends, Query
from dependencies.auth import get_current_user
from services.data_engine import get_metric, get_all_zones, get_all_months

router = APIRouter()

def safe_sum(values):
    vals = [v for v in values if v is not None]
    return round(sum(vals), 2) if vals else 0

def safe_avg(values):
    vals = [v for v in values if v is not None]
    return round(sum(vals) / len(vals), 2) if vals else 0

@router.get("/")
async def get_field(
    zone: str = Query("All"),
    month: str = Query("All"),
    current_user: dict = Depends(get_current_user)
):
    zones = get_all_zones() if zone == "All" else [zone]
    months = get_all_months() if month == "All" else [month]

    def agg_avg(metric):
        return safe_avg([safe_avg([get_metric(z, m, metric) for z in zones]) for m in months])

    def agg_sum(metric):
        return safe_sum([safe_sum([get_metric(z, m, metric) for z in zones]) for m in months])

    # 1. Base Stats
    stats = {
        "nios_enrolled_pct": agg_avg("Students enrolled in NIOS (%)"),
        "out_of_school_pct": agg_avg("Out of school children(%)"),
        "formal_school_pct": agg_avg("Children enrolled in Formal School(%)"),
        "health_camps": agg_sum("Health Check up camp"),
        "meals": agg_sum("No of Meals"),
        "sanitary_pads": agg_sum("Monthly Sanitary pad distributed(Number)")
    }

    # 2. Inclusion Funnel Logic mapping states of integration
    inclusion_funnel = [
        {"stage": "Out of School", "value": agg_avg("Out of school children(%)")},
        {"stage": "Enrolled", "value": agg_avg("Students enrolled in NIOS (%)") + agg_avg("Children enrolled in Formal School(%)")},
        {"stage": "Formal School", "value": agg_avg("Children enrolled in Formal School(%)")},
        {"stage": "NIOS", "value": agg_avg("Students enrolled in NIOS (%)")}
    ]

    # 3. Key external achievements
    achievements = {
        "self_help_groups": agg_sum("Self Help Groups"),
        "students_placed": agg_sum("Students placed"),
        "scholarships": agg_sum("Scholarships"),
        "pursuing_graduation": agg_sum("Pursuing Graduation"),
        "scored_60_10th": agg_sum("Students Scored higher than 60% marks in 10th"),
        "scored_60_12th": agg_sum("Students Scored higher than 60% marks in 12th")
    }

    # 4. Activity programs
    activities_progress = [
        {"activity": "Spardha", "value_pct": agg_avg("Spardha (%)")},
        {"activity": "Centralized Test", "value_pct": agg_avg("Monthly test conduct (%)")},
        {"activity": "IMC", "value_pct": agg_avg("IMC (%)")}
    ]

    # 5. Career trajectories 
    career = {
        "counselling": agg_sum("Career Counselling"),
        "career_courses": agg_sum("Career Courses"),
        "library": agg_sum("Library Usage"),
        "competitive_cleared": agg_sum("Competitive Exams Cleared"),
        "sports_reps": agg_sum("Sports Representatives")
    }

    return {
        "stats": stats,
        "inclusion_funnel": inclusion_funnel,
        "achievements": achievements,
        "activities_progress": activities_progress,
        "career": career
    }
