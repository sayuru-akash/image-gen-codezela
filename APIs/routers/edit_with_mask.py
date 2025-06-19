import io
import logging
import os
import traceback

import numpy as np
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from openai import AzureOpenAI
from PIL import Image

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load API Key
api_key = os.getenv("AZURE_API_KEY")
if not api_key:
    raise RuntimeError("Error: AZURE_API_KEY not found in environment variables.")

# Initialize OpenAI client
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
        original_img = Image.open(io.BytesIO(original_image_bytes)).convert('RGB')
        mask_img = Image.open(io.BytesIO(mask_image_bytes)).convert('L')

        mask_img = mask_img.resize(original_img.size, Image.Resampling.LANCZOS)

        original_array = np.array(original_img)
        mask_array = np.array(mask_img)
        output_array = original_array.copy()

        mask_threshold = 128
        black_areas = mask_array > mask_threshold
        output_array[black_areas] = [0, 0, 0]

        result_img = Image.fromarray(output_array, 'RGB')

        output_buffer = io.BytesIO()
        result_img.save(output_buffer, format='PNG')
        output_buffer.seek(0)

        logger.info("Successfully created black-masked image.")
        return output_buffer.getvalue()

    except Exception as e:
        logger.error(f"Error creating black masked image: {type(e).__name__} - {e}")
        logger.debug(traceback.format_exc())
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
        original_contents = await original_image.read()
        mask_contents = await mask_image.read()

        logger.info(f"Received image '{img_filename}' and mask '{msk_filename}' for editing.")

        black_masked_image_bytes = create_black_masked_image(original_contents, mask_contents)
        if black_masked_image_bytes is None:
            return JSONResponse(
                status_code=500,
                content={"error": "Failed to process mask and original image"}
            )

        buffer_image = io.BytesIO(black_masked_image_bytes)
        buffer_image.name = "masked_image.png"
        buffer_image.seek(0)

        full_prompt = f"{prompt} in a {style} style"
        logger.info(f"Editing image with prompt: '{full_prompt}'")

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
            logger.info("Image editing completed successfully.")
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
            logger.error("Image editing failed: no image data returned.")
            return JSONResponse(
                status_code=500,
                content={"error": "Image editing failed: no image data returned."}
            )

    except Exception as e:
        logger.error(f"Error during image editing: {type(e).__name__} - {e}")
        logger.debug(traceback.format_exc())
        if hasattr(e, "status_code"):
            return JSONResponse(status_code=e.status_code, content={"error": str(e)})
        return JSONResponse(status_code=500, content={"error": str(e)})
