"""
Product routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Product, ProductStatus
from app.schemas import ProductResponse, ProductCreate, ProductUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[ProductResponse])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: Optional[str] = None,
    search: str = "",
    db: Session = Depends(get_db)
):
    """
    List all products with filtering

    Args:
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        category: Filter by category (optional)
        search: Search query for name, SKU, or barcode
        db: Database session

    Returns:
        List of products
    """
    query = db.query(Product)

    # Apply category filter
    if category:
        query = query.filter(Product.category == category)

    # Apply search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Product.name.like(search_pattern)) |
            (Product.sku.like(search_pattern)) |
            (Product.barcode.like(search_pattern))
        )

    # Apply pagination and return
    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/search", response_model=List[ProductResponse])
def search_products(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Fast product search by SKU, barcode, or name

    Args:
        q: Search query
        limit: Maximum number of results
        db: Database session

    Returns:
        List of matching products
    """
    search_pattern = f"%{q}%"
    products = db.query(Product).filter(
        (Product.sku.like(search_pattern)) |
        (Product.barcode.like(search_pattern)) |
        (Product.name.like(search_pattern))
    ).filter(
        Product.status == ProductStatus.ACTIVE
    ).limit(limit).all()

    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Get single product details

    Args:
        product_id: Product ID
        db: Database session

    Returns:
        Product details

    Raises:
        HTTPException: If product not found
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new product

    Args:
        product_data: Product creation data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created product

    Raises:
        HTTPException: If SKU already exists
    """
    # Check if SKU already exists
    existing_product = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SKU already exists"
        )

    # Check if barcode already exists (if provided)
    if product_data.barcode:
        existing_barcode = db.query(Product).filter(Product.barcode == product_data.barcode).first()
        if existing_barcode:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Barcode already exists"
            )

    # Create product
    new_product = Product(**product_data.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update a product

    Args:
        product_id: Product ID
        product_data: Product update data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated product

    Raises:
        HTTPException: If product not found
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Update product fields
    for field, value in product_data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product
