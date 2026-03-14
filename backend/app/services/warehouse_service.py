from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.warehouse import Warehouse
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate


def get_warehouses(db: Session):
    return db.query(Warehouse).filter(Warehouse.is_active == True).all()


def get_warehouse(db: Session, warehouse_id):
    wh = db.query(Warehouse).filter(Warehouse.id == warehouse_id, Warehouse.is_active == True).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return wh


def create_warehouse(db: Session, data: WarehouseCreate):
    existing = db.query(Warehouse).filter(Warehouse.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Warehouse name already exists")
    wh = Warehouse(**data.model_dump())
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh


def update_warehouse(db: Session, warehouse_id, data: WarehouseUpdate):
    wh = get_warehouse(db, warehouse_id)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(wh, key, val)
    db.commit()
    db.refresh(wh)
    return wh


def delete_warehouse(db: Session, warehouse_id):
    wh = get_warehouse(db, warehouse_id)
    wh.is_active = False
    db.commit()
    return wh
