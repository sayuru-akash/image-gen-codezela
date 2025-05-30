from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import random

from utils import (
    upload_image_to_comfyui,
    queue_workflow,
    wait_for_completion,
    get_generated_images,
    check_comfyui_health,
    create_img2img_workflow,
    create_mask_img_workflow
)

router = APIRouter()

@router.get("/health/")
async def health_check():
    """Health check endpoint for ComfyUI server"""
    return await check_comfyui_health()

@router.post("/img2img/")
async def image_to_image(
    image: UploadFile = File(..., description="Input image file"),
    prompt: str = Form(..., description="Text prompt for image generation"),
    seed: Optional[int] = Form(None, description="Random seed (optional)")
):
    try:
        # Validate image file
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Upload image to ComfyUI
        image_bytes = await image.read()
        image_filename = await upload_image_to_comfyui(image_bytes, image.filename)
        if not image_filename:
            raise HTTPException(status_code=400, detail="Image upload failed")

        # Generate random seed if not provided
        if seed is None:
            seed = random.randint(1, 2147483647)

        # Create workflow
        workflow = create_img2img_workflow(prompt, image_filename, seed)

        # Queue and execute workflow
        prompt_id = await queue_workflow(workflow)
        if not prompt_id:
            raise HTTPException(status_code=500, detail="Workflow submission failed")

        # Wait for completion
        await wait_for_completion(prompt_id)

        # Get generated images
        images = await get_generated_images(prompt_id)
        if not images:
            raise HTTPException(status_code=404, detail="No images generated")

        return JSONResponse(content={
            "success": True,
            "prompt_id": prompt_id,
            "seed": seed,
            "generated_images": images
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

@router.post("/mask-img2img/")
async def mask_image_to_image(
    image: UploadFile = File(..., description="Input image file"),
    mask: UploadFile = File(..., description="Mask image file"),
    prompt: str = Form(..., description="Text prompt for image generation"),
    seed: Optional[int] = Form(None, description="Random seed (optional)")
):
    """
    Mask + Image-to-image generation endpoint
    
    - **image**: Input image file (PNG, JPG, etc.)
    - **mask**: Mask image file (PNG, JPG, etc.)
    - **prompt**: Text description for the desired output
    - **seed**: Optional random seed for reproducible results
    """
    try:
        # Validate image files
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Image file must be an image")
        if not mask.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Mask file must be an image")

        # Upload image to ComfyUI
        image_bytes = await image.read()
        image_filename = await upload_image_to_comfyui(image_bytes, image.filename)
        if not image_filename:
            raise HTTPException(status_code=400, detail="Image upload failed")

        # Upload mask to ComfyUI
        mask_bytes = await mask.read()
        mask_filename = await upload_image_to_comfyui(mask_bytes, mask.filename)
        if not mask_filename:
            raise HTTPException(status_code=400, detail="Mask upload failed")

        # Generate random seed if not provided
        if seed is None:
            seed = random.randint(1, 2147483647)

        # Create workflow
        workflow = create_mask_img_workflow(prompt, image_filename, mask_filename, seed)

        # Queue and execute workflow
        prompt_id = await queue_workflow(workflow)
        if not prompt_id:
            raise HTTPException(status_code=500, detail="Workflow submission failed")

        # Wait for completion
        await wait_for_completion(prompt_id)

        # Get generated images
        images = await get_generated_images(prompt_id)
        if not images:
            raise HTTPException(status_code=404, detail="No images generated")

        return JSONResponse(content={
            "success": True,
            "prompt_id": prompt_id,
            "seed": seed,
            "generated_images": images
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

@router.post("/batch-img2img/")
async def batch_image_to_image(
    images: list[UploadFile] = File(..., description="Multiple input image files"),
    prompt: str = Form(..., description="Text prompt for image generation"),
    seed: Optional[int] = Form(None, description="Random seed (optional)")
):
    """
    Batch image-to-image generation endpoint
    
    - **images**: Multiple input image files
    - **prompt**: Text description for the desired output (applied to all images)
    - **seed**: Optional random seed for reproducible results
    """
    try:
        if len(images) > 10:  # Limit batch size
            raise HTTPException(status_code=400, detail="Maximum 10 images allowed per batch")

        results = []
        base_seed = seed or random.randint(1, 2147483647)

        for i, image in enumerate(images):
            # Validate image file
            if not image.content_type.startswith('image/'):
                continue  # Skip non-image files
            
            try:
                # Upload image
                image_bytes = await image.read()
                image_filename = await upload_image_to_comfyui(image_bytes, image.filename)
                
                # Use incremental seed for each image
                current_seed = base_seed + i
                
                # Create and execute workflow
                workflow = create_img2img_workflow(prompt, image_filename, current_seed)
                prompt_id = await queue_workflow(workflow)
                await wait_for_completion(prompt_id)
                
                # Get generated images
                generated_images = await get_generated_images(prompt_id)
                
                results.append({
                    "input_filename": image.filename,
                    "prompt_id": prompt_id,
                    "seed": current_seed,
                    "generated_images": generated_images
                })
                
            except Exception as e:
                results.append({
                    "input_filename": image.filename,
                    "error": str(e)
                })

        return JSONResponse(content={
            "success": True,
            "batch_results": results,
            "total_processed": len(results)
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch generation error: {str(e)}")

@router.get("/status/{prompt_id}")
async def check_generation_status(prompt_id: str):
    """
    Check the status of a generation request
    
    - **prompt_id**: The prompt ID returned from generation endpoints
    """
    try:
        images = await get_generated_images(prompt_id)
        
        if images:
            return JSONResponse(content={
                "status": "completed",
                "prompt_id": prompt_id,
                "generated_images": images
            })
        else:
            return JSONResponse(content={
                "status": "processing",
                "prompt_id": prompt_id,
                "message": "Generation still in progress"
            })
            
    except Exception as e:
        return JSONResponse(content={
            "status": "error",
            "prompt_id": prompt_id,
            "error": str(e)
        })