from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from typing import List, Optional
from decimal import Decimal
from app.core.dependencies import get_db, get_current_user
from app.schemas.stock import StockLevelResponse, StockMoveResponse
from app.models.stock_move import StockMove
from app.models.product import Product
from app.models.warehouse import Location

router = APIRouter(prefix="/api/v1/stock", tags=["Stock"])


@router.get("", response_model=List[StockLevelResponse])
def current_stock(
    warehouse_id: Optional[UUID] = None,
    product_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    query = db.query(
        StockMove.product_id,
        StockMove.location_id,
        func.sum(StockMove.quantity).label("quantity"),
    ).group_by(StockMove.product_id, StockMove.location_id).having(func.sum(StockMove.quantity) != 0)

    if product_id:
        query = query.filter(StockMove.product_id == product_id)
    if warehouse_id:
        query = query.join(Location, StockMove.location_id == Location.id).filter(Location.warehouse_id == warehouse_id)

    results = query.all()
    response = []
    for row in results:
        product = db.query(Product).filter(Product.id == row.product_id).first()
        location = db.query(Location).filter(Location.id == row.location_id).first()
        if product and location:
            response.append(StockLevelResponse(
                product_id=row.product_id,
                product_name=product.name,
                product_sku=product.sku,
                location_id=row.location_id,
                location_name=location.name,
                warehouse_name=location.warehouse.name if location.warehouse else "",
                quantity=row.quantity,
                unit=product.unit,
                min_stock=product.min_stock,
            ))
    return response


@router.get("/moves", response_model=List[StockMoveResponse])
def move_history(
    product_id: Optional[UUID] = None,
    location_id: Optional[UUID] = None,
    move_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    query = db.query(StockMove)
    if product_id:
        query = query.filter(StockMove.product_id == product_id)
    if location_id:
        query = query.filter(StockMove.location_id == location_id)
    if move_type:
        query = query.filter(StockMove.move_type == move_type)
    moves = query.order_by(StockMove.created_at.desc()).offset(skip).limit(limit).all()
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


@router.get("/product/{product_id}", response_model=List[StockLevelResponse])
def stock_by_product(product_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    results = db.query(
        StockMove.location_id,
        func.sum(StockMove.quantity).label("quantity"),
    ).filter(StockMove.product_id == product_id).group_by(StockMove.location_id).having(func.sum(StockMove.quantity) != 0).all()

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return []
    response = []
    for row in results:
        location = db.query(Location).filter(Location.id == row.location_id).first()
        if location:
            response.append(StockLevelResponse(
                product_id=product_id,
                product_name=product.name,
                product_sku=product.sku,
                location_id=row.location_id,
                location_name=location.name,
                warehouse_name=location.warehouse.name if location.warehouse else "",
                quantity=row.quantity,
                unit=product.unit,
                min_stock=product.min_stock,
            ))
    return response
