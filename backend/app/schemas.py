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
