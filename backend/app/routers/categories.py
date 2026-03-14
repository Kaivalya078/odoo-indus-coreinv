from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.core.dependencies import get_db, get_current_user
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category_service import get_categories, get_category, create_category, update_category, delete_category

router = APIRouter(prefix="/api/v1/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_categories(db)


@router.post("", response_model=CategoryResponse)
def create(data: CategoryCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return create_category(db, data)


@router.put("/{category_id}", response_model=CategoryResponse)
def update(category_id: UUID, data: CategoryUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return update_category(db, category_id, data)


@router.delete("/{category_id}", response_model=CategoryResponse)
def delete(category_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return delete_category(db, category_id)
