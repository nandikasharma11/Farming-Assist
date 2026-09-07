from datetime import date
from typing import List, Optional
from sqlalchemy import Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import TimestampedBase

class Crop(TimestampedBase):
    __tablename__ = "crops"

    plot_id: Mapped[str] = mapped_column(String(36), ForeignKey("farm_plots.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False) # e.g. "Cotton", "Wheat", "Rice"
    variety: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    sowing_date: Mapped[date] = mapped_column(Date, nullable=False)
    base_temperature_c: Mapped[float] = mapped_column(Float, default=10.0) # Base temp for GDD
    target_gdd: Mapped[float] = mapped_column(Float, default=1800.0)
    current_gdd: Mapped[float] = mapped_column(Float, default=0.0)
    current_stage: Mapped[str] = mapped_column(String(50), default="Vegetative")
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE") # ACTIVE, HARVESTED, ARCHIVED

    # Relationships
    plot: Mapped["FarmPlot"] = relationship("FarmPlot", back_populates="crops")
    transactions: Mapped[List["KhataTransaction"]] = relationship(
        "KhataTransaction", back_populates="crop", cascade="all, delete-orphan", lazy="selectin"
    )
