from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class WarehouseCreate(BaseModel):
    name: str
    address: Optional[str] = None


class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None


class WarehouseResponse(BaseModel):
    id: UUID
    name: str
    address: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LocationCreate(BaseModel):
    name: str
    warehouse_id: UUID
    zone: Optional[str] = None


class LocationUpdate(BaseModel):
    name: Optional[str] = None
    zone: Optional[str] = None


class LocationResponse(BaseModel):
    id: UUID
    name: str
    warehouse_id: UUID
    warehouse_name: Optional[str] = None
    zone: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
