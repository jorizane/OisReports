import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


def _build_database_url() -> str:
    user = os.getenv("POSTGRES_USER", "ois")
    password = os.getenv("POSTGRES_PASSWORD", "ois")
    host = os.getenv("POSTGRES_HOST", "db")
    port = os.getenv("POSTGRES_PORT", "5432")
    db_name = os.getenv("POSTGRES_DB", "ois_reports")

    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db_name}"


DATABASE_URL = os.getenv("DATABASE_URL", _build_database_url())

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
