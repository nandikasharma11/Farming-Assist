from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.market_weather import MandiPriceResponse, WeatherAdvisoryResponse
from app.services.mandi import get_apmc_prices
from app.services.weather import get_agricultural_weather_advisory

router = APIRouter(tags=["Mandi Market & Weather Intelligence"])

@router.get("/market/prices", response_model=MandiPriceResponse)
async def get_market_prices(
    commodity: Optional[str] = Query(None, description="Filter by crop/commodity e.g. Cotton, Soybean"),
    state: Optional[str] = Query(None, description="Filter by State e.g. Maharashtra"),
    district: Optional[str] = Query(None, description="Filter by District e.g. Nagpur"),
    current_user: User = Depends(get_current_user)
):
    """Retrieve live APMC Mandi price benchmarks with modal prices, trends, and MSP comparisons."""
    rates = await get_apmc_prices(commodity=commodity, state=state, district=district)
    return MandiPriceResponse(
        total_records=len(rates),
        rates=rates
    )

@router.get("/weather/forecast", response_model=WeatherAdvisoryResponse)
async def get_weather_advisory(
    latitude: float = Query(21.1458, description="Plot Latitude"),
    longitude: float = Query(79.0882, description="Plot Longitude"),
    current_user: User = Depends(get_current_user)
):
    """Retrieve 7-day agricultural weather forecast with agrochemical spray drift & wash-off risk alerts."""
    advisory = await get_agricultural_weather_advisory(latitude=latitude, longitude=longitude)
    return WeatherAdvisoryResponse.model_validate(advisory)
