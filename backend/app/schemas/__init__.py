from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CustomerCreate(BaseModel):
    name: str


class CustomerRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class CustomerUpdate(BaseModel):
    name: str


class FilterPlantCreate(BaseModel):
    description: str
    year_built: int


class FilterPlantRead(BaseModel):
    id: int
    customer_id: int
    description: str
    year_built: int

    model_config = ConfigDict(from_attributes=True)


class FilterPlantUpdate(BaseModel):
    description: str
    year_built: int


class ComponentCreate(BaseModel):
    name: str


class ComponentRead(BaseModel):
    id: int
    filter_plant_id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class ComponentUpdate(BaseModel):
    name: str


class ReportComponentCreate(BaseModel):
    component_id: int
    description: str


class ReportCreate(BaseModel):
    component_descriptions: list[ReportComponentCreate]


class ReportRead(BaseModel):
    id: int
    customer_id: int
    filter_plant_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportListRead(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    filter_plant_id: int
    filter_plant_description: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
