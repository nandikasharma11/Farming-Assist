from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.user import FarmPlot, User
from app.schemas.auth import (
    LoginRequest,
    SignupRequest,
    TokenRefreshRequest,
    TokenRefreshResponse,
    TokenResponse,
)
from app.schemas.user import UserProfileResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    """Register a new farmer account and provision a starter farm plot."""
    # Check if email or phone already exists
    stmt = select(User).where(or_(User.email == payload.email, User.phone == payload.phone))
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()
    if existing_user:
        if existing_user.email == payload.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this mobile phone number already exists."
            )

    # Hash password and create user
    hashed_pwd = get_password_hash(payload.password)
    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hashed_pwd,
        state=payload.state,
        district=payload.district,
        preferred_language=payload.preferred_language or "en",
        is_active=True,
    )
    db.add(new_user)
    await db.flush() # Populate new_user.id

    # Create a default farm plot for immediate onboarding
    starter_plot = FarmPlot(
        user_id=new_user.id,
        name=f"{payload.full_name.split()[0]}'s Main Field",
        area_acres=2.5,
        latitude=21.1458,  # Default central India agricultural coordinate
        longitude=79.0882,
        soil_type="Black Cotton",
    )
    db.add(starter_plot)
    await db.commit()
    await db.refresh(new_user)

    # Issue JWT tokens
    access_token = create_access_token(new_user.id)
    refresh_token = create_refresh_token(new_user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with email or phone and password, issuing access & refresh tokens."""
    stmt = select(User).where(
        or_(User.email == payload.email_or_phone, User.phone == payload.email_or_phone)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/phone or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Farmer account has been deactivated."
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )

@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(payload: TokenRefreshRequest, db: AsyncSession = Depends(get_db)):
    """Issue a fresh access token using a valid refresh token."""
    try:
        decoded = decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Provided token is not a refresh token."
            )
        user_id = decoded.get("sub")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        ) from e

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account deactivated."
        )

    new_access_token = create_access_token(user.id)
    return TokenRefreshResponse(
        access_token=new_access_token,
        token_type="bearer"
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated farmer profile with associated plots."""
    return UserProfileResponse.model_validate(current_user)
