from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timezone
from app.models.receipt import Receipt, ReceiptItem, OperationStatus
from app.models.stock_move import MoveType
from app.schemas.receipt import ReceiptCreate, ReceiptUpdate
from app.utils.reference_generator import generate_reference
from app.services.stock_service import create_stock_move


def get_receipts(db: Session, status: str = None):
    query = db.query(Receipt)
    if status:
        query = query.filter(Receipt.status == status)
    return query.order_by(Receipt.created_at.desc()).all()


def get_receipt(db: Session, receipt_id):
    rec = db.query(Receipt).filter(Receipt.id == receipt_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return rec


def create_receipt(db: Session, data: ReceiptCreate, user_id):
    ref = generate_reference(db, "REC", Receipt)
    rec = Receipt(
        reference=ref,
        supplier_id=data.supplier_id,
        warehouse_id=data.warehouse_id,
        notes=data.notes,
        created_by=user_id,
        status=OperationStatus.DRAFT,
    )
    db.add(rec)
    db.flush()
    for item in data.items:
        ri = ReceiptItem(
            receipt_id=rec.id,
            product_id=item.product_id,
            location_id=item.location_id,
            quantity=item.quantity,
        )
        db.add(ri)
    db.commit()
    db.refresh(rec)
    return rec


def update_receipt(db: Session, receipt_id, data: ReceiptUpdate):
    rec = get_receipt(db, receipt_id)
    if rec.status != OperationStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only edit DRAFT receipts")
    if data.supplier_id is not None:
        rec.supplier_id = data.supplier_id
    if data.notes is not None:
        rec.notes = data.notes
    if data.items is not None:
        db.query(ReceiptItem).filter(ReceiptItem.receipt_id == rec.id).delete()
        for item in data.items:
            ri = ReceiptItem(
                receipt_id=rec.id,
                product_id=item.product_id,
                location_id=item.location_id,
                quantity=item.quantity,
            )
            db.add(ri)
    db.commit()
    db.refresh(rec)
    return rec


def validate_receipt(db: Session, receipt_id):
    rec = get_receipt(db, receipt_id)
    if rec.status != OperationStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only validate DRAFT receipts")
    rec.status = OperationStatus.VALIDATED
    rec.validated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(rec)
    return rec


def confirm_receipt(db: Session, receipt_id, user_id):
    rec = get_receipt(db, receipt_id)
    if rec.status != OperationStatus.VALIDATED:
        raise HTTPException(status_code=400, detail="Can only confirm VALIDATED receipts")
    for item in rec.items:
        create_stock_move(
            db, item.product_id, item.location_id,
            quantity=item.quantity,
            reference=rec.reference,
            move_type=MoveType.RECEIPT,
            source_document_id=rec.id,
            created_by=user_id,
        )
    rec.status = OperationStatus.DONE
    db.commit()
    db.refresh(rec)
    return rec


def cancel_receipt(db: Session, receipt_id):
    rec = get_receipt(db, receipt_id)
    if rec.status == OperationStatus.DONE:
        raise HTTPException(status_code=400, detail="Cannot cancel a completed receipt")
    rec.status = OperationStatus.CANCELLED
    db.commit()
    db.refresh(rec)
    return rec
