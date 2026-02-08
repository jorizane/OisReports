from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models import FilterPlant, FilterTestField
from ...schemas import FilterTestFieldRead

router = APIRouter(
    prefix="/filter-plants/{filter_plant_id}/filter-test-fields",
    tags=["filter-test-fields"],
)


@router.get("", response_model=list[FilterTestFieldRead])
def list_filter_test_fields(filter_plant_id: int, db: Session = Depends(get_db)):
    filter_plant = db.get(FilterPlant, filter_plant_id)
    if not filter_plant:
        raise HTTPException(status_code=404, detail="Filter plant not found.")
    if not filter_plant.filter:
        return []
    return (
        db.query(FilterTestField)
        .filter(FilterTestField.filter_id == filter_plant.filter.id)
        .order_by(FilterTestField.id.asc())
        .all()
    )
