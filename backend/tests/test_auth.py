"""
Tests for authentication endpoints
"""
import pytest
from fastapi import status


def test_register_new_user(client):
    """Test registering a new user"""
    response = client.post(
        "/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "password123",
            "role": "cashier"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "cashier"
    assert "id" in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client, test_user):
    """Test registering with an existing email"""
    response = client.post(
        "/auth/register",
        json={
            "email": test_user.email,
            "password": "password123",
            "role": "cashier"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already registered" in response.json()["detail"]


def test_login_success(client, test_user):
    """Test successful login"""
    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass123"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_user.email


def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post(
        "/auth/login",
        json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user(client, test_user):
    """Test getting current user info"""
    # First login to get token
    login_response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass123"
        }
    )
    token = login_response.json()["access_token"]

    # Get current user
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == test_user.email
    assert data["role"] == test_user.role


def test_get_current_user_no_token(client):
    """Test getting current user without token"""
    response = client.get("/auth/me")
    assert response.status_code == status.HTTP_403_FORBIDDEN
