from fastapi import APIRouter, Depends

from ..core.security import require_admin
from .routes.auth import router as auth_router
from .routes.clients import router as clients_router
from .routes.components import router as components_router
from .routes.customers import router as customers_router
from .routes.filter_test_fields import router as filter_test_fields_router
from .routes.filter_plants import router as filter_plants_router
from .routes.health import router as health_router
from .routes.manufacturers import router as manufacturers_router
from .routes.reports import router as reports_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(clients_router, dependencies=[Depends(require_admin)])
api_router.include_router(customers_router, dependencies=[Depends(require_admin)])
api_router.include_router(manufacturers_router, dependencies=[Depends(require_admin)])
api_router.include_router(filter_plants_router, dependencies=[Depends(require_admin)])
api_router.include_router(components_router, dependencies=[Depends(require_admin)])
api_router.include_router(reports_router, dependencies=[Depends(require_admin)])
api_router.include_router(filter_test_fields_router, dependencies=[Depends(require_admin)])
