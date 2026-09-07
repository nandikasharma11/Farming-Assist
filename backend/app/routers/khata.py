from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.crop import Crop
from app.models.khata import KhataTransaction, LaborRecord
from app.models.user import FarmPlot, User
from app.schemas.khata import (
    KCCReportResponse,
    KhataSummaryResponse,
    LaborRecordCreate,
    LaborRecordResponse,
    LaborRecordUpdate,
    TransactionCreate,
    TransactionResponse,
)

router = APIRouter(prefix="/khata", tags=["Farm Khata Ledger"])

# --- Double-Entry Khata Transactions ---

@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Record an income or expense transaction in the farm ledger."""
    # If crop_id is provided, verify ownership
    if payload.crop_id:
        stmt = (
            select(Crop)
            .join(FarmPlot, Crop.plot_id == FarmPlot.id)
            .where(Crop.id == payload.crop_id, FarmPlot.user_id == current_user.id)
        )
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced crop not found")

    tx_type = payload.transaction_type.upper()
    if tx_type not in ["INCOME", "EXPENSE"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="transaction_type must be INCOME or EXPENSE")

    tx = KhataTransaction(
        user_id=current_user.id,
        crop_id=payload.crop_id,
        transaction_type=tx_type,
        category=payload.category,
        amount=payload.amount,
        transaction_date=payload.transaction_date,
        description=payload.description,
        receipt_url=payload.receipt_url
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx

@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    crop_id: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List financial transactions with optional filtering."""
    stmt = select(KhataTransaction).where(KhataTransaction.user_id == current_user.id)
    if crop_id:
        stmt = stmt.where(KhataTransaction.crop_id == crop_id)
    if transaction_type:
        stmt = stmt.where(KhataTransaction.transaction_type == transaction_type.upper())
    
    stmt = stmt.order_by(desc(KhataTransaction.transaction_date))
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/summary", response_model=KhataSummaryResponse)
async def get_khata_summary(
    crop_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve financial summary: total income, total expense, net profit, and category breakdowns."""
    stmt = select(KhataTransaction).where(KhataTransaction.user_id == current_user.id)
    if crop_id:
        stmt = stmt.where(KhataTransaction.crop_id == crop_id)

    result = await db.execute(stmt)
    transactions = result.scalars().all()

    total_income = Decimal("0.00")
    total_expense = Decimal("0.00")
    expense_categories: dict[str, Decimal] = {}
    income_categories: dict[str, Decimal] = {}

    for tx in transactions:
        amt = Decimal(str(tx.amount))
        cat = tx.category
        if tx.transaction_type == "INCOME":
            total_income += amt
            income_categories[cat] = income_categories.get(cat, Decimal("0.00")) + amt
        else:
            total_expense += amt
            expense_categories[cat] = expense_categories.get(cat, Decimal("0.00")) + amt

    net_profit = total_income - total_expense

    return KhataSummaryResponse(
        total_income=total_income,
        total_expense=total_expense,
        net_profit=net_profit,
        expense_by_category=expense_categories,
        income_by_category=income_categories,
        transaction_count=len(transactions)
    )

# --- Labor Payroll Sub-Ledger ---

@router.post("/labor", response_model=LaborRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_labor_record(
    payload: LaborRecordCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new farm laborer record with wage calculation."""
    days_worked = Decimal(str(payload.days_worked))
    daily_wage = Decimal(str(payload.daily_wage))
    advance_paid = Decimal(str(payload.advance_paid))
    net_bal = (daily_wage * days_worked) - advance_paid
    status_val = "SETTLED" if net_bal <= 0 else ("PARTIAL" if advance_paid > 0 else "UNPAID")

    record = LaborRecord(
        user_id=current_user.id,
        crop_id=payload.crop_id,
        laborer_name=payload.laborer_name,
        phone=payload.phone,
        task_type=payload.task_type,
        daily_wage=payload.daily_wage,
        days_worked=payload.days_worked,
        advance_paid=payload.advance_paid,
        net_balance=net_bal,
        status=status_val
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record

@router.get("/labor", response_model=List[LaborRecordResponse])
async def list_labor_records(
    crop_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all farm labor records and pending wage balances."""
    stmt = select(LaborRecord).where(LaborRecord.user_id == current_user.id)
    if crop_id:
        stmt = stmt.where(LaborRecord.crop_id == crop_id)
    stmt = stmt.order_by(desc(LaborRecord.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()

@router.patch("/labor/{labor_id}", response_model=LaborRecordResponse)
async def update_labor_record(
    labor_id: str,
    payload: LaborRecordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update labor attendance, advance payment, or settlement status."""
    stmt = select(LaborRecord).where(LaborRecord.id == labor_id, LaborRecord.user_id == current_user.id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Labor record not found")

    if payload.days_worked is not None:
        record.days_worked = payload.days_worked
    if payload.advance_paid is not None:
        record.advance_paid = payload.advance_paid
    if payload.status is not None:
        record.status = payload.status

    days = Decimal(str(record.days_worked))
    wage = Decimal(str(record.daily_wage))
    advance = Decimal(str(record.advance_paid))
    record.net_balance = max(Decimal("0.00"), (wage * days) - advance)

    if record.net_balance == 0:
        record.status = "SETTLED"

    await db.commit()
    await db.refresh(record)
    return record

# --- KCC Loan Appraisal Report ---

@router.get("/kcc-report/{crop_id}", response_model=KCCReportResponse)
async def get_kcc_report(
    crop_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate a bank-compliant Kisan Credit Card (KCC) financial appraisal sheet."""
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

    # Fetch expenses incurred for this crop
    tx_stmt = select(KhataTransaction).where(
        KhataTransaction.crop_id == crop.id,
        KhataTransaction.transaction_type == "EXPENSE"
    )
    tx_result = await db.execute(tx_stmt)
    expenses = tx_result.scalars().all()

    total_expense = Decimal("0.00")
    breakdown: dict[str, Decimal] = {}
    for tx in expenses:
        amt = Decimal(str(tx.amount))
        total_expense += amt
        breakdown[tx.category] = breakdown.get(tx.category, Decimal("0.00")) + amt

    # Fetch pending labor dues
    labor_stmt = select(func.sum(LaborRecord.net_balance)).where(
        LaborRecord.crop_id == crop.id,
        LaborRecord.user_id == current_user.id
    )
    labor_result = await db.execute(labor_stmt)
    labor_dues = labor_result.scalar() or Decimal("0.00")

    # Standard NABARD scale of finance per acre for major crops (e.g. Cotton ~ ₹35,000/acre, Wheat ~ ₹28,000/acre)
    crop_scale_map = {
        "Cotton": Decimal("38000.00"),
        "Wheat": Decimal("30000.00"),
        "Rice": Decimal("32000.00"),
        "Soybean": Decimal("26000.00"),
    }
    scale_of_finance = Decimal("30000.00")
    for key, val in crop_scale_map.items():
        if key.lower() in crop.name.lower():
            scale_of_finance = val
            break

    plot_acres = Decimal(str(plot.area_acres))
    # KCC formula: Scale of Finance * Acreage + 10% post-harvest/household + 20% farm maintenance
    base_kcc_limit = scale_of_finance * plot_acres
    total_eligible_kcc = round(base_kcc_limit * Decimal("1.30"), 2)

    return KCCReportResponse(
        farmer_name=current_user.full_name,
        state=current_user.state,
        district=current_user.district,
        plot_name=plot.name,
        plot_acres=plot.area_acres,
        crop_name=crop.name,
        variety=crop.variety,
        sowing_date=crop.sowing_date,
        current_growth_stage=crop.current_stage,
        cumulative_gdd=crop.current_gdd,
        total_expenses_incurred=total_expense,
        expenses_breakdown=breakdown,
        labor_dues_pending=Decimal(str(labor_dues)),
        standard_scale_of_finance_per_acre=scale_of_finance,
        eligible_kcc_credit_limit=total_eligible_kcc,
        generated_at=datetime.now(timezone.utc)
    )
