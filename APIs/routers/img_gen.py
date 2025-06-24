import base64
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from google import genai
from google.genai import types
from PIL import Image
from pydantic import BaseModel
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

# Initialize GenAI Client
def initialize_client():
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not set in environment.")
        logger.info("Google GenAI client initialized successfully.")
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.error(f"Error initializing Google GenAI client: {type(e).__name__} - {e}")
        raise

# Pydantic Models
class ImageGenerationRequest(BaseModel):
    prompt: str
    number_of_images: Optional[int] = 1
    user_id: Optional[str] = None
    save_to_gcs: Optional[bool] = True
    return_base64: Optional[bool] = True  # Always return base64 for frontend
    use_signed_url: Optional[bool] = True  # Use signed URLs (works with any bucket config)
    signed_url_hours: Optional[int] = 24  # Hours until signed URL expires

class ImageGenerationResponse(BaseModel):
    success: bool
    message: str
    images: Optional[List[Dict[str, Any]]] = None
    gcs_urls: Optional[List[str]] = None  # Keep for backward compatibility
    saved_files: Optional[List[str]] = None  # Keep for backward compatibility with first version
    error: Optional[str] = None

# Setup
router = APIRouter()
client = initialize_client()

def generate_unique_filename(user_id: str, index: int) -> str:
    """Generate a unique filename for the image"""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")[:-3]  # Include milliseconds
    return f"generated_image_{user_id}_{timestamp}_{index}.png"

def validate_image_data(image_bytes: bytes, min_size: int = 1024) -> bool:
    """Validate that image data is not corrupted and meets minimum size"""
    try:
        if not image_bytes or len(image_bytes) < min_size:
            return False
        
        # Try to verify it's a valid image by opening it
        from io import BytesIO
        img = Image.open(BytesIO(image_bytes))
        img.verify()
        return True
    except Exception:
        return False

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


@router.post("/im-gen", response_model=ImageGenerationResponse)
async def im_gen(request: ImageGenerationRequest):
    start_time = datetime.utcnow()
    gcs_urls = []
    saved_files = []  # For backward compatibility
    generated_images = []

    try:
        logger.info(f"Request received from user '{request.user_id}' to generate {request.number_of_images} image(s) for prompt: '{request.prompt}'")

        # Validate prompt
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")

        # Validate image count
        if request.number_of_images < 1 or request.number_of_images > 4:
            raise HTTPException(status_code=400, detail="Number of images must be between 1 and 4")

        # Generate images using Google's GenAI
        try:
            response = client.models.generate_images(
                model='imagen-3.0-generate-002',
                prompt=request.prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=request.number_of_images,
                )
            )
        except Exception as genai_error:
            logger.error(f"GenAI API error: {genai_error}")
            raise HTTPException(status_code=500, detail=f"Image generation failed: {str(genai_error)}")

        # Debug: Log the response structure
        logger.info(f"Response type: {type(response)}")
        logger.info(f"Response attributes: {dir(response)}")

        # Process images - try different ways to access the generated images
        images_data = None
        if hasattr(response, 'generated_images'):
            images_data = response.generated_images
        elif hasattr(response, 'images'):
            images_data = response.images
        elif hasattr(response, 'data'):
            images_data = response.data
        else:
            logger.error(f"Could not find images in response. Available attributes: {dir(response)}")
            raise ValueError("No images found in response")

        # Get GCS bucket name
        gcs_bucket_name = os.getenv("GCS_BUCKET_NAME")
        if request.save_to_gcs and not gcs_bucket_name:
            logger.warning("GCS_BUCKET_NAME not set, skipping GCS upload")
            request.save_to_gcs = False

        successful_images = 0
        
        for idx, generated_image in enumerate(images_data):
            try:
                # Try different ways to access image data (same as your original logic)
                image_bytes = None
                
                if hasattr(generated_image, 'image') and hasattr(generated_image.image, 'image_bytes'):
                    image_bytes = generated_image.image.image_bytes
                elif hasattr(generated_image, 'image_bytes'):
                    image_bytes = generated_image.image_bytes
                elif hasattr(generated_image, 'data'):
                    image_bytes = generated_image.data
                elif hasattr(generated_image, 'bytes'):
                    image_bytes = generated_image.bytes
                
                if image_bytes is None:
                    logger.warning(f"Could not extract bytes from image {idx}. Available attributes: {dir(generated_image)}")
                    continue

                # Verify image data is not empty
                if not image_bytes or len(image_bytes) == 0:
                    logger.warning(f"Image {idx} has empty data")
                    continue

                # Validate image data
                if not validate_image_data(image_bytes):
                    logger.warning(f"Image {idx} failed validation, skipping")
                    continue

                logger.info(f"Image {idx} data size: {len(image_bytes)} bytes")

                # Convert to base64 (ALWAYS for frontend compatibility)
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                
                # Verify base64 string is complete
                logger.info(f"Image {idx} base64 size: {len(image_base64)} characters")

                # Create image info (same structure as your first version)
                image_info = {
                    "format": "base64",
                    "data": image_base64,  # Always include for frontend
                    "index": idx,
                    "size_bytes": len(image_bytes),
                    "size_base64": len(image_base64),
                    "generated_at": datetime.utcnow().isoformat()
                }

                # Upload to GCS if requested
                gcs_url = None
                if request.save_to_gcs:
                    try:
                        filename = generate_unique_filename(request.user_id or "anonymous", idx)
                        gcs_blob_name = f"generated/{request.user_id or 'anonymous'}/{filename}"
                        
                        # Use signed URL method (works with uniform bucket-level access)
                        if request.use_signed_url:
                            gcs_result = upload_image_to_gcs_with_signed_url(
                                image_bytes, 
                                gcs_blob_name, 
                                gcs_bucket_name,
                                expiration_hours=request.signed_url_hours
                            )
                            gcs_url = gcs_result['signed_url']
                            image_info["gcs_result"] = gcs_result
                            image_info["url_type"] = "signed"
                        else:
                            # Try public URL method (may fail with uniform bucket access)
                            gcs_url = upload_image_to_gcs(image_bytes, gcs_blob_name, gcs_bucket_name)
                            image_info["url_type"] = "public"
                        
                        gcs_urls.append(gcs_url)
                        saved_files.append(gcs_url)  # For backward compatibility
                        image_info["gcs_url"] = gcs_url
                        image_info["gcs_blob_name"] = gcs_blob_name
                        
                        logger.info(f"Image {idx} uploaded to GCS: {gcs_url}")
                        
                    except Exception as gcs_error:
                        logger.error(f"Failed to upload image {idx} to GCS: {gcs_error}")
                        image_info["gcs_error"] = str(gcs_error)
                        # Continue processing - don't fail the entire request for GCS issues

                generated_images.append(image_info)
                successful_images += 1

            except Exception as img_error:
                logger.error(f"Error processing image {idx}: {type(img_error).__name__} - {img_error}")
                continue

        if not generated_images:
            raise ValueError("No images were successfully processed")

        # Time tracking
        end_time = datetime.utcnow()
        time_taken = (end_time - start_time).total_seconds()

        # Log to Cosmos DB (same as your updated version)
        log_data = {
            "service": "image_generation_google",
            "user_id": request.user_id,
            "prompt": request.prompt,
            "output_image": saved_files,  # Keep original field name
            "gcs_urls": gcs_urls,
            "image_count": successful_images,
            "requested_count": request.number_of_images,
            "time_image_gen": time_taken,
            "time_total": time_taken,
            "status": "success",
            "timestamp": end_time.isoformat(),
            "image_sizes": [img["size_bytes"] for img in generated_images],
            "settings": {
                "save_to_gcs": request.save_to_gcs,
                "return_base64": request.return_base64,
                "use_signed_url": request.use_signed_url,
                "signed_url_hours": request.signed_url_hours
            }
        }

        log_to_db(log_data)

        # Final response (compatible with both versions)
        return ImageGenerationResponse(
            success=True,
            message=f"Successfully generated {len(generated_images)} image(s)",
            images=generated_images,
            gcs_urls=gcs_urls if gcs_urls else None,
            saved_files=saved_files if saved_files else None  # For backward compatibility
        )

    except HTTPException:
        raise

    except Exception as e:
        end_time = datetime.utcnow()
        time_taken = (end_time - start_time).total_seconds()

        logger.error(f"Unexpected error during image generation: {type(e).__name__} - {e}")

        # Log failure to Cosmos DB
        log_to_db({
            "service": "image_generation_google",
            "user_id": request.user_id,
            "prompt": request.prompt,
            "error": str(e),
            "error_type": type(e).__name__,
            "time_total": time_taken,
            "status": "error",
            "timestamp": end_time.isoformat(),
            "gcs_urls": gcs_urls if gcs_urls else None,
            "output_image": saved_files if saved_files else None
        })

        return ImageGenerationResponse(
            success=False,
            message="Failed to generate images",
            error=str(e),
            gcs_urls=gcs_urls if gcs_urls else None,
            saved_files=saved_files if saved_files else None
        )