import os
import threading
import time
from collections import defaultdict, deque
from datetime import datetime, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.security import (
    SESSION_COOKIE_NAME,
    create_session,
    hash_password,
    get_current_user,
    revoke_session,
    verify_csrf_origin,
    verify_password,
)
from ...models import User
from ...schemas import AuthUserRead, ChangePasswordRequest, LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])
_login_attempts: dict[str, deque[float]] = defaultdict(deque)
_rate_limit_lock = threading.Lock()


def _cookie_secure() -> bool:
    return os.getenv("AUTH_COOKIE_SECURE", "false").strip().lower() == "true"


def _cookie_samesite() -> str:
    value = os.getenv("AUTH_COOKIE_SAMESITE", "lax").strip().lower()
    if value not in {"lax", "strict", "none"}:
        return "lax"
    return value


def _client_key(request: Request, email: str) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else "unknown"
    return f"{ip}:{email}"


def _enforce_login_rate_limit(request: Request, email: str) -> None:
    max_attempts = int(os.getenv("LOGIN_RATE_LIMIT_MAX_ATTEMPTS", "10"))
    window_seconds = int(os.getenv("LOGIN_RATE_LIMIT_WINDOW_SECONDS", "300"))

    now = time.time()
    key = _client_key(request, email)
    threshold = now - window_seconds

    with _rate_limit_lock:
        bucket = _login_attempts[key]
        while bucket and bucket[0] < threshold:
            bucket.popleft()
        if len(bucket) >= max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please try again later.",
            )


def _record_login_failure(request: Request, email: str) -> None:
    key = _client_key(request, email)
    with _rate_limit_lock:
        _login_attempts[key].append(time.time())


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if not email or not payload.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email and password required.")

    _enforce_login_rate_limit(request, email)

    user = db.query(User).filter(User.email == email, User.is_active.is_(True)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        _record_login_failure(request, email)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    user.last_login_at = datetime.now(timezone.utc)
    token = create_session(db, user)

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=_cookie_secure(),
        samesite=_cookie_samesite(),
        max_age=7 * 24 * 60 * 60,
        path="/",
    )
    return LoginResponse(user=AuthUserRead.model_validate(user))


@router.post("/logout", status_code=204)
def logout(
    response: Response,
    session_cookie: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    _: None = Depends(verify_csrf_origin),
    db: Session = Depends(get_db),
):
    if session_cookie:
        revoke_session(db, session_cookie)
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        secure=_cookie_secure(),
        samesite=_cookie_samesite(),
    )
    return None


@router.get("/me", response_model=AuthUserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password", status_code=204)
def change_password(
    payload: ChangePasswordRequest,
    _: None = Depends(verify_csrf_origin),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is invalid.")
    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different.")

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return None
