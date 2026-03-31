from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
import os
import jwt

from dependencies.auth import get_current_user

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET", "your_jwt_secret_here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8

class LoginRequest(BaseModel):
    email: str
    password: str

# Demo users for hackathon
USERS = {
    "admin@ngo.org": {
        "password": "admin123",
        "name": "Admin User",
        "role": "admin",
        "zones": ["all"]
    },
    "manager@ngo.org": {
        "password": "manager123",
        "name": "Manager User",
        "role": "zone_manager",
        "zones": ["Delhi", "Pune"]
    },
    "viewer@ngo.org": {
        "password": "viewer123",
        "name": "Viewer User",
        "role": "viewer",
        "zones": ["all"]
    }
}

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login")
async def login(req: LoginRequest):
    user = USERS.get(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create JWT payload
    payload = {
        "sub": req.email,
        "role": user["role"],
        "zones": user["zones"]
    }
    
    expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    token = create_access_token(payload, expires)
    
    return {
        "token": token,
        "user": {
            "name": user["name"],
            "role": user["role"],
            "zones": user["zones"],
            "email": req.email
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Protected endpoint to return current user info from JWT"""
    return current_user
