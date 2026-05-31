from fastapi import APIRouter
from pydantic import BaseModel
from app.services.fal_service import generate_tryon

router = APIRouter()

class TryOnRequest(BaseModel):
    model_image_url: str
    garment_image_url: str
    category: str = "auto"

@router.post("/tryon")
async def tryon(payload: TryOnRequest):
    result_url = await generate_tryon(
        model_image_url=payload.model_image_url,
        garment_image_url=payload.garment_image_url,
        category=payload.category,
    )
    return {"image_url": result_url}