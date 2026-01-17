# app.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class CityQuery(BaseModel):
    question: str

@app.get("/")
def home():
    return {"status": "CityBrain AI Engine LIVE"}

@app.post("/citybrain")
def city_brain(query: CityQuery):
    
    return {
        "answer": f"Analysis: '{query.question}'. Root cause: Infrastructure overload. Action: Deploy field team immediately.",
        "confidence": 0.94
    }