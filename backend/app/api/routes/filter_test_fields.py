from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models import FilterTestField
from ...schemas import FilterTestFieldRead

router = APIRouter(prefix="/filter-test-fields", tags=["filter-test-fields"])


@router.get("", response_model=list[FilterTestFieldRead])
def list_filter_test_fields(db: Session = Depends(get_db)):
    return db.query(FilterTestField).order_by(FilterTestField.id.asc()).all()
