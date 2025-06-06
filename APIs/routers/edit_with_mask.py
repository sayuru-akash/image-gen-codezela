import io
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from openai import OpenAI
from dotenv import load_dotenv
import traceback
import os
from PIL import Image

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("Error: OPENAI_API_KEY not found in environment variables.")

client = OpenAI(api_key=api_key)


router = APIRouter()

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
    original_image:UploadFile = File(...),
    mask_image:UploadFile = File(...),
    prompt:str = Form(...),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024")
):
    if not prompt.strip():
        return JSONResponse(status_code=400, content={"error": "Missing prompt parameter"})
    img_filename = original_image.filename or ""
    msk_filename = mask_image.filename or ""
    img_ext = img_filename.rsplit(".", 1)[-1].lower()
    msk_ext = msk_filename.rsplit(".", 1)[-1].lower()
    if (img_ext not in {"png", "jpg", "jpeg"}) and (msk_ext not in {"png", "jpg", "jpeg"}):
        return JSONResponse(
            status_code=400,
            content={"error": "Allowed image types: png, jpg, jpeg"}
        )
    try:
        contents_image = await original_image.read()
        # Wrap in BytesIO and assign .name so the client infers MIME correctly
        buffer_image = io.BytesIO(contents_image)
        buffer_image.name = img_filename  
        buffer_image.seek(0)
        
        contents_mask = await mask_image.read()
        buffer_mask = ensure_rgba_png(contents_mask) 
        buffer_mask.name = msk_filename
        buffer_mask.seek(0)

        # 5. Combine style + prompt
        full_prompt = f"{prompt} in a {style} style in size {size}"

        
        response = client.images.edit(
            model="gpt-image-1",   
            image=buffer_image,
            mask= buffer_mask,
            prompt=full_prompt,
            size= size,
            n = 1
        )
       
        
        if response.data and len(response.data) > 0 and response.data[0].b64_json:
            image_b64 = response.data[0].b64_json
            data_url = f"data:image/png;base64,{image_b64}"
            return JSONResponse(status_code=200, content={"image_url": data_url})
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