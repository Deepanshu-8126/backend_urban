from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
import logging
from datetime import datetime
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import os
from fastapi.middleware.cors import CORSMiddleware

# ... earlier imports ...

app = FastAPI()

# ✅ Add CORS support
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. DATABASE CONNECTION
complaints_col = None
chats_col = None

try:
    # Use environment variable for MongoDB (for Render compatibility)
    MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI") or "mongodb://localhost:27017/cityos"
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    
    db = client.get_database() # Automatically gets DB from URI if specified, else generic
    complaints_col = db['complaints']
    chats_col = db['chats']
    logger.info("✅ MongoDB Connected!")
    
except Exception as e:
    logger.warning(f"⚠️ MongoDB connection failed: {e}")
    complaints_col = None
    chats_col = None

# 2. DATA MODELS
class Query(BaseModel):
    user_id: str
    question: str

class CityQuery(BaseModel):
    question: str

# 3. SIMPLE GREETING RESPONSES
GREETING_RESPONSES = {
    "hi": "Hello! I'm CityBrain, your Smart City AI Assistant. How can I help you today?",
    "hello": "Hello! I'm CityBrain, your Smart City AI Assistant. How can I help you today?",
    "hey": "Hello! I'm CityBrain, your Smart City AI Assistant. How can I help you today?",
    "namaste": "Namaste! I'm CityBrain, your Smart City AI Assistant. How can I help you today?"
}

# 4. KEYWORD-BASED RESPONSES
KEYWORD_RESPONSES = {
    "complaint": "Complaints require immediate field team deployment. Please contact your ward officer.",
    "garbage": "Garbage complaints are handled by the sanitation department. Please contact your ward officer.",
    "water": "Water supply issues are handled by the water works department. Please contact your ward officer.",
    "electricity": "Electricity issues are handled by the power department. Please contact your ward officer.",
    "property": "Property tax queries require GIS verification. Visit your municipal office.",
    "tax": "Property tax queries require GIS verification. Visit your municipal office.",
    "disaster": "Emergency services are being dispatched. Please stay safe and follow official instructions.",
    "emergency": "Emergency services are being dispatched. Please stay safe and follow official instructions."
}

# 5. AI ENDPOINT (PURELY FALLBACK - NO IF-ELSE COMPLEXITY)
@app.post("/citybrain")
async def city_brain(q: Query):
    question_lower = q.question.strip().lower()
    
    # Check for exact greetings first
    if question_lower in GREETING_RESPONSES:
        answer = GREETING_RESPONSES[question_lower]
    else:
        # Check for keywords
        answer = "Hello! I'm CityBrain. Ask about complaints, certificates, property tax, or disaster alerts."
        for keyword, response in KEYWORD_RESPONSES.items():
            if keyword in question_lower:
                answer = response
                break
    
    # Save to database if available
    if chats_col:
        try:
            chats_col.insert_one({
                "user_id": q.user_id,
                "question": q.question,
                "answer": answer,
                "timestamp": datetime.now().isoformat()  # ✅ FIXED: No timezone needed
            })
        except Exception as save_error:
            logger.warning(f"Failed to save chat: {save_error}")
    
    return {"answer": answer, "success": True}

# 6. SIMPLIFIED ENDPOINT
@app.post("/citybrain-simple")
async def city_brain_simple(q: CityQuery):
    dummy_query = Query(user_id="web_user", question=q.question)
    return await city_brain(dummy_query)

# 7. HEALTH CHECK
@app.get("/health")
async def health_check():
    db_status = "connected" if complaints_col else "disconnected"
    return {
        "status": "healthy",
        "database": db_status,
        "ai_engine": "fallback-mode",
        "message": "CityBrain AI is operational"
    }

# 8. ROOT ENDPOINT
@app.get("/")
def home():
    return {
        "service": "CityBrain AI Assistant",
        "version": "2.0.0",
        "endpoints": {
            "citybrain": "POST /citybrain",
            "health": "GET /health"
        }
    }

# 9. SERVER STARTUP
if __name__ == "__main__":
    port = 8001
    host = "0.0.0.0"
    
    logger.info(f"🚀 Starting CityBrain AI on {host}:{port}")
    uvicorn.run(app, host=host, port=port)