import aiohttp
import asyncio
import json
import base64
import io
import uuid
import websockets
from fastapi import HTTPException, UploadFile
from typing import List, Dict, Optional

# ComfyUI server configuration
COMFYUI_SERVER = "http://20.195.24.250:8188"
COMFYUI_WS = "ws://20.195.24.250:8188/ws"

async def upload_image_to_comfyui(image_data: bytes, filename: str) -> str:
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

async def queue_workflow(workflow: dict) -> str:
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

async def wait_for_completion(prompt_id: str, timeout: int = 300) -> bool:
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

async def get_generated_images(prompt_id: str) -> List[Dict]:

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

async def check_comfyui_health() -> Dict:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{COMFYUI_SERVER}/system_stats") as response:
                if response.status == 200:
                    return {"status": "healthy", "comfyui": "accessible"}
                else:
                    return {"status": "unhealthy", "comfyui": "not accessible"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def create_img2img_workflow(prompt: str, image_filename: str, seed: int = None) -> Dict:
    if seed is None:
        seed = 1716280943  # Default seed
        
    return {
        "10": {
            "inputs": {
                "prompt": prompt,
                "seed": seed,
                "quality": "high",
                "background": "opaque",
                "size": "1024x1024",
                "n": 1,
                "image": ["14", 0]
            },
            "class_type": "OpenAIGPTImage1",
            "_meta": {
                "title": "OpenAI GPT Image 1"
            }
        },
        "14": {
            "inputs": {
                "image": image_filename
            },
            "class_type": "LoadImage",
            "_meta": {
                "title": "Load Image"
            }
        },
        "15": {
            "inputs": {
                "filename_prefix": "ComfyUI",
                "images": ["10", 0]
            },
            "class_type": "SaveImage",
            "_meta": {
                "title": "Save Image"
            }
        }
    }

def create_mask_img_workflow(prompt: str, image_filename: str, mask_filename: str, seed: int = None) -> Dict:
    if seed is None:
        seed = 1371116998  # Default seed
        
    return {
        "25": {
            "inputs": {
                "prompt": prompt,
                "seed": seed,
                "quality": "high",
                "background": "opaque",
                "size": "1024x1024",
                "n": 1,
                "image": ["29", 0],
                "mask": ["32", 1]
            },
            "class_type": "OpenAIGPTImage1",
            "_meta": {
                "title": "OpenAI GPT Image 1"
            }
        },
        "28": {
            "inputs": {
                "filename_prefix": "ComfyUI",
                "images": ["25", 0]
            },
            "class_type": "SaveImage",
            "_meta": {
                "title": "Save Image"
            }
        },
        "29": {
            "inputs": {
                "image": image_filename
            },
            "class_type": "LoadImage",
            "_meta": {
                "title": "Load Image"
            }
        },
        "32": {
            "inputs": {
                "image": mask_filename
            },
            "class_type": "LoadImage",
            "_meta": {
                "title": "Load Image"
            }
        }
    }