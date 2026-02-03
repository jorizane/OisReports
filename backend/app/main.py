import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from .database import Base, engine
from .models import Customer  # noqa: F401

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

    yield


app = FastAPI(lifespan=lifespan)

@app.get("/")
def root():
    return {
        "name": "OIS Reports API",
        "endpoints": {
            "health": "/health",
            "db_health": "/db-health",
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
