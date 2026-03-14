from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class DeliveryItemCreate(BaseModel):
    product_id: UUID
    location_id: UUID
    quantity: Decimal


class DeliveryCreate(BaseModel):
    customer_name: str
    warehouse_id: UUID
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    items: List[DeliveryItemCreate]


class DeliveryUpdate(BaseModel):
    customer_name: Optional[str] = None
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    items: Optional[List[DeliveryItemCreate]] = None


class DeliveryItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: Optional[str] = None
    location_id: UUID
    location_name: Optional[str] = None
    quantity: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class DeliveryResponse(BaseModel):
    id: UUID
    reference: str
    customer_name: str
    warehouse_id: UUID
    warehouse_name: Optional[str] = None
    status: str
    notes: Optional[str]
    scheduled_date: Optional[datetime] = None
    created_by: UUID
    validated_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    items: List[DeliveryItemResponse] = []

    class Config:
        from_attributes = True
