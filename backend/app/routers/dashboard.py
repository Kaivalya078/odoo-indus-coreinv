from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from decimal import Decimal
from app.core.dependencies import get_db, get_current_user
from app.schemas.dashboard import DashboardStats, LowStockItem, WarehouseSummary
from app.schemas.stock import StockMoveResponse
from app.models.product import Product
from app.models.warehouse import Warehouse, Location
from app.models.supplier import Supplier
from app.models.receipt import Receipt, OperationStatus
from app.models.delivery import Delivery
from app.models.transfer import Transfer
from app.models.stock_move import StockMove

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db), user=Depends(get_current_user)):
    total_products = db.query(Product).filter(Product.is_active == True).count()
    total_warehouses = db.query(Warehouse).filter(Warehouse.is_active == True).count()
    total_suppliers = db.query(Supplier).filter(Supplier.is_active == True).count()
    pending_receipts = db.query(Receipt).filter(Receipt.status.in_([OperationStatus.DRAFT, OperationStatus.VALIDATED])).count()
    pending_deliveries = db.query(Delivery).filter(Delivery.status.in_([OperationStatus.DRAFT, OperationStatus.VALIDATED])).count()
    pending_transfers = db.query(Transfer).filter(Transfer.status.in_([OperationStatus.DRAFT, OperationStatus.VALIDATED])).count()

    stock_query = db.query(
        StockMove.product_id,
        StockMove.location_id,
        func.sum(StockMove.quantity).label("qty"),
    ).group_by(StockMove.product_id, StockMove.location_id).subquery()

    low_stock_count = 0
    products = db.query(Product).filter(Product.is_active == True).all()
    for p in products:
        rows = db.query(stock_query.c.qty).filter(stock_query.c.product_id == p.id).all()
        total = sum(r.qty for r in rows) if rows else 0
        if total < p.min_stock:
            low_stock_count += 1

    return DashboardStats(
        total_products=total_products,
        total_warehouses=total_warehouses,
        total_suppliers=total_suppliers,
        pending_receipts=pending_receipts,
        pending_deliveries=pending_deliveries,
        pending_transfers=pending_transfers,
        low_stock_count=low_stock_count,
    )


@router.get("/recent-moves", response_model=List[StockMoveResponse])
def recent_moves(db: Session = Depends(get_db), user=Depends(get_current_user)):
    moves = db.query(StockMove).order_by(StockMove.created_at.desc()).limit(10).all()
    return [
        StockMoveResponse(
            id=m.id, product_id=m.product_id,
            product_name=m.product.name if m.product else None,
            location_id=m.location_id,
            location_name=m.location.name if m.location else None,
            quantity=m.quantity, reference=m.reference,
            move_type=m.move_type.value, created_by=m.created_by,
            created_at=m.created_at,
        ) for m in moves
    ]


@router.get("/low-stock", response_model=List[LowStockItem])
def low_stock(db: Session = Depends(get_db), user=Depends(get_current_user)):
    stock_data = db.query(
        StockMove.product_id,
        StockMove.location_id,
        func.sum(StockMove.quantity).label("qty"),
    ).group_by(StockMove.product_id, StockMove.location_id).all()

    items = []
    for row in stock_data:
        product = db.query(Product).filter(Product.id == row.product_id).first()
        location = db.query(Location).filter(Location.id == row.location_id).first()
        if product and location and row.qty < product.min_stock:
            items.append(LowStockItem(
                product_name=product.name,
                product_sku=product.sku,
                location_name=location.name,
                warehouse_name=location.warehouse.name if location.warehouse else "",
                current_stock=row.qty,
                min_stock=product.min_stock,
                unit=product.unit,
            ))
    return items


@router.get("/warehouse-summary", response_model=List[WarehouseSummary])
def warehouse_summary(db: Session = Depends(get_db), user=Depends(get_current_user)):
    warehouses = db.query(Warehouse).filter(Warehouse.is_active == True).all()
    result = []
    for wh in warehouses:
        location_ids = [l.id for l in wh.locations]
        if not location_ids:
            result.append(WarehouseSummary(warehouse_name=wh.name, total_products=0, total_stock=Decimal("0")))
            continue
        stock_data = db.query(
            func.count(func.distinct(StockMove.product_id)).label("products"),
            func.coalesce(func.sum(StockMove.quantity), 0).label("total"),
        ).filter(StockMove.location_id.in_(location_ids)).first()
        result.append(WarehouseSummary(
            warehouse_name=wh.name,
            total_products=stock_data.products if stock_data else 0,
            total_stock=stock_data.total if stock_data else Decimal("0"),
        ))
    return result
