from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB")]
collection = db[os.getenv("MONGO_COLLECTION")]

class BaseLog(BaseModel):
    service: str
    user_id: str
    prompt: Optional[str] = None
    enhanced_prompt: Optional[str] = None
    input_image: Optional[str] = None
    mask_image: Optional[str] = None
    input_image_2: Optional[str] = None
    output_image: Optional[str] = None
    time_prompt_enhance: Optional[float] = None
    time_image_gen: Optional[float] = None
    time_total: Optional[float] = None
    status: str

