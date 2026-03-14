from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user
from app.schemas.adjustment import AdjustmentCreate, AdjustmentResponse
from app.services.adjustment_service import get_adjustments, get_adjustment, create_adjustment, confirm_adjustment, cancel_adjustment
from app.models.user import User

router = APIRouter(prefix="/api/v1/adjustments", tags=["Adjustments"])


def _build_response(adj) -> AdjustmentResponse:
    return AdjustmentResponse(
        id=adj.id, reference=adj.reference,
        product_id=adj.product_id,
        product_name=adj.product.name if adj.product else None,
        location_id=adj.location_id,
        location_name=adj.location.name if adj.location else None,
        quantity=adj.quantity, reason=adj.reason,
        status=adj.status.value, created_by=adj.created_by,
        created_at=adj.created_at, updated_at=adj.updated_at,
    )


@router.get("", response_model=List[AdjustmentResponse])
def list_adjustments(status: Optional[str] = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return [_build_response(a) for a in get_adjustments(db, status)]


@router.get("/{adjustment_id}", response_model=AdjustmentResponse)
def detail(adjustment_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(get_adjustment(db, adjustment_id))


@router.post("", response_model=AdjustmentResponse)
def create(data: AdjustmentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _build_response(create_adjustment(db, data, user.id))


@router.post("/{adjustment_id}/done", response_model=AdjustmentResponse)
def done(adjustment_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _build_response(confirm_adjustment(db, adjustment_id, user.id))


@router.post("/{adjustment_id}/cancel", response_model=AdjustmentResponse)
def cancel(adjustment_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _build_response(cancel_adjustment(db, adjustment_id))
