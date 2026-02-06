# 🧠 Urban Analytics & AI Brain - Technical Documentation

**The Cognitive Center of Urban OS**

The **Urban Analytics** module is a standalone **Python Microservice** powered by **FastAPI**. It is responsible for all intelligent operations in the Urban OS ecosystem, including Natural Language Processing (NLP), Predictive Analytics, and Automated Decision Making.

---

## 🏗️ Architecture Overview

The system operates on a **Data-Driven Intelligence** model:
1.  **Data Ingestion**: Fetches raw data (Complaints, Tax Records, Census) directly from **MongoDB**.
2.  **Processing Layer**: Applies Statistical Analysis and ML Models (`scikit-learn`).
3.  **Insight Generation**: Translates raw numbers into actionable advice (e.g., "Deploy teams to Ward 5").
4.  **API Layer**: Exposes these insights via fast **REST Endpoints** for the backend to consume.

---

## 📂 Internal File Structure

| File | Purpose | Logic Breakdown |
| :--- | :--- | :--- |
| **`app.py`** | **FastAPI Server Entry Point**. | - Initializes **Starlette** application.<br>- Manages **CORS** middleware.<br>- Connects to **MongoDB** (`pymongo`).<br>- Defines API Routes (`/citybrain`, `/health`). |
| **`intelligence.py`** | **Core Logic Engine**. | - **`get_real_data()`**: Aggregates data from 4 different collections.<br>- **`generate_city_insights()`**: Runs 5 different rule-based algorithms to detect anomalies (Hotspots, Defaulters, Risks). |
| **`train_disaster_model.py`** | **ML Training Script**. | - Uses **Random Forest Classifier**.<br>- Trains on features: `population_density`, `infrastructure_age`, `proximity_to_river`.<br>- Saves model as `.pkl` for inference. |
| **`train_population_model.py`** | **Predictive Training Script**. | - Uses **Random Forest Regressor**.<br>- Forecasts next year's population based on migration and birth rates. |

---

## 🤖 AI Logic & Algorithms

### 1. CityBrain Chatbot Engine (`/citybrain`)
The chatbot uses a **Hybrid NLU Approach**:
*   **Level 1 (Exact Match):** Checks for greetings (`hi`, `namaste`) for sub-millisecond response.
*   **Level 2 (Keyword Intent):** Analyzes sentence for tokens like `complaint`, `tax`, `emergency`.
*   **Level 3 (Generative AI - Google Gemini):** If enabled, sends prompt to LLM for complex queries.
*   **Level 4 (Fallback):** Returns safe, predefined guidance if all else fails.

### 2. Insight Generation Algorithm (`intelligence.py`)
The system strictly follows these heuristic rules:
*   **Hotspot Detection:** `frequency > 2` unique complaints in the same `ward` region.
*   **Revenue Leakage:** `tax_default_rate > 20%` of total registered properties.
*   **Disaster Risk:** ANY active alert with `severity == 'high'`.
*   **Systemic Stress:** Intersection set of (`High Complaint Wards` ∩ `High Population Wards`).

---

## 🔮 Machine Learning Models

### Disaster Risk Classifier
*   **Algorithm:** Random Forest (Ensemble Learning).
*   **Input Features:**
    *   `Population Density` (Int)
    *   `Infrastructure Age` (Years)
    *   `Building Quality` (1-5 Scale)
*   **Output:** Risk Level (0 = Safe, 1 = Monitor, 2 = Evacuate).

### Population Forecast Engine
*   **Algorithm:** Random Forest Regression.
*   **Purpose:** Helps city planners estimate resource requirements for the upcoming fiscal year.

---

## 🔌 API Reference

### `POST /citybrain`
**Description:** Processes a natural language query.
**Payload:**
```json
{
  "user_id": "user_123",
  "question": "My street light is broken"
}
```
**Response:**
```json
{
  "answer": "Complaints require immediate field team deployment. Please contact your ward officer.",
  "success": true
}
```

### `GET /health`
**Description:** System status check.
**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "ai_engine": "operational"
}
```

---

## ⚙️ Installation & Training Guide

### Prerequisites
*   Python 3.9+
*   MongoDB Instance (Local or Atlas)

### 1. Install Dependencies
```bash
pip install fastapi uvicorn pymongo scikit-learn pandas python-dotenv
```

### 2. Train Models (Important!)
Before running the server, generate the models:
```bash
python train_disaster_model.py
python train_population_model.py
```
*This will create a `models/` directory with `.pkl` files.*

### 3. Start Server
```bash
python app.py
```
*Server runs on `http://0.0.0.0:8001`*

---

**✨ Developer Note:**
The analytics engine is decoupled from the main backend. This means heavy data processing or model training **never slows down** the user experience on the mobile app.
