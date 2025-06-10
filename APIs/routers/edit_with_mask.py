import base64
import io
import traceback
import os
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from openai import AzureOpenAI
from PIL import Image

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

def ensure_rgba_png(mask_bytes):
    with Image.open(io.BytesIO(mask_bytes)) as img:
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        # Make sure the image is saved with transparency (if needed, you can define your own logic here)
        byte_io = io.BytesIO()
        img.save(byte_io, format="PNG")
        byte_io.seek(0)
        return byte_io

@router.post("/edit-with-mask")
async def edit_with_mask(
    original_image: UploadFile = File(...),
    mask_image: UploadFile = File(...),
    prompt: str = Form(...),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024"),
    enhance_prompt: bool = Form(default=True)  # New parameter to control prompt enhancement
):
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
        contents_image = await original_image.read()
        contents_mask = await mask_image.read()
        
        # Enhanced prompt generation
        if enhance_prompt:
            print(f"Original prompt: {prompt}")
            enhanced_prompt = await analyze_image_for_prompt_enhancement(
                client, contents_image, prompt
            )
            print(f"Enhanced prompt: {enhanced_prompt}")
            final_prompt = enhanced_prompt
        else:
            final_prompt = prompt
        
        # Wrap in BytesIO and assign .name so the client infers MIME correctly
        buffer_image = io.BytesIO(contents_image)
        buffer_image.name = img_filename  
        buffer_image.seek(0)
        
        buffer_mask = ensure_rgba_png(contents_mask) 
        buffer_mask.name = msk_filename
        buffer_mask.seek(0)

        # Combine style + enhanced prompt
        full_prompt = f"{final_prompt} in a {style} style"

        response = client.images.edit(
            model="gpt-image-1",   
            image=buffer_image,
            mask=buffer_mask,
            prompt=full_prompt,
            size=size,
            n=1
        )
       
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