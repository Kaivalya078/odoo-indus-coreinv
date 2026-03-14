from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user
from app.schemas.warehouse import LocationCreate, LocationUpdate, LocationResponse
from app.services.location_service import get_locations, get_location, create_location, update_location, delete_location

router = APIRouter(prefix="/api/v1/locations", tags=["Locations"])


@router.get("", response_model=List[LocationResponse])
def list_locations(warehouse_id: Optional[UUID] = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    locations = get_locations(db, warehouse_id)
    return [
        LocationResponse(
            id=l.id, name=l.name, warehouse_id=l.warehouse_id,
            warehouse_name=l.warehouse.name if l.warehouse else None,
            zone=l.zone, is_active=l.is_active, created_at=l.created_at,
        ) for l in locations
    ]


@router.get("/{location_id}", response_model=LocationResponse)
def detail(location_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    l = get_location(db, location_id)
    return LocationResponse(
        id=l.id, name=l.name, warehouse_id=l.warehouse_id,
        warehouse_name=l.warehouse.name if l.warehouse else None,
        zone=l.zone, is_active=l.is_active, created_at=l.created_at,
    )


@router.post("", response_model=LocationResponse)
def create(data: LocationCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    l = create_location(db, data)
    return LocationResponse(
        id=l.id, name=l.name, warehouse_id=l.warehouse_id,
        warehouse_name=l.warehouse.name if l.warehouse else None,
        zone=l.zone, is_active=l.is_active, created_at=l.created_at,
    )


@router.put("/{location_id}", response_model=LocationResponse)
def update(location_id: UUID, data: LocationUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    l = update_location(db, location_id, data)
    return LocationResponse(
        id=l.id, name=l.name, warehouse_id=l.warehouse_id,
        warehouse_name=l.warehouse.name if l.warehouse else None,
        zone=l.zone, is_active=l.is_active, created_at=l.created_at,
    )


@router.delete("/{location_id}", response_model=LocationResponse)
def delete(location_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    l = delete_location(db, location_id)
    return LocationResponse(
        id=l.id, name=l.name, warehouse_id=l.warehouse_id,
        warehouse_name=l.warehouse.name if l.warehouse else None,
        zone=l.zone, is_active=l.is_active, created_at=l.created_at,
    )
