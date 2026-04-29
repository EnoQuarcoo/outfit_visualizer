from fastapi import APIRouter
from app.services.mailerlite_service import create_subscriber
from pydantic import BaseModel, EmailStr, field_validator

router = APIRouter()


class Subscriber(BaseModel):
    email: EmailStr
    name: str = ""

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        value = value.strip()
        if not value:
            return ""
        return value


@router.post("/subscribe")
async def subscribe(payload: Subscriber):
    print("Route function ra!!!")
    email = payload.email
    name = payload.name
    result = create_subscriber(email, name)
    return result
