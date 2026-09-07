import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.crop import Crop
from app.models.drone import DiseaseDiagnosis, DroneFlight, DroneScan
from app.models.user import FarmPlot, User
from app.schemas.drone import (
    DiagnosisResponse,
    DroneFlightResponse,
    DroneFlightStartRequest,
    DroneIngestResponse,
    DroneScanResponse,
)
from app.services.vision_ai import analyze_crop_image

router = APIRouter(prefix="/drone", tags=["Drone Ingestion & Vision AI"])

# --- Flight Session Management ---

@router.post("/flights/start", response_model=DroneFlightResponse, status_code=status.HTTP_201_CREATED)
async def start_flight_session(
    payload: DroneFlightStartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Initiate an aerial drone scanning flight session."""
    session_code = payload.session_code or f"FLIGHT-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
    
    flight = DroneFlight(
        user_id=current_user.id,
        session_code=session_code,
        start_latitude=payload.start_latitude,
        start_longitude=payload.start_longitude,
        altitude_m=payload.altitude_m,
        status="IN_PROGRESS"
    )
    db.add(flight)
    await db.commit()
    await db.refresh(flight)
    return flight

@router.post("/flights/{flight_id}/end", response_model=DroneFlightResponse)
async def end_flight_session(
    flight_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark an aerial drone mission as completed."""
    stmt = select(DroneFlight).where(DroneFlight.id == flight_id, DroneFlight.user_id == current_user.id)
    result = await db.execute(stmt)
    flight = result.scalar_one_or_none()
    if not flight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flight session not found")

    flight.status = "COMPLETED"
    flight.ended_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(flight)
    return flight

@router.get("/flights", response_model=List[DroneFlightResponse])
async def list_flight_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List recent drone flight missions."""
    stmt = select(DroneFlight).where(DroneFlight.user_id == current_user.id).order_by(desc(DroneFlight.started_at))
    result = await db.execute(stmt)
    return result.scalars().all()

# --- Drone Image Ingestion & AI Pathology ---

@router.post("/ingest", response_model=DroneIngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_drone_frame(
    crop_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    altitude_m: float = Form(12.5),
    flight_session_id: Optional[str] = Form(None),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest aerial/macro drone camera capture with telemetry and trigger Gemini Vision pathology analysis.
    """
    # Verify crop ownership
    crop_stmt = (
        select(Crop)
        .join(FarmPlot, Crop.plot_id == FarmPlot.id)
        .where(Crop.id == crop_id, FarmPlot.user_id == current_user.id)
    )
    result = await db.execute(crop_stmt)
    crop = result.scalar_one_or_none()
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified crop not found")

    # If flight_session_id is provided, verify it
    if flight_session_id:
        f_stmt = select(DroneFlight).where(DroneFlight.id == flight_session_id, DroneFlight.user_id == current_user.id)
        f_res = await db.execute(f_stmt)
        if not f_res.scalar_one_or_none():
            flight_session_id = None

    # Persist file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(image.filename or "capture.jpg")[1] or ".jpg"
    unique_filename = f"drone_{crop_id}_{uuid.uuid4().hex[:8]}{file_ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    file_bytes = await image.read()
    with open(saved_path, "wb") as f:
        f.write(file_bytes)

    # Relative path for API serving
    relative_image_url = f"/uploads/drone_images/{unique_filename}"

    # Create DroneScan record
    scan = DroneScan(
        flight_id=flight_session_id,
        crop_id=crop.id,
        latitude=latitude,
        longitude=longitude,
        altitude_m=altitude_m,
        image_path=relative_image_url,
        captured_at=datetime.now(timezone.utc)
    )
    db.add(scan)
    await db.flush()

    # Run AI Vision plant pathology analysis
    ai_result = await analyze_crop_image(saved_path, crop_name=crop.name)

    diagnosis = DiseaseDiagnosis(
        scan_id=scan.id,
        disease_name=ai_result.get("disease_name", "Undetermined Condition"),
        confidence_score=float(ai_result.get("confidence_score", 85.0)),
        severity=ai_result.get("severity", "MEDIUM"),
        affected_quadrant=ai_result.get("affected_quadrant", "Central Canopy"),
        organic_remedy=ai_result.get("organic_remedy", "Apply 5ml neem oil solution per liter."),
        chemical_remedy=ai_result.get("chemical_remedy", "Consult local Krishi Vigyan Kendra for recommended fungicide."),
        preventive_plan=ai_result.get("preventive_plan", "Monitor crop leaf margins closely over the next 7 days."),
        raw_inference_metadata=ai_result.get("raw_inference_metadata", {})
    )
    db.add(diagnosis)
    await db.commit()
    await db.refresh(scan)
    await db.refresh(diagnosis)

    return DroneIngestResponse(
        message="Drone image ingested and diagnosed successfully",
        scan=DroneScanResponse.model_validate(scan),
        diagnosis=DiagnosisResponse.model_validate(diagnosis)
    )

@router.get("/scans/{crop_id}", response_model=List[DroneScanResponse])
async def list_crop_scans(
    crop_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full timeline of aerial drone scans with AI pathology records for a crop."""
    # Verify crop ownership
    crop_stmt = (
        select(Crop)
        .join(FarmPlot, Crop.plot_id == FarmPlot.id)
        .where(Crop.id == crop_id, FarmPlot.user_id == current_user.id)
    )
    result = await db.execute(crop_stmt)
    crop = result.scalar_one_or_none()
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")

    stmt = select(DroneScan).where(DroneScan.crop_id == crop_id).order_by(desc(DroneScan.captured_at))
    scan_result = await db.execute(stmt)
    return scan_result.scalars().all()
