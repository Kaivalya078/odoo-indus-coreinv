from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timezone
from app.models.delivery import Delivery, DeliveryItem
from app.models.receipt import OperationStatus
from app.models.stock_move import MoveType
from app.schemas.delivery import DeliveryCreate, DeliveryUpdate
from app.utils.reference_generator import generate_reference
from app.services.stock_service import create_stock_move, assert_stock_available


def get_deliveries(db: Session, status: str = None):
    query = db.query(Delivery)
    if status:
        query = query.filter(Delivery.status == status)
    return query.order_by(Delivery.created_at.desc()).all()


def get_delivery(db: Session, delivery_id):
    dlv = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not dlv:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return dlv


def create_delivery(db: Session, data: DeliveryCreate, user_id):
    ref = generate_reference(db, "DEL", Delivery)
    dlv = Delivery(
        reference=ref,
        customer_name=data.customer_name,
        warehouse_id=data.warehouse_id,
        notes=data.notes,
        created_by=user_id,
        status=OperationStatus.DRAFT,
    )
    db.add(dlv)
    db.flush()
    for item in data.items:
        di = DeliveryItem(
            delivery_id=dlv.id,
            product_id=item.product_id,
            location_id=item.location_id,
            quantity=item.quantity,
        )
        db.add(di)
    db.commit()
    db.refresh(dlv)
    return dlv


def update_delivery(db: Session, delivery_id, data: DeliveryUpdate):
    dlv = get_delivery(db, delivery_id)
    if dlv.status != OperationStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only edit DRAFT deliveries")
    if data.customer_name is not None:
        dlv.customer_name = data.customer_name
    if data.notes is not None:
        dlv.notes = data.notes
    if data.items is not None:
        db.query(DeliveryItem).filter(DeliveryItem.delivery_id == dlv.id).delete()
        for item in data.items:
            di = DeliveryItem(
                delivery_id=dlv.id,
                product_id=item.product_id,
                location_id=item.location_id,
                quantity=item.quantity,
            )
            db.add(di)
    db.commit()
    db.refresh(dlv)
    return dlv


def validate_delivery(db: Session, delivery_id):
    dlv = get_delivery(db, delivery_id)
    if dlv.status != OperationStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only validate DRAFT deliveries")
    dlv.status = OperationStatus.VALIDATED
    dlv.validated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(dlv)
    return dlv


def confirm_delivery(db: Session, delivery_id, user_id):
    dlv = get_delivery(db, delivery_id)
    if dlv.status != OperationStatus.VALIDATED:
        raise HTTPException(status_code=400, detail="Can only confirm VALIDATED deliveries")
    for item in dlv.items:
        assert_stock_available(db, item.product_id, item.location_id, item.quantity)
    for item in dlv.items:
        create_stock_move(
            db, item.product_id, item.location_id,
            quantity=-item.quantity,
            reference=dlv.reference,
            move_type=MoveType.DELIVERY,
            source_document_id=dlv.id,
            created_by=user_id,
        )
    dlv.status = OperationStatus.DONE
    db.commit()
    db.refresh(dlv)
    return dlv


def cancel_delivery(db: Session, delivery_id):
    dlv = get_delivery(db, delivery_id)
    if dlv.status == OperationStatus.DONE:
        raise HTTPException(status_code=400, detail="Cannot cancel a completed delivery")
    dlv.status = OperationStatus.CANCELLED
    db.commit()
    db.refresh(dlv)
    return dlv
