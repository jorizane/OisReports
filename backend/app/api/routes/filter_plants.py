from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models import Customer, FilterPlant, Manufacturer
from ...schemas import FilterPlantCreate, FilterPlantRead, FilterPlantUpdate

router = APIRouter(tags=["filter-plants"])


@router.get("/customers/{customer_id}/filter-plants", response_model=list[FilterPlantRead])
def list_filter_plants(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    return (
        db.query(FilterPlant)
        .filter(FilterPlant.customer_id == customer_id)
        .order_by(FilterPlant.id.asc())
        .all()
    )


@router.get("/filter-plants/{filter_plant_id}", response_model=FilterPlantRead)
def get_filter_plant(filter_plant_id: int, db: Session = Depends(get_db)):
    filter_plant = db.get(FilterPlant, filter_plant_id)
    if not filter_plant:
        raise HTTPException(status_code=404, detail="Filter plant not found.")
    return filter_plant


@router.post(
    "/customers/{customer_id}/filter-plants", response_model=FilterPlantRead, status_code=201
)
def create_filter_plant(
    customer_id: int, payload: FilterPlantCreate, db: Session = Depends(get_db)
):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    description = payload.description.strip()
    if not description:
        raise HTTPException(status_code=400, detail="Description is required.")

    if payload.year_built < 1800 or payload.year_built > 2100:
        raise HTTPException(status_code=400, detail="Year built is invalid.")

    manufacturer = db.get(Manufacturer, payload.manufacturer_id)
    if not manufacturer:
        raise HTTPException(status_code=404, detail="Manufacturer not found.")

    filter_plant = FilterPlant(
        customer_id=customer_id,
        manufacturer_id=payload.manufacturer_id,
        description=description,
        year_built=payload.year_built,
    )
    db.add(filter_plant)
    db.commit()
    db.refresh(filter_plant)
    return filter_plant


@router.patch("/filter-plants/{filter_plant_id}", response_model=FilterPlantRead)
def update_filter_plant(
    filter_plant_id: int, payload: FilterPlantUpdate, db: Session = Depends(get_db)
):
    filter_plant = db.get(FilterPlant, filter_plant_id)
    if not filter_plant:
        raise HTTPException(status_code=404, detail="Filter plant not found.")

    description = payload.description.strip()
    if not description:
        raise HTTPException(status_code=400, detail="Description is required.")

    if payload.year_built < 1800 or payload.year_built > 2100:
        raise HTTPException(status_code=400, detail="Year built is invalid.")

    manufacturer = db.get(Manufacturer, payload.manufacturer_id)
    if not manufacturer:
        raise HTTPException(status_code=404, detail="Manufacturer not found.")

    filter_plant.description = description
    filter_plant.year_built = payload.year_built
    filter_plant.manufacturer_id = payload.manufacturer_id
    db.commit()
    db.refresh(filter_plant)
    return filter_plant


@router.delete("/filter-plants/{filter_plant_id}", status_code=204)
def delete_filter_plant(filter_plant_id: int, db: Session = Depends(get_db)):
    filter_plant = db.get(FilterPlant, filter_plant_id)
    if not filter_plant:
        raise HTTPException(status_code=404, detail="Filter plant not found.")

    db.delete(filter_plant)
    db.commit()
    return None
