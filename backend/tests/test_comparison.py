import pytest
from app.models import Salon, Service, ServiceCategory, SalonSchedule, User, UserRole
from app.utils.geo import calculate_haversine_distance
from datetime import time


def test_haversine_distance_calculation():
    # Distance between Bandra (19.0596, 72.8295) and Andheri (19.1363, 72.8277) in Mumbai ~ 8.5 km
    dist = calculate_haversine_distance(19.0596, 72.8295, 19.1363, 72.8277)
    assert dist is not None
    assert 8.0 <= dist <= 9.0


def test_comparison_service_exact_pricing(client, db_session):
    # Setup test category
    cat = ServiceCategory(name="Hair", slug="hair-test", icon="Scissors", display_order=1)
    db_session.add(cat)
    db_session.flush()

    # Setup owner
    owner = User(
        email="owner_comp@example.com",
        hashed_password="hash",
        full_name="Owner Comp",
        role=UserRole.SALON_OWNER.value,
        is_active=True
    )
    db_session.add(owner)
    db_session.flush()

    # Salon A: Haircut ₹300, Hair Spa ₹1200
    salon_a = Salon(
        owner_id=owner.id,
        name="Salon Alpha",
        address="Bandra West",
        city="Mumbai",
        locality="Bandra",
        pincode="400050",
        latitude=19.0596,
        longitude=72.8295,
        phone="+91 22 1111",
        cover_image="https://example.com/a.jpg",
        rating=4.5,
        review_count=20,
        is_active=True
    )
    # Salon B: Haircut ₹250, Hair Spa ₹1500
    salon_b = Salon(
        owner_id=owner.id,
        name="Salon Beta",
        address="Andheri West",
        city="Mumbai",
        locality="Andheri",
        pincode="400053",
        latitude=19.1363,
        longitude=72.8277,
        phone="+91 22 2222",
        cover_image="https://example.com/b.jpg",
        rating=4.8,
        review_count=50,
        is_active=True
    )
    db_session.add_all([salon_a, salon_b])
    db_session.flush()

    # Add services
    svc_a_haircut = Service(salon_id=salon_a.id, category_id=cat.id, name="Haircut & Styling", price=300.0, duration_minutes=30)
    svc_a_spa = Service(salon_id=salon_a.id, category_id=cat.id, name="Hair Spa Treatment", price=1200.0, duration_minutes=60)

    svc_b_haircut = Service(salon_id=salon_b.id, category_id=cat.id, name="Haircut & Styling", price=250.0, duration_minutes=30)
    svc_b_spa = Service(salon_id=salon_b.id, category_id=cat.id, name="Hair Spa Treatment", price=1500.0, duration_minutes=60)

    db_session.add_all([svc_a_haircut, svc_a_spa, svc_b_haircut, svc_b_spa])
    db_session.commit()

    # Request comparison for "Haircut" with budget max ₹350
    # BOTH salons MUST qualify based on their haircut price, unaffected by the ₹1200/₹1500 hair spa!
    response = client.post(
        "/api/v1/compare",
        json={
            "service_name": "Haircut",
            "max_budget": 350.0,
            "city": "Mumbai"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates_found"] == 2
    
    items = data["items"]
    # Check that exact service prices are 250 and 300
    prices = {item["salon_name"]: item["exact_service_price"] for item in items}
    assert prices["Salon Alpha"] == 300.0
    assert prices["Salon Beta"] == 250.0

    # Verify score breakdown presence
    for item in items:
        assert "score_breakdown" in item
        assert "total_composite_score" in item["score_breakdown"]
        assert len(item["score_breakdown"]["reasons"]) > 0
