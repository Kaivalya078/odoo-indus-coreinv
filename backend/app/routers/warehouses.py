from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.core.dependencies import get_db, get_current_user
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse
from app.services.warehouse_service import get_warehouses, get_warehouse, create_warehouse, update_warehouse, delete_warehouse

router = APIRouter(prefix="/api/v1/warehouses", tags=["Warehouses"])


@router.get("", response_model=List[WarehouseResponse])
def list_warehouses(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_warehouses(db)


@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def detail(warehouse_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_warehouse(db, warehouse_id)


@router.post("", response_model=WarehouseResponse)
def create(data: WarehouseCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return create_warehouse(db, data)


@router.put("/{warehouse_id}", response_model=WarehouseResponse)
def update(warehouse_id: UUID, data: WarehouseUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return update_warehouse(db, warehouse_id, data)


@router.delete("/{warehouse_id}", response_model=WarehouseResponse)
def delete(warehouse_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return delete_warehouse(db, warehouse_id)
