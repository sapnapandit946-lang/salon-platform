from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.salons import router as salons_router
from app.api.v1.services import router as services_router
from app.api.v1.comparisons import router as comparisons_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.owner import router as owner_router
from app.api.v1.ai_preview import router as ai_preview_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(salons_router)
api_router.include_router(services_router)
api_router.include_router(comparisons_router)
api_router.include_router(bookings_router)
api_router.include_router(reviews_router)
api_router.include_router(owner_router)
api_router.include_router(ai_preview_router)
