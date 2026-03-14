from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user
from app.schemas.delivery import DeliveryCreate, DeliveryUpdate, DeliveryResponse, DeliveryItemResponse
from app.services.delivery_service import get_deliveries, get_delivery, create_delivery, update_delivery, validate_delivery, confirm_delivery, cancel_delivery
from app.models.user import User

router = APIRouter(prefix="/api/v1/deliveries", tags=["Deliveries"])


def _build_response(dlv) -> DeliveryResponse:
    return DeliveryResponse(
        id=dlv.id, reference=dlv.reference, customer_name=dlv.customer_name,
        warehouse_id=dlv.warehouse_id,
        warehouse_name=dlv.warehouse.name if dlv.warehouse else None,
        status=dlv.status.value, notes=dlv.notes,
        created_by=dlv.created_by, validated_at=dlv.validated_at,
        created_at=dlv.created_at, updated_at=dlv.updated_at,
        items=[
            DeliveryItemResponse(
                id=i.id, product_id=i.product_id,
                product_name=i.product.name if i.product else None,
                location_id=i.location_id,
                location_name=i.location.name if i.location else None,
                quantity=i.quantity, created_at=i.created_at,
            ) for i in dlv.items
        ],
    )


@router.get("", response_model=List[DeliveryResponse])
def list_deliveries(status: Optional[str] = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return [_build_response(d) for d in get_deliveries(db, status)]


@router.get("/{delivery_id}", response_model=DeliveryResponse)
def detail(delivery_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(get_delivery(db, delivery_id))


@router.post("", response_model=DeliveryResponse)
def create(data: DeliveryCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _build_response(create_delivery(db, data, user.id))


@router.put("/{delivery_id}", response_model=DeliveryResponse)
def update(delivery_id: UUID, data: DeliveryUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(update_delivery(db, delivery_id, data))


@router.post("/{delivery_id}/validate", response_model=DeliveryResponse)
def validate(delivery_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(validate_delivery(db, delivery_id))


@router.post("/{delivery_id}/done", response_model=DeliveryResponse)
def done(delivery_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _build_response(confirm_delivery(db, delivery_id, user.id))


@router.post("/{delivery_id}/cancel", response_model=DeliveryResponse)
def cancel(delivery_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(cancel_delivery(db, delivery_id))
