from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import User, UserRole
from app.schemas import UserCreate, UserLogin, UserUpdate
from app.core.security import get_password_hash, verify_password, create_access_token


class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> dict:
        """Register a new user account with hashed password and role."""
        existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists.",
            )

        new_user = User(
            email=user_in.email.lower(),
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name.strip(),
            phone=user_in.phone.strip() if user_in.phone else None,
            role=user_in.role.value if isinstance(user_in.role, UserRole) else user_in.role,
            is_active=True,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = create_access_token(subject=new_user.id, role=new_user.role)
        return {"access_token": token, "token_type": "bearer", "user": new_user}

    @staticmethod
    def authenticate_user(db: Session, credentials: UserLogin) -> dict:
        """Authenticate user credentials and return JWT session token."""
        user = db.query(User).filter(User.email == credentials.email.lower()).first()
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email address or password.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated. Please contact support.",
            )

        token = create_access_token(subject=user.id, role=user.role)
        return {"access_token": token, "token_type": "bearer", "user": user}

    @staticmethod
    def update_profile(db: Session, user: User, update_data: UserUpdate) -> User:
        """Update authenticated user's profile information."""
        if update_data.full_name is not None:
            user.full_name = update_data.full_name.strip()
        if update_data.phone is not None:
            user.phone = update_data.phone.strip()

        db.commit()
        db.refresh(user)
        return user
