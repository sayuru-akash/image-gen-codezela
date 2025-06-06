from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from openai import OpenAI
from dotenv import load_dotenv
import traceback
import os
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("Error: OPENAI_API_KEY not found in environment variables.")

client = OpenAI(api_key=api_key)


router = APIRouter()

    
@router.post("/create-from-references")
async def create_from_references(
    images: list[UploadFile] = File(...),
    prompt: str = Form(...),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024")
):
    if not prompt.strip():
        return JSONResponse(status_code=400, content={"error": "Missing prompt parameter"})
    
    if len(images) == 0:
        return JSONResponse(status_code=400, content={"error": "At least one reference image is required"})
    
    if len(images) > 10:  # Reasonable limit
        return JSONResponse(status_code=400, content={"error": "Maximum 10 reference images allowed"})

    # Validate all uploaded files
    for i, image in enumerate(images):
        filename = image.filename or f"image_{i}"
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in {"png", "jpg", "jpeg"}:
            return JSONResponse(
                status_code=400,
                content={"error": f"Image {i+1} ({filename}): Allowed image types are png, jpg, jpeg"}
            )

    try:
        # Process all images into BytesIO buffers
        image_buffers = []
        for i, image in enumerate(images):
            contents = await image.read()
            buffer = io.BytesIO(contents)
            buffer.name = image.filename or f"image_{i}.png"
            buffer.seek(0)
            image_buffers.append(buffer)

        # Combine style + prompt
        full_prompt = f"{prompt} in a {style} style"

        # Call OpenAI API with multiple image references
        response = client.images.edit(
            model="gpt-image-1",
            image=image_buffers,  # List of image buffers
            prompt=full_prompt,
            size=size,
            n=1
        )

        # Extract base64 from response
        if response.data and len(response.data) > 0 and response.data[0].b64_json:
            image_b64 = response.data[0].b64_json
            data_url = f"data:image/png;base64,{image_b64}"
            return JSONResponse(status_code=200, content={"image_url": data_url})
        else:
            return JSONResponse(
                status_code=500,
                content={"error": "Image creation failed: no image data returned."}
            )

    except Exception as e:
        # Print out for debugging on the server side
        print(f"Error during image creation from references: {type(e).__name__} - {e}")
        print(traceback.format_exc())

        # If OpenAIError has .status_code, pass it along
        if hasattr(e, "status_code"):
            return JSONResponse(status_code=e.status_code, content={"error": str(e)})
        return JSONResponse(status_code=500, content={"error": str(e)})
    