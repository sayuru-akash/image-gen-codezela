import base64
import logging
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from google import genai
from google.genai import types
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def initialize_client():
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE API KEY Not set")
        logger.info("Google GenAI client initialized successfully.")
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.error(f"Error initializing Google GenAI client: {type(e).__name__} - {e}")
        raise

# Pydantic models
class ImageGenerationRequest(BaseModel):
    prompt: str
    number_of_images: Optional[int] = 1

class ImageGenerationResponse(BaseModel):
    success: bool
    message: str
    images: Optional[list] = None
    saved_files: Optional[list] = None
    error: Optional[str] = None

router = APIRouter()
client = initialize_client()

@router.post("/im-gen", response_model=ImageGenerationResponse)
async def im_gen(request: ImageGenerationRequest):
    try:
        logger.info(f"Received request to generate {request.number_of_images} image(s) for prompt: '{request.prompt}'")

        if not request.prompt or len(request.prompt.strip()) == 0:
            logger.warning("Prompt is empty.")
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")

        if request.number_of_images < 1 or request.number_of_images > 4:
            logger.warning("Invalid number of images requested.")
            raise HTTPException(status_code=400, detail="Number of images must be between 1 and 4")

        response = client.models.generate_images(
            model='imagen-3.0-generate-002',
            prompt=request.prompt,
            config=types.GenerateImagesConfig(
                number_of_images=request.number_of_images,
            )
        )

        generated_images = []

        if hasattr(response, 'generated_images'):
            for idx, generated_image in enumerate(response.generated_images):
                if hasattr(generated_image, 'image') and hasattr(generated_image.image, 'image_bytes'):
                    image_data = generated_image.image.image_bytes
                    image_base64 = base64.b64encode(image_data).decode('utf-8')
                    generated_images.append({
                        "format": "base64",
                        "data": image_base64,
                        "index": idx
                    })
                else:
                    logger.warning(f"Image {idx} missing expected structure.")
        else:
            logger.error("No 'generated_images' in response.")
            return ImageGenerationResponse(
                success=False,
                message="Invalid response structure from image generation API",
                error="No 'generated_images' in response"
            )

        logger.info(f"Successfully generated {len(generated_images)} image(s).")
        return ImageGenerationResponse(
            success=True,
            message=f"Successfully generated {len(generated_images)} image(s)",
            images=generated_images,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during image generation: {type(e).__name__} - {e}")
        return ImageGenerationResponse(
            success=False,
            message="Failed to generate images",
            error=str(e)
        )
