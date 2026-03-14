from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class TransferItemCreate(BaseModel):
    product_id: UUID
    source_location_id: UUID
    dest_location_id: UUID
    quantity: Decimal


class TransferCreate(BaseModel):
    source_warehouse_id: UUID
    dest_warehouse_id: UUID
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    items: List[TransferItemCreate]


class TransferUpdate(BaseModel):
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    items: Optional[List[TransferItemCreate]] = None


class TransferItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: Optional[str] = None
    source_location_id: UUID
    source_location_name: Optional[str] = None
    dest_location_id: UUID
    dest_location_name: Optional[str] = None
    quantity: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class TransferResponse(BaseModel):
    id: UUID
    reference: str
    source_warehouse_id: UUID
    source_warehouse_name: Optional[str] = None
    dest_warehouse_id: UUID
    dest_warehouse_name: Optional[str] = None
    status: str
    notes: Optional[str]
    scheduled_date: Optional[datetime] = None
    created_by: UUID
    validated_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    items: List[TransferItemResponse] = []

    class Config:
        from_attributes = True
