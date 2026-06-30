import fal_client

async def generate_tryon(model_image_url: str, garment_image_url: str, category: str = "auto"):
    category_map = {
        "tops": "tops",
        "bottoms": "bottoms",
        "one-pieces": "one-pieces",
    }
    mapped_category = category_map.get(category, "auto")
    
    handler = await fal_client.submit_async(
        "fal-ai/fashn/tryon/v1.6",
        arguments={
            "model_image": model_image_url,
            "garment_image": garment_image_url,
            "category": mapped_category,
            "mode": "quality",
            "num_samples": 1,
            "segmentation_free": True,
        },
    )

    result = await handler.get()
    return result["images"][0]["url"]