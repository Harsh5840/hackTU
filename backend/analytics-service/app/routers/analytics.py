from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from app.services.forecast_service import forecast_service
from app.services.recommendation_service import recommendation_service
from app.services.inventory_analytics import (
    get_stock_classification,
    get_low_stock_alerts,
    get_regional_sales,
    get_demand_forecast
)

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

# --- New Analytics Endpoints ---

@router.get("/stock-classification")
async def stock_classification():
    """Classify products as fast-moving, slow-moving, or dead stock"""
    try:
        result = await get_stock_classification()
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/low-stock-alerts")
async def low_stock_alerts(threshold: int = Query(default=20, ge=1)):
    """Get products with inventory below threshold"""
    try:
        alerts = await get_low_stock_alerts(threshold)
        return {"success": True, "count": len(alerts), "data": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/regional-sales")
async def regional_sales():
    """Get sales distribution by dealer region"""
    try:
        result = await get_regional_sales()
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/demand-forecast")
async def demand_forecast(days: int = Query(default=7, ge=1, le=30)):
    """Get demand forecast for upcoming days"""
    try:
        result = await get_demand_forecast(days)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
