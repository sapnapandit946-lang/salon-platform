from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Any, Optional
from datetime import datetime, time
from app.core.database import get_db
from app.core.dependencies import require_salon_owner
from app.models import Salon, Service, SalonSchedule, Booking, BookingStatus, User, ServiceCategory
from app.schemas import (
    SalonCreate, SalonUpdate, SalonDetailResponse,
    ServiceCreate, ServiceUpdate, ServiceResponse,
    SalonScheduleCreate, SalonScheduleResponse,
    BookingResponse, BookingStatusUpdate
)

router = APIRouter(prefix="/owner", tags=["Salon Owner Dashboard"])


def _get_owner_salon(db: Session, owner: User) -> Salon:
    """Helper to get owner's salon or raise 404."""
    salon = db.query(Salon).filter(Salon.owner_id == owner.id).first()
    if not salon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No salon profile found for your account. Please create your salon profile first."
        )
    return salon


@router.get("/my-salon")
def get_my_salon(
    owner: User = Depends(require_salon_owner),
    db: Session = Depends(get_db)
):
    """Retrieve the salon profile owned by the authenticated salon owner."""
    salon = db.query(Salon).options(
        joinedload(Salon.services).joinedload(Service.category),
        joinedload(Salon.schedules)
    ).filter(Salon.owner_id == owner.id).first()

    if not salon:
        return {"has_salon": False, "salon": None}

    return {
        "has_salon": True,
        "salon": {
            "id": salon.id,
            "owner_id": salon.owner_id,
            "name": salon.name,
            "description": salon.description,
            "address": salon.address,
            "city": salon.city,
            "locality": salon.locality,
            "pincode": salon.pincode,
            "latitude": salon.latitude,
            "longitude": salon.longitude,
            "phone": salon.phone,
            "email": salon.email,
            "cover_image": salon.cover_image,
            "gallery_images": salon.gallery_images,
            "rating": salon.rating,
            "review_count": salon.review_count,
            "is_active": salon.is_active,
            "services": [
                {
                    "id": s.id,
                    "salon_id": s.salon_id,
                    "name": s.name,
                    "description": s.description,
                    "price": s.price,
                    "duration_minutes": s.duration_minutes,
                    "category_id": s.category_id,
                    "is_active": s.is_active,
                    "category": {"id": s.category.id, "name": s.category.name, "slug": s.category.slug} if s.category else None
                } for s in salon.services
            ],
            "schedules": [
                {
                    "id": sch.id,
                    "salon_id": sch.salon_id,
                    "day_of_week": sch.day_of_week,
                    "open_time": sch.open_time.strftime("%H:%M"),
                    "close_time": sch.close_time.strftime("%H:%M"),
                    "is_closed": sch.is_closed,
                    "slot_duration_minutes": sch.slot_duration_minutes,
                    "concurrent_capacity": sch.concurrent_capacity
                } for sch in sorted(salon.schedules, key=lambda x: x.day_of_week)
            ]
        }
    }


@router.post("/my-salon", status_code=status.HTTP_201_CREATED)
def create_salon(
    salon_in: SalonCreate,
    owner: User = Depends(require_salon_owner),
    db: Session = Depends(get_db)
):
    """Create a new salon profile for the authenticated salon owner."""
    existing = db.query(Salon).filter(Salon.owner_id == owner.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A salon profile already exists for your account. Use PUT to update it."
        )

    new_salon = Salon(
        owner_id=owner.id,
        name=salon_in.name.strip(),
        description=salon_in.description.strip() if salon_in.description else None,
        address=salon_in.address.strip(),
        city=salon_in.city.strip(),
        locality=salon_in.locality.strip(),
        pincode=salon_in.pincode.strip(),
        latitude=salon_in.latitude,
        longitude=salon_in.longitude,
        phone=salon_in.phone.strip(),
        email=salon_in.email,
        cover_image=salon_in.cover_image,
        gallery_images=salon_in.gallery_images or "[]",
        rating=0.0,
        review_count=0,
        is_active=True
    )
    db.add(new_salon)
    db.flush()

    # Initialize default operating hours (Monday to Sunday 09:00 - 20:00)
    for day in range(7):
        sched = SalonSchedule(
            salon_id=new_salon.id,
            day_of_week=day,
            open_time=time(9, 0),
            close_time=time(20, 0),
            is_closed=(day == 1),  # Monday or Tuesday off by default, e.g. Tuesday off
            slot_duration_minutes=30,
            concurrent_capacity=2
        )
        db.add(sched)

    db.commit()
    db.refresh(new_salon)
    return {"message": "Salon profile created successfully.", "salon_id": new_salon.id}


@router.put("/my-salon")
def update_salon(
    update_in: SalonUpdate,
    owner: User = Depends(require_salon_owner),
    db: Session = Depends(get_db)
):
    """Update salon business details."""
    salon = _get_owner_salon(db, owner)

    for field, val in update_in.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(salon, field, val)

    db.commit()
    db.refresh(salon)
    return {"message": "Salon details updated successfully.", "salon_id": salon.id}


# --- Service Management --- #
@router.get("/services", response_model=List[ServiceResponse])
def get_owner_services(
    owner: User = Depends(require_salon_owner),
    db: Session = Depends(get_db)
):
    """List all services offered by owner's salon."""
    salon = _get_owner_salon(db, owner)
    return db.query(Service).options(joinedload(Service.category)).filter(Service.salon_id == salon.id).all()


@router.post("/services", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def add_service(
    svc_in: ServiceCreate,
    owner: User = Depends(require_salon_owner),
    db: Session = Depends(get_db)
):
    """Add a new service with exact price and duration to owner's salon."""
    salon = _get_owner_salon(db, owner)

    # Check category
    cat = db.query(ServiceCategory).filter(ServiceCategory.id == svc_in.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid service category selected.")

    new_svc = Service(
        salon_id=salon.id,
        category_id=svc_in.category_id,
        name=svc_in.name.strip(),
        description=svc_in.description.strip() if svc_in.description else None,
        price=svc_in.price,
        duration_minutes=svc_in.duration_minutes,
        is_active=True
    )
    db.add(new_svc)
    db.commit()
    db.refresh(new_svc)
    return new_svc


@router.put("/services/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    svc_in: ServiceUpdate,
    owner: User = Depends(require_salon_owner),
    db: Session = Depends(get_db)
):
    """Update service price, duration, name, or active status."""
    salon = _get_owner_salon(db, owner)
    service = db.query(Service).filter(Service.id == service_id, Service.salon_id == salon.id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found in your salon.")

    for field, val in svc_in.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(service, field, val)

    db.commit()
    db.refresh(service)
    return service


@router.delete("/services/{service_id}")
def delete_service(
    service_id: int,
    owner: User = Depends(require_salon_owner),
    db: Session = Depends(get_db)
):
    """Remove a service from owner's salon."""
    salon = _get_owner_salon(db, owner)
    service = db.query(Service).filter(Service.id == service_id, Service.salon_id == salon.id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found in your salon.")

    db.delete(service)
    db.commit()
    return {"message": "Service removed successfully."}


# --- Schedule Management --- #
@router.put("/schedules")
def update_schedules(
    schedules_in: List[Dict[str, Any]],
    owner: User = Depends(require_salon_owner),
    db: Session = Depends(get_db)
):
    """
    Update weekly operating hours, closed days, and concurrent capacity.
    Expected items: [{'day_of_week': 0, 'open_time': '09:00', 'close_time': '20:00', 'is_closed': false, 'concurrent_capacity': 2}]
    """
    salon = _get_owner_salon(db, owner)

    for item in schedules_in:
        dow = int(item["day_of_week"])
        sched = db.query(SalonSchedule).filter(
            SalonSchedule.salon_id == salon.id,
            SalonSchedule.day_of_week == dow
        ).first()

        open_t = datetime.strptime(item["open_time"][:5], "%H:%M").time()
        close_t = datetime.strptime(item["close_time"][:5], "%H:%M").time()

        if sched:
            sched.open_time = open_t
            sched.close_time = close_t
            sched.is_closed = bool(item.get("is_closed", False))
            sched.concurrent_capacity = int(item.get("concurrent_capacity", 2))
        else:
            sched = SalonSchedule(
                salon_id=salon.id,
                day_of_week=dow,
                open_time=open_t,
                close_time=close_t,
                is_closed=bool(item.get("is_closed", False)),
                slot_duration_minutes=30,
                concurrent_capacity=int(item.get("concurrent_capacity", 2))
            )
            db.add(sched)

    db.commit()
    return {"message": "Operating schedule updated successfully."}


# --- Bookings & Dashboard Stats --- #
@router.get("/bookings")
def get_owner_bookings(
    status_filter: Optional[str] = Query(None, description="Filter by status: PENDING, CONFIRMED, COMPLETED, CANCELLED"),
    owner: User = Depends(require_salon_owner),
    db: Session = Depends(get_db)
):
    """Get all customer appointments for owner's salon."""
    salon = _get_owner_salon(db, owner)

    query = db.query(Booking).options(
        joinedload(Booking.customer),
        joinedload(Booking.service)
    ).filter(Booking.salon_id == salon.id)

    if status_filter:
        query = query.filter(Booking.status == status_filter.upper())

    bookings = query.order_by(Booking.booking_date.desc(), Booking.start_time.desc()).all()

    return [
        {
            "id": b.id,
            "booking_reference": b.booking_reference,
            "customer_id": b.customer_id,
            "customer_name": b.customer.full_name if b.customer else "Client",
            "customer_phone": b.customer.phone if b.customer else "N/A",
            "service_name": b.service.name if b.service else "Service",
            "service_duration": b.service.duration_minutes if b.service else 30,
            "booking_date": b.booking_date.isoformat(),
            "start_time": b.start_time.strftime("%H:%M"),
            "end_time": b.end_time.strftime("%H:%M"),
            "total_price": b.total_price,
            "status": b.status,
            "customer_notes": b.customer_notes,
            "created_at": b.created_at.isoformat()
        } for b in bookings
    ]


@router.put("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    status_in: BookingStatusUpdate,
    owner: User = Depends(require_salon_owner),
    db: Session = Depends(get_db)
):
    """Update appointment status (CONFIRM, COMPLETE, REJECT, CANCEL)."""
    salon = _get_owner_salon(db, owner)
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.salon_id == salon.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found in your salon.")

    booking.status = status_in.status.value
    if status_in.cancellation_reason:
        booking.cancellation_reason = status_in.cancellation_reason

    db.commit()
    return {"message": f"Booking updated to {booking.status}", "booking_id": booking.id, "status": booking.status}


@router.get("/stats")
def get_dashboard_stats(
    owner: User = Depends(require_salon_owner),
    db: Session = Depends(get_db)
):
    """Compute aggregate analytics for salon owner dashboard."""
    salon = _get_owner_salon(db, owner)

    bookings = db.query(Booking).filter(Booking.salon_id == salon.id).all()

    total_bookings = len(bookings)
    completed_bookings = sum(1 for b in bookings if b.status == BookingStatus.COMPLETED.value)
    confirmed_bookings = sum(1 for b in bookings if b.status == BookingStatus.CONFIRMED.value)
    cancelled_bookings = sum(1 for b in bookings if b.status in [BookingStatus.CANCELLED.value, BookingStatus.REJECTED.value])

    total_revenue = sum(b.total_price for b in bookings if b.status == BookingStatus.COMPLETED.value)

    return {
        "salon_name": salon.name,
        "total_bookings": total_bookings,
        "completed_bookings": completed_bookings,
        "upcoming_bookings": confirmed_bookings,
        "cancelled_bookings": cancelled_bookings,
        "total_revenue": total_revenue,
        "rating": salon.rating,
        "review_count": salon.review_count,
        "active_services_count": db.query(Service).filter(Service.salon_id == salon.id, Service.is_active == True).count()
    }
