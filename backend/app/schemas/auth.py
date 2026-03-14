from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
