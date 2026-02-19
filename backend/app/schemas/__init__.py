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


class FilterReportValueCreate(BaseModel):
    filter_test_field_id: int
    value_text: str | None = None
    value_number: float | None = None
    value_option: str | None = None
    value_bool: bool | None = None


class ReportCreate(BaseModel):
    filter_values: list[FilterReportValueCreate]


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


class FilterTestFieldRead(BaseModel):
    id: int
    filter_id: int
    label: str
    field_type: str
    unit: str | None = None
    options: str | None = None
    required: bool
    min_value: float | None = None
    max_value: float | None = None


class FilterReportValueRead(BaseModel):
    filter_test_field_id: int
    label: str
    field_type: str
    unit: str | None = None
    options: str | None = None
    required: bool
    min_value: float | None = None
    max_value: float | None = None
    value_text: str | None = None
    value_number: float | None = None
    value_option: str | None = None
    value_bool: bool | None = None


class ReportDetailRead(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    filter_plant_id: int
    filter_plant_description: str
    created_at: datetime
    completed: bool
    filter_values: list[FilterReportValueRead]


class ReportUpdate(BaseModel):
    completed: bool
    filter_values: list[FilterReportValueCreate]


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthUserRead(BaseModel):
    id: int
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    user: AuthUserRead
