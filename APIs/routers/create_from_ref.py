import base64
import io
import logging
import os
import traceback

from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from openai import AzureOpenAI

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
    """Convert image bytes to base64 string"""
    return base64.b64encode(image_bytes).decode('utf-8')

async def analyze_multiple_images_for_prompt_enhancement(client, image_bytes_list, user_prompt):
    """Analyze multiple images and enhance the user prompt using OpenAI Vision API"""
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
        return user_prompt  # Fallback

@router.post("/create-from-references")
async def create_from_references(
    images: list[UploadFile] = File(...),
    prompt: str = Form(...),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024"),
    enhance_prompt: bool = Form(default=True)
):
    if not prompt.strip():
        return JSONResponse(status_code=400, content={"error": "Missing prompt parameter"})
    
    if len(images) == 0:
        return JSONResponse(status_code=400, content={"error": "At least one reference image is required"})
    
    if len(images) > 10:
        return JSONResponse(status_code=400, content={"error": "Maximum 10 reference images allowed"})

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

        for i, image in enumerate(images):
            contents = await image.read()
            image_contents_list.append(contents)

            buffer = io.BytesIO(contents)
            buffer.name = image.filename or f"image_{i}.png"
            buffer.seek(0)
            image_buffers.append(buffer)

        if enhance_prompt:
            logger.info(f"Original prompt: {prompt}")
            enhanced_prompt = await analyze_multiple_images_for_prompt_enhancement(
                client, image_contents_list, prompt
            )
            logger.info(f"Enhanced prompt: {enhanced_prompt}")
            final_prompt = enhanced_prompt
        else:
            final_prompt = prompt

        full_prompt = f"{final_prompt} in a {style} style"

        logger.info(f"Generating image with final prompt: '{full_prompt}'")

        response = client.images.edit(
            model="gpt-image-1",
            image=image_buffers,
            prompt=full_prompt,
            size=size,
            n=1
        )

        if response.data and len(response.data) > 0 and response.data[0].b64_json:
            image_b64 = response.data[0].b64_json
            data_url = f"data:image/png;base64,{image_b64}"
            logger.info("Image successfully generated")
            return JSONResponse(
                status_code=200,
                content={
                    "image_url": data_url,
                    "original_prompt": prompt,
                    "enhanced_prompt": final_prompt if enhance_prompt else None,
                    "full_prompt": full_prompt
                }
            )
        else:
            logger.error("Image creation failed: no image data returned.")
            return JSONResponse(
                status_code=500,
                content={"error": "Image creation failed: no image data returned."}
            )

    except Exception as e:
        logger.error(f"Error during image creation: {type(e).__name__} - {e}")
        logger.debug(traceback.format_exc())
        if hasattr(e, "status_code"):
            return JSONResponse(status_code=e.status_code, content={"error": str(e)})
        return JSONResponse(status_code=500, content={"error": str(e)})
