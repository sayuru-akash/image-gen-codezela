from .cosmos import collection
from datetime import datetime

def log_to_db(log: dict):
    log['timestamp'] = datetime.utcnow().isoformat()
    collection.insert_one(log)
