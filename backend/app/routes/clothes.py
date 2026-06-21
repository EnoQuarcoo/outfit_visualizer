from fastapi import APIRouter
from pydantic import BaseModel
from app.services.database import add_demo_pieces_to_wardrobe

router = APIRouter()

class SignupPayload(BaseModel):
    user_id:str

@router.post("/add_default_pieces_on_signup")
def  add_default_pieces(payload: SignupPayload):
    result = add_demo_pieces_to_wardrobe(payload.user_id)
    return {"Insert results": result}


