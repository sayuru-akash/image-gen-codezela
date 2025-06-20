import base64
import io
import logging
import os
import traceback
from datetime import datetime
from utils.logger import log_to_db
from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from openai import AzureOpenAI

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

@router.post("/edit-image")
async def edit_image_endpoint(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    user_id: str = Form(default="dev"),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024"),
    enhance_prompt: bool = Form(default=True)
):
    if not prompt.strip():
        return JSONResponse(status_code=400, content={"error": "Missing prompt parameter"})

    filename = image.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in {"png", "jpg", "jpeg"}:
        return JSONResponse(
            status_code=400,
            content={"error": "Allowed image types: png, jpg, jpeg"}
        )

    try:
        contents = await image.read()
        enhanced_prompt = prompt

        start_time = datetime.utcnow()

        if enhance_prompt:
            logger.info(f"Original prompt: {prompt}")
            enhanced_prompt = await analyze_image_for_prompt_enhancement(client, contents, prompt)
            logger.info(f"Enhanced prompt: {enhanced_prompt}")

        buffer = io.BytesIO(contents)
        buffer.name = filename
        buffer.seek(0)

        full_prompt = f"{enhanced_prompt} in a {style} style"
        logger.info(f"Final prompt used for image editing: {full_prompt}")

        response = client.images.edit(
            model="gpt-image-1", 
            image=buffer,
            prompt=full_prompt,
            size=size,
            n=1,
        )

        end_time = datetime.utcnow()
        time_enhance = (end_time - start_time).total_seconds()

        if response.data and len(response.data) > 0 and response.data[0].b64_json:
            image_b64 = response.data[0].b64_json
            data_url = f"data:image/png;base64,{image_b64}"
            logger.info("Image editing successful")

            log_to_db({
                "service": "edit_image",
                "user_id": user_id,
                "prompt": prompt,
                "enhanced_prompt": enhanced_prompt,
                "input_image": "original_image_base64",
                "output_image": "output_image_base64",
                "time_prompt_enhance": round(time_enhance, 2) if enhance_prompt else None,
                "time_image_gen": round(time_enhance, 2),
                "time_total": round(time_enhance, 2),
                "status": "success",
                "timestamp": datetime.utcnow().isoformat()
            })

            return JSONResponse(
                status_code=200, 
                content={
                    "image_url": data_url,
                    "original_prompt": prompt,
                    "enhanced_prompt": enhanced_prompt if enhance_prompt else None,
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