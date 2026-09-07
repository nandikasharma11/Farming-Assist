from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

class DroneFlightStartRequest(BaseModel):
    session_code: Optional[str] = None
    start_latitude: float = Field(..., json_schema_extra={"example": 21.1458})
    start_longitude: float = Field(..., json_schema_extra={"example": 79.0882})
    altitude_m: float = Field(15.0, json_schema_extra={"example": 15.0})

class DroneFlightResponse(BaseModel):
    id: str
    user_id: str
    session_code: str
    start_latitude: float
    start_longitude: float
    altitude_m: float
    status: str
    started_at: datetime
    ended_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class DiagnosisResponse(BaseModel):
    id: str
    scan_id: str
    disease_name: str
    confidence_score: float
    severity: str
    affected_quadrant: str
    organic_remedy: str
    chemical_remedy: str
    preventive_plan: str
    raw_inference_metadata: Dict[str, Any] = {}
    diagnosed_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DroneScanResponse(BaseModel):
    id: str
    flight_id: Optional[str] = None
    crop_id: str
    latitude: float
    longitude: float
    altitude_m: float
    image_path: str
    captured_at: datetime
    diagnosis: Optional[DiagnosisResponse] = None

    model_config = ConfigDict(from_attributes=True)

class DroneIngestResponse(BaseModel):
    message: str = "Drone frame successfully ingested and analyzed by Multimodal AI Doctor"
    scan: DroneScanResponse
    diagnosis: DiagnosisResponse
