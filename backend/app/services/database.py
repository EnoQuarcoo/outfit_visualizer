import os
from supabase import create_client, Client
from app.config import SUPABASE_KEY, SUPABASE_URL

# Initialize the supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def add_demo_pieces_to_wardrobe(user_id):
    """
    Seeds a new user's wardrobe with pre-loaded demo clothing pieces from the
    'Abrima-default-pieces' storage folder, so they can try on outfits immediately
    without uploading anything themselves.
    """
    storage_response = (
        supabase.storage
        .from_("Clothing Pieces")
        .list("Abrima-default-pieces")
    )

    for clothing_piece in storage_response:
        name = clothing_piece["name"]
        if name == "Black Baggy Jeans" or name == "Khaki Slacks":
            category = "bottoms"
        elif name == "White Tank Top" or name == "Black Fitted Long Sleeve":
            category = "tops"
        else:
            category = "other"
        print(f"name is {name} and category is {category}")
        # get image url
        img_url_storage_response = (
            supabase.storage
            .from_("Clothing Pieces")
            .get_public_url(f"Abrima-default-pieces/{name}")
        )

        # insert data into  clothing items table
        db_response = (
            supabase.table("clothing_items")
            .insert({
                "user_id": user_id,
                "name": name,
                "category": category,
                "image_url": img_url_storage_response[0:]
            })
            .execute()
        )

    return db_response

# user_id="1c54d0c9-8762-423e-a2eb-818973cf54fb"
# print(automatically_upload_pieces_to_wardrobe_on_signup(user_id))
