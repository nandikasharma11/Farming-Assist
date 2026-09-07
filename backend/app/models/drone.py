from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import JSON, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import TimestampedBase, utc_now

class DroneFlight(TimestampedBase):
    __tablename__ = "drone_flights"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    session_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    start_latitude: Mapped[float] = mapped_column(Float, nullable=False)
    start_longitude: Mapped[float] = mapped_column(Float, nullable=False)
    altitude_m: Mapped[float] = mapped_column(Float, default=15.0)
    status: Mapped[str] = mapped_column(String(20), default="IN_PROGRESS") # IN_PROGRESS, COMPLETED, ABORTED
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    scans: Mapped[List["DroneScan"]] = relationship("DroneScan", back_populates="flight", cascade="all, delete-orphan")

class DroneScan(TimestampedBase):
    __tablename__ = "drone_scans"

    flight_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("drone_flights.id"), nullable=True, index=True)
    crop_id: Mapped[str] = mapped_column(String(36), ForeignKey("crops.id"), nullable=False, index=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    altitude_m: Mapped[float] = mapped_column(Float, default=12.5)
    image_path: Mapped[str] = mapped_column(String(255), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    flight: Mapped[Optional["DroneFlight"]] = relationship("DroneFlight", back_populates="scans")
    crop = relationship("Crop")
    diagnosis: Mapped[Optional["DiseaseDiagnosis"]] = relationship(
        "DiseaseDiagnosis", back_populates="scan", uselist=False, cascade="all, delete-orphan", lazy="selectin"
    )

class DiseaseDiagnosis(TimestampedBase):
    __tablename__ = "disease_diagnoses"

    scan_id: Mapped[str] = mapped_column(String(36), ForeignKey("drone_scans.id"), unique=True, nullable=False, index=True)
    disease_name: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. "Leaf Blight (Alternaria)", "Healthy Crop"
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False) # 0.0 to 100.0%
    severity: Mapped[str] = mapped_column(String(20), nullable=False) # "LOW", "MEDIUM", "CRITICAL"
    affected_quadrant: Mapped[str] = mapped_column(String(100), default="Canopy Center")
    organic_remedy: Mapped[str] = mapped_column(Text, nullable=False)
    chemical_remedy: Mapped[str] = mapped_column(Text, nullable=False)
    preventive_plan: Mapped[str] = mapped_column(Text, nullable=False)
    raw_inference_metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    diagnosed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    scan: Mapped["DroneScan"] = relationship("DroneScan", back_populates="diagnosis")
