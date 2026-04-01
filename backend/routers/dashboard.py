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

@router.get("/overview")
async def get_dashboard_overview(
    zone: str = Query("All"),
    month: str = Query("All"),
    current_user: dict = Depends(get_current_user)
):
    zones = get_all_zones() if zone == "All" else [zone]
    months = get_all_months() if month == "All" else [month]
    
    # KPIs -> aggregate across zones, then average across months (if multiple)
    def month_agg_sum(metric):
        monthly_totals = [safe_sum([get_metric(z, m, metric) for z in zones]) for m in months]
        return safe_avg(monthly_totals)
        
    def month_agg_avg(metric):
        monthly_avgs = [safe_avg([get_metric(z, m, metric) for z in zones]) for m in months]
        return safe_avg(monthly_avgs)

    kpis = {
        "total_students": month_agg_sum("Monthly Student Count (Monthly Attendance >0)"),
        "avg_attendance": month_agg_avg("Average Student's Attendance (%)"),
        "dropout_rate": month_agg_avg("Students Drop out (%)"),
        "academic_perf": month_agg_avg("Average Students Performance test in Academics ( % )"),
        "monthly_expenditure": month_agg_sum("Monthly Expenditure (INR)"),
        "performance_score": month_agg_avg("Performance Score")
    }
    
    # Zone Comparison is normally shown for all zones to allow comparison
    zone_comparison = []
    for z in get_all_zones():
        # calculate for the selected months (so we can compare performance this month across all zones)
        z_stu = [get_metric(z, m, "Monthly Student Count (Monthly Attendance >0)") for m in months]
        z_str = [get_metric(z, m, "Monthly Average Student Strength") for m in months]
        zone_comparison.append({
            "zone": z,
            "student_count": safe_avg(z_stu),
            "avg_strength": safe_avg(z_str)
        })
        
    # Trends should return all months if month="All" or just the selected trend length
    # Based on requirement "If month='All': return all months for trends", we'll always return all months to show the full trend
    trend_months = get_all_months()
    trends = []
    for m in trend_months:
        m_att = [get_metric(z, m, "Average Student's Attendance (%)") for z in zones]
        m_drop = [get_metric(z, m, "Students Drop out (%)") for z in zones]
        m_perf = [get_metric(z, m, "Average Students Performance test in Academics ( % )") for z in zones]
        trends.append({
            "month": m,
            "attendance": safe_avg(m_att),
            "dropout": safe_avg(m_drop),
            "academic_perf": safe_avg(m_perf)
        })
        
    return {
        "kpis": kpis,
        "zone_comparison": zone_comparison,
        "trends": trends
    }
