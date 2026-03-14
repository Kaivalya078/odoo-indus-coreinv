from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user
from app.schemas.transfer import TransferCreate, TransferUpdate, TransferResponse, TransferItemResponse
from app.services.transfer_service import get_transfers, get_transfer, create_transfer, update_transfer, validate_transfer, confirm_transfer, cancel_transfer
from app.models.user import User

router = APIRouter(prefix="/api/v1/transfers", tags=["Transfers"])


def _build_response(trf) -> TransferResponse:
    return TransferResponse(
        id=trf.id, reference=trf.reference,
        source_warehouse_id=trf.source_warehouse_id,
        source_warehouse_name=trf.source_warehouse.name if trf.source_warehouse else None,
        dest_warehouse_id=trf.dest_warehouse_id,
        dest_warehouse_name=trf.dest_warehouse.name if trf.dest_warehouse else None,
        status=trf.status.value, notes=trf.notes,
        created_by=trf.created_by, validated_at=trf.validated_at,
        created_at=trf.created_at, updated_at=trf.updated_at,
        items=[
            TransferItemResponse(
                id=i.id, product_id=i.product_id,
                product_name=i.product.name if i.product else None,
                source_location_id=i.source_location_id,
                source_location_name=i.source_location.name if i.source_location else None,
                dest_location_id=i.dest_location_id,
                dest_location_name=i.dest_location.name if i.dest_location else None,
                quantity=i.quantity, created_at=i.created_at,
            ) for i in trf.items
        ],
    )


@router.get("", response_model=List[TransferResponse])
def list_transfers(status: Optional[str] = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return [_build_response(t) for t in get_transfers(db, status)]


@router.get("/{transfer_id}", response_model=TransferResponse)
def detail(transfer_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(get_transfer(db, transfer_id))


@router.post("", response_model=TransferResponse)
def create(data: TransferCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _build_response(create_transfer(db, data, user.id))


@router.put("/{transfer_id}", response_model=TransferResponse)
def update(transfer_id: UUID, data: TransferUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(update_transfer(db, transfer_id, data))


@router.post("/{transfer_id}/validate", response_model=TransferResponse)
def validate(transfer_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(validate_transfer(db, transfer_id))


@router.post("/{transfer_id}/done", response_model=TransferResponse)
def done(transfer_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _build_response(confirm_transfer(db, transfer_id, user.id))


@router.post("/{transfer_id}/cancel", response_model=TransferResponse)
def cancel(transfer_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(cancel_transfer(db, transfer_id))
