import io
import os
import traceback

import numpy as np
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from openai import AzureOpenAI
from PIL import Image

api_key = os.getenv("AZURE_API_KEY")
if not api_key:
    raise RuntimeError("Error: AZURE_API_KEY not found in environment variables.")

client = AzureOpenAI(
    api_key=api_key,
    azure_endpoint="https://jegan-mboyrdhf-uaenorth.openai.azure.com",
    api_version="2025-04-01-preview"
)

router = APIRouter()

def create_black_masked_image(original_image_bytes, mask_image_bytes):
    """
    Create a new image where masked areas are black and unmasked areas remain original
    """
    try:
        # Open both images
        original_img = Image.open(io.BytesIO(original_image_bytes)).convert('RGB')
        mask_img = Image.open(io.BytesIO(mask_image_bytes)).convert('L')  # Convert to grayscale
        
        # Resize mask to match original image dimensions
        mask_img = mask_img.resize(original_img.size, Image.Resampling.LANCZOS)
        
        # Convert to numpy arrays
        original_array = np.array(original_img)
        mask_array = np.array(mask_img)
        
        # Create output array (copy of original)
        output_array = original_array.copy()
        
        # Where mask is white (255) or has high values, make the image black
        # Assuming white areas in mask indicate areas to edit
        mask_threshold = 128  # Adjust this threshold as needed
        black_areas = mask_array > mask_threshold
        
        # Set masked areas to black
        output_array[black_areas] = [0, 0, 0]  # RGB black
        
        # Convert back to PIL Image
        result_img = Image.fromarray(output_array, 'RGB')
        
        # Convert to bytes
        output_buffer = io.BytesIO()
        result_img.save(output_buffer, format='PNG')
        output_buffer.seek(0)
        
        return output_buffer.getvalue()
        
    except Exception as e:
        print(f"Error creating black masked image: {e}")
        print(traceback.format_exc())
        return None

@router.post("/edit-with-mask")
async def edit_with_mask(
    original_image: UploadFile = File(...),
    mask_image: UploadFile = File(...),
    prompt: str = Form(...),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024")
):
    if not prompt.strip():
        return JSONResponse(status_code=400, content={"error": "Missing prompt parameter"})

    img_filename = original_image.filename or ""
    msk_filename = mask_image.filename or ""
    img_ext = img_filename.rsplit(".", 1)[-1].lower()
    msk_ext = msk_filename.rsplit(".", 1)[-1].lower()

    if (img_ext not in {"png", "jpg", "jpeg"}) or (msk_ext not in {"png", "jpg", "jpeg"}):
        return JSONResponse(
            status_code=400,
            content={"error": "Allowed image types: png, jpg, jpeg"}
        )

    try:
        # Read both images
        original_contents = await original_image.read()
        mask_contents = await mask_image.read()

        # Create the black masked image
        black_masked_image_bytes = create_black_masked_image(original_contents, mask_contents)
        
        if black_masked_image_bytes is None:
            return JSONResponse(
                status_code=500,
                content={"error": "Failed to process mask and original image"}
            )

        # Prepare the black masked image for OpenAI API
        buffer_image = io.BytesIO(black_masked_image_bytes)
        buffer_image.name = "masked_image.png"
        buffer_image.seek(0)

        # Create the prompt for editing
        full_prompt = f"{prompt} in a {style} style"

        # Use OpenAI's image edit endpoint
        response = client.images.edit(
            model="gpt-image-1",
            image=buffer_image,
            prompt=full_prompt,
            size=size,
            n=1
        )

        if response.data and len(response.data) > 0 and response.data[0].b64_json:
            image_b64 = response.data[0].b64_json
            data_url = f"data:image/png;base64,{image_b64}"
            return JSONResponse(
                status_code=200,
                content={
                    "image_url": data_url,
                    "prompt": prompt,
                    "style": style,
                    "full_prompt": full_prompt
                }
            )
        else:
            return JSONResponse(
                status_code=500,
                content={"error": "Image editing failed: no image data returned."}
            )

    except Exception as e:
        print(f"Error during image editing: {type(e).__name__} - {e}")
        print(traceback.format_exc())
        if hasattr(e, "status_code"):
            return JSONResponse(status_code=e.status_code, content={"error": str(e)})
        return JSONResponse(status_code=500, content={"error": str(e)})