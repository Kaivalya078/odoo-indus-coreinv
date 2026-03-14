from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def get_products(db: Session, skip: int = 0, limit: int = 50, search: str = None, category_id=None):
    query = db.query(Product).filter(Product.is_active == True)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%"))
    if category_id:
        query = query.filter(Product.category_id == category_id)
    return query.offset(skip).limit(limit).all()


def get_product(db: Session, product_id):
    prod = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod


def create_product(db: Session, data: ProductCreate):
    existing = db.query(Product).filter(Product.sku == data.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    prod = Product(**data.model_dump())
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod


def update_product(db: Session, product_id, data: ProductUpdate):
    prod = get_product(db, product_id)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(prod, key, val)
    db.commit()
    db.refresh(prod)
    return prod


def delete_product(db: Session, product_id):
    prod = get_product(db, product_id)
    prod.is_active = False
    db.commit()
    return prod
