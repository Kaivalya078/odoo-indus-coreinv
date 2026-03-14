from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from decimal import Decimal


class ProductCreate(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    unit: str = "pcs"
    min_stock: Decimal = 0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    unit: Optional[str] = None
    min_stock: Optional[Decimal] = None


class ProductResponse(BaseModel):
    id: UUID
    sku: str
    name: str
    description: Optional[str]
    category_id: Optional[UUID]
    category_name: Optional[str] = None
    unit: str
    min_stock: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
