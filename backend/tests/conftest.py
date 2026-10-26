import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__))))

from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models import User, UserRole, Salon, ServiceCategory, Service, SalonSchedule, Booking, BookingStatus

# In-memory test database for fast, isolated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def customer_token(db_session):
    user = User(
        email="test_customer@example.com",
        hashed_password="fakehashedpassword",
        full_name="Test Customer",
        phone="+91 9999900001",
        role=UserRole.CUSTOMER.value,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    token = create_access_token(subject=user.id, role=user.role)
    return {"token": token, "user": user}


@pytest.fixture
def owner_token(db_session):
    user = User(
        email="test_owner@example.com",
        hashed_password="fakehashedpassword",
        full_name="Test Salon Owner",
        phone="+91 9999900002",
        role=UserRole.SALON_OWNER.value,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    token = create_access_token(subject=user.id, role=user.role)
    return {"token": token, "user": user}
