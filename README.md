## Project Structure

### Backend

- `backend/app/api/` – FastAPI routers grouped by domain
- `backend/app/core/` – infrastructure (database, lifecycle)
- `backend/app/models/` – SQLAlchemy models
- `backend/app/schemas/` – Pydantic schemas
- `backend/tests/` – backend tests

### Frontend

- `ois-reports/src/app/components/` – UI components (list/detail/edit)
  - `customers/`
  - `filter-plants/`
  - `components/`
- `ois-reports/src/app/services/` – API services
  - `customers/`
  - `filter-plants/`
  - `components/`

## Overview

OIS Reports is a full‑stack application for managing industrial filtration customers, their filter plants, components, and reports. The stack is:

- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: Angular
- Dev: Docker Compose for local setup

## Quick Start

### 1) Start services

```bash
docker-compose up -d --build db backend
```

### 2) Run migrations

```bash
docker-compose exec backend alembic upgrade head
```

### 3) Bootstrap admin user (local)

```bash
docker-compose exec -T backend python - <<'PY'
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import User

email = "admin@local"
password = "ChangeMe123!"

db = SessionLocal()
try:
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.password_hash = hash_password(password)
        user.role = "admin"
        user.is_active = True
    else:
        db.add(User(email=email, password_hash=hash_password(password), role="admin", is_active=True))
    db.commit()
finally:
    db.close()
PY
```

### 4) Frontend

```bash
cd ois-reports
npm install
npm start
```

Open `http://localhost:4200/`.
Login at `http://localhost:4200/login` with:

- `admin@local`
- `ChangeMe123!`

## Backend

### Health

- `GET /health`
- `GET /db-health`

### Auth

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Customers

- `GET /customers`
- `GET /customers/{id}`
- `POST /customers`
- `PATCH /customers/{id}`
- `DELETE /customers/{id}`

### Filter Plants

- `GET /customers/{id}/filter-plants`
- `POST /customers/{id}/filter-plants`
- `GET /filter-plants/{id}`
- `PATCH /filter-plants/{id}`
- `DELETE /filter-plants/{id}`

### Components

- `GET /filter-plants/{id}/components`
- `POST /filter-plants/{id}/components`
- `GET /components/{id}`
- `PATCH /components/{id}`
- `DELETE /components/{id}`

## Tests

### Backend

```bash
docker-compose run --rm backend pytest -q
```

### Frontend

```bash
cd ois-reports
npm test -- --watch=false
```

## Notes

- The project uses a containerized Postgres database for local development.
- The frontend communicates with the backend at `http://localhost:8000`.
- All data endpoints are admin-protected; use the login flow first.
- Railway deploy note: backend startup runs `alembic upgrade head` automatically.
- If Railway DB already had tables but no `alembic_version`, set `AUTO_STAMP_EXISTING_SCHEMA=true` once, redeploy, then remove it again.
- If Railway DB is completely empty, startup now auto-creates the schema and stamps Alembic head before running migrations.
