import os
import time
from datetime import datetime
from collections import defaultdict
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import auth, dashboard, operations, training, financial, field, reports
from services.data_engine import load_csv
from dependencies.auth import require_role

load_dotenv()

RATE_LIMIT_STORE = defaultdict(list)
RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = 60

@asynccontextmanager
async def lifespan(app: FastAPI):
    csv_path = os.getenv("CSV_PATH", "data.csv")
    try:
        load_csv(csv_path)
        print(f"Successfully loaded app data from {csv_path} via data_engine")
    except FileNotFoundError:
        print(f"File {csv_path} not found. Ensure CSV is present.")
    except Exception as e:
        print(f"Error loading CSV: {e}")
    yield

app = FastAPI(lifespan=lifespan)

# CORS setup: allow local development and production URLs from environment variables
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    
    RATE_LIMIT_STORE[client_ip] = [t for t in RATE_LIMIT_STORE[client_ip] if now - t < RATE_LIMIT_WINDOW]
    
    if len(RATE_LIMIT_STORE[client_ip]) >= RATE_LIMIT_MAX:
        return JSONResponse(status_code=429, content={"detail": "Too many requests"})
        
    RATE_LIMIT_STORE[client_ip].append(now)
    response = await call_next(request)
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [{"field": err["loc"][-1], "message": err["msg"]} for err in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={"error": "Validation Error", "detail": errors},
    )

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(operations.router, prefix="/api/operations", tags=["operations"])
app.include_router(training.router, prefix="/api/training", tags=["training"])
app.include_router(field.router, prefix="/api/field", tags=["field"])

# Role-based access for Financial and Reports
app.include_router(
    financial.router, 
    prefix="/api/financial", 
    tags=["financial"],
    dependencies=[Depends(require_role(["admin", "zone_manager"]))]
)
app.include_router(
    reports.router, 
    prefix="/api/reports", 
    tags=["reports"],
    dependencies=[Depends(require_role(["admin", "zone_manager"]))]
)

# Meta endpoint for dropdown menus explicitly parsing Data mappings
@app.get("/api/meta")
def get_metadata():
    from services.data_engine import ZONES, MONTHS, METRICS
    return {
        "zones": ZONES,
        "months": [m for m in MONTHS if "Quarter" not in m],
        "metrics": METRICS
    }

@app.get("/health")
def read_health():
    from services.data_engine import DATA, ZONES
    metrics_count = len(list(DATA.values())[0]) if DATA else 0
    return {
        "status": "ok",
        "csv_loaded": len(DATA) > 0,
        "zones": len(ZONES),
        "metrics": metrics_count,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the NGO MIS Dashboard API"}
