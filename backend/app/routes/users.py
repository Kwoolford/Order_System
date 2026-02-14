"""
User routes
"""
from fastapi import APIRouter, Depends
from app.models import User
from app.schemas import UserResponse
from app.auth import get_current_user

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
