"""
Returns and Refunds routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from app.database import get_db
from app.models import (
    Order, OrderItem, Product, InventoryMovement,
    InventoryMovementType, User, AuditLog
)
from app.schemas import (
    ReturnCreate, ReturnResponse, OrderLookupResponse,
    ReturnItemCreate
)
from app.auth import get_current_user
from app.rbac import require_cashier
from app.services.inventory import increment_inventory

router = APIRouter(prefix="/returns", tags=["returns"])


@router.get("/lookup", response_model=OrderLookupResponse)
def lookup_order(
    search: str = Query(..., description="Order number or receipt number to search"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_cashier)
):
    """
    Lookup order by order number or receipt number

    Args:
        search: Order number or receipt number
        db: Database session
        current_user: Current authenticated user (cashier+)

    Returns:
        Order details with items

    Raises:
        HTTPException: If order not found
    """
    # Search by order number (receipt number is same as order number)
    order = db.query(Order).filter(Order.order_number == search.strip()).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order not found: {search}"
        )

    # Parse payment details
    payment_details = json.loads(order.payment_json) if order.payment_json else {}

    return OrderLookupResponse(
        id=order.id,
        order_number=order.order_number,
        created_at=order.created_at,
        subtotal=order.subtotal,
        discount_total=order.discount_total,
        tax_total=order.tax_total,
        total=order.total,
        payment_method=payment_details.get("method", "cash"),
        cashier_id=order.cashier_id,
        items=[
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name,
                "qty": item.qty,
                "unit_price": item.unit_price,
                "discount": item.discount,
                "line_total": item.line_total
            }
            for item in order.items
        ]
    )


@router.post("", response_model=ReturnResponse, status_code=status.HTTP_201_CREATED)
def process_return(
    return_data: ReturnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_cashier)
):
    """
    Process return/refund

    Args:
        return_data: Return data with line items
        db: Database session
        current_user: Current authenticated user (cashier+)

    Returns:
        Return processing result

    Raises:
        HTTPException: If order not found or invalid return
    """
    try:
        # Verify order exists
        order = db.query(Order).filter(Order.id == return_data.order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        # Parse original payment details
        payment_details = json.loads(order.payment_json) if order.payment_json else {}
        refund_method = payment_details.get("method", "cash")

        total_refund = 0.0
        processed_items = []

        # Process each return item
        for return_item in return_data.items:
            # Verify order item exists
            order_item = db.query(OrderItem).filter(
                OrderItem.id == return_item.order_item_id,
                OrderItem.order_id == return_data.order_id
            ).first()

            if not order_item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Order item {return_item.order_item_id} not found"
                )

            # Validate return quantity
            if return_item.qty > order_item.qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Return quantity ({return_item.qty}) exceeds order quantity ({order_item.qty})"
                )

            # Calculate refund amount (proportional to quantity)
            refund_amount = (order_item.line_total / order_item.qty) * return_item.qty
            total_refund += refund_amount

            # Increment inventory only if NOT damaged
            if not return_item.damaged:
                increment_inventory(
                    db=db,
                    product_id=order_item.product_id,
                    qty=return_item.qty,
                    reason=f"Return - Order {order.order_number} (non-damaged)",
                    user_id=current_user.id
                )
            else:
                # Record damaged inventory movement (but don't increment stock)
                product = db.query(Product).filter(Product.id == order_item.product_id).first()
                movement = InventoryMovement(
                    product_id=order_item.product_id,
                    type=InventoryMovementType.DAMAGE,
                    delta_qty=-return_item.qty,  # Negative to show loss
                    reason=f"Return - Order {order.order_number} (damaged, not restocked)",
                    created_by_id=current_user.id
                )
                db.add(movement)

            processed_items.append({
                "order_item_id": return_item.order_item_id,
                "product_id": order_item.product_id,
                "qty": return_item.qty,
                "damaged": return_item.damaged,
                "refund_amount": refund_amount
            })

        # Create audit log entry
        audit_log = AuditLog(
            actor_id=current_user.id,
            action="return_processed",
            entity_type="order",
            entity_id=order.id,
            metadata_json=json.dumps({
                "order_number": order.order_number,
                "items": processed_items,
                "total_refund": total_refund,
                "refund_method": refund_method,
                "reason": return_data.reason
            })
        )
        db.add(audit_log)

        # Commit transaction
        db.commit()

        return ReturnResponse(
            order_id=order.id,
            order_number=order.order_number,
            refund_amount=total_refund,
            refund_method=refund_method,
            items_returned=processed_items,
            processed_at=datetime.utcnow(),
            processed_by=current_user.email
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process return: {str(e)}"
        )
