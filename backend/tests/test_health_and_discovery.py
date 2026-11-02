import pytest
from app.models import Salon, Service, ServiceCategory, User, UserRole


def test_health_check_endpoint(client):
    """Verify that GET /health accurately reports healthy status and database connection."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert data["database"]["status"] == "connected"
    assert "dialect" in data["database"]
    assert "service" in data


def test_service_categories_endpoint(client, db_session):
    """Verify listing service categories."""
    cat = ServiceCategory(name="Hair Styling", slug="hair-styling", icon="Scissors", display_order=1)
    db_session.add(cat)
    db_session.commit()

    response = client.get("/api/v1/services/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 1
    assert any(c["slug"] == "hair-styling" for c in categories)


def test_salon_discovery_and_detail(client, db_session):
    """Verify salon discovery with city and service filters, and detail lookup."""
    owner = User(
        email="owner_disc@example.com",
        hashed_password="fakehashowner",
        full_name="Owner Discovery",
        role=UserRole.SALON_OWNER.value,
        is_active=True
    )
    db_session.add(owner)
    db_session.commit()

    salon = Salon(
        owner_id=owner.id,
        name="Vogue Hair Lounge",
        description="Luxury grooming",
        address="Bandra Road",
        city="Mumbai",
        locality="Bandra West",
        pincode="400050",
        phone="+91 22 2600 9988",
        email="vogue@example.com",
        cover_image="https://example.com/cover.jpg",
        latitude=19.0596,
        longitude=72.8295,
        rating=4.8,
        review_count=12,
        is_active=True
    )
    db_session.add(salon)
    db_session.commit()

    cat = ServiceCategory(name="Hair Care", slug="hair-care-disc", icon="Scissors", display_order=1)
    db_session.add(cat)
    db_session.commit()

    svc = Service(
        salon_id=salon.id,
        category_id=cat.id,
        name="Haircut",
        price=450.0,
        duration_minutes=30
    )
    db_session.add(svc)
    db_session.commit()

    # 1. Search all Mumbai salons
    resp_all = client.get("/api/v1/salons?city=Mumbai")
    assert resp_all.status_code == 200
    salons_mumbai = resp_all.json()
    assert len(salons_mumbai) >= 1
    assert any(s["name"] == "Vogue Hair Lounge" for s in salons_mumbai)

    # 2. Search by service name and price cap
    resp_svc = client.get("/api/v1/salons?city=Mumbai&service_name=Haircut&max_price=500")
    assert resp_svc.status_code == 200
    assert len(resp_svc.json()) >= 1
    # Matched service price should be attached
    assert resp_svc.json()[0]["matched_service_price"] == 450.0

    # 3. Search with low price cap that excludes it
    resp_low = client.get("/api/v1/salons?city=Mumbai&service_name=Haircut&max_price=200")
    assert resp_low.status_code == 200
    assert len(resp_low.json()) == 0

    # 4. Detail lookup
    resp_detail = client.get(f"/api/v1/salons/{salon.id}")
    assert resp_detail.status_code == 200
    detail = resp_detail.json()
    assert detail["name"] == "Vogue Hair Lounge"
    assert len(detail["services"]) >= 1
