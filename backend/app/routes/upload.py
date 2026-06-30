from fastapi import APIRouter, UploadFile
from app.services.image_service import preprocess_avatar_image, preprocess_garment_image
from app.services.database import supabase
from datetime import datetime

router = APIRouter()


@router.post("/upload_image")
async def upload_image(img: UploadFile, userId, image_type, name: str = None, category: str = None):
    # read the img file as bytes.
    image_bytes = await img.read()

    # process the image bytes to meet FASHN API standards
    if image_type == "garment":
        processed_image_bytes = preprocess_garment_image(image_bytes)

        # Upload image to storage
        outfitPath = f"{userId}/outfit-{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        print("outfit path is ", outfitPath)
        upload_response = (
            supabase.storage
            .from_("Clothing Pieces")
            .upload(outfitPath, processed_image_bytes, file_options={"content-type": "image/jpeg", "cache-control": "3600", "upsert": "false"})
        )

        # get image's url
        retrieve_public_url_response = (
            supabase.storage
            .from_("Clothing Pieces")
            .get_public_url(outfitPath)
        )

        # upload image_url to database
        database_upload_response = (
            supabase.table("clothing_items")
            .insert({
                "user_id" : userId,
                "name" : name, 
                "category" : category, 
                "image_url" : retrieve_public_url_response
            })
            .execute()
        )

    elif image_type == "avatar":
        processed_image_bytes = preprocess_avatar_image(image_bytes)
        
        # Upload image to storage
        avatarPath = f"{userId}/avatar-{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        print("avatar path is ", avatarPath)
        upload_response = (
            supabase.storage
            .from_("Avatars")
            .upload(avatarPath, processed_image_bytes, file_options={"content-type": "image/jpeg", "cache-control": "3600", "upsert": "false"})
        )
        print("upload_response", upload_response)

        # get image's url
        retrieve_public_url_response = (
            supabase.storage
            .from_("Avatars")
            .get_public_url(avatarPath)
        )
        

        # upload image_url to database
        database_upload_response = (
            supabase.table("users")
            .update({
                "model_photo_url" : retrieve_public_url_response
            })
            .eq("id", userId)
            .execute()
        )
    else:
        raise ValueError("Wrong Image Type")
    
    #print("processed image bytes = ", processed_image_bytes)

    return {"database_upload_response": database_upload_response}


