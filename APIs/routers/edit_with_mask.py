import base64
import io
import logging
import os
import traceback
from datetime import datetime
from typing import Optional

import numpy as np
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from openai import AzureOpenAI
from PIL import Image
from utils.gcs_helper import (
    get_bucket_info,
    upload_image_to_gcs,
    upload_image_to_gcs_with_signed_url,
)
from utils.logger import log_to_db

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

def generate_unique_filename(user_id: str, image_type: str = "edited") -> str:
    """Generate a unique filename for the image"""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")[:-3]  # Include milliseconds
    return f"{image_type}_image_{user_id}_{timestamp}.png"

def create_black_masked_image(original_image_bytes, mask_image_bytes):
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

def upload_to_gcs(image_bytes: bytes, user_id: str, image_type: str = "edited", 
                  use_signed_url: bool = True, signed_url_hours: int = 24) -> Optional[str]:
    """Upload image to GCS and return URL"""
    try:
        gcs_bucket_name = os.getenv("GCS_BUCKET_NAME")
        if not gcs_bucket_name:
            logger.warning("GCS_BUCKET_NAME not set, skipping GCS upload")
            return None

        filename = generate_unique_filename(user_id, image_type)
        gcs_blob_name = f"edited/{user_id}/{filename}"
        
        if use_signed_url:
            # Use signed URL method (works with uniform bucket-level access)
            gcs_result = upload_image_to_gcs_with_signed_url(
                image_bytes, 
                gcs_blob_name, 
                gcs_bucket_name,
                expiration_hours=signed_url_hours
            )
            gcs_url = gcs_result['signed_url']
            logger.info(f"Image uploaded to GCS with signed URL: {gcs_url}")
        else:
            # Try public URL method (may fail with uniform bucket access)
            gcs_url = upload_image_to_gcs(image_bytes, gcs_blob_name, gcs_bucket_name)
            logger.info(f"Image uploaded to GCS with public URL: {gcs_url}")
        
        return gcs_url
        
    except Exception as e:
        logger.error(f"Failed to upload image to GCS: {e}")
        return None

@router.get("/bucket-info")
async def get_bucket_configuration():
    """Get information about the GCS bucket configuration"""
    try:
        bucket_name = os.getenv("GCS_BUCKET_NAME")
        if not bucket_name:
            return JSONResponse(status_code=400, content={"error": "GCS_BUCKET_NAME not configured"})
        
        bucket_info = get_bucket_info(bucket_name)
        return bucket_info
        
    except Exception as e:
        logger.error(f"Error getting bucket info: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/edit-with-mask")
async def edit_with_mask(
    original_image: UploadFile = File(...),
    mask_image: UploadFile = File(...),
    prompt: str = Form(...),
    user_id: str = Form(default="developer"),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024"),
    save_to_gcs: bool = Form(default=True),
    use_signed_url: bool = Form(default=True),
    signed_url_hours: int = Form(default=24),
    return_base64: bool = Form(default=True)  # For frontend compatibility
):
    start_time = datetime.utcnow()
    
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

        logger.info(f"Received image '{img_filename}' and mask '{msk_filename}' for editing by user '{user_id}'.")

        # Upload original and mask images to GCS if requested
        original_gcs_url = None
        mask_gcs_url = None
        
        if save_to_gcs:
            original_gcs_url = upload_to_gcs(original_contents, user_id, "original", use_signed_url, signed_url_hours)
            mask_gcs_url = upload_to_gcs(mask_contents, user_id, "mask", use_signed_url, signed_url_hours)

        # Create black masked image
        black_masked_image_bytes = create_black_masked_image(original_contents, mask_contents)
        if black_masked_image_bytes is None:
            return JSONResponse(
                status_code=500,
                content={"error": "Failed to process mask and original image"}
            )

        # Upload masked image to GCS if requested
        masked_gcs_url = None
        if save_to_gcs:
            masked_gcs_url = upload_to_gcs(black_masked_image_bytes, user_id, "masked", use_signed_url, signed_url_hours)

        buffer_image = io.BytesIO(black_masked_image_bytes)
        buffer_image.name = "masked_image.png"
        buffer_image.seek(0)

        full_prompt = f"{prompt} in a {style} style"
        logger.info(f"Editing image with prompt: '{full_prompt}'")

        edit_start_time = datetime.utcnow()

        response = client.images.edit(
            model="gpt-image-1",
            image=buffer_image,
            prompt=full_prompt,
            size=size,
            n=1
        )

        edit_end_time = datetime.utcnow()
        edit_time_taken = round((edit_end_time - edit_start_time).total_seconds(), 2)

        if response.data and len(response.data) > 0 and response.data[0].b64_json:
            image_b64 = response.data[0].b64_json
            
            # Convert base64 to bytes for GCS upload
            edited_image_bytes = base64.b64decode(image_b64)
            
            # Upload edited image to GCS
            edited_gcs_url = None
            if save_to_gcs:
                edited_gcs_url = upload_to_gcs(edited_image_bytes, user_id, "edited", use_signed_url, signed_url_hours)

            # Prepare response data
            response_data = {
                "success": True,
                "prompt": prompt,
                "style": style,
                "full_prompt": full_prompt,
                "size": size,
                "processing_time_seconds": edit_time_taken,
                "gcs_urls": {
                    "original": original_gcs_url,
                    "mask": mask_gcs_url,
                    "masked": masked_gcs_url,
                    "edited": edited_gcs_url
                } if save_to_gcs else None,
                "url_type": "signed" if use_signed_url else "public",
                "signed_url_expires_hours": signed_url_hours if use_signed_url else None
            }

            # Add base64 data if requested (for frontend compatibility)
            if return_base64:
                data_url = f"data:image/png;base64,{image_b64}"
                response_data["image_url"] = data_url
                response_data["base64_data"] = image_b64

            # Keep backward compatibility
            if edited_gcs_url:
                response_data["image_url"] = response_data.get("image_url", edited_gcs_url)

            end_time = datetime.utcnow()
            total_time_taken = round((end_time - start_time).total_seconds(), 2)

            logger.info("Image editing completed successfully.")

            # Enhanced logging to Cosmos DB
            log_data = {
                "service": "edit_with_mask",
                "user_id": user_id,
                "prompt": prompt,
                "enhanced_prompt": full_prompt,
                "style": style,
                "size": size,
                "input_image": original_gcs_url or "original_image_base64",
                "mask_image": mask_gcs_url or "mask_image_base64",
                "masked_image": masked_gcs_url,
                "output_image": edited_gcs_url or "output_image_base64",
                "gcs_urls": {
                    "original": original_gcs_url,
                    "mask": mask_gcs_url,
                    "masked": masked_gcs_url,
                    "edited": edited_gcs_url
                },
                "time_prompt_enhance": None,
                "time_image_gen": edit_time_taken,
                "time_total": total_time_taken,
                "status": "success",
                "timestamp": end_time.isoformat(),
                "settings": {
                    "save_to_gcs": save_to_gcs,
                    "use_signed_url": use_signed_url,
                    "signed_url_hours": signed_url_hours,
                    "return_base64": return_base64
                },
                "image_sizes": {
                    "original_bytes": len(original_contents),
                    "mask_bytes": len(mask_contents),
                    "masked_bytes": len(black_masked_image_bytes),
                    "edited_bytes": len(edited_image_bytes)
                }
            }

            log_to_db(log_data)

            return JSONResponse(
                status_code=200,
                content=response_data
            )
        else:
            logger.error("Image editing failed: no image data returned.")
            
            # Log failure
            end_time = datetime.utcnow()
            total_time_taken = round((end_time - start_time).total_seconds(), 2)
            
            log_to_db({
                "service": "edit_with_mask",
                "user_id": user_id,
                "prompt": prompt,
                "enhanced_prompt": full_prompt,
                "error": "No image data returned from API",
                "time_total": total_time_taken,
                "status": "error",
                "timestamp": end_time.isoformat()
            })
            
            return JSONResponse(
                status_code=500,
                content={"error": "Image editing failed: no image data returned."}
            )

    except Exception as e:
        end_time = datetime.utcnow()
        total_time_taken = round((end_time - start_time).total_seconds(), 2)
        
        logger.error(f"Error during image editing: {type(e).__name__} - {e}")
        logger.debug(traceback.format_exc())
        
        # Log failure to Cosmos DB
        log_to_db({
            "service": "edit_with_mask",
            "user_id": user_id,
            "prompt": prompt,
            "error": str(e),
            "error_type": type(e).__name__,
            "time_total": total_time_taken,
            "status": "error",
            "timestamp": end_time.isoformat()
        })
        
        if hasattr(e, "status_code"):
            return JSONResponse(status_code=e.status_code, content={"error": str(e)})
        return JSONResponse(status_code=500, content={"error": str(e)})