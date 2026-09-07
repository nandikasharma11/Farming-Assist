import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.core.database import init_db
from app.services.weather import evaluate_spray_conditions

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

async def get_test_token(client: AsyncClient, email: str = "market.user@agro.com"):
    phone_suffix = abs(hash(email)) % 90000 + 10000
    res = await client.post("/api/v1/auth/signup", json={
        "full_name": "Market Observer Farmer",
        "email": email,
        "phone": f"98765{phone_suffix}",
        "password": "MarketPassword123!",
        "state": "Maharashtra",
        "district": "Nagpur"
    })
    if res.status_code == 201:
        return res.json()["access_token"]
    login_res = await client.post("/api/v1/auth/login", json={
        "email_or_phone": email,
        "password": "MarketPassword123!"
    })
    return login_res.json()["access_token"]

@pytest.mark.asyncio
async def test_mandi_prices_and_filters():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_test_token(client, "market.test1@agro.com")
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Fetch all Mandi rates
        res = await client.get("/api/v1/market/prices", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["total_records"] >= 5
        first = data["rates"][0]
        assert "commodity" in first
        assert "modal_price" in first
        assert first["modal_price"] > 0

        # 2. Filter by commodity=Cotton
        cotton_res = await client.get("/api/v1/market/prices?commodity=Cotton", headers=headers)
        assert cotton_res.status_code == 200
        c_data = cotton_res.json()
        for item in c_data["rates"]:
            assert "Cotton" in item["commodity"]

        # 3. Filter by state=Maharashtra
        state_res = await client.get("/api/v1/market/prices?state=Maharashtra", headers=headers)
        assert state_res.status_code == 200
        s_data = state_res.json()
        for item in s_data["rates"]:
            assert "Maharashtra" in item["state"]

@pytest.mark.asyncio
async def test_agricultural_weather_advisory():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_test_token(client, "weather.test2@agro.com")
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/weather/forecast?latitude=21.1458&longitude=79.0882", headers=headers)
        assert res.status_code == 200
        w_data = res.json()
        assert w_data["latitude"] == 21.1458
        assert "spray_status" in w_data
        assert "spray_rationale" in w_data
        assert len(w_data["forecast"]) >= 5

        day = w_data["forecast"][0]
        assert "t_max" in day
        assert "precipitation_probability" in day
        assert day["spray_status"] in ["OPTIMAL", "CAUTION_WIND", "NO_SPRAY", "EVENING_ONLY"]

def test_spray_condition_rules():
    # Rain risk
    status, _ = evaluate_spray_conditions(precip_prob=60.0, precip_mm=5.0, wind_kmh=8.0, temp_max=30.0)
    assert status == "NO_SPRAY"

    # High wind
    status, _ = evaluate_spray_conditions(precip_prob=10.0, precip_mm=0.0, wind_kmh=18.5, temp_max=31.0)
    assert status == "CAUTION_WIND"

    # High heat / scorch
    status, _ = evaluate_spray_conditions(precip_prob=5.0, precip_mm=0.0, wind_kmh=8.0, temp_max=37.5)
    assert status == "EVENING_ONLY"

    # Optimal
    status, _ = evaluate_spray_conditions(precip_prob=10.0, precip_mm=0.0, wind_kmh=9.0, temp_max=31.0)
    assert status == "OPTIMAL"
