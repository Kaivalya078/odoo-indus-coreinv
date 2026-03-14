from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from decimal import Decimal


class StockLevelResponse(BaseModel):
    product_id: UUID
    product_name: str
    product_sku: str
    location_id: UUID
    location_name: str
    warehouse_name: str
    quantity: Decimal
    unit: str
    min_stock: Decimal

    class Config:
        from_attributes = True


class StockMoveResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: Optional[str] = None
    location_id: UUID
    location_name: Optional[str] = None
    quantity: Decimal
    reference: str
    move_type: str
    created_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True
