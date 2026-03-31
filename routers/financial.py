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
async def get_financial(
    zone: str = Query("All"),
    month: str = Query("All"),
    current_user: dict = Depends(get_current_user)
):
    zones = get_all_zones() if zone == "All" else [zone]
    months = get_all_months() if month == "All" else [month]
    all_z = get_all_zones()
    all_m = get_all_months()

    # 1. Summary
    zone_exp = {}
    total_exp = 0
    for z in zones:
        val = safe_sum([get_metric(z, m, "Monthly Expenditure (INR)") for m in months])
        zone_exp[z] = val
        total_exp += val
        
    highest_zone = max(zone_exp, key=zone_exp.get) if zone_exp else "None"
    lowest_zone = min(zone_exp, key=zone_exp.get) if zone_exp else "None"

    mom_change_pct = 0
    if len(all_m) >= 2:
        last_m = all_m[-1]
        prev_m = all_m[-2]
        latest_val = safe_sum([get_metric(z, last_m, "Monthly Expenditure (INR)") for z in zones])
        prev_val = safe_sum([get_metric(z, prev_m, "Monthly Expenditure (INR)") for z in zones])
        if prev_val:
            mom_change_pct = round(((latest_val - prev_val) / prev_val) * 100, 2)
            
    summary = {
        "total_expenditure": round(total_exp, 2),
        "highest_zone": highest_zone,
        "lowest_zone": lowest_zone,
        "mom_change_pct": mom_change_pct
    }
    
    # 2. By Zone
    by_zone = [{"zone": z, "expenditure": exp} for z, exp in zone_exp.items()]

    # 3. Trends (historical distribution)
    trends = []
    for m in all_m:
        point = {"month": m}
        for z in all_z:
            point[z] = get_metric(z, m, "Monthly Expenditure (INR)") or 0
        trends.append(point)
        
    # 4. Scatter relationships
    scatter = []
    for m in months:
        for z in zones:
            exp = get_metric(z, m, "Monthly Expenditure (INR)")
            perf = get_metric(z, m, "Performance Score")
            if exp is not None and perf is not None:
                scatter.append({
                    "zone": z,
                    "month": m,
                    "expenditure": exp,
                    "performance_score": perf
                })
                
    # 5. Zone Tables
    zone_table = []
    for z in all_z:
        m_vals = {}
        z_total = 0
        for m in all_m:
            val = get_metric(z, m, "Monthly Expenditure (INR)") or 0
            m_vals[m] = val
            z_total += val
        zone_table.append({
            "zone": z,
            "monthly_values": m_vals,
            "total": round(z_total, 2)
        })

    return {
        "summary": summary,
        "by_zone": by_zone,
        "trends": trends,
        "scatter": scatter,
        "zone_table": zone_table
    }

@router.get("/exceptions")
async def get_exceptions(
    zone: str = Query("All"),
    month: str = Query("All"),
    current_user: dict = Depends(get_current_user)
):
    zones = get_all_zones() if zone == "All" else [zone]
    months = get_all_months() if month == "All" else [month]
    all_z = get_all_zones()
    
    # Grab latest target values mapping as they are natively cumulative across CSV
    latest_month = months[-1] if months else (get_all_months()[-1] if get_all_months() else "")
    
    raised_list = [get_metric(z, latest_month, "No of Exceptions Raised upto Current Month") for z in zones]
    resolved_list = [get_metric(z, latest_month, "No of Exceptions Resolved/Terminated") for z in zones]
    rate_list = [get_metric(z, latest_month, "Exception Resolved (%)") for z in zones]
    
    total_raised = safe_sum(raised_list)
    total_resolved = safe_sum(resolved_list)
    avg_resolution_rate = safe_avg(rate_list)
    
    summary = {
        "total_raised": total_raised,
        "total_resolved": total_resolved,
        "avg_resolution_rate": avg_resolution_rate
    }
    
    by_zone = []
    for z in all_z:
        z_raised = get_metric(z, latest_month, "No of Exceptions Raised upto Current Month") or 0
        z_resolved = get_metric(z, latest_month, "No of Exceptions Resolved/Terminated") or 0
        z_rate = get_metric(z, latest_month, "Exception Resolved (%)") or 0
        
        status = "Good" if z_rate >= 80 else ("Average" if z_rate >= 50 else "Poor")
        
        by_zone.append({
            "zone": z,
            "raised": z_raised,
            "resolved": z_resolved,
            "resolution_rate": z_rate,
            "status": status
        })

    return {
        "summary": summary,
        "by_zone": by_zone
    }
