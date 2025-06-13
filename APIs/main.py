from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import create_from_ref, edit_image, edit_with_mask, img_gen

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(create_from_ref.router)
app.include_router(edit_image.router)
app.include_router(edit_with_mask.router)
app.include_router(img_gen.router)