from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import base64
from dotenv import load_dotenv
import os
import io
import requests
from PIL import Image

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-image")
async def generate_image_with_upload(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024")
):
    """Endpoint that accepts an uploaded image and generates based on prompt"""
    if not prompt:
        return JSONResponse(status_code=400, content={"error": "Missing prompt parameter"})

    try:
        # Read the uploaded image file (if you need to process it)
        image_bytes = await image.read()
        
        # Create the full prompt with style
        full_prompt = f"{prompt} in {style} style"
        
        # Generate image using OpenAI's DALL-E
        response = client.images.generate(
            model="gpt-image-1",
            prompt=full_prompt,
            size=size,
            quality="standard",
            response_format="b64_json"
        )

        # Get the base64 image data and decode it
        image_b64 = response.data[0].b64_json
        generated_image_bytes = base64.b64decode(image_b64)
        
        # Return the generated image as a streaming response
        return StreamingResponse(
            io.BytesIO(generated_image_bytes),
            media_type="image/png",
            headers={"Content-Disposition": "inline; filename=generated_image.png"}
        )

    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return JSONResponse(
            status_code=500, 
            content={"error": f"Image generation failed: {str(e)}"}
        )

