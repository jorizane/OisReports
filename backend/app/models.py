from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)

    filter_plants = relationship("FilterPlant", back_populates="customer", cascade="all, delete-orphan")


class FilterPlant(Base):
    __tablename__ = "filter_plants"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    description = Column(String(500), nullable=False)
    year_built = Column(Integer, nullable=False)

    customer = relationship("Customer", back_populates="filter_plants")
    components = relationship("Component", back_populates="filter_plant", cascade="all, delete-orphan")


class Component(Base):
    __tablename__ = "components"

    id = Column(Integer, primary_key=True, index=True)
    filter_plant_id = Column(Integer, ForeignKey("filter_plants.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)

    filter_plant = relationship("FilterPlant", back_populates="components")
