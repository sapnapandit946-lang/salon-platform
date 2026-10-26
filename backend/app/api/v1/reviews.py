from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import require_customer
from app.models import Review, Booking, BookingStatus, Salon, User
from app.schemas import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    review_in: ReviewCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    """
    Submit a verified customer review for an appointment that has been marked COMPLETED.
    Enforces one review per completed booking and updates salon's aggregate rating.
    """
    booking = db.query(Booking).filter(
        Booking.id == review_in.booking_id,
        Booking.customer_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found.")

    if booking.status != BookingStatus.COMPLETED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviews can only be submitted for completed appointments."
        )

    # Check if review already exists
    existing_review = db.query(Review).filter(Review.booking_id == booking.id).first()
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A review has already been submitted for this appointment."
        )

    # Create review
    new_review = Review(
        booking_id=booking.id,
        customer_id=current_user.id,
        salon_id=booking.salon_id,
        rating=review_in.rating,
        comment=review_in.comment.strip() if review_in.comment else None
    )
    db.add(new_review)
    db.flush()

    # Recompute salon average rating & review count
    agg = db.query(
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("total_reviews")
    ).filter(Review.salon_id == booking.salon_id).first()

    salon = db.query(Salon).filter(Salon.id == booking.salon_id).first()
    if salon and agg:
        salon.rating = round(float(agg.avg_rating or 0.0), 1)
        salon.review_count = int(agg.total_reviews or 0)

    db.commit()
    db.refresh(new_review)

    return {
        "id": new_review.id,
        "booking_id": new_review.booking_id,
        "customer_id": new_review.customer_id,
        "salon_id": new_review.salon_id,
        "rating": new_review.rating,
        "comment": new_review.comment,
        "customer_name": current_user.full_name,
        "created_at": new_review.created_at
    }
