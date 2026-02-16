"""
Role-Based Access Control (RBAC) utilities
"""
from fastapi import Depends, HTTPException, status
from typing import List
from app.models import User, UserRole
from app.auth import get_current_user


def require_role(allowed_roles: List[UserRole]):
    """
    Dependency factory that creates a role-checking dependency

    Args:
        allowed_roles: List of roles that are allowed to access the endpoint

    Returns:
        Dependency function that checks user role

    Raises:
        HTTPException: 403 Forbidden if user role is not in allowed_roles
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join([role.value for role in allowed_roles])}"
            )
        return current_user

    return role_checker


# Convenience dependencies for common role checks
def require_cashier(current_user: User = Depends(get_current_user)) -> User:
    """Allow Cashier, Manager, and Admin"""
    if current_user.role not in [UserRole.CASHIER, UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Cashier role or higher required."
        )
    return current_user


def require_manager(current_user: User = Depends(get_current_user)) -> User:
    """Allow Manager and Admin only"""
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Manager role or higher required."
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Allow Admin only"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin role required."
        )
    return current_user
