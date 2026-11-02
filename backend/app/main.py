import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models import Salon
from app.api.v1.api import api_router
from app.core.seeder import seed_database

logger = logging.getLogger("salon.main")

# Ensure uploads directory exists
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(os.path.join(uploads_dir, "previews"), exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "salons"), exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)

    # Automatically self-heal / seed sample data if database is empty
    db = SessionLocal()
    try:
        if db.query(Salon).count() == 0:
            logger.info("Empty database detected on startup. Seeding demonstration data...")
            seed_database(db=db)
    except Exception as exc:
        logger.error("Failed to seed initial data on startup: %s", exc)
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
def health_check(response: Response):
    """
    Verify backend operational health and active database connectivity.
    Accurately reports database status and loaded record count; returns HTTP 503 if DB is unreachable.
    """
    db_status = "unknown"
    salon_count = 0
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        salon_count = db.query(Salon).count()
        db_status = "connected"
    except Exception as exc:
        db_status = f"disconnected: {str(exc)}"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        logger.error("Health check failed database ping: %s", exc)
    finally:
        db.close()

    is_healthy = db_status == "connected"
    return {
        "status": "healthy" if is_healthy else "unhealthy",
        "database": {
            "status": db_status,
            "dialect": engine.dialect.name,
            "salons_loaded": salon_count
        },
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER,
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
