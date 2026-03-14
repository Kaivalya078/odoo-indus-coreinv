from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class ReceiptItemCreate(BaseModel):
    product_id: UUID
    location_id: UUID
    quantity: Decimal


class ReceiptCreate(BaseModel):
    supplier_id: Optional[UUID] = None
    warehouse_id: UUID
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    source_document: Optional[str] = None
    items: List[ReceiptItemCreate]


class ReceiptUpdate(BaseModel):
    supplier_id: Optional[UUID] = None
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    source_document: Optional[str] = None
    items: Optional[List[ReceiptItemCreate]] = None


class ReceiptItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: Optional[str] = None
    location_id: UUID
    location_name: Optional[str] = None
    quantity: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class ReceiptResponse(BaseModel):
    id: UUID
    reference: str
    supplier_id: Optional[UUID]
    supplier_name: Optional[str] = None
    warehouse_id: UUID
    warehouse_name: Optional[str] = None
    status: str
    notes: Optional[str]
    scheduled_date: Optional[datetime] = None
    source_document: Optional[str] = None
    created_by: UUID
    validated_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    items: List[ReceiptItemResponse] = []

    class Config:
        from_attributes = True
