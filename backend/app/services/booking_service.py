import random
import string
from datetime import datetime, date, time, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models import Booking, BookingStatus, Salon, Service, SalonSchedule, User, UserRole, Review
from app.schemas import BookingCreate, BookingStatusUpdate, AvailableSlotResponse


def generate_booking_reference() -> str:
    """Generate a clean, professional booking reference ID like SLN-2026-X8R4P."""
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"SLN-{datetime.now().year}-{chars}"


class BookingService:
    @staticmethod
    def get_available_slots(
        db: Session,
        salon_id: int,
        service_id: int,
        query_date: date
    ) -> List[AvailableSlotResponse]:
        """
        Compute real-time available time slots for a given salon, service, and date.
        Takes operating hours, slot intervals, service duration, and concurrent capacity into account.
        """
        service = db.query(Service).filter(Service.id == service_id, Service.salon_id == salon_id).first()
        if not service or not service.is_active:
            raise HTTPException(status_code=404, detail="Selected service is unavailable at this salon.")

        # 0=Monday, 6=Sunday
        dow = query_date.weekday()
        schedule = db.query(SalonSchedule).filter(
            SalonSchedule.salon_id == salon_id,
            SalonSchedule.day_of_week == dow
        ).first()

        # If no explicit schedule configured or marked closed
        if not schedule or schedule.is_closed:
            return []

        # Generate slots based on schedule open/close time
        slot_step = timedelta(minutes=schedule.slot_duration_minutes)
        service_duration = timedelta(minutes=service.duration_minutes)

        open_dt = datetime.combine(query_date, schedule.open_time)
        close_dt = datetime.combine(query_date, schedule.close_time)

        # Fetch existing active bookings for this salon and date
        existing_bookings = db.query(Booking).filter(
            Booking.salon_id == salon_id,
            Booking.booking_date == query_date,
            Booking.status.in_([BookingStatus.CONFIRMED.value, BookingStatus.PENDING.value])
        ).all()

        slots: List[AvailableSlotResponse] = []
        current_slot_dt = open_dt

        now = datetime.now()

        while current_slot_dt + service_duration <= close_dt:
            slot_end_dt = current_slot_dt + service_duration

            # If date is today, check if slot is in the past
            if query_date == date.today() and current_slot_dt <= now:
                is_available = False
                remaining_cap = 0
            else:
                # Count overlapping active bookings
                overlapping = 0
                for b in existing_bookings:
                    b_start = datetime.combine(query_date, b.start_time)
                    b_end = datetime.combine(query_date, b.end_time)

                    # Overlap condition: max(start1, start2) < min(end1, end2)
                    if max(current_slot_dt, b_start) < min(slot_end_dt, b_end):
                        overlapping += 1

                remaining_cap = max(0, schedule.concurrent_capacity - overlapping)
                is_available = remaining_cap > 0

            slots.append(
                AvailableSlotResponse(
                    time_str=current_slot_dt.strftime("%H:%M"),
                    is_available=is_available,
                    remaining_capacity=remaining_cap
                )
            )

            current_slot_dt += slot_step

        return slots

    @staticmethod
    def create_booking(
        db: Session,
        customer: User,
        booking_in: BookingCreate
    ) -> Booking:
        """Create a confirmed appointment booking with validation against operating schedule and capacity."""
        if booking_in.booking_date < date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Appointments cannot be scheduled for past dates."
            )

        salon = db.query(Salon).filter(Salon.id == booking_in.salon_id, Salon.is_active == True).first()
        if not salon:
            raise HTTPException(status_code=404, detail="Salon not found or inactive.")

        service = db.query(Service).filter(
            Service.id == booking_in.service_id,
            Service.salon_id == salon.id,
            Service.is_active == True
        ).first()
        if not service:
            raise HTTPException(status_code=404, detail="Requested service is not offered by this salon.")

        try:
            start_t = datetime.strptime(booking_in.start_time, "%H:%M").time()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid time format. Please provide HH:MM.")

        # Calculate end time based on exact service duration
        start_dt = datetime.combine(booking_in.booking_date, start_t)
        end_dt = start_dt + timedelta(minutes=service.duration_minutes)
        end_t = end_dt.time()

        # Check operating schedule
        dow = booking_in.booking_date.weekday()
        schedule = db.query(SalonSchedule).filter(
            SalonSchedule.salon_id == salon.id,
            SalonSchedule.day_of_week == dow
        ).first()

        if not schedule or schedule.is_closed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This salon is closed on the selected day of the week."
            )

        if start_t < schedule.open_time or end_t > schedule.close_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested appointment time is outside operating hours ({schedule.open_time.strftime('%I:%M %p')} - {schedule.close_time.strftime('%I:%M %p')})."
            )

        # Capacity check
        active_overlapping = db.query(Booking).filter(
            Booking.salon_id == salon.id,
            Booking.booking_date == booking_in.booking_date,
            Booking.status.in_([BookingStatus.CONFIRMED.value, BookingStatus.PENDING.value])
        ).all()

        overlapping_count = 0
        for b in active_overlapping:
            b_start = datetime.combine(booking_in.booking_date, b.start_time)
            b_end = datetime.combine(booking_in.booking_date, b.end_time)
            if max(start_dt, b_start) < min(end_dt, b_end):
                overlapping_count += 1

        if overlapping_count >= schedule.concurrent_capacity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This appointment slot was just filled by another customer. Please choose an alternate time."
            )

        # Create booking record
        new_booking = Booking(
            booking_reference=generate_booking_reference(),
            customer_id=customer.id,
            salon_id=salon.id,
            service_id=service.id,
            booking_date=booking_in.booking_date,
            start_time=start_t,
            end_time=end_t,
            total_price=service.price,
            status=BookingStatus.CONFIRMED.value,
            customer_notes=booking_in.customer_notes.strip() if booking_in.customer_notes else None
        )

        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        return new_booking

    @staticmethod
    def get_customer_bookings(db: Session, customer_id: int) -> List[Dict[str, Any]]:
        """Retrieve booking history for authenticated customer."""
        bookings = db.query(Booking).options(
            joinedload(Booking.salon),
            joinedload(Booking.service),
            joinedload(Booking.review)
        ).filter(Booking.customer_id == customer_id).order_by(Booking.booking_date.desc(), Booking.start_time.desc()).all()

        results = []
        for b in bookings:
            can_review = (b.status == BookingStatus.COMPLETED.value and b.review is None)
            has_reviewed = (b.review is not None)
            results.append({
                "id": b.id,
                "booking_reference": b.booking_reference,
                "customer_id": b.customer_id,
                "salon_id": b.salon_id,
                "service_id": b.service_id,
                "booking_date": b.booking_date,
                "start_time": b.start_time,
                "end_time": b.end_time,
                "total_price": b.total_price,
                "status": b.status,
                "customer_notes": b.customer_notes,
                "cancellation_reason": b.cancellation_reason,
                "created_at": b.created_at,
                "salon_name": b.salon.name if b.salon else "Salon",
                "service_name": b.service.name if b.service else "Service",
                "can_review": can_review,
                "has_reviewed": has_reviewed
            })
        return results

    @staticmethod
    def cancel_booking_by_customer(
        db: Session,
        booking_id: int,
        customer_id: int,
        reason: Optional[str] = None
    ) -> Booking:
        """Cancel an upcoming booking by the customer."""
        booking = db.query(Booking).filter(
            Booking.id == booking_id,
            Booking.customer_id == customer_id
        ).first()

        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found.")

        if booking.status in [BookingStatus.CANCELLED.value, BookingStatus.COMPLETED.value, BookingStatus.REJECTED.value]:
            raise HTTPException(
                status_code=400,
                detail=f"This booking is already marked as {booking.status} and cannot be cancelled."
            )

        booking.status = BookingStatus.CANCELLED.value
        booking.cancellation_reason = reason or "Cancelled by customer"
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def update_booking_status_by_owner(
        db: Session,
        booking_id: int,
        owner: User,
        update_in: BookingStatusUpdate
    ) -> Booking:
        """Update appointment status (CONFIRM, COMPLETE, REJECT, CANCEL) by verified salon owner."""
        booking = db.query(Booking).join(Salon).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found.")

        # Crucial RBAC: verify that the authenticated salon owner owns THIS salon
        if owner.role != UserRole.ADMIN.value and booking.salon.owner_id != owner.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to manage bookings for another salon."
            )

        booking.status = update_in.status.value
        if update_in.cancellation_reason:
            booking.cancellation_reason = update_in.cancellation_reason

        db.commit()
        db.refresh(booking)
        return booking
