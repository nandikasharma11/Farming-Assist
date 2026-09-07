from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class FarmPlotBase(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "North Field"})
    area_acres: float = Field(1.0, ge=0.01, json_schema_extra={"example": 2.5})
    latitude: float = Field(..., json_schema_extra={"example": 21.1458})
    longitude: float = Field(..., json_schema_extra={"example": 79.0882})
    soil_type: Optional[str] = Field("Loamy", json_schema_extra={"example": "Black Cotton"})

class FarmPlotCreate(FarmPlotBase):
    pass

class FarmPlotResponse(FarmPlotBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    full_name: str = Field(..., json_schema_extra={"example": "Ramesh Patel"})
    email: str = Field(..., json_schema_extra={"example": "ramesh@krishikhata.com"})
    phone: str = Field(..., json_schema_extra={"example": "+919876543210"})
    state: Optional[str] = Field(None, json_schema_extra={"example": "Maharashtra"})
    district: Optional[str] = Field(None, json_schema_extra={"example": "Nagpur"})
    preferred_language: str = Field("en", json_schema_extra={"example": "hi"})

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserProfileResponse(UserResponse):
    plots: List[FarmPlotResponse] = []

    model_config = ConfigDict(from_attributes=True)
