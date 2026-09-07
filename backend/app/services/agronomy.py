import httpx
from datetime import date, datetime
from typing import Any, Dict, List, Tuple

CROP_GDD_CONFIGS: Dict[str, Dict[str, Any]] = {
    "Cotton": {
        "base_temp": 15.6,
        "target_gdd": 1800.0,
        "stages": [
            ("Emergence", 0.0, 120.0),
            ("Vegetative (Square Initiation)", 120.0, 600.0),
            ("Flowering", 600.0, 1200.0),
            ("Boll Development", 1200.0, 1750.0),
            ("Maturity & Harvest Ready", 1750.0, 99999.0),
        ]
    },
    "Wheat": {
        "base_temp": 4.4,
        "target_gdd": 1700.0,
        "stages": [
            ("Crown Root Initiation", 0.0, 250.0),
            ("Tillering & Stem Elongation", 250.0, 750.0),
            ("Booting & Anthesis (Flowering)", 750.0, 1200.0),
            ("Grain Filling & Dough Stage", 1200.0, 1600.0),
            ("Maturity & Harvest Ready", 1600.0, 99999.0),
        ]
    },
    "Rice": {
        "base_temp": 10.0,
        "target_gdd": 1600.0,
        "stages": [
            ("Seedling & Tillering", 0.0, 500.0),
            ("Panicle Initiation & Heading", 500.0, 1050.0),
            ("Grain Filling & Milk Stage", 1050.0, 1450.0),
            ("Maturity & Harvest Ready", 1450.0, 99999.0),
        ]
    },
    "Soybean": {
        "base_temp": 10.0,
        "target_gdd": 1400.0,
        "stages": [
            ("Emergence & Unifoliate", 0.0, 180.0),
            ("Vegetative Trifoliate", 180.0, 550.0),
            ("Flowering & Pod Set", 550.0, 950.0),
            ("Seed Fill", 950.0, 1300.0),
            ("Maturity & Harvest Ready", 1300.0, 99999.0),
        ]
    }
}

DEFAULT_CROP_CONFIG = {
    "base_temp": 10.0,
    "target_gdd": 1500.0,
    "stages": [
        ("Vegetative", 0.0, 500.0),
        ("Flowering", 500.0, 1000.0),
        ("Grain/Fruit Filling", 1000.0, 1400.0),
        ("Maturity & Harvest Ready", 1400.0, 99999.0),
    ]
}

def get_crop_spec(crop_name: str) -> Dict[str, Any]:
    for key, spec in CROP_GDD_CONFIGS.items():
        if key.lower() in crop_name.lower():
            return spec
    return DEFAULT_CROP_CONFIG

def determine_crop_stage(cumulative_gdd: float, crop_spec: Dict[str, Any]) -> str:
    stages = crop_spec["stages"]
    for stage_name, min_val, max_val in stages:
        if min_val <= cumulative_gdd < max_val:
            return stage_name
    return stages[-1][0]

async def calculate_cumulative_gdd(
    crop_name: str,
    sowing_date: date,
    latitude: float,
    longitude: float,
    current_date: date | None = None
) -> Tuple[float, str, float, List[Dict[str, Any]]]:
    """
    Queries Open-Meteo Archive API to calculate cumulative GDD and growth stage.
    Returns: (cumulative_gdd, current_stage, progress_percentage, daily_series)
    """
    if current_date is None:
        current_date = date.today()

    spec = get_crop_spec(crop_name)
    base_temp = spec["base_temp"]
    target_gdd = spec["target_gdd"]

    start_str = sowing_date.isoformat()
    end_str = current_date.isoformat()

    daily_history: List[Dict[str, Any]] = []
    cumulative_gdd = 0.0

    # Attempt to query Open-Meteo archive API
    url = (
        f"https://archive-api.open-meteo.com/v1/archive?"
        f"latitude={latitude}&longitude={longitude}"
        f"&start_date={start_str}&end_date={end_str}"
        f"&daily=temperature_2m_max,temperature_2m_min"
        f"&timezone=auto"
    )

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                daily = data.get("daily", {})
                dates = daily.get("time", [])
                max_temps = daily.get("temperature_2m_max", [])
                min_temps = daily.get("temperature_2m_min", [])

                for d_str, t_max, t_min in zip(dates, max_temps, min_temps):
                    if t_max is not None and t_min is not None:
                        avg_temp = (t_max + t_min) / 2.0
                        daily_gdd = max(0.0, avg_temp - base_temp)
                        cumulative_gdd += daily_gdd
                        daily_history.append({
                            "date": d_str,
                            "t_max": t_max,
                            "t_min": t_min,
                            "daily_gdd": round(daily_gdd, 2),
                            "cumulative_gdd": round(cumulative_gdd, 2)
                        })
    except Exception:
        # Fallback to standard seasonal thermal estimation if remote weather service is unreachable
        pass

    # If API returned no records (e.g. offline or dates in future/same day), use seasonal model
    if not daily_history:
        days = max(1, (current_date - sowing_date).days)
        # Average agricultural daytime mean temp ~ 28C
        estimated_avg_temp = 27.5
        daily_thermal = max(0.0, estimated_avg_temp - base_temp)
        cumulative_gdd = daily_thermal * days
        daily_history.append({
            "date": end_str,
            "t_max": 32.0,
            "t_min": 23.0,
            "daily_gdd": round(daily_thermal, 2),
            "cumulative_gdd": round(cumulative_gdd, 2),
            "estimated": True
        })

    stage = determine_crop_stage(cumulative_gdd, spec)
    progress_pct = min(100.0, round((cumulative_gdd / target_gdd) * 100.0, 1))

    return round(cumulative_gdd, 2), stage, progress_pct, daily_history
