from fastapi import APIRouter

from .routes.components import router as components_router
from .routes.customers import router as customers_router
from .routes.filter_plants import router as filter_plants_router
from .routes.health import router as health_router
from .routes.manufacturers import router as manufacturers_router
from .routes.reports import router as reports_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(customers_router)
api_router.include_router(manufacturers_router)
api_router.include_router(filter_plants_router)
api_router.include_router(components_router)
api_router.include_router(reports_router)
