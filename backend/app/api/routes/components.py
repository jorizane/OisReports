from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models import Component, FilterPlant
from ...schemas import ComponentCreate, ComponentRead, ComponentUpdate

router = APIRouter(tags=["components"])


@router.get("/filter-plants/{filter_plant_id}/components", response_model=list[ComponentRead])
def list_components(filter_plant_id: int, db: Session = Depends(get_db)):
    filter_plant = db.get(FilterPlant, filter_plant_id)
    if not filter_plant:
        raise HTTPException(status_code=404, detail="Filter plant not found.")

    return (
        db.query(Component)
        .filter(Component.filter_plant_id == filter_plant_id)
        .order_by(Component.id.asc())
        .all()
    )


@router.post(
    "/filter-plants/{filter_plant_id}/components", response_model=ComponentRead, status_code=201
)
def create_component(
    filter_plant_id: int, payload: ComponentCreate, db: Session = Depends(get_db)
):
    filter_plant = db.get(FilterPlant, filter_plant_id)
    if not filter_plant:
        raise HTTPException(status_code=404, detail="Filter plant not found.")

    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required.")

    component = Component(filter_plant_id=filter_plant_id, name=name)
    db.add(component)
    db.commit()
    db.refresh(component)
    return component


@router.get("/components/{component_id}", response_model=ComponentRead)
def get_component(component_id: int, db: Session = Depends(get_db)):
    component = db.get(Component, component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found.")
    return component


@router.patch("/components/{component_id}", response_model=ComponentRead)
def update_component(
    component_id: int, payload: ComponentUpdate, db: Session = Depends(get_db)
):
    component = db.get(Component, component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found.")

    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required.")

    component.name = name
    db.commit()
    db.refresh(component)
    return component


@router.delete("/components/{component_id}", status_code=204)
def delete_component(component_id: int, db: Session = Depends(get_db)):
    component = db.get(Component, component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found.")

    db.delete(component)
    db.commit()
    return None
