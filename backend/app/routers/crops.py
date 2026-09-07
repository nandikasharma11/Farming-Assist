from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.crop import Crop
from app.models.user import FarmPlot, User
from app.schemas.crop import CropCreate, CropResponse, GDDCalculationResponse
from app.schemas.user import FarmPlotCreate, FarmPlotResponse
from app.services.agronomy import calculate_cumulative_gdd, get_crop_spec

router = APIRouter(prefix="/crops", tags=["Agronomy & Crops"])

# --- Farm Plots ---

@router.post("/plots", response_model=FarmPlotResponse, status_code=status.HTTP_201_CREATED)
async def create_plot(
    payload: FarmPlotCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new farm plot for the authenticated farmer."""
    new_plot = FarmPlot(
        user_id=current_user.id,
        name=payload.name,
        area_acres=payload.area_acres,
        latitude=payload.latitude,
        longitude=payload.longitude,
        soil_type=payload.soil_type or "Loamy"
    )
    db.add(new_plot)
    await db.commit()
    await db.refresh(new_plot)
    return new_plot

@router.get("/plots", response_model=List[FarmPlotResponse])
async def list_plots(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all farm plots owned by the farmer."""
    stmt = select(FarmPlot).where(FarmPlot.user_id == current_user.id)
    result = await db.execute(stmt)
    return result.scalars().all()

# --- Crops & GDD ---

@router.post("", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
async def register_crop(
    payload: CropCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Register a new crop cycle on a designated farm plot."""
    # Verify plot ownership
    stmt = select(FarmPlot).where(FarmPlot.id == payload.plot_id, FarmPlot.user_id == current_user.id)
    result = await db.execute(stmt)
    plot = result.scalar_one_or_none()
    if not plot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm plot not found")

    spec = get_crop_spec(payload.name)
    base_temp = payload.base_temperature_c or spec["base_temp"]
    target_gdd = payload.target_gdd or spec["target_gdd"]

    # Compute initial GDD from sowing date to today
    gdd_val, stage, _, _ = await calculate_cumulative_gdd(
        crop_name=payload.name,
        sowing_date=payload.sowing_date,
        latitude=plot.latitude,
        longitude=plot.longitude
    )

    new_crop = Crop(
        plot_id=plot.id,
        name=payload.name,
        variety=payload.variety,
        sowing_date=payload.sowing_date,
        base_temperature_c=base_temp,
        target_gdd=target_gdd,
        current_gdd=gdd_val,
        current_stage=stage,
        status="ACTIVE"
    )
    db.add(new_crop)
    await db.commit()
    await db.refresh(new_crop)
    return new_crop

@router.get("", response_model=List[CropResponse])
async def list_crops(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all active and archived crops across all farmer plots."""
    stmt = (
        select(Crop)
        .join(FarmPlot, Crop.plot_id == FarmPlot.id)
        .where(FarmPlot.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{crop_id}", response_model=CropResponse)
async def get_crop(
    crop_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get single crop details."""
    stmt = (
        select(Crop)
        .join(FarmPlot, Crop.plot_id == FarmPlot.id)
        .where(Crop.id == crop_id, FarmPlot.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    crop = result.scalar_one_or_none()
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    return crop

@router.post("/{crop_id}/calculate-gdd", response_model=GDDCalculationResponse)
async def trigger_gdd_calculation(
    crop_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Compute latest cumulative GDD from Open-Meteo weather API and update growth stage."""
    stmt = (
        select(Crop, FarmPlot)
        .join(FarmPlot, Crop.plot_id == FarmPlot.id)
        .where(Crop.id == crop_id, FarmPlot.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    row = result.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    
    crop, plot = row
    gdd_val, stage, progress_pct, history = await calculate_cumulative_gdd(
        crop_name=crop.name,
        sowing_date=crop.sowing_date,
        latitude=plot.latitude,
        longitude=plot.longitude
    )

    crop.current_gdd = gdd_val
    crop.current_stage = stage
    await db.commit()
    await db.refresh(crop)

    return GDDCalculationResponse(
        crop_id=crop.id,
        crop_name=crop.name,
        sowing_date=crop.sowing_date,
        current_gdd=crop.current_gdd,
        target_gdd=crop.target_gdd,
        progress_percentage=progress_pct,
        current_stage=crop.current_stage,
        daily_history=history
    )
