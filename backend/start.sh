#!/usr/bin/env sh
set -eu

IS_EMPTY_SCHEMA="$(python - <<'PY'
from sqlalchemy import inspect
from app.core.database import engine

inspector = inspect(engine)
tables = [name for name in inspector.get_table_names() if name != "alembic_version"]
print("true" if len(tables) == 0 else "false")
PY
)"

if [ "$IS_EMPTY_SCHEMA" = "true" ]; then
  echo "[startup] Empty schema detected: creating tables via SQLAlchemy and stamping Alembic head"
  python - <<'PY'
from app.core.database import Base, engine
Base.metadata.create_all(bind=engine)
PY
  alembic stamp head
fi

echo "[startup] Running Alembic migrations"
if alembic upgrade head; then
  echo "[startup] Alembic migrations applied"
else
  migration_status=$?
  if [ "${AUTO_STAMP_EXISTING_SCHEMA:-false}" != "true" ]; then
    echo "[startup] Migration failed and AUTO_STAMP_EXISTING_SCHEMA is not enabled"
    exit "$migration_status"
  fi

  echo "[startup] Migration failed, trying schema-aware recovery via alembic stamp"
  STAMP_TARGET="$(python - <<'PY'
from sqlalchemy import inspect, text
from app.core.database import engine

inspector = inspect(engine)
has_version_table = inspector.has_table("alembic_version")
has_users = inspector.has_table("users")
has_sessions = inspector.has_table("auth_sessions")
has_filters = inspector.has_table("filters")

has_version_rows = False
if has_version_table:
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM alembic_version")).scalar() or 0
        has_version_rows = count > 0

if has_version_rows:
    print("")
elif has_users and has_sessions:
    print("20260216_0001")
elif has_filters:
    print("ff77a7b7e42f")
else:
    print("")
PY
)"
  if [ -z "$STAMP_TARGET" ]; then
    echo "[startup] No safe stamp target detected; aborting"
    exit "$migration_status"
  fi

  echo "[startup] Stamping existing schema to revision: $STAMP_TARGET"
  alembic stamp "$STAMP_TARGET"
  alembic upgrade head
  echo "[startup] Recovery migration finished"
fi

echo "[startup] Starting API server"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
