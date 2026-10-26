from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas import UserCreate, UserLogin, UserResponse, UserUpdate, Token
from app.services.auth_service import AuthService
from app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new customer or salon owner account."""
    return AuthService.register_user(db=db, user_in=user_in)


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password to receive JWT access token."""
    return AuthService.authenticate_user(db=db, credentials=credentials)


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve the currently authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile details for the authenticated user."""
    return AuthService.update_profile(db=db, user=current_user, update_data=update_data)
