from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import date, time, datetime
from app.models import Salon, Service, ServiceCategory, SalonSchedule, Booking, BookingStatus
from app.schemas import ComparisonRequest, ComparisonResponse, ComparisonItemResponse, ScoreBreakdown
from app.utils.geo import calculate_haversine_distance


class ComparisonService:
    @staticmethod
    def compare_salons_for_service(
        db: Session,
        req: ComparisonRequest,
    ) -> ComparisonResponse:
        """
        Compare salons offering an exact service.
        Ranks salons transparently with documented scoring weights:
        - Exact Service Price / Budget Match: 35%
        - Distance / Proximity: 25%
        - Verified Customer Rating & Review Volume (Bayesian weighted): 25%
        - Availability for preferred date & time: 15%
        """
        service_target = req.service_name.strip() if req.service_name else "Haircut"

        # 1. Base query: Find all active services matching target name
        services_query = db.query(Service).join(Salon).filter(
            Salon.is_active == True,
            Service.is_active == True,
            Service.name.ilike(f"%{service_target}%")
        )

        if req.category_id:
            services_query = services_query.filter(Service.category_id == req.category_id)

        matched_services = services_query.all()

        # If user passed specific salon_ids to compare directly
        if req.salon_ids and len(req.salon_ids) > 0:
            matched_services = [s for s in matched_services if s.salon_id in req.salon_ids]

        # 2. Filter & Evaluate Each Candidate
        candidate_items: List[ComparisonItemResponse] = []

        for svc in matched_services:
            salon = svc.salon

            # Location / City filter if requested
            if req.city and req.city.lower() not in salon.city.lower():
                continue
            if req.locality and req.locality.lower() not in salon.locality.lower():
                continue

            # Hard budget filter if strict min/max requested
            if req.min_budget is not None and svc.price < req.min_budget:
                continue
            if req.max_budget is not None and svc.price > req.max_budget:
                # Still show if comparing direct salon_ids, otherwise filter out
                if not req.salon_ids:
                    continue

            # Rating filter
            if req.min_rating is not None and salon.rating < req.min_rating:
                continue

            # Distance calculation
            dist = None
            if req.user_latitude is not None and req.user_longitude is not None:
                dist = calculate_haversine_distance(
                    req.user_latitude, req.user_longitude,
                    salon.latitude, salon.longitude
                )
                if req.max_distance_km is not None and dist is not None and dist > req.max_distance_km:
                    continue

            # Availability evaluation for preferred date
            is_open_on_date = True
            has_slot = True
            opening_hours_text = "Mon-Sat: 09:00 - 20:00"

            if req.preferred_date:
                # day of week: 0=Monday, 6=Sunday
                dow = req.preferred_date.weekday()
                sched = db.query(SalonSchedule).filter(
                    SalonSchedule.salon_id == salon.id,
                    SalonSchedule.day_of_week == dow
                ).first()

                if sched:
                    if sched.is_closed:
                        is_open_on_date = False
                        has_slot = False
                        opening_hours_text = "Closed on selected day"
                    else:
                        opening_hours_text = f"{sched.open_time.strftime('%I:%M %p')} - {sched.close_time.strftime('%I:%M %p')}"
                        # Check slot if preferred time given
                        if req.preferred_time:
                            try:
                                pref_t = datetime.strptime(req.preferred_time, "%H:%M").time()
                                if pref_t < sched.open_time or pref_t >= sched.close_time:
                                    has_slot = False
                                else:
                                    # Count overlapping bookings
                                    active_bookings_count = db.query(Booking).filter(
                                        Booking.salon_id == salon.id,
                                        Booking.booking_date == req.preferred_date,
                                        Booking.start_time == pref_t,
                                        Booking.status.in_([BookingStatus.CONFIRMED.value, BookingStatus.PENDING.value])
                                    ).count()
                                    if active_bookings_count >= sched.concurrent_capacity:
                                        has_slot = False
                            except ValueError:
                                pass

            # --- Transparent Scoring Calculation ---
            reasons = []

            # A. Budget score (35% weight)
            budget_fit = True
            if req.max_budget and req.max_budget > 0:
                if svc.price <= req.max_budget:
                    # Savings ratio bonus
                    savings = req.max_budget - svc.price
                    b_score = min(100.0, 70.0 + (savings / req.max_budget) * 30.0)
                    reasons.append(f"₹{int(svc.price)} fits within your ₹{int(req.max_budget)} budget (saves ₹{int(savings)})")
                else:
                    budget_fit = False
                    over = svc.price - req.max_budget
                    b_score = max(0.0, 50.0 - (over / req.max_budget) * 50.0)
                    reasons.append(f"₹{int(svc.price)} is ₹{int(over)} above your target budget")
            else:
                # Default baseline score based on competitive market price
                b_score = 80.0
                reasons.append(f"Standard pricing: ₹{int(svc.price)}")

            # B. Distance score (25% weight)
            if dist is not None:
                # 0 km = 100, 20 km = 0
                d_score = max(0.0, min(100.0, (1.0 - (dist / 20.0)) * 100.0))
                reasons.append(f"Located {dist} km away")
            else:
                d_score = 70.0
                reasons.append("Distance not calculated (location permission not provided)")

            # C. Rating score with Bayesian smoothing (25% weight)
            # Prior: 3.8 stars with 5 reviews weight
            # smoothed = (salon.rating * salon.review_count + 3.8 * 5) / (salon.review_count + 5)
            smoothed_rating = (salon.rating * salon.review_count + 3.8 * 5.0) / (salon.review_count + 5.0)
            r_score = min(100.0, (smoothed_rating / 5.0) * 100.0)
            if salon.review_count > 0:
                reasons.append(f"{salon.rating:.1f} ★ verified rating across {salon.review_count} client reviews")
            else:
                reasons.append("Newly listed salon (awaiting verified client reviews)")

            # D. Availability score (15% weight)
            if not is_open_on_date:
                a_score = 0.0
                reasons.append("Unavailable on requested date")
            elif not has_slot:
                a_score = 40.0
                reasons.append("Selected slot is currently full; alternate slots open")
            else:
                a_score = 100.0
                reasons.append("Slots currently available for chosen schedule")

            # Composite weighted total: 0.35*B + 0.25*D + 0.25*R + 0.15*A
            composite_score = round(
                0.35 * b_score +
                0.25 * d_score +
                0.25 * r_score +
                0.15 * a_score,
                1
            )

            breakdown = ScoreBreakdown(
                budget_fit=budget_fit,
                budget_score=round(b_score, 1),
                distance_score=round(d_score, 1),
                rating_score=round(r_score, 1),
                availability_score=round(a_score, 1),
                total_composite_score=composite_score,
                reasons=reasons
            )

            candidate_items.append(
                ComparisonItemResponse(
                    salon_id=salon.id,
                    salon_name=salon.name,
                    cover_image=salon.cover_image,
                    locality=salon.locality,
                    city=salon.city,
                    rating=salon.rating,
                    review_count=salon.review_count,
                    distance_km=dist,
                    exact_service_id=svc.id,
                    exact_service_name=svc.name,
                    exact_service_price=svc.price,
                    exact_service_duration=svc.duration_minutes,
                    opening_hours_text=opening_hours_text,
                    is_available_for_date=is_open_on_date,
                    has_preferred_slot=has_slot,
                    booking_policy="Free cancellation up to 2 hours before appointment. Pay online or at salon.",
                    score_breakdown=breakdown
                )
            )

        # Sort candidate items descending by total_composite_score
        candidate_items.sort(key=lambda x: x.score_breakdown.total_composite_score, reverse=True)

        return ComparisonResponse(
            queried_service=service_target,
            customer_budget=req.max_budget,
            total_candidates_found=len(candidate_items),
            ranking_explanation=(
                "Rankings are calculated dynamically: Exact Service Budget Fit (35%), "
                "Travel Distance (25%), Bayesian-Weighted Client Rating (25%), and "
                "Appointment Availability (15%)."
            ),
            items=candidate_items
        )
