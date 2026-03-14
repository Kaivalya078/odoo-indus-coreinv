from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal


class DashboardStats(BaseModel):
    total_products: int
    total_warehouses: int
    total_suppliers: int
    pending_receipts: int
    pending_deliveries: int
    pending_transfers: int
    low_stock_count: int


class LowStockItem(BaseModel):
    product_name: str
    product_sku: str
    location_name: str
    warehouse_name: str
    current_stock: Decimal
    min_stock: Decimal
    unit: str


class WarehouseSummary(BaseModel):
    warehouse_name: str
    total_products: int
    total_stock: Decimal
