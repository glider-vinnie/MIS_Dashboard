import os
import jwt
from typing import List, Union, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "your_jwt_secret_here")
ALGORITHM = "HS256"

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to get the current user from the JWT token in the Authorization header.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# 4. Role Guard 
def require_role(allowed_roles: List[str]):
    """
    Dependency to restrict endpoint access based on user role natively mapping to JWT headers.
    Usage: Depends(require_role(["admin", "zone_manager"]))
    """
    def role_checker(current_user: dict = Depends(get_current_user)):
        role = current_user.get("role")
        if not role or role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role: {role}"
            )
        return current_user
    return role_checker

# 5. Zone Context Scoping filter
def filter_by_user_zones(data: Union[List[str], List[Dict], Dict], user: dict) -> Union[List[str], List[Dict], Dict]:
    """
    Zone-scoped access: filters datasets dynamically depending on user role and assigned zones.
    If user is zone_manager, strips any data block belonging to off-limit zones.
    Handles List[str] of zones, List[dict] with 'zone' keys, or Dict scalar mapped dynamically by zone.
    """
    role = user.get("role")
    user_zones = set(user.get("zones", []))
    
    if role == "admin" or "all" in user_zones:
        return data
        
    if isinstance(data, list):
        if not data:
            return data
        # Handle simple string arrays (like returning allowed target zones subset limiters)
        if isinstance(data[0], str):
            return [z for z in data if z in user_zones]
        # Handle array of objects filtering off mapping 'zone' keys (like dropping tables)
        if isinstance(data[0], dict):
            return [item for item in data if item.get("zone") in user_zones]
            
    if isinstance(data, dict):
        # Handle mappings keyed explicitly by dynamic zone matrices
        return {k: v for k, v in data.items() if k in user_zones}

    return data
