from typing import List, Optional
from sqlalchemy import Boolean, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import TimestampedBase

class User(TimestampedBase):
    __tablename__ = "users"

    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    state: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    plots: Mapped[List["FarmPlot"]] = relationship(
        "FarmPlot", back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )

class FarmPlot(TimestampedBase):
    __tablename__ = "farm_plots"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    area_acres: Mapped[float] = mapped_column(Float, default=1.0)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    soil_type: Mapped[Optional[str]] = mapped_column(String(50), default="Loamy")

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="plots")
    crops: Mapped[List["Crop"]] = relationship(
        "Crop", back_populates="plot", cascade="all, delete-orphan", lazy="selectin"
    )
