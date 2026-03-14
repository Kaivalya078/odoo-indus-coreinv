from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.warehouse import Location
from app.schemas.warehouse import LocationCreate, LocationUpdate


def get_locations(db: Session, warehouse_id=None):
    query = db.query(Location).filter(Location.is_active == True)
    if warehouse_id:
        query = query.filter(Location.warehouse_id == warehouse_id)
    return query.all()


def get_location(db: Session, location_id):
    loc = db.query(Location).filter(Location.id == location_id, Location.is_active == True).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return loc


def create_location(db: Session, data: LocationCreate):
    existing = db.query(Location).filter(
        Location.name == data.name, Location.warehouse_id == data.warehouse_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Location name already exists in this warehouse")
    loc = Location(**data.model_dump())
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


def update_location(db: Session, location_id, data: LocationUpdate):
    loc = get_location(db, location_id)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(loc, key, val)
    db.commit()
    db.refresh(loc)
    return loc


def delete_location(db: Session, location_id):
    loc = get_location(db, location_id)
    loc.is_active = False
    db.commit()
    return loc
