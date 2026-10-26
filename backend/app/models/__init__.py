from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, Time,
    ForeignKey, Text, UniqueConstraint, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    GUEST = "GUEST"
    CUSTOMER = "CUSTOMER"
    SALON_OWNER = "SALON_OWNER"
    ADMIN = "ADMIN"


class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(50), default=UserRole.CUSTOMER.value, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    owned_salons = relationship("Salon", back_populates="owner", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="customer", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="customer", cascade="all, delete-orphan")
    favourites = relationship("FavouriteSalon", back_populates="user", cascade="all, delete-orphan")


class Salon(Base):
    __tablename__ = "salons"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    locality = Column(String(100), nullable=False, index=True)
    pincode = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String(30), nullable=False)
    email = Column(String(255), nullable=True)
    cover_image = Column(String(1000), nullable=False)
    gallery_images = Column(Text, nullable=True, default="[]")  # JSON-encoded array of URLs
    rating = Column(Float, default=0.0, nullable=False, index=True)
    review_count = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="owned_salons")
    services = relationship("Service", back_populates="salon", cascade="all, delete-orphan")
    schedules = relationship("SalonSchedule", back_populates="salon", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="salon", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="salon", cascade="all, delete-orphan")
    favorited_by = relationship("FavouriteSalon", back_populates="salon", cascade="all, delete-orphan")


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    icon = Column(String(100), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)

    services = relationship("Service", back_populates="category")


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    salon_id = Column(Integer, ForeignKey("salons.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("service_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False, index=True)  # Service-specific pricing
    duration_minutes = Column(Integer, nullable=False, default=30)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    salon = relationship("Salon", back_populates="services")
    category = relationship("ServiceCategory", back_populates="services")
    bookings = relationship("Booking", back_populates="service")


class SalonSchedule(Base):
    __tablename__ = "salon_schedules"

    id = Column(Integer, primary_key=True, index=True)
    salon_id = Column(Integer, ForeignKey("salons.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    open_time = Column(Time, nullable=False)
    close_time = Column(Time, nullable=False)
    is_closed = Column(Boolean, default=False, nullable=False)
    slot_duration_minutes = Column(Integer, default=30, nullable=False)
    concurrent_capacity = Column(Integer, default=2, nullable=False)  # e.g. 2-3 stylists chairs

    salon = relationship("Salon", back_populates="schedules")

    __table_args__ = (
        UniqueConstraint("salon_id", "day_of_week", name="uq_salon_day"),
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    salon_id = Column(Integer, ForeignKey("salons.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="RESTRICT"), nullable=False, index=True)
    booking_date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(50), default=BookingStatus.CONFIRMED.value, nullable=False, index=True)
    customer_notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    customer = relationship("User", back_populates="bookings")
    salon = relationship("Salon", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False, cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    salon_id = Column(Integer, ForeignKey("salons.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    booking = relationship("Booking", back_populates="review")
    customer = relationship("User", back_populates="reviews")
    salon = relationship("Salon", back_populates="reviews")


class FavouriteSalon(Base):
    __tablename__ = "favourite_salons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    salon_id = Column(Integer, ForeignKey("salons.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="favourites")
    salon = relationship("Salon", back_populates="favorited_by")

    __table_args__ = (
        UniqueConstraint("user_id", "salon_id", name="uq_user_favourite_salon"),
    )


class AIPreviewLog(Base):
    __tablename__ = "ai_preview_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    hairstyle_name = Column(String(100), nullable=False)
    hair_color = Column(String(100), nullable=False)
    original_image_name = Column(String(255), nullable=False)
    result_image_path = Column(String(500), nullable=False)
    provider = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)  # SUCCESS, FAILED
    created_at = Column(DateTime, default=utc_now, nullable=False)
