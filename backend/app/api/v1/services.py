from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.core.database import get_db
from app.models import ServiceCategory, Service
from app.schemas import ServiceCategoryResponse

router = APIRouter(prefix="/services", tags=["Services & Categories"])


@router.get("/categories", response_model=List[ServiceCategoryResponse])
def get_service_categories(db: Session = Depends(get_db)):
    """Retrieve all available salon service categories."""
    return db.query(ServiceCategory).order_by(ServiceCategory.display_order.asc()).all()


@router.get("/popular")
def get_popular_services(db: Session = Depends(get_db)):
    """Retrieve common service names and sample price ranges for discovery chips."""
    popular = [
        {"name": "Haircut & Styling", "category": "Hair", "avg_price": 350, "icon": "Scissors"},
        {"name": "Beard Trim & Grooming", "category": "Grooming", "avg_price": 200, "icon": "Smile"},
        {"name": "Hair Spa & Deep Conditioning", "category": "Hair Care", "avg_price": 850, "icon": "Sparkles"},
        {"name": "Keratin Treatment", "category": "Hair Treatments", "avg_price": 2500, "icon": "Zap"},
        {"name": "Balayage & Hair Colour", "category": "Colouring", "avg_price": 1800, "icon": "Palette"},
        {"name": "Facial & Glow Cleanup", "category": "Skin Care", "avg_price": 750, "icon": "Sun"},
        {"name": "Bridal & Party Makeup", "category": "Makeup", "avg_price": 3200, "icon": "Heart"},
        {"name": "Manicure & Pedicure", "category": "Nail Care", "avg_price": 600, "icon": "CheckCircle"},
    ]
    return popular
