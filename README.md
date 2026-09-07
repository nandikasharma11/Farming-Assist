# 🌾 Farming Assist
### Next-Gen Agritech & Farm Ledger Operating System

[![Python](https://img.shields.io/badge/Python-3.13%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0%2B-646cff.svg)](https://vitejs.dev/)
[![CSS](https://img.shields.io/badge/Style-Vanilla%20CSS%20Glassmorphism-027b7f.svg)](frontend/src/styles/glassmorphism.css)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Farming Assist** is an end-to-end intelligent agricultural operating system and double-entry farm ledger designed specifically for modern farmers, agronomists, and lending institutions. It bridges aerial drone computer vision, physiological crop growth tracking, agricultural accounting, and hyper-local meteorological intelligence into a unified glassmorphic workspace.

---

## ✨ Key System Features

### 1. 🛸 Autonomous Drone Studio & Multimodal Vision AI Doctor
- **Aerial Lesion Detection**: Ingests drone aerial imagery with latitude, longitude, and altitude telemetry.
- **Multimodal AI Analysis**: Integrates Google Gemini 2.5 Flash / Vision pathology models with a domain-specific agronomic heuristic fallback for offline and low-bandwidth scenarios.
- **Prescriptions & Action Plans**: Identifies disease pathogens (e.g., Foliar Blight, Powdery Mildew), calculates leaf damage surface percentage, and delivers dual **Organic / Bio-Remedies** alongside certified **Agrochemical Formulations** and 7-day preventive field protocols.
- **Dynamic Radar HUD**: Rotating SVG radar scanner reflecting active flight telemetry and affected canopy sectors.

### 2. 🌡️ Growing Degree Day (GDD) Thermal Crop Stage Engine
- **Heat Unit Accumulation**: Connects directly to Open-Meteo temperature archives and forecasts from sowing date:
  $$\text{GDD} = \sum \max\left(0, \frac{T_{\max} + T_{\min}}{2} - T_{\text{base}}\right)$$
- **Phenological Stage Tracking**: Maps cumulative thermal units against crop base temperatures ($T_{\text{base}}$), automatically transitioning through Emergence, Squaring/Vegetative, Flowering, and Boll Opening/Maturity.
- **Interactive SVG Gauge**: Circular progress visualization comparing current accumulation against target thermal maturity.

### 3. 📒 Smart Double-Entry Farm Ledger (Khata) & Labor Payroll
- **Farm Bookkeeping**: Real-time revenue and expenditure tracking categorized by agricultural operations (Seeds, Fertilizers, Agrochemicals, Diesel, Harvesting, Subsidies, Mandi sales).
- **Labor Sub-Ledger**: Tracks field laborer attendance, piece-rate wages, task allocations (weeding, spraying, picking), advance payouts, and one-click wage settlement.
- **Kisan Credit Card (KCC) Bank Appraisal**: Calculates eligible crop loan limits based on NABARD scales of finance and cultivated acreage, with a print-ready underwriting appraisal document.

### 4. 📈 APMC Mandi Market Intelligence & 7-Day Spray Advisory
- **Mandi Price Discovery**: Real-time modal price benchmarks, daily price trends, arrival tonnages, and MSP comparisons across commodities and agricultural mandis.
- **Agrochemical Spray Feasibility Radar**: Hyper-local 7-day weather evaluation preventing pesticide wash-off (precipitation $> 40\%$) and drift risk (wind speed $> 15\text{ km/h}$).

### 5. 🎨 Custom Teal Oceanic Glassmorphism & Theme Engine
- **Tailored 5-Shade Palette**: Custom teal oceanic aesthetic across dark and light surfaces:
  - Light Seafoam: `#95c1c0`
  - Sage Teal: `#58a4a7`
  - Vibrant Peacock Teal: `#027b7f`
  - Deep Ocean Teal: `#015457`
  - Obsidian Spruce: `#013337`
- **Light & Dark Mode**: Seamless toggle with zero layout shift and automatic `localStorage` persistence.

### 6. 🌐 6 Indian Languages Localization Engine
- Full interface localization supporting native scripts:
  - **English**
  - **हिन्दी (Hindi)**
  - **मराठी (Marathi)**
  - **తెలుగు (Telugu)**
  - **ਪੰਜਾਬੀ (Punjabi)**
  - **ગુજરાતી (Gujarati)**

---

## 🏛️ System Architecture

```text
                                  ┌──────────────────────────────────────────────────┐
                                  │             Farming Assist Frontend              │
                                  │      (Vite + React 18 + TS + Vanilla CSS)        │
                                  └──────────────────────┬───────────────────────────┘
                                                         │ HTTP / REST (JWT Auth)
                                                         ▼
                                  ┌──────────────────────────────────────────────────┐
                                  │              FastAPI Backend Engine              │
                                  │         (Python 3.13, Async SQLAlchemy 2.0)      │
                                  └──────┬───────────────┬───────────────────┬───────┘
                                         │               │                   │
                     ┌───────────────────┴──────┐ ┌──────┴──────────┐ ┌──────┴─────────────┐
                     ▼                          ▼ ▼                  ▼ ▼                     ▼
             ┌───────────────┐          ┌──────────────┐     ┌──────────────┐       ┌──────────────┐
             │ SQLite / PG   │          │ Gemini Vision│     │  Open-Meteo  │       │  APMC Mandi  │
             │ Async Engine  │          │ AI Pathology │     │  Weather API │       │ Market Rates │
             └───────────────┘          └──────────────┘     └──────────────┘       └──────────────┘
```

---

## 📂 Repository Structure

```text
Farming-Assist/
├── backend/
│   ├── app/
│   │   ├── core/           # Security, native bcrypt, JWT, and async database engine
│   │   ├── models/         # SQLAlchemy 2.0 async ORM models (User, Crop, Drone, Khata)
│   │   ├── routers/        # Modular API endpoints (auth, crops, drone, khata, market)
│   │   ├── schemas/        # Pydantic V2 validation schemas
│   │   ├── services/       # Agronomy GDD, Vision AI Doctor, Mandi, Weather engines
│   │   └── main.py         # FastAPI application entry point
│   ├── tests/              # Pytest test suite (16 comprehensive async tests)
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/     # Glassmorphic UI components (Radar, Gauge, Layout)
│   │   ├── context/        # Auth, Theme (Light/Dark), and Language Contexts
│   │   ├── i18n/           # Translations for 6 Indian languages
│   │   ├── pages/          # Dashboard, DroneStudio, KhataPage, MandiWeatherPage, AuthPage
│   │   ├── services/       # Typed API client
│   │   └── styles/         # Vanilla CSS design tokens & glassmorphism system
│   ├── index.html          # HTML5 entry with Google Fonts
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
├── README.md               # Project documentation
└── PROGRESS.md             # Development milestones & commit tracking
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Python**: 3.11+ (Python 3.13 recommended)
- **Node.js**: 18+ (Node 22 or 24 recommended)
- **Git**

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation will be accessible at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```

Open your browser at **`http://127.0.0.1:5173/`**.

---

## 🔑 Demo Farmer Account

For quick evaluation without manual signup:
- **Email / Phone**: `ramesh@krishikhata.com`
- **Password**: `FarmerPass123!`
- *(Or click the **Instant Demo Farmer Login** button directly on the login screen)*

---

## 🧪 Testing & Verification

### Run Backend Unit & Integration Tests
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```
*Executes all 16 test cases across Auth, Crops, GDD thermal calculations, Drone ingestion, Khata double-entry ledger, and Mandi price discovery.*

### Build Frontend Production Bundle
```bash
cd frontend
npm run build
```
*Validates zero TypeScript errors and compiles production distribution bundle in ~150ms.*

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Register new farmer account |
| `POST` | `/api/v1/auth/login` | JWT OAuth2 token acquisition |
| `POST` | `/api/v1/auth/refresh` | Refresh expired access token |
| `GET` | `/api/v1/crops` | List registered farm crops and varieties |
| `POST` | `/api/v1/crops` | Register new crop with sowing date & base temp |
| `GET` | `/api/v1/crops/{crop_id}/gdd` | Calculate cumulative GDD thermal units from Open-Meteo |
| `POST` | `/api/v1/drone/flights` | Initiate autonomous drone mission |
| `POST` | `/api/v1/drone/ingest` | Multipart upload of aerial frame for AI pathology diagnosis |
| `GET` | `/api/v1/drone/scans/{crop_id}` | Retrieve historical flight telemetry and diagnoses |
| `GET` | `/api/v1/khata/summary` | Double-entry ledger income, expense, and net profit |
| `POST` | `/api/v1/khata/transactions` | Record farm expenditure or harvest revenue |
| `GET` | `/api/v1/khata/labor` | Fetch worker attendance and wage records |
| `POST` | `/api/v1/khata/labor` | Log worker hours and daily wages |
| `GET` | `/api/v1/khata/kcc-report/{crop_id}`| Generate Kisan Credit Card bank loan appraisal |
| `GET` | `/api/v1/market/prices` | Query APMC Mandi commodity rates and daily trends |
| `GET` | `/api/v1/weather/forecast` | 7-day agricultural spray feasibility advisory |


