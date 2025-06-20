import base64
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from google import genai
from google.genai import types
from PIL import Image  # Add this import
from pydantic import BaseModel
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
    save_to_disk: Optional[bool] = False  # Add option to save to disk

class ImageGenerationResponse(BaseModel):
    success: bool
    message: str
    images: Optional[list] = None
    saved_files: Optional[list] = None
    error: Optional[str] = None

# Setup
router = APIRouter()
client = initialize_client()

def save_image_to_disk(image_data: bytes, filename: str, save_dir: str = "generated_images") -> str:
    """Save image bytes to disk and return the file path"""
    try:
        # Create directory if it doesn't exist
        Path(save_dir).mkdir(parents=True, exist_ok=True)
        
        # Full file path
        file_path = os.path.join(save_dir, filename)
        
        # Save the image
        with open(file_path, 'wb') as f:
            f.write(image_data)
        
        # Verify the image was saved correctly
        with Image.open(file_path) as img:
            logger.info(f"Image saved successfully: {file_path} ({img.size[0]}x{img.size[1]})")
        
        return file_path
    except Exception as e:
        logger.error(f"Error saving image to disk: {e}")
        raise

@router.post("/im-gen", response_model=ImageGenerationResponse)
async def im_gen(request: ImageGenerationRequest):
    start_time = datetime.utcnow()

    try:
        logger.info(f"Request received from user '{request.user_id}' to generate {request.number_of_images} image(s) for prompt: '{request.prompt}'")

        # Validate prompt
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")

        # Validate image count
        if request.number_of_images < 1 or request.number_of_images > 4:
            raise HTTPException(status_code=400, detail="Number of images must be between 1 and 4")

        # Generate images using Google's GenAI
        response = client.models.generate_images(
            model='imagen-3.0-generate-002',
            prompt=request.prompt,
            config=types.GenerateImagesConfig(
                number_of_images=request.number_of_images,
            )
        )

        # Debug: Log the response structure
        logger.info(f"Response type: {type(response)}")
        logger.info(f"Response attributes: {dir(response)}")

        # Process images with better error handling
        generated_images = []
        saved_files = []
        
        # Try different ways to access the generated images
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

        for idx, generated_image in enumerate(images_data):
            try:
                # Try different ways to access image data
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

                logger.info(f"Image {idx} data size: {len(image_bytes)} bytes")

                # Convert to base64
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                
                # Verify base64 string is complete
                logger.info(f"Image {idx} base64 size: {len(image_base64)} characters")

                generated_images.append({
                    "format": "base64",
                    "data": image_base64,
                    "index": idx,
                    "size_bytes": len(image_bytes),
                    "size_base64": len(image_base64)
                })

                # Optionally save to disk
                if request.save_to_disk:
                    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                    filename = f"generated_image_{request.user_id}_{timestamp}_{idx}.png"
                    file_path = save_image_to_disk(image_bytes, filename)
                    saved_files.append(file_path)

            except Exception as img_error:
                logger.error(f"Error processing image {idx}: {type(img_error).__name__} - {img_error}")
                continue

        if not generated_images:
            raise ValueError("No images were successfully processed")

        # Time tracking
        end_time = datetime.utcnow()
        time_taken = (end_time - start_time).total_seconds()

        # Log to Cosmos DB
        log_to_db({
            "service": "image_generation_google",
            "user_id": request.user_id,
            "prompt": request.prompt,
            "output_image": f"{len(generated_images)}_base64_images",
            "time_image_gen": time_taken,
            "time_total": time_taken,
            "status": "success",
            "timestamp": end_time.isoformat(),
            "image_sizes": [img["size_bytes"] for img in generated_images]
        })

        # Final response
        return ImageGenerationResponse(
            success=True,
            message=f"Successfully generated {len(generated_images)} image(s)",
            images=generated_images,
            saved_files=saved_files if saved_files else None
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
            "time_total": time_taken,
            "status": "error",
            "timestamp": end_time.isoformat()
        })

        return ImageGenerationResponse(
            success=False,
            message="Failed to generate images",
            error=str(e)
        )