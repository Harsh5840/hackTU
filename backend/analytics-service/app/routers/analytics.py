from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.forecast_service import forecast_service
from app.services.recommendation_service import recommendation_service

router = APIRouter()

# --- Forecast Models ---
class SalesDataPoint(BaseModel):
    date: str
    quantity: int

class ForecastRequest(BaseModel):
    productId: str
    history: List[SalesDataPoint]

# --- Recommendation Models ---
class InventoryItem(BaseModel):
    productId: str
    warehouseId: str
    currentStock: int

class SalesVelocityItem(BaseModel):
    productId: str
    avgDailySales: float

class RecommendationRequest(BaseModel):
    inventory: List[InventoryItem]
    salesVelocity: List[SalesVelocityItem]

# --- Endpoints ---

@router.post("/forecast/demand")
async def forecast_demand(request: ForecastRequest):
    try:
        data = [point.dict() for point in request.history]
        forecast = forecast_service.predict_demand(data)
        return {"success": True, "productId": request.productId, "forecast": forecast}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend/stock")
async def recommend_stock(request: RecommendationRequest):
    try:
        inventory = [item.dict() for item in request.inventory]
        velocity = [item.dict() for item in request.salesVelocity]
        recommendations = recommendation_service.recommend_stock(inventory, velocity)
        return {"success": True, "count": len(recommendations), "recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
