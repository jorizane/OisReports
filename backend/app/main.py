import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.router import api_router
from .core.database import Base, SessionLocal, engine
from .models import Customer


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

app.include_router(api_router)
