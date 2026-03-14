from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.adjustment import Adjustment, AdjustmentStatus
from app.models.stock_move import MoveType
from app.schemas.adjustment import AdjustmentCreate
from app.utils.reference_generator import generate_reference
from app.services.stock_service import create_stock_move, assert_stock_available
from decimal import Decimal


def get_adjustments(db: Session, status: str = None):
    query = db.query(Adjustment)
    if status:
        query = query.filter(Adjustment.status == status)
    return query.order_by(Adjustment.created_at.desc()).all()


def get_adjustment(db: Session, adjustment_id):
    adj = db.query(Adjustment).filter(Adjustment.id == adjustment_id).first()
    if not adj:
        raise HTTPException(status_code=404, detail="Adjustment not found")
    return adj


def create_adjustment(db: Session, data: AdjustmentCreate, user_id):
    ref = generate_reference(db, "ADJ", Adjustment)
    adj = Adjustment(
        reference=ref,
        product_id=data.product_id,
        location_id=data.location_id,
        quantity=data.quantity,
        reason=data.reason,
        created_by=user_id,
        status=AdjustmentStatus.DRAFT,
    )
    db.add(adj)
    db.commit()
    db.refresh(adj)
    return adj


def confirm_adjustment(db: Session, adjustment_id, user_id):
    adj = get_adjustment(db, adjustment_id)
    if adj.status != AdjustmentStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only confirm DRAFT adjustments")
    if adj.quantity < 0:
        assert_stock_available(db, adj.product_id, adj.location_id, abs(adj.quantity))
    create_stock_move(
        db, adj.product_id, adj.location_id,
        quantity=adj.quantity,
        reference=adj.reference,
        move_type=MoveType.ADJUSTMENT,
        source_document_id=adj.id,
        created_by=user_id,
    )
    adj.status = AdjustmentStatus.DONE
    db.commit()
    db.refresh(adj)
    return adj


def cancel_adjustment(db: Session, adjustment_id):
    adj = get_adjustment(db, adjustment_id)
    if adj.status == AdjustmentStatus.DONE:
        raise HTTPException(status_code=400, detail="Cannot cancel a completed adjustment")
    adj.status = AdjustmentStatus.CANCELLED
    db.commit()
    db.refresh(adj)
    return adj
