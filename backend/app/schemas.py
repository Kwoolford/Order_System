"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
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


# Order schemas
class OrderItemCreate(BaseModel):
    """Order item creation schema"""
    product_id: int
    qty: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    discount: float = Field(0.0, ge=0)


class OrderItemResponse(BaseModel):
    """Order item response schema"""
    id: int
    order_id: int
    product_id: int
    qty: int
    unit_price: float
    discount: float
    line_total: float
    product: ProductResponse

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    """Order creation schema"""
    customer_id: Optional[int] = None
    items: List[OrderItemCreate]
    subtotal: float = Field(..., ge=0)
    discount_total: float = Field(0.0, ge=0)
    tax_total: float = Field(..., ge=0)
    total: float = Field(..., gt=0)
    payment_details: Optional[Dict[str, Any]] = None


class OrderResponse(BaseModel):
    """Order response schema"""
    id: int
    order_number: str
    created_at: datetime
    cashier_id: int
    customer_id: Optional[int]
    subtotal: float
    discount_total: float
    tax_total: float
    total: float
    payment_json: Optional[str] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class ReceiptResponse(BaseModel):
    """Receipt response schema"""
    order_number: str
    date: datetime
    items: List[Dict[str, Any]]
    subtotal: float
    discount_total: float
    tax_total: float
    total: float
    payment_method: str
    cashier: str


# Cart validation schemas
class CartItem(BaseModel):
    """Cart item schema"""
    product_id: int
    qty: int = Field(..., gt=0)


class CartValidationRequest(BaseModel):
    """Cart validation request schema"""
    items: List[CartItem]


class CartValidationResponse(BaseModel):
    """Cart validation response schema"""
    valid: bool
    errors: List[str]
    totals: Dict[str, float]


# Config schemas
class TaxConfigResponse(BaseModel):
    """Tax configuration response schema"""
    tax_rate: float
    tax_rate_percent: float


# Health check schema
class HealthCheck(BaseModel):
    """Health check response"""
    status: str
    app_name: str
    version: str
    timestamp: datetime
