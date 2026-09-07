import io
from PIL import Image
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.core.database import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

async def get_farmer_token(client: AsyncClient, email: str):
    phone_suffix = abs(hash(email)) % 90000 + 10000
    res = await client.post("/api/v1/auth/signup", json={
        "full_name": "Drone Pilot Farmer",
        "email": email,
        "phone": f"98765{phone_suffix}",
        "password": "PilotPassword123!",
        "state": "Maharashtra",
        "district": "Nagpur"
    })
    if res.status_code == 201:
        return res.json()["access_token"]
    login_res = await client.post("/api/v1/auth/login", json={
        "email_or_phone": email,
        "password": "PilotPassword123!"
    })
    return login_res.json()["access_token"]

def create_mock_leaf_image() -> bytes:
    """Creates a sample leaf image with lesion-like pixel patterns."""
    img = Image.new("RGB", (200, 200), color=(34, 139, 34)) # Forest Green
    # Draw yellow-brown lesion spot
    for x in range(60, 140):
        for y in range(60, 140):
            img.putpixel((x, y), (180, 115, 35)) # Brownish-yellow necrotic spot
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

@pytest.mark.asyncio
async def test_drone_flight_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_farmer_token(client, "drone.pilot1@agro.com")
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Start flight mission
        start_res = await client.post("/api/v1/drone/flights/start", headers=headers, json={
            "start_latitude": 21.1458,
            "start_longitude": 79.0882,
            "altitude_m": 18.0
        })
        assert start_res.status_code == 201
        flight = start_res.json()
        assert flight["status"] == "IN_PROGRESS"
        assert flight["altitude_m"] == 18.0
        flight_id = flight["id"]

        # 2. List flights
        list_res = await client.get("/api/v1/drone/flights", headers=headers)
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1

        # 3. End flight mission
        end_res = await client.post(f"/api/v1/drone/flights/{flight_id}/end", headers=headers)
        assert end_res.status_code == 200
        assert end_res.json()["status"] == "COMPLETED"
        assert end_res.json()["ended_at"] is not None

@pytest.mark.asyncio
async def test_drone_ingest_and_ai_diagnosis():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = await get_farmer_token(client, "drone.pilot2@agro.com")
        headers = {"Authorization": f"Bearer {token}"}

        # Setup plot and crop
        p_res = await client.post("/api/v1/crops/plots", headers=headers, json={
            "name": "Drone Surveillance Plot",
            "area_acres": 5.0,
            "latitude": 21.1458,
            "longitude": 79.0882
        })
        plot_id = p_res.json()["id"]

        c_res = await client.post("/api/v1/crops", headers=headers, json={
            "plot_id": plot_id,
            "name": "Cotton",
            "sowing_date": "2026-06-15"
        })
        crop_id = c_res.json()["id"]

        # Start flight
        f_res = await client.post("/api/v1/drone/flights/start", headers=headers, json={
            "start_latitude": 21.1458,
            "start_longitude": 79.0882
        })
        flight_id = f_res.json()["id"]

        # Ingest drone image frame
        image_bytes = create_mock_leaf_image()
        files = {"image": ("drone_capture_001.jpg", image_bytes, "image/jpeg")}
        data = {
            "crop_id": crop_id,
            "latitude": "21.1462",
            "longitude": "79.0889",
            "altitude_m": "14.5",
            "flight_session_id": flight_id
        }

        ingest_res = await client.post("/api/v1/drone/ingest", headers=headers, data=data, files=files)
        assert ingest_res.status_code == 201
        res_data = ingest_res.json()
        assert "scan" in res_data
        assert "diagnosis" in res_data

        diag = res_data["diagnosis"]
        assert diag["disease_name"] is not None
        assert diag["severity"] in ["LOW", "MEDIUM", "CRITICAL"]
        assert diag["confidence_score"] > 50.0
        assert len(diag["organic_remedy"]) > 10
        assert len(diag["chemical_remedy"]) > 10

        # Query scan history for the crop
        scans_res = await client.get(f"/api/v1/drone/scans/{crop_id}", headers=headers)
        assert scans_res.status_code == 200
        scans = scans_res.json()
        assert len(scans) >= 1
        assert scans[0]["diagnosis"] is not None
        assert scans[0]["diagnosis"]["disease_name"] == diag["disease_name"]
