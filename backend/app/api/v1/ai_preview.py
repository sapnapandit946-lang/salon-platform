from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from app.core.database import get_db
from app.core.dependencies import get_optional_current_user
from app.models import User, AIPreviewLog
from app.schemas import AIPreviewResponse
from app.services.ai_preview_service import AIPreviewService

router = APIRouter(prefix="/ai-preview", tags=["AI Hairstyle Preview"])


@router.get("/styles")
def get_available_styles():
    """Retrieve curated hairstyles and color palettes available for virtual preview."""
    return {
        "hairstyles": [
            {"id": "textured_fade", "name": "Textured Crop Fade", "category": "Men", "description": "Clean skin fade with textured top layer"},
            {"id": "classic_pompadour", "name": "Classic Pompadour", "category": "Men", "description": "High-volume swept back silhouette"},
            {"id": "messy_quiff", "name": "Modern Messy Quiff", "category": "Men", "description": "Contemporary casual upward sweep"},
            {"id": "curtain_fringe", "name": "Curtain Fringe with Waves", "category": "Unisex", "description": "Middle parted face-framing natural drape"},
            {"id": "layered_bob", "name": "Textured Layered Bob", "category": "Women", "description": "Collarbone grazing dynamic textured bob"},
            {"id": "curtain_bangs_long", "name": "Curtain Bangs with Long Layers", "category": "Women", "description": "Voluminous South Asian bridal/party layered blowout"},
            {"id": "beach_waves", "name": "Soft Balayage Beach Waves", "category": "Women", "description": "Loose effortless natural waves with dimensional tone"},
            {"id": "pixie_cut", "name": "Edgy Pixie Cut", "category": "Women", "description": "Chic short textured crop with tapered nape"},
        ],
        "hair_colors": [
            {"name": "Natural Black", "hex": "#1a1a1a", "desc": "Deep natural raven sheen"},
            {"name": "Espresso Dark Brown", "hex": "#382318", "desc": "Rich dark coffee undertones"},
            {"name": "Chestnut Brown", "hex": "#5e3922", "desc": "Warm autumnal brown with soft shine"},
            {"name": "Honey Blonde", "hex": "#c49a56", "desc": "Warm golden sunkissed honey tones"},
            {"name": "Caramel Highlights", "hex": "#9c6b3b", "desc": "Dimensional sunlit strands"},
            {"name": "Burgundy Wine", "hex": "#69172e", "desc": "Deep wine red with purple nuance"},
            {"name": "Copper Auburn", "hex": "#9e4320", "desc": "Vibrant fiery ginger-copper sheen"},
            {"name": "Platinum Silver", "hex": "#d3d5db", "desc": "Cool modern metallic ash tone"},
        ],
        "consent_notice": (
            "By uploading your photo, you confirm that you are the person in the image or have authorized consent. "
            "Photos are processed temporarily for visualization purposes and are never shared or used to train third-party models."
        )
    }


@router.post("/transform", response_model=AIPreviewResponse)
async def transform_hairstyle(
    file: UploadFile = File(...),
    hairstyle: str = Form(...),
    hair_color: str = Form(...),
    consent_given: bool = Form(...),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Virtual AI Hairstyle & Hair-Colour Transformation Endpoint.
    Enforces explicit user consent, strict byte size and format validation,
    and returns simulated or generative result.
    """
    image_bytes = await file.read()
    image = AIPreviewService.validate_and_load_image(file=file, image_bytes=image_bytes)

    result = AIPreviewService.generate_preview(
        image=image,
        hairstyle=hairstyle,
        hair_color=hair_color,
        consent_given=consent_given
    )

    # Log transformation audit record
    try:
        log_entry = AIPreviewLog(
            user_id=current_user.id if current_user else None,
            hairstyle_name=hairstyle,
            hair_color=hair_color,
            original_image_name=file.filename or "uploaded.jpg",
            result_image_path=result.get("preview_url") or "",
            provider="mock" if result.get("is_mock") else "gemini",
            status=result["status"].upper()
        )
        db.add(log_entry)
        db.commit()
    except Exception:
        db.rollback()

    return result
