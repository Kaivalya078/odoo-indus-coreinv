from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timezone
from app.models.transfer import Transfer, TransferItem
from app.models.receipt import OperationStatus
from app.models.stock_move import MoveType
from app.schemas.transfer import TransferCreate, TransferUpdate
from app.utils.reference_generator import generate_reference
from app.services.stock_service import create_stock_move, assert_stock_available


def get_transfers(db: Session, status: str = None):
    query = db.query(Transfer)
    if status:
        query = query.filter(Transfer.status == status)
    return query.order_by(Transfer.created_at.desc()).all()


def get_transfer(db: Session, transfer_id):
    trf = db.query(Transfer).filter(Transfer.id == transfer_id).first()
    if not trf:
        raise HTTPException(status_code=404, detail="Transfer not found")
    return trf


def create_transfer(db: Session, data: TransferCreate, user_id):
    ref = generate_reference(db, "TRF", Transfer)
    trf = Transfer(
        reference=ref,
        source_warehouse_id=data.source_warehouse_id,
        dest_warehouse_id=data.dest_warehouse_id,
        notes=data.notes,
        created_by=user_id,
        status=OperationStatus.DRAFT,
    )
    db.add(trf)
    db.flush()
    for item in data.items:
        ti = TransferItem(
            transfer_id=trf.id,
            product_id=item.product_id,
            source_location_id=item.source_location_id,
            dest_location_id=item.dest_location_id,
            quantity=item.quantity,
        )
        db.add(ti)
    db.commit()
    db.refresh(trf)
    return trf


def update_transfer(db: Session, transfer_id, data: TransferUpdate):
    trf = get_transfer(db, transfer_id)
    if trf.status != OperationStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only edit DRAFT transfers")
    if data.notes is not None:
        trf.notes = data.notes
    if data.items is not None:
        db.query(TransferItem).filter(TransferItem.transfer_id == trf.id).delete()
        for item in data.items:
            ti = TransferItem(
                transfer_id=trf.id,
                product_id=item.product_id,
                source_location_id=item.source_location_id,
                dest_location_id=item.dest_location_id,
                quantity=item.quantity,
            )
            db.add(ti)
    db.commit()
    db.refresh(trf)
    return trf


def validate_transfer(db: Session, transfer_id):
    trf = get_transfer(db, transfer_id)
    if trf.status != OperationStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only validate DRAFT transfers")
    trf.status = OperationStatus.VALIDATED
    trf.validated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(trf)
    return trf


def confirm_transfer(db: Session, transfer_id, user_id):
    trf = get_transfer(db, transfer_id)
    if trf.status != OperationStatus.VALIDATED:
        raise HTTPException(status_code=400, detail="Can only confirm VALIDATED transfers")
    for item in trf.items:
        assert_stock_available(db, item.product_id, item.source_location_id, item.quantity)
    for item in trf.items:
        create_stock_move(
            db, item.product_id, item.source_location_id,
            quantity=-item.quantity,
            reference=trf.reference,
            move_type=MoveType.TRANSFER_OUT,
            source_document_id=trf.id,
            created_by=user_id,
        )
        create_stock_move(
            db, item.product_id, item.dest_location_id,
            quantity=item.quantity,
            reference=trf.reference,
            move_type=MoveType.TRANSFER_IN,
            source_document_id=trf.id,
            created_by=user_id,
        )
    trf.status = OperationStatus.DONE
    db.commit()
    db.refresh(trf)
    return trf


def cancel_transfer(db: Session, transfer_id):
    trf = get_transfer(db, transfer_id)
    if trf.status == OperationStatus.DONE:
        raise HTTPException(status_code=400, detail="Cannot cancel a completed transfer")
    trf.status = OperationStatus.CANCELLED
    db.commit()
    db.refresh(trf)
    return trf
