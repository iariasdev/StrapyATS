import logging
import jwt
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from app.core.config import settings

logger = logging.getLogger("strapy_ats.core.auth")
security = HTTPBearer(auto_error=False)


class CurrentUser:
    def __init__(self, user_id: str, email: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None, plan: str = "free"):
        self.user_id = user_id
        self.email = email or ""
        self.metadata = metadata or {}
        self.plan = plan

    def __repr__(self):
        return f"<CurrentUser user_id={self.user_id} email={self.email} plan={self.plan}>"


def decode_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Decodes and verifies a Supabase JWT token.
    Uses SUPABASE_JWT_SECRET if configured, otherwise falls back to safe inspection.
    """
    if not token or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token."
        )

    # 1. If JWT secret is configured, verify HMAC signature
    jwt_secret = settings.SUPABASE_JWT_SECRET.strip()
    if jwt_secret and jwt_secret != "your-supabase-jwt-secret":
        try:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired. Please re-authenticate."
            )
        except Exception as e:
            logger.warning(f"Supabase JWT HMAC signature check failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature."
            )

    # 2. Fallback: decode unverified (for dev environments when secret is not yet set)
    try:
        payload = jwt.decode(
            token,
            options={"verify_signature": False}
        )
        return payload
    except Exception as e:
        logger.error(f"Error decoding JWT token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed authentication token."
        )


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> CurrentUser:
    """
    FastAPI dependency requiring an authenticated user.
    Extracts Bearer token and returns CurrentUser.
    """
    token: Optional[str] = None

    if credentials and credentials.credentials:
        token = credentials.credentials
    else:
        # Check Authorization header directly
        auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer token."
        )

    payload = decode_supabase_jwt(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims: sub missing."
        )

    email = payload.get("email") or ""
    metadata = payload.get("user_metadata") or {}
    app_metadata = payload.get("app_metadata") or {}
    plan = app_metadata.get("plan") or metadata.get("plan") or "free"

    return CurrentUser(
        user_id=str(user_id),
        email=str(email),
        metadata=metadata,
        plan=str(plan)
    )


async def get_optional_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> Optional[CurrentUser]:
    """
    FastAPI dependency that returns CurrentUser if authenticated, or None if anonymous.
    """
    token: Optional[str] = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    else:
        auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if not token:
        return None

    try:
        payload = decode_supabase_jwt(token)
        user_id = payload.get("sub")
        if not user_id:
            return None

        email = payload.get("email") or ""
        metadata = payload.get("user_metadata") or {}
        app_metadata = payload.get("app_metadata") or {}
        plan = app_metadata.get("plan") or metadata.get("plan") or "free"

        return CurrentUser(
            user_id=str(user_id),
            email=str(email),
            metadata=metadata,
            plan=str(plan)
        )
    except Exception:
        return None
