import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.core.database import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    """Ensure all tables exist before running tests."""
    await init_db()

@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["version"] == "2.0.0"

@pytest.mark.asyncio
async def test_farmer_signup_and_auto_plot():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "full_name": "Ramesh Kumar Patel",
            "email": "ramesh.kumar@example.com",
            "phone": "9876500001",
            "password": "FarmerSecretPass123!",
            "state": "Maharashtra",
            "district": "Nagpur",
            "preferred_language": "hi"
        }
        res = await client.post("/api/v1/auth/signup", json=payload)
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "ramesh.kumar@example.com"
        assert data["user"]["full_name"] == "Ramesh Kumar Patel"

@pytest.mark.asyncio
async def test_farmer_duplicate_signup():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "full_name": "Ramesh Kumar Patel",
            "email": "ramesh.kumar@example.com",
            "phone": "9876500002",
            "password": "FarmerSecretPass123!",
        }
        res = await client.post("/api/v1/auth/signup", json=payload)
        assert res.status_code == 400
        assert "email address already exists" in res.json()["detail"]

@pytest.mark.asyncio
async def test_farmer_login_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login with email
        login_res = await client.post("/api/v1/auth/login", json={
            "email_or_phone": "ramesh.kumar@example.com",
            "password": "FarmerSecretPass123!"
        })
        assert login_res.status_code == 200
        tokens = login_res.json()
        assert "access_token" in tokens
        assert "refresh_token" in tokens
        assert tokens["user"]["phone"] == "9876500001"

        # Login with phone
        phone_login_res = await client.post("/api/v1/auth/login", json={
            "email_or_phone": "9876500001",
            "password": "FarmerSecretPass123!"
        })
        assert phone_login_res.status_code == 200

@pytest.mark.asyncio
async def test_farmer_login_invalid_password():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/v1/auth/login", json={
            "email_or_phone": "ramesh.kumar@example.com",
            "password": "WrongPassword123!"
        })
        assert res.status_code == 401

@pytest.mark.asyncio
async def test_token_refresh_and_profile():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login to get refresh token
        login_res = await client.post("/api/v1/auth/login", json={
            "email_or_phone": "ramesh.kumar@example.com",
            "password": "FarmerSecretPass123!"
        })
        tokens = login_res.json()
        refresh_token = tokens["refresh_token"]

        # Use refresh token to obtain a new access token
        refresh_res = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert refresh_res.status_code == 200
        new_access_token = refresh_res.json()["access_token"]
        assert new_access_token is not None

        # Access protected /me endpoint with new access token
        me_res = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {new_access_token}"}
        )
        assert me_res.status_code == 200
        profile = me_res.json()
        assert profile["email"] == "ramesh.kumar@example.com"
        assert len(profile["plots"]) >= 1
        assert "Main Field" in profile["plots"][0]["name"]
