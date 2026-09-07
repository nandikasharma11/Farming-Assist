from datetime import date, datetime
from decimal import Decimal
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

class TransactionBase(BaseModel):
    crop_id: Optional[str] = None
    transaction_type: str = Field(..., json_schema_extra={"example": "EXPENSE"})
    category: str = Field(..., json_schema_extra={"example": "Fertilizer"})
    amount: Decimal = Field(..., ge=0.01, json_schema_extra={"example": 3500.00})
    transaction_date: date = Field(default_factory=date.today)
    description: Optional[str] = Field(None, json_schema_extra={"example": "2 bags Urea + 1 bag DAP"})
    receipt_url: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class KhataSummaryResponse(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    net_profit: Decimal
    expense_by_category: Dict[str, Decimal] = {}
    income_by_category: Dict[str, Decimal] = {}
    transaction_count: int

class LaborRecordBase(BaseModel):
    crop_id: Optional[str] = None
    laborer_name: str = Field(..., json_schema_extra={"example": "Kailash Bai"})
    phone: Optional[str] = Field(None, json_schema_extra={"example": "9876543210"})
    task_type: str = Field(..., json_schema_extra={"example": "Weeding"})
    daily_wage: Decimal = Field(..., ge=1.0, json_schema_extra={"example": 400.00})
    days_worked: float = Field(1.0, ge=0.5, json_schema_extra={"example": 3.5})
    advance_paid: Decimal = Field(Decimal("0.00"), ge=0.0, json_schema_extra={"example": 500.00})

class LaborRecordCreate(LaborRecordBase):
    pass

class LaborRecordUpdate(BaseModel):
    days_worked: Optional[float] = None
    advance_paid: Optional[Decimal] = None
    status: Optional[str] = None

class LaborRecordResponse(LaborRecordBase):
    id: str
    user_id: str
    net_balance: Decimal
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class KCCReportResponse(BaseModel):
    report_title: str = "Kisan Credit Card (KCC) Crop Loan Appraisal Summary"
    farmer_name: str
    state: Optional[str]
    district: Optional[str]
    plot_name: str
    plot_acres: float
    crop_name: str
    variety: Optional[str]
    sowing_date: date
    current_growth_stage: str
    cumulative_gdd: float
    total_expenses_incurred: Decimal
    expenses_breakdown: Dict[str, Decimal]
    labor_dues_pending: Decimal
    standard_scale_of_finance_per_acre: Decimal
    eligible_kcc_credit_limit: Decimal
    generated_at: datetime
