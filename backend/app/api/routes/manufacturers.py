from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models import Manufacturer
from ...schemas import ManufacturerCreate, ManufacturerRead

router = APIRouter(prefix="/manufacturers", tags=["manufacturers"])


@router.get("", response_model=list[ManufacturerRead])
def list_manufacturers(db: Session = Depends(get_db)):
    return db.query(Manufacturer).order_by(Manufacturer.id.asc()).all()


@router.get("/{manufacturer_id}", response_model=ManufacturerRead)
def get_manufacturer(manufacturer_id: int, db: Session = Depends(get_db)):
    manufacturer = db.get(Manufacturer, manufacturer_id)
    if not manufacturer:
        raise HTTPException(status_code=404, detail="Manufacturer not found.")
    return manufacturer


@router.post("", response_model=ManufacturerRead, status_code=201)
def create_manufacturer(payload: ManufacturerCreate, db: Session = Depends(get_db)):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required.")

    manufacturer = Manufacturer(name=name)
    db.add(manufacturer)
    db.commit()
    db.refresh(manufacturer)
    return manufacturer
