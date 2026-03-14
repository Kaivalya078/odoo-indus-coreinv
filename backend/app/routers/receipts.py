from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user
from app.schemas.receipt import ReceiptCreate, ReceiptUpdate, ReceiptResponse, ReceiptItemResponse
from app.services.receipt_service import get_receipts, get_receipt, create_receipt, update_receipt, validate_receipt, confirm_receipt, cancel_receipt
from app.models.user import User

router = APIRouter(prefix="/api/v1/receipts", tags=["Receipts"])


def _build_response(rec) -> ReceiptResponse:
    return ReceiptResponse(
        id=rec.id, reference=rec.reference, supplier_id=rec.supplier_id,
        supplier_name=rec.supplier.name if rec.supplier else None,
        warehouse_id=rec.warehouse_id,
        warehouse_name=rec.warehouse.name if rec.warehouse else None,
        status=rec.status.value, notes=rec.notes,
        created_by=rec.created_by, validated_at=rec.validated_at,
        created_at=rec.created_at, updated_at=rec.updated_at,
        items=[
            ReceiptItemResponse(
                id=i.id, product_id=i.product_id,
                product_name=i.product.name if i.product else None,
                location_id=i.location_id,
                location_name=i.location.name if i.location else None,
                quantity=i.quantity, created_at=i.created_at,
            ) for i in rec.items
        ],
    )


@router.get("", response_model=List[ReceiptResponse])
def list_receipts(status: Optional[str] = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return [_build_response(r) for r in get_receipts(db, status)]


@router.get("/{receipt_id}", response_model=ReceiptResponse)
def detail(receipt_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(get_receipt(db, receipt_id))


@router.post("", response_model=ReceiptResponse)
def create(data: ReceiptCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _build_response(create_receipt(db, data, user.id))


@router.put("/{receipt_id}", response_model=ReceiptResponse)
def update(receipt_id: UUID, data: ReceiptUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(update_receipt(db, receipt_id, data))


@router.post("/{receipt_id}/validate", response_model=ReceiptResponse)
def validate(receipt_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(validate_receipt(db, receipt_id))


@router.post("/{receipt_id}/done", response_model=ReceiptResponse)
def done(receipt_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _build_response(confirm_receipt(db, receipt_id, user.id))


@router.post("/{receipt_id}/cancel", response_model=ReceiptResponse)
def cancel(receipt_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(cancel_receipt(db, receipt_id))
