import math
from typing import List, Dict, Optional, Any
from services import data_engine

def safe_parse_pct(value: str) -> Optional[float]:
    """
    Strips %, handles NaN, #DIV/0!, returns float 0-1
    """
    if value is None:
        return None
    v = str(value).strip()
    if v in ('', '-', '#DIV/0!', '#REF!', 'NaN', 'None', 'nan', 'NA'):
        return None
    try:
        # If passed with %, chop it off and convert to 0-1 mapped scale float
        if '%' in v:
            v_num = float(v.replace('%', '').replace(',', '').strip())
            return v_num / 100.0
        return float(v.replace(',', ''))
    except (ValueError, TypeError):
        return None

def aggregate_zones(data_dict: Dict, zones: list, month: str, metric: str) -> float:
    """
    Simple/weighted average across zones for a given month+metric
    Assumes `data_dict` yields exactly a dictionary populated from `data_engine.DATA` mappings
    """
    vals = []
    for z in zones:
        val = data_dict.get((z, month), {}).get(metric)
        if val is not None:
            vals.append(val)
    if not vals:
        return 0.0
    return round(sum(vals) / len(vals), 2)

def compute_mom_change(zone: str, metric: str) -> float:
    """
    Compares last 2 available months linearly, returns mathematical (%) growth/decay float scalar.
    """
    all_months = data_engine.get_all_months()
    if len(all_months) < 2:
        return 0.0
        
    last_m = all_months[-1]
    prev_m = all_months[-2]
    
    latest = data_engine.get_metric(zone, last_m, metric)
    prev = data_engine.get_metric(zone, prev_m, metric)
    
    if latest is None or prev is None or prev == 0:
        return 0.0
    return round(((latest - prev) / prev) * 100, 2)

def rank_zones(month: str, metric: str, ascending: bool = False) -> List[Dict]:
    """
    Returns zones sorted by metric sequentially for a given month scalar list.
    Yields list mapping dictionaries of objects [{zone, value, rank}]
    """
    zones = data_engine.get_all_zones()
    data = []
    for z in zones:
        val = data_engine.get_metric(z, month, metric)
        if val is not None:
            data.append({"zone": z, "value": val})
            
    # Native sort implementation 
    data.sort(key=lambda x: x["value"], reverse=not ascending)
    
    # Assign iterative ranked indexing over list map
    for i, item in enumerate(data):
        item["rank"] = i + 1
        
    return data

def compute_quarterly_avg(zone: str, metric: str, quarter: int) -> float:
    """
    Generates deterministic quarterly arrays linearly parsing 3 month blocks out of the all_months dataset
    Q1 = position index 0-2 (Apr-Jun default), Q2 = 3-5 (Jul-Sep default)
    """
    all_months = data_engine.get_all_months()
    start_idx = (quarter - 1) * 3
    end_idx = start_idx + 3
    q_months = all_months[start_idx:end_idx]
    
    vals = []
    for m in q_months:
        val = data_engine.get_metric(zone, m, metric)
        if val is not None:
            vals.append(val)
            
    if not vals:
        return 0.0
    return round(sum(vals) / len(vals), 2)

def get_trend_direction(zone: str, metric: str) -> str:
    """
    Compares identically mapped first 3 months array against the last 3 months average.
    Returns: 'up' | 'down' | 'stable'  (calculated via a 5% margin offset bounds check)
    """
    all_months = data_engine.get_all_months()
    if len(all_months) < 6:
        return 'stable'
        
    first_3 = all_months[:3]
    last_3 = all_months[-3:]
    
    val1 = [data_engine.get_metric(zone, m, metric) for m in first_3]
    val1 = [v for v in val1 if v is not None]
    avg1 = sum(val1) / len(val1) if val1 else 0
    
    val2 = [data_engine.get_metric(zone, m, metric) for m in last_3]
    val2 = [v for v in val2 if v is not None]
    avg2 = sum(val2) / len(val2) if val2 else 0
    
    if avg2 > avg1 * 1.05:
        return 'up'
    elif avg2 < avg1 * 0.95:
        return 'down'
    return 'stable'

def generate_insights(engine) -> List[Dict]:
    """
    Executes standard hackathon logic dynamically mapping Best/Worst performance, 
    improvement deltas, dropout risks, operational cost efficiency, and attendance parameters
    to format structured dictionary metric cards dynamically.
    """
    insights = []
    all_z = engine.get_all_zones()
    all_m = engine.get_all_months()
    if not all_z or not all_m:
        return insights
        
    last_m = all_m[-1]
    
    # 1. Best performing (max performance score)
    scores = [(z, engine.get_metric(z, last_m, "Performance Score") or 0) for z in all_z]
    if scores:
        best = max(scores, key=lambda x: x[1])
        insights.append({
            "icon": "Trophy", 
            "title": "Top Performer", 
            "text": f"{best[0]} is the best performing zone this month.", 
            "metric": f"{best[1]}%", 
            "trend": "up"
        })
        
    # 2. Worst performing (min performance score)
    if scores:
        worst = min(scores, key=lambda x: x[1])
        insights.append({
            "icon": "AlertOctagon", 
            "title": "Needs Attention", 
            "text": f"{worst[0]} has the lowest performance rating.", 
            "metric": f"{worst[1]}%", 
            "trend": "down"
        })
        
    # 3. Biggest improvement (MoM comparison or Start vs End)
    if len(all_m) >= 2:
        diffs = []
        for z in all_z:
            val1 = engine.get_metric(z, all_m[0], "Performance Score") or 0
            val2 = engine.get_metric(z, all_m[-1], "Performance Score") or 0
            diffs.append((z, val2 - val1))
        if diffs:
            most_imp = max(diffs, key=lambda x: x[1])
            insights.append({
                "icon": "TrendingUp", 
                "title": "Biggest Improvement", 
                "text": f"{most_imp[0]} improved the most over the period.", 
                "metric": f"+{round(most_imp[1], 2)}", 
                "trend": "up"
            })
            
    # 4. Highest dropout risk zone
    dropouts = [(z, engine.get_metric(z, last_m, "Students Drop out (%)") or 0) for z in all_z]
    if dropouts:
        highest_drop = max(dropouts, key=lambda x: x[1])
        insights.append({
            "icon": "UserMinus", 
            "title": "Highest Dropout Risk", 
            "text": f"{highest_drop[0]} has the highest student dropout rate.", 
            "metric": f"{round(highest_drop[1], 2)}%", 
            "trend": "down"
        })

    # 5. Cost efficiency outlier (Lowest Expenditure per Student ratio)
    costs = []
    for z in all_z:
        exp = engine.get_metric(z, last_m, "Monthly Expenditure (INR)") or 0
        stu = engine.get_metric(z, last_m, "Monthly Student Count (Monthly Attendance >0)")
        if stu and stu > 0:
            costs.append((z, exp/stu))
    if costs:
        most_eff = min(costs, key=lambda x: x[1])
        insights.append({
            "icon": "CheckCircle", 
            "title": "Cost Efficiency Leader", 
            "text": f"{most_eff[0]} has the lowest expenditure per student.", 
            "metric": f"\u20b9{round(most_eff[1], 2)}/stu", 
            "trend": "up"
        })

    # 6. Attendance leader
    attendance = [(z, engine.get_metric(z, last_m, "Average Student's Attendance (%)") or 0) for z in all_z]
    if attendance:
        best_att = max(attendance, key=lambda x: x[1])
        insights.append({
            "icon": "Users", 
            "title": "Attendance Leader", 
            "text": f"{best_att[0]} has the best student attendance.", 
            "metric": f"{round(best_att[1], 2)}%", 
            "trend": "up"
        })

    return insights
