from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import ComparisonRequest, ComparisonResponse
from app.services.comparison_service import ComparisonService

router = APIRouter(prefix="/compare", tags=["Decision Support & Comparison"])


@router.post("", response_model=ComparisonResponse)
def compare_salons(
    req: ComparisonRequest,
    db: Session = Depends(get_db)
):
    """
    Central Decision Support Engine:
    Compare multiple salons side-by-side for an exact chosen service.
    Evaluates pricing fit, travel proximity, Bayesian-weighted customer ratings,
    and actual appointment availability for the requested date and time.
    """
    return ComparisonService.compare_salons_for_service(db=db, req=req)
