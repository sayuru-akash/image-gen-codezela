from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from endpoints import router

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router, prefix="/api/v1", tags=["ComfyUI"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return JSONResponse(content={
        "message": "ComfyUI API Gateway",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "health_check": "/api/v1/health/",
            "image_to_image": "/api/v1/img2img/",
            "mask_image_to_image": "/api/v1/mask-img2img/",
            "batch_image_to_image": "/api/v1/batch-img2img/",
            "check_status": "/api/v1/status/{prompt_id}"
        }
    })

@app.get("/health")
async def app_health():
    """Application health check"""
    return JSONResponse(content={
        "status": "healthy",
        "service": "ComfyUI API Gateway"
    })

# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found", "message": "The requested endpoint does not exist"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": "An unexpected error occurred"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )