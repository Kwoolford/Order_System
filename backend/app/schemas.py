"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models import UserRole


# Auth schemas
class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr


class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.CASHIER


class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """User response schema"""
    id: int
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Product schemas
class ProductBase(BaseModel):
    """Base product schema"""
    sku: str
    barcode: Optional[str] = None
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    price: float
    cost: float = 0.0
    taxable: bool = True
    reorder_threshold: int = 10
    reorder_qty: int = 50
    location: Optional[str] = None


class ProductCreate(ProductBase):
    """Product creation schema"""
    pass


class ProductUpdate(BaseModel):
    """Product update schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    taxable: Optional[bool] = None
    reorder_threshold: Optional[int] = None
    reorder_qty: Optional[int] = None
    location: Optional[str] = None


class ProductResponse(ProductBase):
    """Product response schema"""
    id: int
    status: str
    on_hand: int
    created_at: datetime

    class Config:
        from_attributes = True


# Health check schema
class HealthCheck(BaseModel):
    """Health check response"""
    status: str
    app_name: str
    version: str
    timestamp: datetime
