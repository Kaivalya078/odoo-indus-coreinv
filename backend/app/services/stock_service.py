from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from decimal import Decimal
from app.models.stock_move import StockMove, MoveType


def get_stock_at_location(db: Session, product_id, location_id) -> Decimal:
    result = db.query(func.coalesce(func.sum(StockMove.quantity), 0)).filter(
        StockMove.product_id == product_id,
        StockMove.location_id == location_id,
    ).scalar()
    return Decimal(str(result))


def assert_stock_available(db: Session, product_id, location_id, required_qty: Decimal):
    current = get_stock_at_location(db, product_id, location_id)
    if current < required_qty:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {current}, Required: {required_qty}",
        )


def create_stock_move(db: Session, product_id, location_id, quantity, reference, move_type: MoveType, source_document_id, created_by):
    move = StockMove(
        product_id=product_id,
        location_id=location_id,
        quantity=quantity,
        reference=reference,
        move_type=move_type,
        source_document_id=source_document_id,
        created_by=created_by,
    )
    db.add(move)
    return move
