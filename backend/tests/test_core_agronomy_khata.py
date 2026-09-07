import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.core.database import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

async def get_authenticated_farmer(client: AsyncClient, email: str = "farmer.ramesh@agro.com"):
    # Signup farmer with valid 10-digit phone
    phone_suffix = abs(hash(email)) % 90000 + 10000
    phone = f"98765{phone_suffix}"
    signup_res = await client.post("/api/v1/auth/signup", json={
        "full_name": "Ramesh Patel",
        "email": email,
        "phone": phone,
        "password": "Password123!",
        "state": "Maharashtra",
        "district": "Nagpur"
    })
    if signup_res.status_code == 201:
        tokens = signup_res.json()
        return tokens["access_token"], tokens["user"]
    # Fallback to login
    login_res = await client.post("/api/v1/auth/login", json={
        "email_or_phone": email,
        "password": "Password123!"
    })
    tokens = login_res.json()
    return tokens["access_token"], tokens["user"]

@pytest.mark.asyncio
async def test_farm_plot_and_crop_creation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await get_authenticated_farmer(client, "agronomy.test1@agro.com")
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create a farm plot
        plot_res = await client.post("/api/v1/crops/plots", headers=headers, json={
            "name": "East Cotton Field",
            "area_acres": 3.5,
            "latitude": 21.1458,
            "longitude": 79.0882,
            "soil_type": "Black Cotton"
        })
        assert plot_res.status_code == 201
        plot_data = plot_res.json()
        plot_id = plot_data["id"]

        # 2. Register a crop cycle (Cotton)
        crop_res = await client.post("/api/v1/crops", headers=headers, json={
            "plot_id": plot_id,
            "name": "Cotton",
            "variety": "Bt-II RCH-659",
            "sowing_date": "2026-06-15",
            "base_temperature_c": 15.6,
            "target_gdd": 1800.0
        })
        assert crop_res.status_code == 201
        crop_data = crop_res.json()
        assert crop_data["name"] == "Cotton"
        assert crop_data["current_gdd"] >= 0
        assert crop_data["current_stage"] in [
            "Emergence", "Vegetative (Square Initiation)", "Flowering", "Boll Development", "Maturity & Harvest Ready"
        ]

@pytest.mark.asyncio
async def test_gdd_calculation_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await get_authenticated_farmer(client, "agronomy.test2@agro.com")
        headers = {"Authorization": f"Bearer {token}"}

        # Create plot and crop
        plot_res = await client.post("/api/v1/crops/plots", headers=headers, json={
            "name": "Wheat Field",
            "area_acres": 2.0,
            "latitude": 21.1458,
            "longitude": 79.0882,
        })
        plot_id = plot_res.json()["id"]

        crop_res = await client.post("/api/v1/crops", headers=headers, json={
            "plot_id": plot_id,
            "name": "Wheat",
            "variety": "Sharbati",
            "sowing_date": "2026-07-01",
        })
        crop_id = crop_res.json()["id"]

        # Trigger GDD recalculation
        gdd_res = await client.post(f"/api/v1/crops/{crop_id}/calculate-gdd", headers=headers)
        assert gdd_res.status_code == 200
        gdd_data = gdd_res.json()
        assert gdd_data["crop_id"] == crop_id
        assert gdd_data["current_gdd"] >= 0
        assert "progress_percentage" in gdd_data
        assert len(gdd_data["daily_history"]) >= 1

@pytest.mark.asyncio
async def test_khata_transactions_and_summary():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await get_authenticated_farmer(client, "khata.test@agro.com")
        headers = {"Authorization": f"Bearer {token}"}

        # Create Plot & Crop
        p_res = await client.post("/api/v1/crops/plots", headers=headers, json={
            "name": "Khata Field",
            "area_acres": 4.0,
            "latitude": 21.1458,
            "longitude": 79.0882
        })
        plot_id = p_res.json()["id"]
        c_res = await client.post("/api/v1/crops", headers=headers, json={
            "plot_id": plot_id,
            "name": "Cotton",
            "sowing_date": "2026-06-01"
        })
        crop_id = c_res.json()["id"]

        # Record Expense 1: Fertilizer
        res1 = await client.post("/api/v1/khata/transactions", headers=headers, json={
            "crop_id": crop_id,
            "transaction_type": "EXPENSE",
            "category": "Fertilizer",
            "amount": 3500.00,
            "transaction_date": "2026-06-10",
            "description": "2 bags Urea"
        })
        assert res1.status_code == 201

        # Record Expense 2: Seeds
        res2 = await client.post("/api/v1/khata/transactions", headers=headers, json={
            "crop_id": crop_id,
            "transaction_type": "EXPENSE",
            "category": "Seeds",
            "amount": 2200.00,
            "transaction_date": "2026-06-02",
            "description": "Certified cotton seeds"
        })
        assert res2.status_code == 201

        # Record Income: Advance sale
        res3 = await client.post("/api/v1/khata/transactions", headers=headers, json={
            "crop_id": crop_id,
            "transaction_type": "INCOME",
            "category": "Harvest Sale",
            "amount": 50000.00,
            "transaction_date": "2026-08-20",
            "description": "Early harvest contract sale"
        })
        assert res3.status_code == 201

        # Check summary
        sum_res = await client.get("/api/v1/khata/summary", headers=headers)
        assert sum_res.status_code == 200
        summary = sum_res.json()
        assert float(summary["total_income"]) == 50000.00
        assert float(summary["total_expense"]) == 5700.00
        assert float(summary["net_profit"]) == 44300.00
        assert "Fertilizer" in summary["expense_by_category"]

@pytest.mark.asyncio
async def test_labor_sub_ledger():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await get_authenticated_farmer(client, "labor.test@agro.com")
        headers = {"Authorization": f"Bearer {token}"}

        # Add labor record: 4 days @ 400 = 1600, advance = 400 -> balance = 1200
        create_res = await client.post("/api/v1/khata/labor", headers=headers, json={
            "laborer_name": "Kailash Bai",
            "phone": "9876543210",
            "task_type": "Weeding",
            "daily_wage": 400.00,
            "days_worked": 4.0,
            "advance_paid": 400.00
        })
        assert create_res.status_code == 201
        labor_data = create_res.json()
        labor_id = labor_data["id"]
        assert float(labor_data["net_balance"]) == 1200.00
        assert labor_data["status"] == "PARTIAL"

        # Settle remaining dues (advance paid = 1600)
        patch_res = await client.patch(f"/api/v1/khata/labor/{labor_id}", headers=headers, json={
            "advance_paid": 1600.00
        })
        assert patch_res.status_code == 200
        updated = patch_res.json()
        assert float(updated["net_balance"]) == 0.00
        assert updated["status"] == "SETTLED"

@pytest.mark.asyncio
async def test_kcc_loan_appraisal_report():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token, _ = await get_authenticated_farmer(client, "kcc.test@agro.com")
        headers = {"Authorization": f"Bearer {token}"}

        # Plot: 2.5 acres
        p_res = await client.post("/api/v1/crops/plots", headers=headers, json={
            "name": "KCC Plot",
            "area_acres": 2.5,
            "latitude": 21.1458,
            "longitude": 79.0882
        })
        plot_id = p_res.json()["id"]

        # Crop: Cotton
        c_res = await client.post("/api/v1/crops", headers=headers, json={
            "plot_id": plot_id,
            "name": "Cotton",
            "sowing_date": "2026-06-15"
        })
        crop_id = c_res.json()["id"]

        # Add an expense
        await client.post("/api/v1/khata/transactions", headers=headers, json={
            "crop_id": crop_id,
            "transaction_type": "EXPENSE",
            "category": "Pesticide",
            "amount": 2800.00
        })

        # Request KCC report
        kcc_res = await client.get(f"/api/v1/khata/kcc-report/{crop_id}", headers=headers)
        assert kcc_res.status_code == 200
        kcc_data = kcc_res.json()
        assert "KCC" in kcc_data["report_title"]
        assert kcc_data["crop_name"] == "Cotton"
        assert kcc_data["plot_acres"] == 2.5
        assert float(kcc_data["eligible_kcc_credit_limit"]) > 0
        assert float(kcc_data["total_expenses_incurred"]) == 2800.00
