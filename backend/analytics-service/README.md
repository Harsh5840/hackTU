# Analytics Service

Python FastAPI service for Demand Forecasting and analytics.

## Features
- Demand Forecasting Endpoint (Linear Regression / Scikit-learn)
- REST API with FastAPI

## Setup
1. `pip install -r requirements.txt`
2. `uvicorn app.main:app --reload`

## Endpoints
- POST `/api/v1/forecast/demand`
