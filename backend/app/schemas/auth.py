from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import UserResponse

class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6, max_length=100)
    state: Optional[str] = "Maharashtra"
    district: Optional[str] = "Nagpur"
    preferred_language: Optional[str] = "en"

class LoginRequest(BaseModel):
    email_or_phone: str = Field(..., description="Email or mobile phone number")
    password: str = Field(..., min_length=1)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
