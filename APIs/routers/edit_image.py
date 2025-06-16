import base64
import io
import os
import traceback

from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from openai import AzureOpenAI

load_dotenv()
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
    """Convert image bytes to base64 string"""
    return base64.b64encode(image_bytes).decode('utf-8')

async def analyze_image_for_prompt_enhancement(client, image_bytes, user_prompt):
    """Analyze image and enhance the user prompt using OpenAI Vision API"""
    try:
        # Encode the image to base64
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
        print(f"Error enhancing prompt: {e}")
        # Return original prompt if enhancement fails
        return user_prompt




@router.post("/edit-image")
async def edit_image_endpoint(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024"),
    enhance_prompt: bool = Form(default=True)  # New parameter to control prompt enhancement
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
        
        # Enhanced prompt generation
        if enhance_prompt:
            print(f"Original prompt: {prompt}")
            enhanced_prompt = await analyze_image_for_prompt_enhancement(client,contents, prompt)
            print(f"Enhanced prompt: {enhanced_prompt}")
            final_prompt = enhanced_prompt
        else:
            final_prompt = prompt
        
        # Wrap in BytesIO and assign .name so the client infers MIME correctly
        buffer = io.BytesIO(contents)
        buffer.name = filename  
        buffer.seek(0)

        # Combine style + enhanced prompt
        full_prompt = f"{final_prompt} in a {style} style"

        response = client.images.edit(
            model="gpt-image-1", 
            image=buffer,
            prompt=full_prompt,
            size=size,                 
            n=1,
        )

        # Extract base64 from response
        if response.data and len(response.data) > 0 and response.data[0].b64_json:
            image_b64 = response.data[0].b64_json
            data_url = f"data:image/png;base64,{image_b64}"
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
            return JSONResponse(
                status_code=500,
                content={"error": "Image editing failed: no image data returned."}
            )

    except Exception as e:
        # Print out for debugging on the server side
        print(f"Error during image editing: {type(e).__name__} - {e}")
        print(traceback.format_exc())

        # If OpenAIError has .status_code, pass it along
        if hasattr(e, "status_code"):
            return JSONResponse(status_code=e.status_code, content={"error": str(e)})
        return JSONResponse(status_code=500, content={"error": str(e)})