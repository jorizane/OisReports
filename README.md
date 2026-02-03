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
docker-compose up --build
```

### 2) Frontend

```bash
cd ois-reports
npm install
npm start
```

Open `http://localhost:4200/`.

## Backend

### Health

- `GET /health`
- `GET /db-health`

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
