from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
import aiohttp
import asyncio
import json
import base64
import io
from PIL import Image
import uuid
import websockets
from fastapi.middleware.cors import CORSMiddleware




app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Update to your actual ComfyUI server
COMFYUI_SERVER = "http://20.195.24.250:8188"
COMFYUI_WS = "ws://20.195.24.250:8188/ws"

# Workflow template for ComfyUI
WORKFLOW_TEMPLATE_IMAGE_TO_IMAGE = {
    "10": {
        "inputs": {
            "prompt": "",
            "seed": 1559144605,
            "quality": "high",
            "background": "opaque",
            "size": "1024x1024",
            "n": 1,
            "image": ["16", 0],
            "mask": ["16", 1]
        },
        "class_type": "OpenAIGPTImage1",
        "_meta": {
            "title": "OpenAI GPT Image 1"
        }
    },
    "14": {
        "inputs": {
            "filename_prefix": "ComfyUI",
            "images": ["10", 0]
        },
        "class_type": "SaveImage",
        "_meta": {
            "title": "Save Image"
        }
    },
    "16": {
        "inputs": {
            "image": ""  # Will be filled with uploaded image filename
        },
        "class_type": "LoadImage",
        "_meta": {
            "title": "Load Image"
        }
    }
}

# Upload image to ComfyUI server
async def upload_image_to_comfyui(image_data: bytes, filename: str):
    try:
        async with aiohttp.ClientSession() as session:
            form_data = aiohttp.FormData()
            form_data.add_field('image', io.BytesIO(image_data), filename=filename, content_type='image/png')
            async with session.post(f"{COMFYUI_SERVER}/upload/image", data=form_data) as response:
                if response.status == 200:
                    result = await response.json()
                    return result.get('name')
                else:
                    raise HTTPException(status_code=400, detail="Failed to upload image to ComfyUI")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

# Queue workflow
async def queue_workflow(workflow: dict):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{COMFYUI_SERVER}/prompt", json={"prompt": workflow}) as response:
                if response.status == 200:
                    result = await response.json()
                    return result.get('prompt_id')
                else:
                    error_text = await response.text()
                    raise HTTPException(status_code=400, detail=f"Failed to queue workflow: {error_text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Queue error: {str(e)}")

# Wait for workflow to finish
async def wait_for_completion(prompt_id: str, timeout: int = 300):
    try:
        async with websockets.connect(f"{COMFYUI_WS}?clientId={uuid.uuid4()}") as websocket:
            start_time = asyncio.get_event_loop().time()
            while True:
                if asyncio.get_event_loop().time() - start_time > timeout:
                    raise HTTPException(status_code=408, detail="Request timeout")
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                    data = json.loads(message)
                    if data.get('type') == 'executing' and data.get('data', {}).get('prompt_id') == prompt_id:
                        if data.get('data', {}).get('node') is None:
                            return True
                except asyncio.TimeoutError:
                    continue
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WebSocket error: {str(e)}")

# Get generated images
async def get_generated_images(prompt_id: str):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{COMFYUI_SERVER}/history/{prompt_id}") as response:
                if response.status == 200:
                    history = await response.json()
                    if prompt_id in history:
                        outputs = history[prompt_id].get('outputs', {})
                        images = []
                        for node_id, output in outputs.items():
                            if 'images' in output:
                                for img_info in output['images']:
                                    img_url = f"{COMFYUI_SERVER}/view"
                                    params = {
                                        'filename': img_info['filename'],
                                        'subfolder': img_info.get('subfolder', ''),
                                        'type': img_info.get('type', 'output')
                                    }
                                    async with session.get(img_url, params=params) as img_response:
                                        if img_response.status == 200:
                                            img_data = await img_response.read()
                                            img_base64 = base64.b64encode(img_data).decode('utf-8')
                                            images.append({
                                                'filename': img_info['filename'],
                                                'image': img_base64
                                            })
                        return images
                else:
                    raise HTTPException(status_code=400, detail="Failed to get image history")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Get images error: {str(e)}")

# Health check
@app.get("/health/")
async def health_check():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{COMFYUI_SERVER}/system_stats") as response:
                if response.status == 200:
                    return {"status": "healthy", "comfyui": "accessible"}
                else:
                    return {"status": "unhealthy", "comfyui": "not accessible"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ✅ Main endpoint to generate image
@app.post("/generate/")
async def generate_image(
    image: UploadFile = File(...),
    prompt: str = Form("A fantasy castle in the mountains")  # Default prompt
):
    try:
        image_bytes = await image.read()
        image_filename = await upload_image_to_comfyui(image_bytes, image.filename)
        if not image_filename:
            raise HTTPException(status_code=400, detail="Image upload failed")

        # Clone and prepare the workflow
        workflow = json.loads(json.dumps(WORKFLOW_TEMPLATE_IMAGE_TO_IMAGE))
        workflow["16"]["inputs"]["image"] = image_filename
        workflow["10"]["inputs"]["prompt"] = prompt

        # Submit workflow
        prompt_id = await queue_workflow(workflow)
        if not prompt_id:
            raise HTTPException(status_code=500, detail="Workflow submission failed")

        # Wait for processing
        await wait_for_completion(prompt_id)

        # Retrieve results
        images = await get_generated_images(prompt_id)
        if not images:
            raise HTTPException(status_code=404, detail="No images generated")

        return JSONResponse(content={"generated_images": images})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")
