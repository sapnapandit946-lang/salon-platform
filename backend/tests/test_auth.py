import pytest


def test_user_registration_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "fresh_user@example.com",
            "password": "Password@123",
            "full_name": "Fresh User",
            "phone": "+91 9123456789",
            "role": "CUSTOMER"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "fresh_user@example.com"
    assert data["user"]["role"] == "CUSTOMER"


def test_duplicate_registration_fails(client):
    # First registration
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "Password@123",
            "full_name": "Duplicate Test",
            "phone": "+91 9123456780",
            "role": "CUSTOMER"
        }
    )
    # Second registration with same email
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "Password@123",
            "full_name": "Duplicate Test 2",
            "phone": "+91 9123456781",
            "role": "CUSTOMER"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_user_login_success(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login_test@example.com",
            "password": "CorrectPassword123",
            "full_name": "Login Test",
            "role": "CUSTOMER"
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login_test@example.com",
            "password": "CorrectPassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_user_login_invalid_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrong_pw@example.com",
            "password": "CorrectPassword123",
            "full_name": "Login Test",
            "role": "CUSTOMER"
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrong_pw@example.com",
            "password": "WrongPassword!"
        }
    )
    assert response.status_code == 401
    assert "Incorrect email" in response.json()["detail"]


def test_get_current_user_profile(client):
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "profile_check@example.com",
            "password": "Password@123",
            "full_name": "Profile Checker",
            "role": "CUSTOMER"
        }
    ).json()
    token = reg["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "profile_check@example.com"
