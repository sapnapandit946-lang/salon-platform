from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from app.models import Salon, Service, ServiceCategory, SalonSchedule, Review, FavouriteSalon, User
from app.schemas import SalonCreate, SalonUpdate, SalonCardResponse
from app.utils.geo import calculate_haversine_distance


class SalonService:
    @staticmethod
    def search_salons(
        db: Session,
        query: Optional[str] = None,
        service_name: Optional[str] = None,
        category_slug: Optional[str] = None,
        city: Optional[str] = None,
        locality: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        user_lat: Optional[float] = None,
        user_lon: Optional[float] = None,
        max_distance_km: Optional[float] = None,
        sort_by: str = "relevance",
        current_user: Optional[User] = None,
    ) -> List[Dict[str, Any]]:
        """
        Search and filter salons with database-backed matching.
        Crucial: Service pricing and constraints are strictly bound to the requested service.
        """
        # Base query for active salons
        salons_query = db.query(Salon).filter(Salon.is_active == True)

        if city:
            salons_query = salons_query.filter(Salon.city.ilike(f"%{city.strip()}%"))
        if locality:
            salons_query = salons_query.filter(Salon.locality.ilike(f"%{locality.strip()}%"))
        if min_rating is not None:
            salons_query = salons_query.filter(Salon.rating >= min_rating)
        if query:
            search_pattern = f"%{query.strip()}%"
            salons_query = salons_query.filter(
                (Salon.name.ilike(search_pattern)) |
                (Salon.locality.ilike(search_pattern)) |
                (Salon.city.ilike(search_pattern))
            )

        salons = salons_query.all()

        # Get favourite salon IDs for current user if authenticated
        favourite_ids = set()
        if current_user:
            favs = db.query(FavouriteSalon.salon_id).filter(FavouriteSalon.user_id == current_user.id).all()
            favourite_ids = {f[0] for f in favs}

        results = []
        for salon in salons:
            # Check services offered by this salon
            services_query = db.query(Service).filter(
                Service.salon_id == salon.id,
                Service.is_active == True
            )

            if category_slug:
                services_query = services_query.join(ServiceCategory).filter(
                    ServiceCategory.slug == category_slug
                )

            matched_service = None
            if service_name:
                # Find the specific service matching name
                matched = services_query.filter(
                    Service.name.ilike(f"%{service_name.strip()}%")
                ).first()
                if not matched:
                    # Salon does NOT offer this chosen service!
                    continue
                matched_service = matched
            else:
                # If no specific service requested, get the primary/first service if exists
                matched_service = services_query.first()

            # Verify exact service budget constraints if a service was specified
            if matched_service:
                if min_price is not None and matched_service.price < min_price:
                    continue
                if max_price is not None and matched_service.price > max_price:
                    continue

            # Calculate Haversine distance if customer coordinates provided
            dist = None
            if user_lat is not None and user_lon is not None:
                dist = calculate_haversine_distance(user_lat, user_lon, salon.latitude, salon.longitude)
                if max_distance_km is not None and dist is not None and dist > max_distance_km:
                    continue

            results.append({
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
                "rating": salon.rating,
                "review_count": salon.review_count,
                "is_active": salon.is_active,
                "distance_km": dist,
                "matched_service_price": matched_service.price if matched_service else None,
                "matched_service_duration": matched_service.duration_minutes if matched_service else None,
                "matched_service_name": matched_service.name if matched_service else None,
                "is_favourite": salon.id in favourite_ids,
            })

        # Sorting logic
        if sort_by == "price_asc":
            results.sort(key=lambda x: (x["matched_service_price"] is None, x["matched_service_price"] or 0))
        elif sort_by == "price_desc":
            results.sort(key=lambda x: (x["matched_service_price"] or 0), reverse=True)
        elif sort_by == "rating":
            results.sort(key=lambda x: (x["rating"], x["review_count"]), reverse=True)
        elif sort_by == "distance":
            results.sort(key=lambda x: (x["distance_km"] is None, x["distance_km"] or 999999))
        else:  # "relevance"
            def score(item):
                # Composite relevance score
                r_score = item["rating"] * 20.0
                dist_penalty = (item["distance_km"] or 10.0) * 1.5
                price_penalty = ((item["matched_service_price"] or 500) / 100.0)
                return r_score - dist_penalty - price_penalty
            results.sort(key=score, reverse=True)

        return results

    @staticmethod
    def get_salon_detail(db: Session, salon_id: int, current_user: Optional[User] = None) -> Dict[str, Any]:
        """Fetch complete salon profile with services, opening schedule, and verified reviews."""
        salon = db.query(Salon).options(
            joinedload(Salon.services).joinedload(Service.category),
            joinedload(Salon.schedules),
            joinedload(Salon.reviews).joinedload(Review.customer)
        ).filter(Salon.id == salon_id, Salon.is_active == True).first()

        if not salon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Salon with ID {salon_id} was not found or is currently inactive.",
            )

        is_fav = False
        if current_user:
            fav = db.query(FavouriteSalon).filter(
                FavouriteSalon.user_id == current_user.id,
                FavouriteSalon.salon_id == salon_id
            ).first()
            is_fav = fav is not None

        # Build clean review list
        reviews_data = []
        for r in salon.reviews:
            reviews_data.append({
                "id": r.id,
                "booking_id": r.booking_id,
                "customer_id": r.customer_id,
                "salon_id": r.salon_id,
                "rating": r.rating,
                "comment": r.comment,
                "customer_name": r.customer.full_name if r.customer else "Anonymous Customer",
                "created_at": r.created_at,
            })

        return {
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
            "is_favourite": is_fav,
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
                    "category": {
                        "id": s.category.id,
                        "name": s.category.name,
                        "slug": s.category.slug,
                        "icon": s.category.icon,
                        "display_order": s.category.display_order
                    } if s.category else None
                } for s in salon.services if s.is_active
            ],
            "schedules": [
                {
                    "id": sch.id,
                    "salon_id": sch.salon_id,
                    "day_of_week": sch.day_of_week,
                    "open_time": sch.open_time,
                    "close_time": sch.close_time,
                    "is_closed": sch.is_closed,
                    "slot_duration_minutes": sch.slot_duration_minutes,
                    "concurrent_capacity": sch.concurrent_capacity
                } for sch in sorted(salon.schedules, key=lambda x: x.day_of_week)
            ],
            "reviews": reviews_data
        }

    @staticmethod
    def toggle_favourite(db: Session, salon_id: int, user: User) -> bool:
        """Toggle a salon in user's favourites list. Returns True if now favorited, False if removed."""
        salon = db.query(Salon).filter(Salon.id == salon_id).first()
        if not salon:
            raise HTTPException(status_code=404, detail="Salon not found.")

        existing = db.query(FavouriteSalon).filter(
            FavouriteSalon.user_id == user.id,
            FavouriteSalon.salon_id == salon_id
        ).first()

        if existing:
            db.delete(existing)
            db.commit()
            return False
        else:
            new_fav = FavouriteSalon(user_id=user.id, salon_id=salon_id)
            db.add(new_fav)
            db.commit()
            return True
