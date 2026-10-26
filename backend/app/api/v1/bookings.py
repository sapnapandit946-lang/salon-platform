from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import date
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_customer
from app.models import User
from app.schemas import BookingCreate, BookingResponse, AvailableSlotResponse
from app.services.booking_service import BookingService

router = APIRouter(prefix="/bookings", tags=["Bookings & Appointments"])


@router.get("/slots", response_model=List[AvailableSlotResponse])
def get_available_slots(
    salon_id: int = Query(..., description="ID of the salon"),
    service_id: int = Query(..., description="ID of the service to schedule"),
    booking_date: date = Query(..., description="Target appointment date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Compute and retrieve available appointment slots for a specific date and service duration."""
    return BookingService.get_available_slots(
        db=db,
        salon_id=salon_id,
        service_id=service_id,
        query_date=booking_date
    )


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    booking_in: BookingCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Schedule and confirm an appointment for the authenticated customer."""
    new_booking = BookingService.create_booking(
        db=db,
        customer=current_user,
        booking_in=booking_in
    )
    return {
        "id": new_booking.id,
        "booking_reference": new_booking.booking_reference,
        "customer_id": new_booking.customer_id,
        "salon_id": new_booking.salon_id,
        "service_id": new_booking.service_id,
        "booking_date": new_booking.booking_date,
        "start_time": new_booking.start_time,
        "end_time": new_booking.end_time,
        "total_price": new_booking.total_price,
        "status": new_booking.status,
        "customer_notes": new_booking.customer_notes,
        "cancellation_reason": new_booking.cancellation_reason,
        "created_at": new_booking.created_at,
        "salon_name": new_booking.salon.name if new_booking.salon else "Salon",
        "service_name": new_booking.service.name if new_booking.service else "Service",
        "can_review": False,
        "has_reviewed": False
    }


@router.get("/my", response_model=List[BookingResponse])
def get_my_bookings(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Retrieve full booking history for the authenticated customer."""
    return BookingService.get_customer_bookings(db=db, customer_id=current_user.id)


@router.put("/{id}/cancel", response_model=BookingResponse)
def cancel_booking(
    id: int,
    reason: str = Query("Cancelled by customer", description="Reason for cancellation"),
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Cancel an upcoming appointment booking."""
    cancelled = BookingService.cancel_booking_by_customer(
        db=db,
        booking_id=id,
        customer_id=current_user.id,
        reason=reason
    )
    return {
        "id": cancelled.id,
        "booking_reference": cancelled.booking_reference,
        "customer_id": cancelled.customer_id,
        "salon_id": cancelled.salon_id,
        "service_id": cancelled.service_id,
        "booking_date": cancelled.booking_date,
        "start_time": cancelled.start_time,
        "end_time": cancelled.end_time,
        "total_price": cancelled.total_price,
        "status": cancelled.status,
        "customer_notes": cancelled.customer_notes,
        "cancellation_reason": cancelled.cancellation_reason,
        "created_at": cancelled.created_at,
        "salon_name": cancelled.salon.name if cancelled.salon else "Salon",
        "service_name": cancelled.service.name if cancelled.service else "Service",
        "can_review": False,
        "has_reviewed": False
    }
