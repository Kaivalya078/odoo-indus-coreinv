from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.product import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_categories(db: Session):
    return db.query(Category).all()


def get_category(db: Session, category_id):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


def create_category(db: Session, data: CategoryCreate):
    existing = db.query(Category).filter(Category.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def update_category(db: Session, category_id, data: CategoryUpdate):
    cat = get_category(db, category_id)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(cat, key, val)
    db.commit()
    db.refresh(cat)
    return cat


def delete_category(db: Session, category_id):
    cat = get_category(db, category_id)
    db.delete(cat)
    db.commit()
    return cat
