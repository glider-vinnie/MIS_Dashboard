import logging
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Union, Any

DATA: Dict[tuple, Dict[str, Union[float, int, None]]] = {}
ZONES: List[str] = []
MONTHS: List[str] = []
METRICS: List[str] = []

logger = logging.getLogger(__name__)

def clean_value(v: Any, metric_name: str) -> Optional[float]:
    """Strip %, handle NaN, #DIV/0!, format 0-1 float percentages & INT currency natively"""
    if pd.isna(v):
        return None
    
    val_has_percent = False
    
    if isinstance(v, str):
        v = v.strip()
        if v in ('', '-', '#DIV/0!', '#REF!', 'NaN', 'None', 'NA'):
            return None
        if '%' in v:
            v = v.replace('%', '').strip()
            val_has_percent = True
        v = v.replace(',', '')
        
    try:
        val = float(v)
        if pd.isna(val) or np.isinf(val):
            return None
            
        name_lower = str(metric_name).lower()
        
        # Percentage extraction enforcing standard 0-1 mapped structures (4 dec places limit)
        if val_has_percent or "(%" in name_lower or "( % )" in name_lower:
            if val > 1 or val_has_percent: 
                return round(val / 100.0, 4)
            return val
            
        # Monetery standardization forcing flat mathematical INTEGERS 
        if "(inr)" in name_lower or "expenditure" in name_lower:
            return int(val)
            
        return val
        
    except (ValueError, TypeError):
        return None

def load_csv(path: str) -> Dict[tuple, Dict[str, Union[float, int, None]]]:
    """Parse CSV into globally state-tracked dict natively binding METRICS list metadata."""
    global DATA, ZONES, MONTHS, METRICS
    DATA.clear()
    ZONES.clear()
    MONTHS.clear()
    METRICS.clear()
    
    try:
        df = pd.read_csv(path, header=None)
    except Exception as e:
        logger.error(f"Failed to load CSV from {path}: {e}")
        return DATA
        
    # Forward fill the spanning top row mapped arrays
    month_series = pd.Series(df.iloc[0].values).ffill()
    zone_row = df.iloc[1].values
    
    col_mapping = {}
    unique_zones = []
    unique_months = []
    
    for col_idx in range(1, len(month_series)):
        m = str(month_series.iloc[col_idx]).strip()
        z = str(zone_row[col_idx]).strip()
        
        if m == 'nan' or not m or m.lower() == 'none':
            continue
        if z == 'nan' or not z or z.lower() == 'none':
            continue
            
        col_mapping[col_idx] = (z, m)
        if z not in unique_zones: unique_zones.append(z)
        if m not in unique_months: unique_months.append(m)
            
    ZONES.extend(unique_zones)
    MONTHS.extend(unique_months)
    
    unique_metrics = []
    for row_idx in range(2, len(df)):
        row_data = df.iloc[row_idx].values
        metric_name = str(row_data[0]).strip()
        
        if metric_name == 'nan' or not metric_name or metric_name.lower() == 'none':
            continue
            
        if metric_name not in unique_metrics:
            unique_metrics.append(metric_name)
            
        for col_idx, (z, m) in col_mapping.items():
            val = clean_value(row_data[col_idx], metric_name)
            key = (z, m)
            if key not in DATA: DATA[key] = {}
            DATA[key][metric_name] = val
            
    METRICS.extend(unique_metrics)
    return DATA

def get_metric(zone: str, month: str, metric: str) -> Union[float, int, None]:
    return DATA.get((zone, month), {}).get(metric)

def get_all_zones() -> List[str]: return list(ZONES)
def get_all_months() -> List[str]: return list(MONTHS)
