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


def has_enough_credits(user_id):
    response = (
        supabase.table("users")
        .select("monthly_credits_remaining, topup_credits_remaining, plan")
        .eq("id", user_id)
        .execute()
    )
    user_row = response.data[0]
    has_credits = user_row["monthly_credits_remaining"] + \
        user_row["topup_credits_remaining"] > 0
    return has_credits, user_row["plan"]


def decrement_credits(user_id, amount=1):
    response = (
        supabase.table("users")
        .select("monthly_credits_remaining, topup_credits_remaining")
        .eq("id", user_id)
        .execute()
    )
    user_row = response.data[0]
    monthly = user_row["monthly_credits_remaining"]
    topup = user_row["topup_credits_remaining"]

    # monthly credits are drawn down first since they're the recurring
    # allotment; topup credits are only spent once monthly hits 0
    if monthly >= amount:
        monthly -= amount
    else:
        topup -= amount - monthly
        monthly = 0

    (
        supabase.table("users")
        .update({
            "monthly_credits_remaining": monthly,
            "topup_credits_remaining": topup,
        })
        .eq("id", user_id)
        .execute()
    )


def grant_paid_plan(user_id):
    """Called on RevenueCat INITIAL_PURCHASE/RENEWAL — topup_credits_remaining
    is left untouched since those were bought separately from the subscription."""
    (
        supabase.table("users")
        .update({"plan": "paid", "monthly_credits_remaining": 80})
        .eq("id", user_id)
        .execute()
    )


def revert_to_free_plan(user_id):
    """Called on RevenueCat EXPIRATION — treats the user as a first-time free
    user again. topup_credits_remaining is left untouched; those were bought
    separately and aren't tied to subscription status."""
    (
        supabase.table("users")
        .update({"plan": "free", "monthly_credits_remaining": 6})
        .eq("id", user_id)
        .execute()
    )


def delete_user_images_from_storage(user_id, bucket_name):
    # delete user's info from all 3 storage buckets.
    # List the items beginning with the user id
    items_in_bucket_response = (
        supabase.storage
        .from_(bucket_name)
        .list(
            user_id,
        )
    )
    print(items_in_bucket_response)
    # its a list of dictionaries that's returned. get all the names and .remove()
    files_to_delete = []
    if not files_to_delete:
        return 
    for item in items_in_bucket_response:
        files_to_delete.append(user_id + "/" + item["name"])
    print("files to delete are ", files_to_delete)
    # delete the actual files
    delete_items_from_bucket_response = (
        supabase.storage
        .from_(bucket_name)
        .remove(files_to_delete)
    )


def delete_user_info_from_tables(user_id):
    response = (
        supabase.table("users")
        .delete()
        .eq("id", user_id)
        .execute()
    )
    supabase.auth.admin.delete_user(user_id)
