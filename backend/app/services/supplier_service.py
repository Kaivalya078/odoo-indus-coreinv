from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate


def get_suppliers(db: Session):
    return db.query(Supplier).filter(Supplier.is_active == True).all()


def get_supplier(db: Session, supplier_id):
    sup = db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.is_active == True).first()
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return sup


def create_supplier(db: Session, data: SupplierCreate):
    sup = Supplier(**data.model_dump())
    db.add(sup)
    db.commit()
    db.refresh(sup)
    return sup


def update_supplier(db: Session, supplier_id, data: SupplierUpdate):
    sup = get_supplier(db, supplier_id)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(sup, key, val)
    db.commit()
    db.refresh(sup)
    return sup


def delete_supplier(db: Session, supplier_id):
    sup = get_supplier(db, supplier_id)
    sup.is_active = False
    db.commit()
    return sup
