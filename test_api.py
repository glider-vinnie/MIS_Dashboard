import urllib.request
import urllib.parse
import urllib.error
import json

BASE_URL = "http://localhost:8000"
TOKEN = None

def print_result(test_name, condition, error_msg=""):
    if condition:
        print(f"[PASS] {test_name}")
    else:
        print(f"[FAIL] {test_name} - {error_msg}")

def make_request(method, path, data=None, use_token=True):
    url = BASE_URL + path
    headers = {}
    if data is not None:
        data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    
    if use_token and TOKEN:
        headers['Authorization'] = f"Bearer {TOKEN}"
        
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.getcode(), json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body
    except Exception as e:
        return 0, str(e)

def run_tests():
    global TOKEN
    print("Starting NGO MIS Dashboard API Tests...\n")
    
    # (1) GET /health
    try:
        status, data = make_request("GET", "/health", use_token=False)
        print_result("1. GET /health", status == 200 and data.get("csv_loaded") == True, f"Status: {status}, Data: {data}")
    except Exception as e:
        print_result("1. GET /health", False, str(e))

    # (2) POST /api/auth/login
    try:
        status, data = make_request("POST", "/api/auth/login", data={"email": "admin@ngo.org", "password": "admin123"}, use_token=False)
        has_token = "token" in data if isinstance(data, dict) else False
        if has_token:
            TOKEN = data["token"]
        print_result("2. POST /api/auth/login", status == 200 and has_token, f"Status: {status}, Data Error")
    except Exception as e:
        print_result("2. POST /api/auth/login", False, str(e))

    # (3) GET /api/dashboard/overview
    try:
        status, data = make_request("GET", "/api/dashboard/overview")
        kpis = data.get("kpis", {}) if isinstance(data, dict) else {}
        expected_keys = {"total_students", "avg_attendance", "dropout_rate", "academic_perf", "monthly_expenditure", "performance_score"}
        has_keys = expected_keys.issubset(kpis.keys())
        print_result("3. GET /api/dashboard/overview", status == 200 and has_keys, f"Status: {status}, Missing Keys: {expected_keys - kpis.keys()}")
    except Exception as e:
        print_result("3. GET /api/dashboard/overview", False, str(e))

    # (4) GET /api/operations?zone=Delhi
    try:
        status, data = make_request("GET", "/api/operations/?zone=Delhi")
        working_days = data.get("stats", {}).get("working_days") if isinstance(data, dict) else None
        is_num = isinstance(working_days, (int, float))
        print_result("4. GET /api/operations?zone=Delhi", status == 200 and is_num, f"Status: {status}, working_days mapping: {working_days}")
    except Exception as e:
        print_result("4. GET /api/operations?zone=Delhi", False, str(e))

    # (5) GET /api/training?month=Apr'25
    try:
        month_param = urllib.parse.quote("Apr'25")
        status, data = make_request("GET", f"/api/training/?month={month_param}")
        radar = data.get("radar_data") if isinstance(data, dict) else None
        is_list = isinstance(radar, list)
        print_result("5. GET /api/training?month=Apr'25", status == 200 and is_list, f"Status: {status}, radar_data type invalid")
    except Exception as e:
        print_result("5. GET /api/training?month=Apr'25", False, str(e))

    # (6) GET /api/financial
    try:
        status, data = make_request("GET", "/api/financial/")
        total_exp = data.get("summary", {}).get("total_expenditure", 0) if isinstance(data, dict) else 0
        is_valid = isinstance(total_exp, (int, float)) and total_exp >= 0
        print_result("6. GET /api/financial", status == 200 and is_valid, f"Status: {status}, total_expenditure malformed: {total_exp}")
    except Exception as e:
        print_result("6. GET /api/financial", False, str(e))

    # (7) GET /api/exceptions (Mapped to /api/financial/exceptions)
    try:
        status, data = make_request("GET", "/api/financial/exceptions")
        by_zone = data.get("by_zone", []) if isinstance(data, dict) else []
        is_valid = isinstance(by_zone, list) and len(by_zone) > 0 and "zone" in by_zone[0]
        print_result("7. GET /api/financial/exceptions", status == 200 and is_valid, f"Status: {status}, invalid table bindings")
    except Exception as e:
        print_result("7. GET /api/financial/exceptions", False, str(e))

    # (8) GET /api/field
    try:
        status, data = make_request("GET", "/api/field/")
        achievements = data.get("achievements") if isinstance(data, dict) else None
        is_dict = isinstance(achievements, dict)
        print_result("8. GET /api/field", status == 200 and is_dict, f"Status: {status}, achievements binding failed")
    except Exception as e:
        print_result("8. GET /api/field", False, str(e))

    # (9) GET /api/reports/insights
    try:
        status, data = make_request("GET", "/api/reports/insights")
        is_valid = isinstance(data, list) and len(data) >= 4
        print_result("9. GET /api/reports/insights", status == 200 and is_valid, f"Status: {status}, malformed insights map")
    except Exception as e:
        print_result("9. GET /api/reports/insights", False, str(e))

    # (10) POST /api/auth/login with wrong password
    try:
        status, data = make_request("POST", "/api/auth/login", data={"email": "admin@ngo.org", "password": "wrongpassword"}, use_token=False)
        print_result("10. POST /api/auth/login (bad pass)", status == 401, f"Status: {status}, Allowed bad auth!")
    except Exception as e:
        print_result("10. POST /api/auth/login (bad pass)", False, str(e))

    print("\nTests complete.")

if __name__ == "__main__":
    run_tests()
