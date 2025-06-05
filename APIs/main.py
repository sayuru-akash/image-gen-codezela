import os
import base64
import io
import traceback

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("Error: OPENAI_API_KEY not found in environment variables.")

client = OpenAI(api_key=api_key)

app = FastAPI()

# Allow your React app (http://localhost:3000) to hit this endpoint.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/edit-image")
async def edit_image_endpoint(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    style: str = Form(default="realistic"),
    size: str = Form(default="1024x1024")
):
    # 1. Prompt must not be empty.
    if not prompt.strip():
        return JSONResponse(status_code=400, content={"error": "Missing prompt parameter"})

    # 2. Check extension
    filename = image.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in {"png", "jpg", "jpeg"}:
        return JSONResponse(
            status_code=400,
            content={"error": "Allowed image types: png, jpg, jpeg"}
        )

    try:
        # 3. Read the entire upload into memory
        contents = await image.read()
        # 4. Wrap in BytesIO and assign .name so the client infers MIME correctly
        buffer = io.BytesIO(contents)
        buffer.name = filename  # e.g. "photo.png"
        buffer.seek(0)

        # 5. Combine style + prompt
        full_prompt = f"{prompt} in a {style} style"

        # 6. Call OpenAI .images.edit WITHOUT response_format
        #    Pass a list of file‐like objects (here, [buffer])
        response = client.images.edit(
            model="gpt-image-1",   # or "dall-e-2" if your account still uses that
            image=[buffer],
            prompt=full_prompt,
            size=size,                 # e.g. "1024x1024"
            n=1
        )

        # 7. Extract base64 from response
        if response.data and len(response.data) > 0 and response.data[0].b64_json:
            image_b64 = response.data[0].b64_json
            # Build a data-URL so the React front-end can do: <img src={image_url} />
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


if __name__ == "__main__":
    import uvicorn

    print(f"Starting server. OpenAI API key loaded (last 4 chars): …{api_key[-4:]}")
    uvicorn.run(app, host="0.0.0.0", port=8000)

