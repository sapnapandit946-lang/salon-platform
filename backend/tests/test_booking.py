import pytest
from datetime import date, time, timedelta
from app.models import Salon, Service, ServiceCategory, SalonSchedule, User, UserRole, Booking, BookingStatus


def test_booking_workflow_and_availability(client, db_session, customer_token, owner_token):
    # Setup test salon & service
    cat = ServiceCategory(name="Hair", slug="hair-book", icon="Scissors", display_order=1)
    db_session.add(cat)
    db_session.flush()

    salon = Salon(
        owner_id=owner_token["user"].id,
        name="Booking Test Salon",
        address="100 Feet Road",
        city="Bengaluru",
        locality="Indiranagar",
        pincode="560038",
        latitude=12.9784,
        longitude=77.6408,
        phone="+91 80 1234",
        cover_image="https://example.com/b.jpg",
        rating=4.5,
        review_count=10,
        is_active=True
    )
    db_session.add(salon)
    db_session.flush()

    svc = Service(
        salon_id=salon.id,
        category_id=cat.id,
        name="Precision Haircut",
        price=500.0,
        duration_minutes=30
    )
    db_session.add(svc)
    db_session.flush()

    # Schedule: Every day open 10:00 to 12:00, slot_duration=30, concurrent_capacity=1
    target_date = date.today() + timedelta(days=5)
    dow = target_date.weekday()

    sched = SalonSchedule(
        salon_id=salon.id,
        day_of_week=dow,
        open_time=time(10, 0),
        close_time=time(12, 0),
        is_closed=False,
        slot_duration_minutes=30,
        concurrent_capacity=1  # Only 1 customer per slot!
    )
    db_session.add(sched)
    db_session.commit()

    # 1. Query available slots
    slots_resp = client.get(
        f"/api/v1/bookings/slots?salon_id={salon.id}&service_id={svc.id}&booking_date={target_date.isoformat()}"
    )
    assert slots_resp.status_code == 200
    slots = slots_resp.json()
    assert len(slots) > 0
    assert any(s["time_str"] == "10:00" and s["is_available"] for s in slots)

    # 2. Book 10:00 AM slot
    headers = {"Authorization": f"Bearer {customer_token['token']}"}
    book_resp = client.post(
        "/api/v1/bookings",
        headers=headers,
        json={
            "salon_id": salon.id,
            "service_id": svc.id,
            "booking_date": target_date.isoformat(),
            "start_time": "10:00",
            "customer_notes": "First booking"
        }
    )
    assert book_resp.status_code == 201
    booking_data = book_resp.json()
    assert booking_data["status"] == "CONFIRMED"
    booking_id = booking_data["id"]

    # 3. Try to double-book 10:00 AM slot when capacity is 1
    double_resp = client.post(
        "/api/v1/bookings",
        headers=headers,
        json={
            "salon_id": salon.id,
            "service_id": svc.id,
            "booking_date": target_date.isoformat(),
            "start_time": "10:00",
            "customer_notes": "Trying to double book"
        }
    )
    assert double_resp.status_code == 409
    assert "filled" in double_resp.json()["detail"]

    # 4. Cancel booking by customer
    cancel_resp = client.put(
        f"/api/v1/bookings/{booking_id}/cancel",
        headers=headers
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "CANCELLED"
