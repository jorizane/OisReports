import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.core.database import engine
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


def test_get_customer_by_id():
    if not _db_available():
        pytest.skip("Database is not available.")

    created = client.post("/customers", json={"name": f"Get Customer {uuid.uuid4()}"}).json()
    response = client.get(f"/customers/{created['id']}")
    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == created["id"]
    assert payload["name"] == created["name"]


def test_delete_customer():
    if not _db_available():
        pytest.skip("Database is not available.")

    created = client.post("/customers", json={"name": f"Delete Customer {uuid.uuid4()}"}).json()
    delete_response = client.delete(f"/customers/{created['id']}")
    assert delete_response.status_code == 204

    list_response = client.get("/customers")
    assert list_response.status_code == 200
    assert all(customer["id"] != created["id"] for customer in list_response.json())


def test_update_customer():
    if not _db_available():
        pytest.skip("Database is not available.")

    created = client.post("/customers", json={"name": f"Update Customer {uuid.uuid4()}"}).json()
    response = client.patch(f"/customers/{created['id']}", json={"name": "Updated Customer"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == created["id"]
    assert payload["name"] == "Updated Customer"


def test_create_filter_plant():
    if not _db_available():
        pytest.skip("Database is not available.")

    customer = client.post("/customers", json={"name": f"Plant Customer {uuid.uuid4()}"}).json()
    response = client.post(
        f"/customers/{customer['id']}/filter-plants",
        json={"description": "Industriefilter A", "year_built": 2020},
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["customer_id"] == customer["id"]
    assert payload["description"] == "Industriefilter A"
    assert payload["year_built"] == 2020


def test_list_filter_plants():
    if not _db_available():
        pytest.skip("Database is not available.")

    customer = client.post("/customers", json={"name": f"Plant List {uuid.uuid4()}"}).json()
    client.post(
        f"/customers/{customer['id']}/filter-plants",
        json={"description": "Filter B", "year_built": 2018},
    )

    response = client.get(f"/customers/{customer['id']}/filter-plants")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) >= 1


def test_get_filter_plant():
    if not _db_available():
        pytest.skip("Database is not available.")

    customer = client.post("/customers", json={"name": f"Plant Get {uuid.uuid4()}"}).json()
    plant = client.post(
        f"/customers/{customer['id']}/filter-plants",
        json={"description": "Filter C", "year_built": 2019},
    ).json()

    response = client.get(f"/filter-plants/{plant['id']}")
    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == plant["id"]
    assert payload["customer_id"] == customer["id"]


def test_update_filter_plant():
    if not _db_available():
        pytest.skip("Database is not available.")

    customer = client.post("/customers", json={"name": f"Plant Update {uuid.uuid4()}"}).json()
    plant = client.post(
        f"/customers/{customer['id']}/filter-plants",
        json={"description": "Filter D", "year_built": 2016},
    ).json()

    response = client.patch(
        f"/filter-plants/{plant['id']}",
        json={"description": "Filter D Updated", "year_built": 2018},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["description"] == "Filter D Updated"
    assert payload["year_built"] == 2018


def test_delete_filter_plant():
    if not _db_available():
        pytest.skip("Database is not available.")

    customer = client.post("/customers", json={"name": f"Plant Delete {uuid.uuid4()}"}).json()
    plant = client.post(
        f"/customers/{customer['id']}/filter-plants",
        json={"description": "Filter E", "year_built": 2014},
    ).json()

    response = client.delete(f"/filter-plants/{plant['id']}")
    assert response.status_code == 204


def test_create_component():
    if not _db_available():
        pytest.skip("Database is not available.")

    customer = client.post("/customers", json={"name": f"Comp Customer {uuid.uuid4()}"}).json()
    plant = client.post(
        f"/customers/{customer['id']}/filter-plants",
        json={"description": "Component Plant", "year_built": 2021},
    ).json()

    response = client.post(
        f"/filter-plants/{plant['id']}/components",
        json={"name": "Pump A"},
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["filter_plant_id"] == plant["id"]
    assert payload["name"] == "Pump A"


def test_list_components():
    if not _db_available():
        pytest.skip("Database is not available.")

    customer = client.post("/customers", json={"name": f"Comp List {uuid.uuid4()}"}).json()
    plant = client.post(
        f"/customers/{customer['id']}/filter-plants",
        json={"description": "Component Plant 2", "year_built": 2017},
    ).json()

    client.post(
        f"/filter-plants/{plant['id']}/components",
        json={"name": "Ventil B"},
    )

    response = client.get(f"/filter-plants/{plant['id']}/components")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) >= 1


def test_get_update_delete_component():
    if not _db_available():
        pytest.skip("Database is not available.")

    customer = client.post("/customers", json={"name": f"Comp Get {uuid.uuid4()}"}).json()
    plant = client.post(
        f"/customers/{customer['id']}/filter-plants",
        json={"description": "Component Plant 3", "year_built": 2015},
    ).json()

    component = client.post(
        f"/filter-plants/{plant['id']}/components",
        json={"name": "Filterkorb"},
    ).json()

    get_response = client.get(f"/components/{component['id']}")
    assert get_response.status_code == 200

    update_response = client.patch(
        f"/components/{component['id']}",
        json={"name": "Filterkorb XL"},
    )
    assert update_response.status_code == 200

    delete_response = client.delete(f"/components/{component['id']}")
    assert delete_response.status_code == 204


def test_create_report():
    if not _db_available():
        pytest.skip("Database is not available.")

    customer = client.post("/customers", json={"name": f"Report Customer {uuid.uuid4()}"}).json()
    plant = client.post(
        f"/customers/{customer['id']}/filter-plants",
        json={"description": "Report Plant", "year_built": 2020},
    ).json()
    component = client.post(
        f"/filter-plants/{plant['id']}/components",
        json={"name": "Messpunkt A"},
    ).json()

    response = client.post(
        f"/customers/{customer['id']}/filter-plants/{plant['id']}/reports",
        json={
            "component_descriptions": [
                {"component_id": component["id"], "description": "OK"}
            ]
        },
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["customer_id"] == customer["id"]
    assert payload["filter_plant_id"] == plant["id"]


def test_list_reports():
    if not _db_available():
        pytest.skip("Database is not available.")

    customer = client.post("/customers", json={"name": f"Report List {uuid.uuid4()}"}).json()
    plant = client.post(
        f"/customers/{customer['id']}/filter-plants",
        json={"description": "Report List Plant", "year_built": 2021},
    ).json()
    component = client.post(
        f"/filter-plants/{plant['id']}/components",
        json={"name": "Messpunkt B"},
    ).json()
    client.post(
        f"/customers/{customer['id']}/filter-plants/{plant['id']}/reports",
        json={
            "component_descriptions": [
                {"component_id": component["id"], "description": "OK"}
            ]
        },
    )

    response = client.get("/reports")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) >= 1
    assert "customer_name" in payload[0]
    assert "filter_plant_description" in payload[0]
