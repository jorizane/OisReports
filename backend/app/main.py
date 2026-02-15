import json
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.router import api_router
from .core.database import Base, SessionLocal, engine
from .models import Client, Customer, Filter, FilterPlant, FilterTestField


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
        if db.query(Client).count() == 0:
            client = Client(name="Initial Client")
            db.add(client)
            db.commit()
            db.refresh(client)
        else:
            client = db.query(Client).order_by(Client.id.asc()).first()

        if client and db.query(Customer).count() == 0:
            db.add(Customer(name="Initial Customer", client_id=client.id))
            db.commit()

        filter_plants = db.query(FilterPlant).order_by(FilterPlant.id.asc()).all()
        for filter_plant in filter_plants:
            if not filter_plant.filter:
                filter_item = Filter(
                    filter_plant_id=filter_plant.id,
                    name="Standardfilter",
                    description="Automatisch angelegter Filter",
                )
                db.add(filter_item)
                db.flush()
            else:
                filter_item = filter_plant.filter

            existing_fields = (
                db.query(FilterTestField)
                .filter(FilterTestField.filter_id == filter_item.id)
                .count()
            )
            if existing_fields == 0:
                db.add_all(
                    [
                        FilterTestField(
                            filter_id=filter_item.id,
                            label="Differenzdruck",
                            field_type="number",
                            unit="bar",
                            required=True,
                            min_value=0,
                            max_value=10,
                        ),
                        FilterTestField(
                            filter_id=filter_item.id,
                            label="Dichtheit geprüft",
                            field_type="radio",
                            options=json.dumps(["OK", "Nicht OK"]),
                            required=True,
                        ),
                        FilterTestField(
                            filter_id=filter_item.id,
                            label="Filter beschädigt?",
                            field_type="radio",
                            options=json.dumps(["Nein", "Ja"]),
                            required=True,
                        ),
                        FilterTestField(
                            filter_id=filter_item.id,
                            label="Geräuschentwicklung",
                            field_type="number",
                            unit="dB",
                            required=False,
                            min_value=0,
                            max_value=120,
                        ),
                        FilterTestField(
                            filter_id=filter_item.id,
                            label="Beschreibung / Auffälligkeiten",
                            field_type="text",
                            required=False,
                        ),
                    ]
                )
        db.commit()
    finally:
        db.close()

    yield


app = FastAPI(lifespan=lifespan)

cors_allow_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:4200").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
