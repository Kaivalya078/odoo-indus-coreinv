from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.core.dependencies import get_db, get_current_user
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse
from app.services.supplier_service import get_suppliers, get_supplier, create_supplier, update_supplier, delete_supplier

router = APIRouter(prefix="/api/v1/suppliers", tags=["Suppliers"])


@router.get("", response_model=List[SupplierResponse])
def list_suppliers(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_suppliers(db)


@router.get("/{supplier_id}", response_model=SupplierResponse)
def detail(supplier_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_supplier(db, supplier_id)


@router.post("", response_model=SupplierResponse)
def create(data: SupplierCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return create_supplier(db, data)


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update(supplier_id: UUID, data: SupplierUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return update_supplier(db, supplier_id, data)


@router.delete("/{supplier_id}", response_model=SupplierResponse)
def delete(supplier_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return delete_supplier(db, supplier_id)
