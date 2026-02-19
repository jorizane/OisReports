import os
from datetime import datetime, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.security import (
    SESSION_COOKIE_NAME,
    create_session,
    hash_password,
    get_current_user,
    revoke_session,
    verify_password,
)
from ...models import User
from ...schemas import AuthUserRead, ChangePasswordRequest, LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def _cookie_secure() -> bool:
    return os.getenv("AUTH_COOKIE_SECURE", "false").strip().lower() == "true"


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if not email or not payload.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email and password required.")

    user = db.query(User).filter(User.email == email, User.is_active.is_(True)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    user.last_login_at = datetime.now(timezone.utc)
    token = create_session(db, user)

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=_cookie_secure(),
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )
    return LoginResponse(user=AuthUserRead.model_validate(user))


@router.post("/logout", status_code=204)
def logout(
    response: Response,
    session_cookie: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    db: Session = Depends(get_db),
):
    if session_cookie:
        revoke_session(db, session_cookie)
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")
    return None


@router.get("/me", response_model=AuthUserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password", status_code=204)
def change_password(payload: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is invalid.")
    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different.")

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return None
