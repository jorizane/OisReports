from pydantic import BaseModel, ConfigDict


class CustomerCreate(BaseModel):
    name: str


class CustomerRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)
