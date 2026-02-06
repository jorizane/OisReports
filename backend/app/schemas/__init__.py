from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CustomerCreate(BaseModel):
    name: str
    client_id: int


class CustomerRead(BaseModel):
    id: int
    name: str
    client_id: int

    model_config = ConfigDict(from_attributes=True)


class CustomerUpdate(BaseModel):
    name: str
    client_id: int


class ClientCreate(BaseModel):
    name: str


class ClientRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class ManufacturerCreate(BaseModel):
    name: str = Field(..., max_length=100)


class ManufacturerRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class FilterPlantCreate(BaseModel):
    description: str
    year_built: int
    manufacturer_id: int


class FilterPlantRead(BaseModel):
    id: int
    customer_id: int
    manufacturer_id: int
    description: str
    year_built: int

    model_config = ConfigDict(from_attributes=True)


class FilterPlantUpdate(BaseModel):
    description: str
    year_built: int
    manufacturer_id: int


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
    completed: bool

    model_config = ConfigDict(from_attributes=True)


class ReportListRead(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    filter_plant_id: int
    filter_plant_description: str
    created_at: datetime
    completed: bool

    model_config = ConfigDict(from_attributes=True)


class ReportComponentRead(BaseModel):
    component_id: int
    component_name: str
    description: str


class ReportDetailRead(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    filter_plant_id: int
    filter_plant_description: str
    created_at: datetime
    completed: bool
    components: list[ReportComponentRead]


class ReportUpdate(BaseModel):
    completed: bool
    component_descriptions: list[ReportComponentCreate]
