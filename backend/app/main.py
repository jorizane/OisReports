import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import Component, Customer, FilterPlant
from .schemas import (
    CustomerCreate,
    CustomerRead,
    CustomerUpdate,
    FilterPlantCreate,
    FilterPlantRead,
    FilterPlantUpdate,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Wait briefly for the DB container to accept connections.
    for _ in range(10):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except Exception:
            time.sleep(1)
    else:
        Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(Customer).count() == 0:
            db.add(Customer(name="Initial Customer"))
            db.commit()
    finally:
        db.close()

    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
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
            "customer_delete": "/customers/{customer_id}",
        },
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-health")
def db_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {"status": "ok", "database": "reachable"}


@app.get("/customers", response_model=list[CustomerRead])
def list_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.id.asc()).all()


@app.get("/customers/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return customer


@app.post("/customers", response_model=CustomerRead, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required.")

    customer = Customer(name=name)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@app.patch("/customers/{customer_id}", response_model=CustomerRead)
def update_customer(
    customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)
):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required.")

    customer.name = name
    db.commit()
    db.refresh(customer)
    return customer


@app.get("/customers/{customer_id}/filter-plants", response_model=list[FilterPlantRead])
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


@app.get("/filter-plants/{filter_plant_id}", response_model=FilterPlantRead)
def get_filter_plant(filter_plant_id: int, db: Session = Depends(get_db)):
    filter_plant = db.get(FilterPlant, filter_plant_id)
    if not filter_plant:
        raise HTTPException(status_code=404, detail="Filter plant not found.")
    return filter_plant


@app.post(
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

    filter_plant = FilterPlant(
        customer_id=customer_id,
        description=description,
        year_built=payload.year_built,
    )
    db.add(filter_plant)
    db.commit()
    db.refresh(filter_plant)
    return filter_plant


@app.patch("/filter-plants/{filter_plant_id}", response_model=FilterPlantRead)
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

    filter_plant.description = description
    filter_plant.year_built = payload.year_built
    db.commit()
    db.refresh(filter_plant)
    return filter_plant


@app.delete("/filter-plants/{filter_plant_id}", status_code=204)
def delete_filter_plant(filter_plant_id: int, db: Session = Depends(get_db)):
    filter_plant = db.get(FilterPlant, filter_plant_id)
    if not filter_plant:
        raise HTTPException(status_code=404, detail="Filter plant not found.")

    db.delete(filter_plant)
    db.commit()
    return None


@app.delete("/customers/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    db.delete(customer)
    db.commit()
    return None
