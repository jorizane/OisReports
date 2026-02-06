from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..core.database import Base


class Manufacturer(Base):
    __tablename__ = "manufacturers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)

    filter_plants = relationship("FilterPlant", back_populates="manufacturer")


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)

    customers = relationship("Customer", back_populates="client")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)

    client = relationship("Client", back_populates="customers")
    filter_plants = relationship("FilterPlant", back_populates="customer", cascade="all, delete-orphan")


class FilterPlant(Base):
    __tablename__ = "filter_plants"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id"), nullable=False, index=True)
    description = Column(String(500), nullable=False)
    year_built = Column(Integer, nullable=False)

    customer = relationship("Customer", back_populates="filter_plants")
    manufacturer = relationship("Manufacturer", back_populates="filter_plants")
    components = relationship("Component", back_populates="filter_plant", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="filter_plant", cascade="all, delete-orphan")


class Component(Base):
    __tablename__ = "components"

    id = Column(Integer, primary_key=True, index=True)
    filter_plant_id = Column(Integer, ForeignKey("filter_plants.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)

    filter_plant = relationship("FilterPlant", back_populates="components")
    report_components = relationship(
        "ReportComponent", back_populates="component", cascade="all, delete-orphan"
    )


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    filter_plant_id = Column(Integer, ForeignKey("filter_plants.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    customer = relationship("Customer")
    filter_plant = relationship("FilterPlant", back_populates="reports")
    items = relationship("ReportComponent", back_populates="report", cascade="all, delete-orphan")


class ReportComponent(Base):
    __tablename__ = "report_components"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False, index=True)
    component_id = Column(Integer, ForeignKey("components.id"), nullable=False, index=True)
    description = Column(String(1000), nullable=False)

    report = relationship("Report", back_populates="items")
    component = relationship("Component", back_populates="report_components")
