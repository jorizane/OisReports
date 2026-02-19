import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from .database import get_db
from ..models import AuthSession, User

SESSION_COOKIE_NAME = "ois_session"
SESSION_TTL_DAYS = int(os.getenv("SESSION_TTL_DAYS", "7"))


def _allowed_origins() -> set[str]:
    return {
        origin.strip()
        for origin in os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:4200").split(",")
        if origin.strip()
    }


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    iterations = 210000
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
    return f"pbkdf2_sha256${iterations}${salt}${dk.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected = stored_hash.split("$", 3)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False

    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        int(iterations),
    )
    return hmac.compare_digest(dk.hex(), expected)


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session(db: Session, user: User) -> str:
    token = secrets.token_urlsafe(48)
    token_hash = hash_session_token(token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)

    session = AuthSession(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
    db.add(session)
    db.commit()
    return token


def revoke_session(db: Session, token: str) -> None:
    token_hash = hash_session_token(token)
    session = (
        db.query(AuthSession)
        .filter(AuthSession.token_hash == token_hash, AuthSession.revoked_at.is_(None))
        .first()
    )
    if not session:
        return
    session.revoked_at = datetime.now(timezone.utc)
    db.commit()


def get_current_user(
    db: Session = Depends(get_db),
    session_cookie: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> User:
    if not session_cookie:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token_hash = hash_session_token(session_cookie)
    now = datetime.now(timezone.utc)

    session = (
        db.query(AuthSession)
        .join(User, User.id == AuthSession.user_id)
        .filter(
            AuthSession.token_hash == token_hash,
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > now,
            User.is_active.is_(True),
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    return session.user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return user


def verify_csrf_origin(request: Request) -> None:
    if request.method.upper() in {"GET", "HEAD", "OPTIONS"}:
        return

    origin = request.headers.get("origin", "").strip()
    if not origin or origin not in _allowed_origins():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid request origin")
