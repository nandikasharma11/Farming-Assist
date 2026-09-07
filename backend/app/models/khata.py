from datetime import date
from typing import Optional
from decimal import Decimal
from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import TimestampedBase

class KhataTransaction(TimestampedBase):
    __tablename__ = "khata_transactions"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    crop_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("crops.id"), nullable=True, index=True)
    
    # "INCOME" or "EXPENSE"
    transaction_type: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    
    # Categories: Seeds, Fertilizer, Pesticide, Fuel, Machinery, Labor, Irrigation, Harvest Sale, Subsidy, Other
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    receipt_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    user = relationship("User")
    crop = relationship("Crop", back_populates="transactions")

class LaborRecord(TimestampedBase):
    __tablename__ = "labor_records"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    crop_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("crops.id"), nullable=True, index=True)
    
    laborer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    task_type: Mapped[str] = mapped_column(String(50), nullable=False) # Transplanting, Weeding, Spraying, Harvesting
    daily_wage: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    days_worked: Mapped[float] = mapped_column(Numeric(6, 2), default=1.0)
    advance_paid: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    net_balance: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    status: Mapped[str] = mapped_column(String(20), default="UNPAID") # UNPAID, PARTIAL, SETTLED

    # Relationships
    user = relationship("User")
    crop = relationship("Crop")
