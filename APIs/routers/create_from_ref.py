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

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=api_key,
    azure_endpoint="https://jegan-mboyrdhf-uaenorth.openai.azure.com",
    api_version="2025-04-01-preview"
)

router = APIRouter()

def encode_image_to_base64_from_bytes(image_bytes):
    return base64.b64encode(image_bytes).decode('utf-8')

def generate_unique_filename(user_id: str, operation: str = "reference", index: int = 0) -> str:
    """Generate a unique filename for the reference or generated image"""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")[:-3]  # Include milliseconds
    if operation == "reference":
        return f"reference_{index}_{user_id}_{timestamp}.png"
    else:
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

async def analyze_multiple_images_for_prompt_enhancement(client, image_bytes_list, user_prompt):
    try:
        base64_images = [encode_image_to_base64_from_bytes(img_bytes) for img_bytes in image_bytes_list]

        content = [
            {
                "type": "text", 
                "text": f"Analyze these reference images and enhance this creation prompt: '{user_prompt}'. Provide a detailed, enhanced prompt that incorporates visual elements, styles, lighting, composition, colors, and objects from the reference images. Make the enhanced prompt suitable for creating a new image based on these references. Return only the enhanced prompt without explanations."
            }
        ]

        for i, base64_image in enumerate(base64_images):
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}"
                }
            })

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": content}],
            max_tokens=400
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        logger.error(f"Error enhancing prompt with multiple images: {type(e).__name__} - {e}")
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

@router.post("/create-from-references")
async def create_from_references(
    images: list[UploadFile] = File(...),
    prompt: str = Form(...),
    user_id: str = Form(default="developer"),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024"),
    enhance_prompt: bool = Form(default=True),
    save_to_gcs: bool = Form(default=True),
    return_base64: bool = Form(default=True),
    use_signed_url: bool = Form(default=True),
    signed_url_hours: int = Form(default=24),
    store_reference_images: bool = Form(default=True)  # Store all reference images
):
    start_time = datetime.utcnow()
    
    if not prompt.strip():
        return JSONResponse(status_code=400, content={"error": "Missing prompt parameter"})

    if len(images) == 0:
        return JSONResponse(status_code=400, content={"error": "At least one reference image is required"})

    if len(images) > 10:
        return JSONResponse(status_code=400, content={"error": "Maximum 10 reference images allowed"})

    # Initialize variables for GCS upload tracking
    gcs_urls = []
    reference_gcs_urls = []
    generated_gcs_url = None
    gcs_bucket_name = os.getenv("GCS_BUCKET_NAME")
    
    # Check GCS configuration
    if save_to_gcs and not gcs_bucket_name:
        logger.warning("GCS_BUCKET_NAME not set, skipping GCS upload")
        save_to_gcs = False

    # Validate image formats
    for i, image in enumerate(images):
        filename = image.filename or f"image_{i}"
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in {"png", "jpg", "jpeg"}:
            return JSONResponse(
                status_code=400,
                content={"error": f"Image {i+1} ({filename}): Allowed image types are png, jpg, jpeg"}
            )

    try:
        image_contents_list = []
        image_buffers = []
        reference_filenames = []

        # Read all images and prepare for processing
        for i, image in enumerate(images):
            contents = await image.read()
            image_contents_list.append(contents)
            reference_filenames.append(image.filename or f"reference_{i}.png")

            # Validate each reference image
            if not validate_image_data(contents):
                return JSONResponse(
                    status_code=400,
                    content={"error": f"Reference image {i+1} appears to be corrupted or invalid"}
                )

            buffer = io.BytesIO(contents)
            buffer.name = image.filename or f"image_{i}.png"
            buffer.seek(0)
            image_buffers.append(buffer)

        # Upload reference images to GCS if requested
        if save_to_gcs and store_reference_images:
            logger.info(f"Uploading {len(image_contents_list)} reference images to GCS...")
            
            for i, (contents, filename) in enumerate(zip(image_contents_list, reference_filenames)):
                try:
                    ref_filename = generate_unique_filename(user_id, "reference", i)
                    ref_blob_name = f"create_from_references/{user_id}/references/{ref_filename}"
                    
                    if use_signed_url:
                        gcs_result = upload_image_to_gcs_with_signed_url(
                            contents, 
                            ref_blob_name, 
                            gcs_bucket_name,
                            expiration_hours=signed_url_hours
                        )
                        ref_gcs_url = gcs_result['signed_url']
                    else:
                        ref_gcs_url = upload_image_to_gcs(contents, ref_blob_name, gcs_bucket_name)
                    
                    reference_gcs_urls.append({
                        "index": i,
                        "filename": filename,
                        "gcs_url": ref_gcs_url,
                        "blob_name": ref_blob_name,
                        "size_bytes": len(contents)
                    })
                    gcs_urls.append(ref_gcs_url)
                    logger.info(f"Reference image {i+1} uploaded to GCS: {ref_gcs_url}")
                    
                except Exception as gcs_error:
                    logger.error(f"Failed to upload reference image {i+1} to GCS: {gcs_error}")
                    # Continue processing - don't fail for GCS issues

        prompt_enhance_start = datetime.utcnow()

        if enhance_prompt:
            logger.info(f"Original prompt: {prompt}")
            enhanced_prompt = await analyze_multiple_images_for_prompt_enhancement(
                client, image_contents_list, prompt
            )
            logger.info(f"Enhanced prompt: {enhanced_prompt}")
            final_prompt = enhanced_prompt
        else:
            final_prompt = prompt

        prompt_enhance_end = datetime.utcnow()
        time_prompt_enhance = (prompt_enhance_end - prompt_enhance_start).total_seconds()

        full_prompt = f"{final_prompt} in a {style} style"
        logger.info(f"Generating image with final prompt: '{full_prompt}'")

        # Image generation API call
        generation_start = datetime.utcnow()
        response = client.images.edit(
            model="gpt-image-1",
            image=image_buffers,
            prompt=full_prompt,
            size=size,
            n=1
        )
        generation_end = datetime.utcnow()
        time_image_generation = (generation_end - generation_start).total_seconds()

        if not (response.data and len(response.data) > 0 and response.data[0].b64_json):
            logger.error("Image creation failed: no image data returned.")
            return JSONResponse(
                status_code=500,
                content={"error": "Image creation failed: no image data returned."}
            )

        image_b64 = response.data[0].b64_json
        
        # Convert base64 back to bytes for GCS upload
        generated_image_bytes = base64.b64decode(image_b64)
        
        # Validate generated image data
        if not validate_image_data(generated_image_bytes):
            logger.warning("Generated image failed validation")
            return JSONResponse(
                status_code=500,
                content={"error": "Generated image appears to be corrupted"}
            )

        # Upload generated image to GCS
        if save_to_gcs:
            try:
                generated_filename = generate_unique_filename(user_id, "generated")
                generated_blob_name = f"create_from_references/{user_id}/results/{generated_filename}"
                
                if use_signed_url:
                    gcs_result = upload_image_to_gcs_with_signed_url(
                        generated_image_bytes, 
                        generated_blob_name, 
                        gcs_bucket_name,
                        expiration_hours=signed_url_hours
                    )
                    generated_gcs_url = gcs_result['signed_url']
                else:
                    generated_gcs_url = upload_image_to_gcs(
                        generated_image_bytes, generated_blob_name, gcs_bucket_name
                    )
                
                gcs_urls.append(generated_gcs_url)
                logger.info(f"Generated image uploaded to GCS: {generated_gcs_url}")
                
            except Exception as gcs_error:
                logger.error(f"Failed to upload generated image to GCS: {gcs_error}")
                # Continue processing - don't fail the entire request for GCS issues

        end_time = datetime.utcnow()
        time_total = (end_time - start_time).total_seconds()

        # Prepare response data
        response_data = {
            "success": True,
            "message": f"Successfully created image from {len(images)} reference images",
            "original_prompt": prompt,
            "enhanced_prompt": final_prompt if enhance_prompt else None,
            "full_prompt": full_prompt,
            "reference_count": len(images),
            "processing_info": {
                "time_prompt_enhance": round(time_prompt_enhance, 2) if enhance_prompt else None,
                "time_image_generation": round(time_image_generation, 2),
                "time_total": round(time_total, 2),
                "output_image_size_bytes": len(generated_image_bytes),
                "reference_images_total_size": sum(len(img) for img in image_contents_list)
            }
        }

        # Add base64 image if requested
        if return_base64:
            response_data["image_url"] = f"data:image/png;base64,{image_b64}"

        # Add GCS URLs if available
        if gcs_urls:
            response_data["gcs_info"] = {
                "generated_image_url": generated_gcs_url,
                "reference_images": reference_gcs_urls,
                "all_urls": gcs_urls,
                "url_type": "signed" if use_signed_url else "public",
                "expires_hours": signed_url_hours if use_signed_url else None,
                "total_uploads": len(gcs_urls)
            }

        # Log to Cosmos DB with comprehensive information
        log_data = {
            "service": "create_from_references",
            "user_id": user_id,
            "prompt": prompt,
            "enhanced_prompt": final_prompt if enhance_prompt else None,
            "full_prompt": full_prompt,
            "style": style,
            "size": size,
            "reference_count": len(images),
            "reference_filenames": reference_filenames,
            "reference_images_urls": [ref["gcs_url"] for ref in reference_gcs_urls],
            "generated_image_url": generated_gcs_url,
            "output_image": gcs_urls,  # List of all GCS URLs for backward compatibility
            "gcs_urls": gcs_urls,  # For backward compatibility
            "time_prompt_enhance": round(time_prompt_enhance, 2) if enhance_prompt else None,
            "time_image_generation": round(time_image_generation, 2),
            "time_total": round(time_total, 2),
            "status": "success",
            "timestamp": end_time.isoformat(),
            "reference_images_total_size": sum(len(img) for img in image_contents_list),
            "output_image_size_bytes": len(generated_image_bytes),
            "settings": {
                "enhance_prompt": enhance_prompt,
                "save_to_gcs": save_to_gcs,
                "return_base64": return_base64,
                "use_signed_url": use_signed_url,
                "signed_url_hours": signed_url_hours,
                "store_reference_images": store_reference_images
            }
        }

        log_to_db(log_data)
        logger.info("Image creation from references completed successfully")

        return JSONResponse(status_code=200, content=response_data)

    except Exception as e:
        end_time = datetime.utcnow()
        time_total = (end_time - start_time).total_seconds()
        
        logger.error(f"Error during image creation from references: {type(e).__name__} - {e}")
        logger.debug(traceback.format_exc())

        # Log failure to Cosmos DB
        log_to_db({
            "service": "create_from_references", 
            "user_id": user_id,
            "prompt": prompt,
            "reference_count": len(images) if images else 0,
            "error": str(e),
            "error_type": type(e).__name__,
            "time_total": round(time_total, 2),
            "status": "error",
            "timestamp": end_time.isoformat(),
            "gcs_urls": gcs_urls if gcs_urls else None,
            "output_image": gcs_urls if gcs_urls else None,
            "reference_images_urls": [ref["gcs_url"] for ref in reference_gcs_urls] if reference_gcs_urls else None
        })

        if hasattr(e, "status_code"):
            return JSONResponse(status_code=e.status_code, content={"error": str(e)})
        return JSONResponse(status_code=500, content={"error": str(e)})