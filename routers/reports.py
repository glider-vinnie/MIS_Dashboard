import pandas as pd
from fastapi import APIRouter, Depends, Query, Response
from dependencies.auth import get_current_user
from services.data_engine import get_metric, get_all_zones, get_all_months, DATA

router = APIRouter()

def safe_avg(values):
    vals = [v for v in values if v is not None]
    return round(sum(vals) / len(vals), 2) if vals else 0
    
def safe_sum(values):
    vals = [v for v in values if v is not None]
    return round(sum(vals), 2) if vals else 0

@router.get("/summary")
async def get_reports_summary(
    month: str = Query("All"),
    current_user: dict = Depends(get_current_user)
):
    months = get_all_months() if month == "All" else [month]
    all_z = get_all_zones()
    
    # Zone leaderboard ranked by performance_score
    leaderboard = []
    for z in all_z:
        score = safe_avg([get_metric(z, m, "Performance Score") for m in months])
        leaderboard.append({
            "zone": z,
            "performance_score": score
        })
    leaderboard.sort(key=lambda x: x["performance_score"], reverse=True)
    
    # Quarter comparison data mathematically grouping start/end of cycle
    all_m = get_all_months()
    quarter_comparison = {}
    if len(all_m) >= 6:
        q1_m = all_m[0:3]
        q2_m = all_m[3:6]
        
        q1_score = safe_avg([get_metric(z, m, "Performance Score") for z in all_z for m in q1_m])
        q2_score = safe_avg([get_metric(z, m, "Performance Score") for z in all_z for m in q2_m])
        quarter_comparison = {
            "q1_avg": q1_score,
            "q2_avg": q2_score,
            "improvement": round(q2_score - q1_score, 2)
        }
        
    return {
        "leaderboard": leaderboard,
        "quarter_comparison": quarter_comparison
    }

@router.get("/insights")
async def get_insights(
    month: str = Query("All"),
    current_user: dict = Depends(get_current_user)
):
    months = get_all_months() if month == "All" else [month]
    all_z = get_all_zones()
    all_m = get_all_months()
    
    insights = []
    if not all_z or not all_m:
        return insights
        
    # 1. Best performing zone 
    best_zone = max(all_z, key=lambda z: safe_avg([get_metric(z, m, "Performance Score") for m in months]))
    best_score = safe_avg([get_metric(best_zone, m, "Performance Score") for m in months])
    insights.append({
        "icon": "Trophy",
        "title": "Top Performer",
        "text": f"{best_zone} is the best performing zone this period.",
        "metric": f"{best_score}%",
        "trend": "up"
    })
    
    # 2. Biggest improvement 
    first_m, last_m = all_m[0], all_m[-1]
    improvements = {}
    for z in all_z:
        f_val = get_metric(z, first_m, "Performance Score") or 0
        l_val = get_metric(z, last_m, "Performance Score") or 0
        improvements[z] = l_val - f_val
        
    most_imp_zone = max(improvements, key=improvements.get) if improvements else "N/A"
    insights.append({
        "icon": "TrendingUp",
        "title": "Biggest Improvement",
        "text": f"{most_imp_zone} showed the highest growth from {first_m} to {last_m}.",
        "metric": f"+{round(improvements.get(most_imp_zone, 0), 2)}",
        "trend": "up"
    })
    
    # 3. Highest dropout risk
    high_drop = max(all_z, key=lambda z: safe_avg([get_metric(z, m, "Students Drop out (%)") for m in months]))
    drop_val = safe_avg([get_metric(high_drop, m, "Students Drop out (%)") for m in months])
    insights.append({
        "icon": "AlertTriangle",
        "title": "Dropout Risk",
        "text": f"{high_drop} has the highest dropout rate currently.",
        "metric": f"{drop_val}%",
        "trend": "down"
    })
    
    # 4. Attendance leader
    att_leader = max(all_z, key=lambda z: safe_avg([get_metric(z, m, "Average Student's Attendance (%)") for m in months]))
    att_val = safe_avg([get_metric(att_leader, m, "Average Student's Attendance (%)") for m in months])
    insights.append({
        "icon": "Users",
        "title": "Attendance Leader",
        "text": f"{att_leader} leads in student attendance.",
        "metric": f"{att_val}%",
        "trend": "up"
    })
    
    return insights

@router.get("/export")
async def export_report(
    format: str = Query("csv"),
    current_user: dict = Depends(get_current_user)
):
    rows = []
    # Dump fully mapped internal data dictionary out to tabular array 
    for (z, m), metrics_dict in DATA.items():
        row = {"Zone": z, "Month": m}
        row.update(metrics_dict)
        rows.append(row)
        
    df = pd.DataFrame(rows)
    csv_data = df.to_csv(index=False)
    
    # Since structured CSV is fine for both pdf/csv payload queries based on hackathon scope
    content_type = "text/csv"
    ext = "csv"
    if format.lower() == "pdf":
         ext = "pdf"
         # Send essentially stringified CSV body renamed to proxy for standard PDF parsers or PDF conversion hooks at frontend Layer
         
    return Response(content=csv_data, media_type=content_type, headers={"Content-Disposition": f"attachment; filename=ngomis_report.{ext}"})
