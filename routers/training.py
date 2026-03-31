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
async def get_training(
    zone: str = Query("All"),
    month: str = Query("All"),
    current_user: dict = Depends(get_current_user)
):
    zones = get_all_zones() if zone == "All" else [zone]
    months = get_all_months() if month == "All" else [month]
    all_z = get_all_zones()
    all_m = get_all_months()

    def agg_avg(metric):
        return safe_avg([safe_avg([get_metric(z, m, metric) for z in zones]) for m in months])

    def agg_sum(metric):
        # Average of the sums across zones for each month
        return safe_avg([safe_sum([get_metric(z, m, metric) for z in zones]) for m in months])

    # 1. KPIs
    kpis = {
        "student_count": agg_sum("Monthly Student Count (Monthly Attendance >0)"),
        "avg_strength": agg_avg("Monthly Average Student Strength"),
        "attendance": agg_avg("Average Student's Attendance (%)"),
        "dropout": agg_avg("Students Drop out (%)"),
        "academic_perf": agg_avg("Average Students Performance test in Academics ( % )"),
        "values_perf": agg_avg("Average Students Performance in Values( % )")
    }

    # 2. Radar Data
    radar_data = []
    for z in all_z: # Typically all zones to see comparison polygon
        radar_data.append({
            "zone": z,
            "attendance": safe_avg([get_metric(z, m, "Average Student's Attendance (%)") for m in months]),
            "academic": safe_avg([get_metric(z, m, "Average Students Performance test in Academics ( % )") for m in months]),
            "values": safe_avg([get_metric(z, m, "Average Students Performance in Values( % )") for m in months]),
            "vol_attendance": safe_avg([get_metric(z, m, "Average Volunteer's Attendance (%)") for m in months]),
            "syllabus": safe_avg([get_metric(z, m, "Center Monthly Report Completion (%)") for m in months]),
            "test": safe_avg([get_metric(z, m, "Monthly test conduct (%)") for m in months])
        })

    # 3. Student Trends
    student_trends = []
    for m in all_m: # All months historically
        student_trends.append({
            "month": m,
            "count": safe_sum([get_metric(z, m, "Monthly Student Count (Monthly Attendance >0)") for z in zones]),
            "strength": safe_avg([get_metric(z, m, "Monthly Average Student Strength") for z in zones])
        })

    # 4. Dropout Trends
    dropout_trends = []
    for m in all_m:
        trend_point = {"month": m}
        # Flat object mappings per zone e.g. { month: "Apr", "Delhi": 5.4, "Pune": 3.0 }
        for z in all_z:
            trend_point[z] = get_metric(z, m, "Students Drop out (%)") or 0
        dropout_trends.append(trend_point)

    # 5. Volunteer Metrics
    volunteer_metrics = {
        "count": agg_sum("Monthly Volunteers Count (Monthly attendance>0)"),
        "avg_attendance": agg_avg("Average Volunteer's Attendance (%)"),
        "community_vols": agg_sum("No Community Volunteers"),
        "community_visits": 0 # Not given natively directly in subset
    }

    # 6. Heatmap
    heatmap = {
        "metric": "academic_perf",
        "data": {z: {m: get_metric(z, m, "Average Students Performance test in Academics ( % )") or 0 for m in all_m} for z in all_z}
    }

    return {
        "kpis": kpis,
        "radar_data": radar_data,
        "student_trends": student_trends,
        "dropout_trends": dropout_trends,
        "volunteer_metrics": volunteer_metrics,
        "heatmap": heatmap
    }
