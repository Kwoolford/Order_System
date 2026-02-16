"""
User routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserResponse
from app.auth import get_current_user
from app.rbac import require_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user

    Args:
        current_user: Current authenticated user from token

    Returns:
        Current user info
    """
    return current_user


@router.get("", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    List all users (Admin only)

    Args:
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        List of all users
    """
    users = db.query(User).all()
    return users


@router.patch("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    new_role: UserRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update user role (Admin only)

    Args:
        user_id: User ID to update
        new_role: New role to assign
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        Updated user

    Raises:
        HTTPException: If user not found
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.role = new_role
    db.commit()
    db.refresh(user)

    return user
