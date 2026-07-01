from PIL import Image, ImageOps
import io

def get_background_color(img):
    width, height = img.size
    img_rgb = img.convert("RGB")
    margin = 5
    corners = [
        img_rgb.getpixel((margin, margin)),
        img_rgb.getpixel((width - margin - 1, margin)),
        img_rgb.getpixel((margin, height - margin - 1)),
        img_rgb.getpixel((width - margin - 1, height - margin - 1)),
    ]
    avg_r = sum(c[0] for c in corners) // 4
    avg_g = sum(c[1] for c in corners) // 4
    avg_b = sum(c[2] for c in corners) // 4
    return (avg_r, avg_g, avg_b)

def preprocess_avatar_image(image_bytes: bytes):
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)

    # Step 1: Resize so longest edge <= 2000px, maintain aspect ratio
    max_size = 2000
    width, height = img.size
    if max(width, height) > max_size:
        if width > height:
            new_width = max_size
            new_height = int((height / width) * max_size)
        else:
            new_height = max_size
            new_width = int((width / height) * max_size)
        img = img.resize((new_width, new_height), Image.LANCZOS)

    # Step 2: Pad to 2:3 aspect ratio
    width, height = img.size
    target_ratio = 2 / 3
    current_ratio = width / height

    if current_ratio > target_ratio:
        # Too wide — pad top and bottom
        new_height = int(width / target_ratio)
        canvas = Image.new("RGB", (width, new_height), get_background_color(img))
    elif current_ratio < target_ratio:
        # Too tall — pad sides
        new_width = int(height * target_ratio)
        canvas = Image.new("RGB", (new_width, height), get_background_color(img))
    else:
        canvas = img

    if canvas is not img:
        canvas_width, canvas_height = canvas.size
        x_offset = (canvas_width - width) // 2
        y_offset = (canvas_height - height) // 2
        canvas.paste(img, (x_offset, y_offset))

    # Step 3: Convert to JPEG at quality 95
    buffer = io.BytesIO()
    canvas.convert("RGB").save(buffer, format="JPEG", quality=95)
    buffer.seek(0)
    return buffer.read()


def preprocess_garment_image(image_bytes: bytes):
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)

    # Step 1: Resize so longest edge <= 2000px, maintain aspect ratio
    max_size = 2000
    width, height = img.size
    if max(width, height) > max_size:
        if width > height:
            new_width = max_size
            new_height = int((height / width) * max_size)
        else:
            new_height = max_size
            new_width = int((width / height) * max_size)
        img = img.resize((new_width, new_height), Image.LANCZOS)

    # Step 2: Convert to JPEG at quality 95
    buffer = io.BytesIO()
    img.convert("RGB").save(buffer, format="JPEG", quality=95)
    buffer.seek(0)
    return buffer.read()