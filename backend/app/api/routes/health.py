from fastapi import APIRouter
from sqlalchemy import text

from ...core.database import engine

router = APIRouter()


@router.get("/")
def root():
    return {
        "name": "OIS Reports API",
        "endpoints": {
            "health": "/health",
            "db_health": "/db-health",
            "customers": "/customers",
            "customer_get": "/customers/{customer_id}",
            "filter_plants": "/customers/{customer_id}/filter-plants",
            "filter_plant_get": "/filter-plants/{filter_plant_id}",
            "filter_plant_update": "/filter-plants/{filter_plant_id}",
            "filter_plant_delete": "/filter-plants/{filter_plant_id}",
            "components": "/filter-plants/{filter_plant_id}/components",
            "component_get": "/components/{component_id}",
            "component_update": "/components/{component_id}",
            "component_delete": "/components/{component_id}",
            "report_create": "/customers/{customer_id}/filter-plants/{filter_plant_id}/reports",
            "reports": "/reports",
            "customer_delete": "/customers/{customer_id}",
        },
    }


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/db-health")
def db_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {"status": "ok", "database": "reachable"}
