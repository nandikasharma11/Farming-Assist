from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class MandiRateItem(BaseModel):
    commodity: str
    variety: str
    state: str
    district: str
    market: str
    min_price: float
    max_price: float
    modal_price: float
    trend_pct: float
    arrival_tons: float
    msp: Optional[float] = None

class MandiPriceResponse(BaseModel):
    total_records: int
    rates: List[MandiRateItem]

class DailyWeatherForecast(BaseModel):
    date: str
    weather_code: int
    condition: str
    t_max: float
    t_min: float
    precipitation_probability: float
    precipitation_sum: float
    wind_speed_max: float
    spray_status: str # OPTIMAL, CAUTION_WIND, NO_SPRAY, EVENING_ONLY
    spray_advice: str

class WeatherAdvisoryResponse(BaseModel):
    latitude: float
    longitude: float
    current_temperature: float
    current_humidity: float
    current_wind_speed: float
    current_weather: str
    spray_status: str
    spray_rationale: str
    forecast: List[DailyWeatherForecast]
