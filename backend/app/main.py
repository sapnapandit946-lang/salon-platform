from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models import ServiceCategory
from app.api.v1.api import api_router

# Ensure uploads directory exists
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(os.path.join(uploads_dir, "previews"), exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "salons"), exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)

    # Seed default service categories if not already present
    db = SessionLocal()
    try:
        if db.query(ServiceCategory).count() == 0:
            default_categories = [
                ServiceCategory(name="Hair Care & Styling", slug="hair-care", icon="Scissors", display_order=1),
                ServiceCategory(name="Beard & Shaving", slug="beard-shaving", icon="Smile", display_order=2),
                ServiceCategory(name="Hair Coloring & Highlights", slug="hair-coloring", icon="Palette", display_order=3),
                ServiceCategory(name="Hair Treatments & Spa", slug="hair-treatments", icon="Sparkles", display_order=4),
                ServiceCategory(name="Skin Care & Facials", slug="skin-facials", icon="Sun", display_order=5),
                ServiceCategory(name="Bridal & Event Makeup", slug="bridal-makeup", icon="Heart", display_order=6),
                ServiceCategory(name="Nails & Pedicure", slug="nails-pedicure", icon="CheckCircle", display_order=7),
            ]
            db.add_all(default_categories)
            db.commit()
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for AI-Powered Salon Decision & Booking Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    """Verify backend API operational status and database connection."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER,
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
