from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime, date, time
from app.models import UserRole, BookingStatus


# ---------------- USER SCHEMAS ---------------- #
class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=72)
    role: UserRole = UserRole.CUSTOMER


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None


# ---------------- SERVICE SCHEMAS ---------------- #
class ServiceCategoryBase(BaseModel):
    name: str
    slug: str
    icon: Optional[str] = None
    display_order: int = 0


class ServiceCategoryResponse(ServiceCategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ServiceBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    price: float = Field(..., ge=0)
    duration_minutes: int = Field(..., ge=10, le=480)
    category_id: int


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    duration_minutes: Optional[int] = Field(None, ge=10, le=480)
    category_id: Optional[int] = None
    is_active: Optional[bool] = None


class ServiceResponse(ServiceBase):
    id: int
    salon_id: int
    is_active: bool
    category: Optional[ServiceCategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- SCHEDULE SCHEMAS ---------------- #
class SalonScheduleBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)
    open_time: time
    close_time: time
    is_closed: bool = False
    slot_duration_minutes: int = Field(30, ge=15, le=120)
    concurrent_capacity: int = Field(2, ge=1, le=20)


class SalonScheduleCreate(SalonScheduleBase):
    pass


class SalonScheduleResponse(SalonScheduleBase):
    id: int
    salon_id: int

    model_config = ConfigDict(from_attributes=True)


class AvailableSlotResponse(BaseModel):
    time_str: str  # e.g. "10:00"
    is_available: bool
    remaining_capacity: int


# ---------------- REVIEW SCHEMAS ---------------- #
class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)


class ReviewResponse(BaseModel):
    id: int
    booking_id: int
    customer_id: int
    salon_id: int
    rating: int
    comment: Optional[str] = None
    customer_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------- SALON SCHEMAS ---------------- #
class SalonBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    address: str = Field(..., min_length=5, max_length=500)
    city: str = Field(..., min_length=2, max_length=100)
    locality: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=5, max_length=20)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: str = Field(..., min_length=7, max_length=30)
    email: Optional[EmailStr] = None
    cover_image: str


class SalonCreate(SalonBase):
    gallery_images: Optional[str] = "[]"


class SalonUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    cover_image: Optional[str] = None
    gallery_images: Optional[str] = None
    is_active: Optional[bool] = None


class SalonCardResponse(SalonBase):
    id: int
    owner_id: int
    rating: float
    review_count: int
    is_active: bool
    distance_km: Optional[float] = None
    matched_service_price: Optional[float] = None
    matched_service_duration: Optional[int] = None
    matched_service_name: Optional[str] = None
    is_favourite: bool = False

    model_config = ConfigDict(from_attributes=True)


class SalonDetailResponse(SalonCardResponse):
    gallery_images: Optional[str] = "[]"
    services: List[ServiceResponse] = []
    schedules: List[SalonScheduleResponse] = []
    reviews: List[ReviewResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ---------------- BOOKING SCHEMAS ---------------- #
class BookingCreate(BaseModel):
    salon_id: int
    service_id: int
    booking_date: date
    start_time: str  # "HH:MM" e.g. "14:30"
    customer_notes: Optional[str] = Field(None, max_length=500)


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    cancellation_reason: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    booking_reference: str
    customer_id: int
    salon_id: int
    service_id: int
    booking_date: date
    start_time: time
    end_time: time
    total_price: float
    status: BookingStatus
    customer_notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime

    salon_name: Optional[str] = None
    service_name: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    can_review: bool = False
    has_reviewed: bool = False

    model_config = ConfigDict(from_attributes=True)


# ---------------- COMPARISON SCHEMAS ---------------- #
class ComparisonRequest(BaseModel):
    service_name: Optional[str] = None
    category_id: Optional[int] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    user_latitude: Optional[float] = None
    user_longitude: Optional[float] = None
    max_budget: Optional[float] = None
    min_budget: Optional[float] = None
    max_distance_km: Optional[float] = None
    min_rating: Optional[float] = None
    preferred_date: Optional[date] = None
    preferred_time: Optional[str] = None  # "HH:MM"
    salon_ids: Optional[List[int]] = None  # If comparing selected salons directly


class ScoreBreakdown(BaseModel):
    budget_fit: bool
    budget_score: float  # 0 to 100
    distance_score: float  # 0 to 100
    rating_score: float  # 0 to 100
    availability_score: float  # 0 to 100
    total_composite_score: float  # 0 to 100
    reasons: List[str]


class ComparisonItemResponse(BaseModel):
    salon_id: int
    salon_name: str
    cover_image: str
    locality: str
    city: str
    rating: float
    review_count: int
    distance_km: Optional[float] = None
    exact_service_id: int
    exact_service_name: str
    exact_service_price: float
    exact_service_duration: int
    opening_hours_text: str
    is_available_for_date: bool
    has_preferred_slot: bool
    booking_policy: str
    score_breakdown: ScoreBreakdown


class ComparisonResponse(BaseModel):
    queried_service: str
    customer_budget: Optional[float] = None
    total_candidates_found: int
    ranking_explanation: str
    items: List[ComparisonItemResponse]


# ---------------- AI PREVIEW SCHEMAS ---------------- #
class AIPreviewRequest(BaseModel):
    hairstyle: str
    hair_color: str
    consent_given: bool = Field(..., description="Explicit user consent required")


class AIPreviewResponse(BaseModel):
    status: str  # "success", "configured_error", "failed"
    message: str
    hairstyle: str
    hair_color: str
    preview_url: Optional[str] = None
    is_mock: bool = False
    processing_time_seconds: Optional[float] = None
