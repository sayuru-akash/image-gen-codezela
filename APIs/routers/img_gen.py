import base64
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from google import genai
from google.genai import types
from pydantic import BaseModel

load_dotenv()

def initialize_client():
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE API KEY Not set")
        client = genai.Client(api_key=api_key)
        return client
    except Exception as e:
        print(str(e))
        raise

# Pydantic models for request/response
class ImageGenerationRequest(BaseModel):
    prompt: str
    number_of_images: Optional[int] = 1

class ImageGenerationResponse(BaseModel):
    success: bool
    message: str
    images: Optional[list] = None
    saved_files: Optional[list] = None  # List of saved file paths
    error: Optional[str] = None

router = APIRouter()

client = initialize_client()


@router.post("/im-gen", response_model=ImageGenerationResponse)
async def im_gen(request: ImageGenerationRequest):
    try:
        if not request.prompt or len(request.prompt.strip()) == 0:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")

        if request.number_of_images < 1 or request.number_of_images > 4:
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
                    print(f"Image {idx} missing structure")
        else:
            return ImageGenerationResponse(
                success=False,
                message="Invalid response structure from image generation API",
                error="No 'generated_images' in response"
            )

        return ImageGenerationResponse(
            success=True,
            message=f"Successfully generated {len(generated_images)} image(s)",
            images=generated_images,
        )

    except HTTPException:
        raise
    except Exception as e:
        return ImageGenerationResponse(
            success=False,
            message="Failed to generate images",
            error=str(e)
        )
