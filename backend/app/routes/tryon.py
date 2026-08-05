from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.fal_service import generate_tryon
from app.services.auth_service import get_current_user
from app.services.database import has_enough_credits, decrement_credits

router = APIRouter()

class TryOnRequest(BaseModel):
    model_image_url: str
    garment_image_url: str
    category: str = "auto"

@router.post("/tryon")
async def tryon(payload: TryOnRequest, user_id: str = Depends(get_current_user)):
    has_credits, user_plan = has_enough_credits(user_id)
    if not has_credits:
        raise HTTPException(status_code=402, detail={"error": "Credit limit reached", "plan": user_plan})

    result_url = await generate_tryon(
        model_image_url=payload.model_image_url,
        garment_image_url=payload.garment_image_url,
        category=payload.category,
    )
    decrement_credits(user_id)
    return {"image_url": result_url}