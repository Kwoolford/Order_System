"""
Cart validation routes
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Product, User
from app.schemas import CartValidationRequest, CartValidationResponse
from app.services.tax import calculate_tax
from app.auth import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])


@router.post("/validate", response_model=CartValidationResponse)
def validate_cart(
    cart_data: CartValidationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Validate cart items before checkout

    Args:
        cart_data: Cart validation request with items
        db: Database session

    Returns:
        Validation result with errors and totals
    """
    errors = []
    valid = True
    subtotal = 0.0
    taxable_subtotal = 0.0

    for item in cart_data.items:
        # Check if product exists
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            errors.append(f"Product {item.product_id} not found")
            valid = False
            continue

        # Check if quantity is available
        if product.on_hand < item.qty:
            errors.append(
                f"{product.name}: Insufficient stock. Available: {product.on_hand}, Requested: {item.qty}"
            )
            valid = False
            continue

        # Calculate subtotal
        item_total = product.price * item.qty
        subtotal += item_total

        # Track taxable items
        if product.taxable:
            taxable_subtotal += item_total

    # Calculate tax
    tax = calculate_tax(taxable_subtotal)
    total = subtotal + tax

    return CartValidationResponse(
        valid=valid,
        errors=errors,
        totals={
            "subtotal": round(subtotal, 2),
            "tax": round(tax, 2),
            "total": round(total, 2)
        }
    )
