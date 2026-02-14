"""
Order routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime

from app.database import get_db
from app.models import Order, OrderItem, Product, InventoryMovement, InventoryMovementType, User
from app.schemas import OrderCreate, OrderResponse, OrderItemResponse, ReceiptResponse
from app.auth import get_current_user
from app.services.inventory import decrement_inventory

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create new order (checkout)

    Args:
        order_data: Order creation data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created order with items

    Raises:
        HTTPException: If product not found or insufficient inventory
    """
    try:
        # Generate order number
        order_count = db.query(Order).count()
        order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{order_count + 1:04d}"

        # Create order
        new_order = Order(
            order_number=order_number,
            cashier_id=current_user.id,
            customer_id=order_data.customer_id,
            subtotal=order_data.subtotal,
            discount_total=order_data.discount_total,
            tax_total=order_data.tax_total,
            total=order_data.total,
            payment_json=json.dumps(order_data.payment_details) if order_data.payment_details else None
        )
        db.add(new_order)
        db.flush()  # Get order ID without committing

        # Create order items and decrement inventory
        for item_data in order_data.items:
            # Verify product exists
            product = db.query(Product).filter(Product.id == item_data.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {item_data.product_id} not found"
                )

            # Check inventory availability
            if product.on_hand < item_data.qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient inventory for {product.name}. Available: {product.on_hand}, Requested: {item_data.qty}"
                )

            # Calculate line total
            line_total = (item_data.unit_price * item_data.qty) - item_data.discount

            # Create order item
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item_data.product_id,
                qty=item_data.qty,
                unit_price=item_data.unit_price,
                discount=item_data.discount,
                line_total=line_total
            )
            db.add(order_item)

            # Decrement inventory (atomic update)
            decrement_inventory(
                db=db,
                product_id=item_data.product_id,
                qty=item_data.qty,
                reason=f"Sale - Order {order_number}",
                user_id=current_user.id
            )

        # Commit transaction
        db.commit()
        db.refresh(new_order)

        return new_order

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )


@router.get("", response_model=List[OrderResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all orders with pagination

    Args:
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of orders
    """
    orders = db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get order details with line items

    Args:
        order_id: Order ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Order details

    Raises:
        HTTPException: If order not found
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order


@router.post("/{order_id}/receipt", response_model=ReceiptResponse)
def generate_receipt(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate receipt for an order

    Args:
        order_id: Order ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Receipt data

    Raises:
        HTTPException: If order not found
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Build receipt data
    items = []
    for order_item in order.items:
        items.append({
            "name": order_item.product.name,
            "qty": order_item.qty,
            "unit_price": order_item.unit_price,
            "discount": order_item.discount,
            "line_total": order_item.line_total
        })

    payment_details = json.loads(order.payment_json) if order.payment_json else {}

    receipt = ReceiptResponse(
        order_number=order.order_number,
        date=order.created_at,
        items=items,
        subtotal=order.subtotal,
        discount_total=order.discount_total,
        tax_total=order.tax_total,
        total=order.total,
        payment_method=payment_details.get("method", "Unknown"),
        cashier=order.cashier.email
    )

    return receipt
