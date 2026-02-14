"""
Inventory management services
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import Product, InventoryMovement, InventoryMovementType


def decrement_inventory(
    db: Session,
    product_id: int,
    qty: int,
    reason: str,
    user_id: int,
    allow_negative: bool = False
) -> None:
    """
    Decrement product inventory atomically

    Args:
        db: Database session
        product_id: Product ID
        qty: Quantity to decrement
        reason: Reason for inventory movement
        user_id: User ID performing the action
        allow_negative: Allow negative inventory (admin override)

    Raises:
        HTTPException: If product not found or insufficient inventory
    """
    # Get product with row lock to prevent race conditions
    product = db.query(Product).filter(Product.id == product_id).with_for_update().first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found"
        )

    # Check inventory availability
    new_quantity = product.on_hand - qty
    if new_quantity < 0 and not allow_negative:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient inventory for {product.name}. Available: {product.on_hand}, Requested: {qty}"
        )

    # Update product inventory
    product.on_hand = new_quantity

    # Create inventory movement record
    movement = InventoryMovement(
        product_id=product_id,
        type=InventoryMovementType.SALE,
        delta_qty=-qty,  # Negative for decrement
        reason=reason,
        created_by_id=user_id
    )
    db.add(movement)


def increment_inventory(
    db: Session,
    product_id: int,
    qty: int,
    reason: str,
    user_id: int,
    movement_type: InventoryMovementType = InventoryMovementType.PURCHASE
) -> None:
    """
    Increment product inventory atomically

    Args:
        db: Database session
        product_id: Product ID
        qty: Quantity to increment
        reason: Reason for inventory movement
        user_id: User ID performing the action
        movement_type: Type of inventory movement

    Raises:
        HTTPException: If product not found
    """
    # Get product with row lock
    product = db.query(Product).filter(Product.id == product_id).with_for_update().first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found"
        )

    # Update product inventory
    product.on_hand += qty

    # Create inventory movement record
    movement = InventoryMovement(
        product_id=product_id,
        type=movement_type,
        delta_qty=qty,  # Positive for increment
        reason=reason,
        created_by_id=user_id
    )
    db.add(movement)
