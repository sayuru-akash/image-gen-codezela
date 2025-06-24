import base64
import io
import logging
import os
import traceback
from datetime import datetime

from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from openai import AzureOpenAI
from utils.gcs_helper import (
    get_bucket_info,
    upload_image_to_gcs,
    upload_image_to_gcs_with_signed_url,
)
from utils.logger import log_to_db

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load API key
api_key = os.getenv("AZURE_API_KEY")
if not api_key:
    raise RuntimeError("Error: AZURE_API_KEY not found in environment variables.")

client = AzureOpenAI(
    api_key=api_key,
    azure_endpoint="https://jegan-mboyrdhf-uaenorth.openai.azure.com",
    api_version="2025-04-01-preview"
)

router = APIRouter()

def encode_image_to_base64_from_bytes(image_bytes):
    return base64.b64encode(image_bytes).decode('utf-8')

def generate_unique_filename(user_id: str, operation: str = "edited") -> str:
    """Generate a unique filename for the edited image"""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")[:-3]  # Include milliseconds
    return f"{operation}_image_{user_id}_{timestamp}.png"

def validate_image_data(image_bytes: bytes, min_size: int = 1024) -> bool:
    """Validate that image data is not corrupted and meets minimum size"""
    try:
        if not image_bytes or len(image_bytes) < min_size:
            return False
        
        # Try to verify it's a valid image by opening it
        from io import BytesIO

        from PIL import Image
        img = Image.open(BytesIO(image_bytes))
        img.verify()
        return True
    except Exception:
        return False

async def analyze_image_for_prompt_enhancement(client, image_bytes, user_prompt):
    try:
        base64_image = encode_image_to_base64_from_bytes(image_bytes)

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": f"Analyze this image and enhance this editing prompt: '{user_prompt}'. Provide a detailed, enhanced prompt that includes specific details about the image's style, lighting, composition, colors, and objects. Make the enhanced prompt suitable for image editing. Return only the enhanced prompt without explanations."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=300
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        logger.error(f"Error enhancing prompt: {type(e).__name__} - {e}")
        logger.debug(traceback.format_exc())
        return user_prompt

@router.get("/bucket-info")
async def get_bucket_configuration():
    """Get information about the GCS bucket configuration"""
    try:
        bucket_name = os.getenv("GCS_BUCKET_NAME")
        if not bucket_name:
            raise HTTPException(status_code=400, detail="GCS_BUCKET_NAME not configured")
        
        bucket_info = get_bucket_info(bucket_name)
        return bucket_info
        
    except Exception as e:
        logger.error(f"Error getting bucket info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit-image")
async def edit_image_endpoint(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    user_id: str = Form(default="dev"),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024"),
    enhance_prompt: bool = Form(default=True),
    save_to_gcs: bool = Form(default=True),
    return_base64: bool = Form(default=True),
    use_signed_url: bool = Form(default=True),
    signed_url_hours: int = Form(default=24),
    save_original_to_gcs: bool = Form(default=False),  # Additional option for backup copy
    store_input_image: bool = Form(default=True)  # Always store input for audit trail
):
    start_time = datetime.utcnow()
    
    if not prompt.strip():
        return JSONResponse(status_code=400, content={"error": "Missing prompt parameter"})

    filename = image.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in {"png", "jpg", "jpeg"}:
        return JSONResponse(
            status_code=400,
            content={"error": "Allowed image types: png, jpg, jpeg"}
        )

    # Initialize variables for GCS upload tracking
    gcs_urls = []
    input_gcs_url = None
    backup_gcs_url = None
    edited_gcs_url = None
    gcs_bucket_name = os.getenv("GCS_BUCKET_NAME")
    
    # Check GCS configuration
    if save_to_gcs and not gcs_bucket_name:
        logger.warning("GCS_BUCKET_NAME not set, skipping GCS upload")
        save_to_gcs = False

    try:
        contents = await image.read()
        enhanced_prompt = prompt
        prompt_enhance_start = datetime.utcnow()

        # Save input/original image to GCS (default behavior when save_to_gcs is True)
        if save_to_gcs:
            try:
                # Always save input image for audit trail and reference
                original_filename = generate_unique_filename(user_id, "input")
                original_blob_name = f"edited/{user_id}/inputs/{original_filename}"
                
                if use_signed_url:
                    gcs_result = upload_image_to_gcs_with_signed_url(
                        contents, 
                        original_blob_name, 
                        gcs_bucket_name,
                        expiration_hours=signed_url_hours
                    )
                    original_gcs_url = gcs_result['signed_url']
                else:
                    original_gcs_url = upload_image_to_gcs(contents, original_blob_name, gcs_bucket_name)
                
                gcs_urls.append(original_gcs_url)
                logger.info(f"Input image uploaded to GCS: {original_gcs_url}")
                
            except Exception as gcs_error:
                logger.error(f"Failed to upload input image to GCS: {gcs_error}")
                # Continue processing - don't fail the entire request for GCS issues

        # Save additional backup copy if requested (separate from audit trail)
        if save_to_gcs and save_original_to_gcs:
            try:
                backup_filename = generate_unique_filename(user_id, "backup")
                backup_blob_name = f"edited/{user_id}/backups/{backup_filename}"
                
                if use_signed_url:
                    gcs_result = upload_image_to_gcs_with_signed_url(
                        contents, 
                        backup_blob_name, 
                        gcs_bucket_name,
                        expiration_hours=signed_url_hours
                    )
                    backup_gcs_url = gcs_result['signed_url']
                else:
                    backup_gcs_url = upload_image_to_gcs(contents, backup_blob_name, gcs_bucket_name)
                
                gcs_urls.append(backup_gcs_url)
                logger.info(f"Backup copy uploaded to GCS: {backup_gcs_url}")
                
            except Exception as gcs_error:
                logger.error(f"Failed to upload backup copy to GCS: {gcs_error}")

        if enhance_prompt:
            logger.info(f"Original prompt: {prompt}")
            enhanced_prompt = await analyze_image_for_prompt_enhancement(client, contents, prompt)
            logger.info(f"Enhanced prompt: {enhanced_prompt}")

        prompt_enhance_end = datetime.utcnow()
        time_prompt_enhance = (prompt_enhance_end - prompt_enhance_start).total_seconds()

        buffer = io.BytesIO(contents)
        buffer.name = filename
        buffer.seek(0)

        full_prompt = f"{enhanced_prompt} in a {style} style"
        logger.info(f"Final prompt used for image editing: {full_prompt}")

        # Image editing API call
        edit_start = datetime.utcnow()
        response = client.images.edit(
            model="gpt-image-1", 
            image=buffer,
            prompt=full_prompt,
            size=size,
            n=1,
        )
        edit_end = datetime.utcnow()
        time_image_edit = (edit_end - edit_start).total_seconds()

        if not (response.data and len(response.data) > 0 and response.data[0].b64_json):
            logger.error("Image editing failed: no image data returned.")
            return JSONResponse(
                status_code=500,
                content={"error": "Image editing failed: no image data returned."}
            )

        image_b64 = response.data[0].b64_json
        
        # Convert base64 back to bytes for GCS upload
        edited_image_bytes = base64.b64decode(image_b64)
        
        # Validate edited image data
        if not validate_image_data(edited_image_bytes):
            logger.warning("Edited image failed validation")
            return JSONResponse(
                status_code=500,
                content={"error": "Generated image appears to be corrupted"}
            )

        # Upload edited image to GCS
        if save_to_gcs:
            try:
                edited_filename = generate_unique_filename(user_id, "edited")
                edited_blob_name = f"edited/{user_id}/results/{edited_filename}"
                
                if use_signed_url:
                    gcs_result = upload_image_to_gcs_with_signed_url(
                        edited_image_bytes, 
                        edited_blob_name, 
                        gcs_bucket_name,
                        expiration_hours=signed_url_hours
                    )
                    edited_gcs_url = gcs_result['signed_url']
                else:
                    edited_gcs_url = upload_image_to_gcs(edited_image_bytes, edited_blob_name, gcs_bucket_name)
                
                gcs_urls.append(edited_gcs_url)
                logger.info(f"Edited image uploaded to GCS: {edited_gcs_url}")
                
            except Exception as gcs_error:
                logger.error(f"Failed to upload edited image to GCS: {gcs_error}")
                # Continue processing - don't fail the entire request for GCS issues

        end_time = datetime.utcnow()
        time_total = (end_time - start_time).total_seconds()

        # Prepare response data
        response_data = {
            "success": True,
            "message": "Image editing successful",
            "original_prompt": prompt,
            "enhanced_prompt": enhanced_prompt if enhance_prompt else None,
            "full_prompt": full_prompt,
            "processing_info": {
                "time_prompt_enhance": round(time_prompt_enhance, 2) if enhance_prompt else None,
                "time_image_edit": round(time_image_edit, 2),
                "time_total": round(time_total, 2),
                "image_size_bytes": len(edited_image_bytes)
            }
        }

        # Add base64 image if requested
        if return_base64:
            response_data["image_url"] = f"data:image/png;base64,{image_b64}"

        # Add GCS URLs if available
        if gcs_urls:
            response_data["gcs_info"] = {
                "edited_image_url": edited_gcs_url,
                "input_image_url": input_gcs_url,  # Always stored for audit
                "backup_image_url": backup_gcs_url if save_original_to_gcs else None,
                "all_urls": gcs_urls,
                "url_type": "signed" if use_signed_url else "public",
                "expires_hours": signed_url_hours if use_signed_url else None
            }

        # Log to Cosmos DB with comprehensive information
        log_data = {
            "service": "edit_image",
            "user_id": user_id,
            "prompt": prompt,
            "enhanced_prompt": enhanced_prompt,
            "full_prompt": full_prompt,
            "style": style,
            "size": size,
            "input_image_filename": filename,
            "input_image_url": input_gcs_url,  # Always stored
            "output_image": gcs_urls,  # List of all GCS URLs
            "edited_image_url": edited_gcs_url,
            "backup_image_url": backup_gcs_url,
            "gcs_urls": gcs_urls,  # For backward compatibility
            "time_prompt_enhance": round(time_prompt_enhance, 2) if enhance_prompt else None,
            "time_image_edit": round(time_image_edit, 2),
            "time_total": round(time_total, 2),
            "status": "success",
            "timestamp": end_time.isoformat(),
            "input_image_size_bytes": len(contents),
            "output_image_size_bytes": len(edited_image_bytes),
            "settings": {
                "enhance_prompt": enhance_prompt,
                "save_to_gcs": save_to_gcs,
                "return_base64": return_base64,
                "use_signed_url": use_signed_url,
                "signed_url_hours": signed_url_hours,
                "save_original_to_gcs": save_original_to_gcs,
                "store_input_image": store_input_image
            }
        }

        log_to_db(log_data)
        logger.info("Image editing completed successfully")

        return JSONResponse(status_code=200, content=response_data)

    except Exception as e:
        end_time = datetime.utcnow()
        time_total = (end_time - start_time).total_seconds()
        
        logger.error(f"Error during image editing: {type(e).__name__} - {e}")
        logger.debug(traceback.format_exc())

        # Log failure to Cosmos DB
        log_to_db({
            "service": "edit_image",
            "user_id": user_id,
            "prompt": prompt,
            "error": str(e),
            "error_type": type(e).__name__,
            "time_total": round(time_total, 2),
            "status": "error",
            "timestamp": end_time.isoformat(),
            "gcs_urls": gcs_urls if gcs_urls else None,
            "output_image": gcs_urls if gcs_urls else None,
            "input_image_url": input_gcs_url
        })

        if hasattr(e, "status_code"):
            return JSONResponse(status_code=e.status_code, content={"error": str(e)})
        return JSONResponse(status_code=500, content={"error": str(e)})