from fastapi import APIRouter, Depends
from app.services.auth_service import get_current_user
from app.services.database import delete_user_images_from_storage, delete_user_info_from_tables

router = APIRouter()

STORAGE_BUCKETS = ["Avatars", "Clothing Pieces", "Generated Outfits"]


@router.delete("/account")
async def delete_account(user_id: str = Depends(get_current_user)):
    for bucket_name in STORAGE_BUCKETS:
        delete_user_images_from_storage(user_id, bucket_name)

    delete_user_info_from_tables(user_id)

    return {"message": "Account deleted successfully"}
