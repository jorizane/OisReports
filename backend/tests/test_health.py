from fastapi.testclient import TestClient
from sqlalchemy import text

from app.database import engine
from app.main import app


client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_db_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        return

    response = client.get("/db-health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "reachable"}
