from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user, require_customer
from app.models import User, FavouriteSalon, Salon
from app.schemas import SalonCardResponse, SalonDetailResponse
from app.services.salon_service import SalonService

router = APIRouter(prefix="/salons", tags=["Salons"])


@router.get("", response_model=List[SalonCardResponse])
def discover_salons(
    query: Optional[str] = Query(None, description="Search keyword for salon name, locality, or city"),
    service_name: Optional[str] = Query(None, description="Target service name e.g. 'Haircut'"),
    category_slug: Optional[str] = Query(None, description="Category slug filter"),
    city: Optional[str] = Query(None, description="City filter e.g. Mumbai, Bengaluru, Delhi"),
    locality: Optional[str] = Query(None, description="Locality filter e.g. Bandra, Indiranagar"),
    min_price: Optional[float] = Query(None, description="Minimum price for requested service"),
    max_price: Optional[float] = Query(None, description="Maximum budget for requested service"),
    min_rating: Optional[float] = Query(None, description="Minimum salon rating (1.0 - 5.0)"),
    user_lat: Optional[float] = Query(None, description="User latitude for distance calculation"),
    user_lon: Optional[float] = Query(None, description="User longitude for distance calculation"),
    max_distance_km: Optional[float] = Query(None, description="Maximum travel distance in km"),
    sort_by: str = Query("relevance", description="Sorting criterion: relevance, price_asc, price_desc, rating, distance"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Discover salons matching search filters.
    Pricing is strictly evaluated against the requested service.
    """
    return SalonService.search_salons(
        db=db,
        query=query,
        service_name=service_name,
        category_slug=category_slug,
        city=city,
        locality=locality,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        user_lat=user_lat,
        user_lon=user_lon,
        max_distance_km=max_distance_km,
        sort_by=sort_by,
        current_user=current_user,
    )


@router.get("/favourites/my", response_model=List[SalonCardResponse])
def get_my_favourite_salons(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Retrieve list of salons favorited by authenticated customer."""
    favs = db.query(Salon).join(FavouriteSalon).filter(
        FavouriteSalon.user_id == current_user.id,
        Salon.is_active == True
    ).all()

    return [
        {
            "id": s.id,
            "owner_id": s.owner_id,
            "name": s.name,
            "description": s.description,
            "address": s.address,
            "city": s.city,
            "locality": s.locality,
            "pincode": s.pincode,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "phone": s.phone,
            "email": s.email,
            "cover_image": s.cover_image,
            "rating": s.rating,
            "review_count": s.review_count,
            "is_active": s.is_active,
            "distance_km": None,
            "matched_service_price": None,
            "matched_service_duration": None,
            "matched_service_name": None,
            "is_favourite": True
        }
        for s in favs
    ]


@router.get("/{id}", response_model=SalonDetailResponse)
def get_salon_details(
    id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full salon profile, including all services, operating schedule, and client reviews."""
    return SalonService.get_salon_detail(db=db, salon_id=id, current_user=current_user)


@router.post("/{id}/favourite")
def toggle_favourite(
    id: int,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """Toggle a salon in customer's saved favourites list."""
    is_fav = SalonService.toggle_favourite(db=db, salon_id=id, user=current_user)
    return {
        "salon_id": id,
        "is_favourite": is_fav,
        "message": "Added to favourites." if is_fav else "Removed from favourites."
    }
