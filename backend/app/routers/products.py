from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import get_products, get_product, create_product, update_product, delete_product

router = APIRouter(prefix="/api/v1/products", tags=["Products"])


@router.get("", response_model=List[ProductResponse])
def list_products(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    category_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    products = get_products(db, skip, limit, search, category_id)
    return [
        ProductResponse(
            id=p.id, sku=p.sku, name=p.name, description=p.description,
            category_id=p.category_id, category_name=p.category.name if p.category else None,
            unit=p.unit, min_stock=p.min_stock, is_active=p.is_active,
            created_at=p.created_at, updated_at=p.updated_at,
        ) for p in products
    ]


@router.get("/{product_id}", response_model=ProductResponse)
def detail(product_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = get_product(db, product_id)
    return ProductResponse(
        id=p.id, sku=p.sku, name=p.name, description=p.description,
        category_id=p.category_id, category_name=p.category.name if p.category else None,
        unit=p.unit, min_stock=p.min_stock, is_active=p.is_active,
        created_at=p.created_at, updated_at=p.updated_at,
    )


@router.post("", response_model=ProductResponse)
def create(data: ProductCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = create_product(db, data)
    return ProductResponse(
        id=p.id, sku=p.sku, name=p.name, description=p.description,
        category_id=p.category_id, category_name=p.category.name if p.category else None,
        unit=p.unit, min_stock=p.min_stock, is_active=p.is_active,
        created_at=p.created_at, updated_at=p.updated_at,
    )


@router.put("/{product_id}", response_model=ProductResponse)
def update(product_id: UUID, data: ProductUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = update_product(db, product_id, data)
    return ProductResponse(
        id=p.id, sku=p.sku, name=p.name, description=p.description,
        category_id=p.category_id, category_name=p.category.name if p.category else None,
        unit=p.unit, min_stock=p.min_stock, is_active=p.is_active,
        created_at=p.created_at, updated_at=p.updated_at,
    )


@router.delete("/{product_id}", response_model=ProductResponse)
def delete(product_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = delete_product(db, product_id)
    return ProductResponse(
        id=p.id, sku=p.sku, name=p.name, description=p.description,
        category_id=p.category_id, category_name=p.category.name if p.category else None,
        unit=p.unit, min_stock=p.min_stock, is_active=p.is_active,
        created_at=p.created_at, updated_at=p.updated_at,
    )
