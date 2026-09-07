from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

class CropBase(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Cotton"})
    variety: Optional[str] = Field("Bt-II RCH-659", json_schema_extra={"example": "Bt-II RCH-659"})
    sowing_date: date = Field(..., json_schema_extra={"example": "2026-06-15"})
    base_temperature_c: Optional[float] = Field(15.6, json_schema_extra={"example": 15.6})
    target_gdd: Optional[float] = Field(1800.0, json_schema_extra={"example": 1800.0})

class CropCreate(CropBase):
    plot_id: str

class CropResponse(CropBase):
    id: str
    plot_id: str
    current_gdd: float
    current_stage: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GDDCalculationResponse(BaseModel):
    crop_id: str
    crop_name: str
    sowing_date: date
    current_gdd: float
    target_gdd: float
    progress_percentage: float
    current_stage: str
    daily_history: List[Dict[str, Any]] = []
