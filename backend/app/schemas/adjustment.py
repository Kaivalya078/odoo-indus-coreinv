from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from decimal import Decimal


class AdjustmentCreate(BaseModel):
    product_id: UUID
    location_id: UUID
    quantity: Decimal
    reason: str


class AdjustmentResponse(BaseModel):
    id: UUID
    reference: str
    product_id: UUID
    product_name: Optional[str] = None
    location_id: UUID
    location_name: Optional[str] = None
    quantity: Decimal
    reason: str
    status: str
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
