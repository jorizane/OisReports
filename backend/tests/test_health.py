import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.database import engine
from app.main import app


client = TestClient(app)


def _db_available() -> bool:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_db_health():
    if not _db_available():
        pytest.skip("Database is not available.")

    response = client.get("/db-health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "reachable"}


def test_create_customer():
    if not _db_available():
        pytest.skip("Database is not available.")

    name = f"Test Customer {uuid.uuid4()}"
    response = client.post("/customers", json={"name": name})
    assert response.status_code == 201
    payload = response.json()
    assert payload["id"] > 0
    assert payload["name"] == name


def test_list_customers_includes_created_customer():
    if not _db_available():
        pytest.skip("Database is not available.")

    name = f"List Customer {uuid.uuid4()}"
    created = client.post("/customers", json={"name": name}).json()

    response = client.get("/customers")
    assert response.status_code == 200
    customers = response.json()
    assert any(customer["id"] == created["id"] for customer in customers)


def test_create_customer_requires_name():
    if not _db_available():
        pytest.skip("Database is not available.")

    response = client.post("/customers", json={"name": "   "})
    assert response.status_code == 400


def test_delete_customer():
    if not _db_available():
        pytest.skip("Database is not available.")

    created = client.post("/customers", json={"name": f"Delete Customer {uuid.uuid4()}"}).json()
    delete_response = client.delete(f"/customers/{created['id']}")
    assert delete_response.status_code == 204

    list_response = client.get("/customers")
    assert list_response.status_code == 200
    assert all(customer["id"] != created["id"] for customer in list_response.json())
