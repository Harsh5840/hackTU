from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.forecast_service import forecast_service
from app.services.recommendation_service import recommendation_service
from app.services.advanced_forecast_service import advanced_forecast_service
from app.services.product_clustering_service import product_clustering_service
from app.services.anomaly_detection_service import anomaly_detection_service
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


# ============================================================================
# ADVANCED ML ENDPOINTS
# ============================================================================

# --- Prophet-Based Forecasting ---

@router.post("/ml/forecast/prophet")
async def forecast_with_prophet(request: ForecastRequest):
    """
    Advanced demand forecasting using Facebook Prophet.
    Handles seasonality, trends, and provides confidence intervals.
    """
    try:
        data = [point.dict() for point in request.history]
        forecast = advanced_forecast_service.predict_demand_prophet(data, forecast_days=30)
        return {
            "success": True,
            "productId": request.productId,
            "model": "Prophet (Meta/Facebook)",
            "forecast": forecast,
            "features": ["seasonality", "trend", "confidence_intervals"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ml/forecast/xgboost")
async def forecast_with_xgboost(request: ForecastRequest):
    """
    Multi-feature demand forecasting using XGBoost.
    Incorporates lag features, rolling averages, and temporal patterns.
    """
    try:
        data = [point.dict() for point in request.history]
        forecast = advanced_forecast_service.predict_with_features(data, {}, forecast_days=30)
        return {
            "success": True,
            "productId": request.productId,
            "model": "XGBoost Regressor",
            "forecast": forecast,
            "features": ["lag_features", "rolling_averages", "temporal_encoding"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ForecastAccuracyRequest(BaseModel):
    productId: str
    history: List[SalesDataPoint]
    testSize: int = Field(default=7, ge=3, le=30)

@router.post("/ml/forecast/accuracy")
async def calculate_forecast_accuracy(request: ForecastAccuracyRequest):
    """
    Calculate forecast accuracy using MAPE (Mean Absolute Percentage Error).
    Useful for model validation and comparison.
    """
    try:
        data = [point.dict() for point in request.history]
        accuracy = advanced_forecast_service.get_forecast_accuracy(data, test_size=request.testSize)
        
        if accuracy:
            return {
                "success": True,
                "productId": request.productId,
                "accuracy": accuracy
            }
        else:
            return {
                "success": False,
                "message": "Insufficient data for accuracy calculation"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Product Clustering & Segmentation ---

class ProductMetric(BaseModel):
    productId: str
    totalSales: float
    orderCount: int
    avgOrderValue: float
    pricePerUnit: float
    currentStock: int

class ClusteringRequest(BaseModel):
    products: List[ProductMetric]
    nClusters: int = Field(default=4, ge=2, le=8)

@router.post("/ml/clustering/segment-products")
async def segment_products(request: ClusteringRequest):
    """
    K-Means clustering to segment products into performance categories.
    Groups: Star Products, Growth Potential, Steady Performers, Review Needed.
    """
    try:
        products = [p.dict() for p in request.products]
        result = product_clustering_service.segment_products(products, n_clusters=request.nClusters)
        return {
            "success": True,
            "model": "K-Means Clustering",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ml/clustering/optimize")
async def optimize_cluster_count(request: ClusteringRequest):
    """
    Use Elbow Method to find optimal number of clusters.
    Returns recommended cluster count based on inertia analysis.
    """
    try:
        products = [p.dict() for p in request.products]
        result = product_clustering_service.optimize_cluster_count(products, max_clusters=8)
        return {
            "success": True,
            "optimization": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Anomaly Detection ---

class OrderData(BaseModel):
    orderId: str
    dealerId: str
    totalAmount: float
    itemCount: int
    orderDate: str
    dealerOrderHistory: int = Field(default=0)

class AnomalyDetectionRequest(BaseModel):
    orders: List[OrderData]
    contamination: float = Field(default=0.1, ge=0.01, le=0.5)

@router.post("/ml/anomaly/detect-orders")
async def detect_order_anomalies(request: AnomalyDetectionRequest):
    """
    Isolation Forest algorithm to detect unusual orders.
    Flags potentially fraudulent or erroneous orders.
    """
    try:
        orders = [o.dict() for o in request.orders]
        result = anomaly_detection_service.detect_order_anomalies(
            orders, 
            contamination=request.contamination
        )
        return {
            "success": True,
            "model": "Isolation Forest",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class InventorySnapshot(BaseModel):
    productId: str
    warehouseId: str
    quantity: int
    timestamp: str

class InventoryAnomalyRequest(BaseModel):
    snapshots: List[InventorySnapshot]

@router.post("/ml/anomaly/detect-inventory")
async def detect_inventory_anomalies(request: InventoryAnomalyRequest):
    """
    Detect unusual inventory patterns: sudden drops, spikes, or stagnation.
    Helps identify data errors or unexpected supply chain events.
    """
    try:
        snapshots = [s.dict() for s in request.snapshots]
        anomalies = anomaly_detection_service.detect_inventory_anomalies(snapshots)
        return {
            "success": True,
            "anomalyCount": len(anomalies),
            "anomalies": anomalies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class DealerMetric(BaseModel):
    dealerId: str
    orderFrequency: float  # Orders per month
    avgOrderValue: float
    avgPaymentDelay: float  # Days

class DealerAnomalyRequest(BaseModel):
    dealers: List[DealerMetric]

@router.post("/ml/anomaly/detect-dealer-behavior")
async def detect_dealer_behavior_anomalies(request: DealerAnomalyRequest):
    """
    Identify dealers with unusual ordering patterns using statistical methods.
    Helps flag potential account issues or opportunities.
    """
    try:
        dealers = [d.dict() for d in request.dealers]
        anomalies = anomaly_detection_service.detect_dealer_behavior_anomalies(dealers)
        return {
            "success": True,
            "anomalousCount": len(anomalies),
            "dealers": anomalies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Model Information ---

@router.get("/ml/models/info")
async def get_ml_models_info():
    """
    Get information about all available ML models and their capabilities.
    """
    return {
        "success": True,
        "models": {
            "forecasting": {
                "prophet": {
                    "name": "Facebook Prophet",
                    "type": "Time-Series Forecasting",
                    "features": ["Automatic seasonality", "Trend detection", "Confidence intervals"],
                    "best_for": "Long-term demand prediction with seasonal patterns",
                    "endpoint": "/ml/forecast/prophet"
                },
                "xgboost": {
                    "name": "XGBoost Regressor",
                    "type": "Ensemble Learning",
                    "features": ["Multi-feature learning", "Lag features", "Non-linear patterns"],
                    "best_for": "Complex demand patterns with multiple influencing factors",
                    "endpoint": "/ml/forecast/xgboost"
                }
            },
            "clustering": {
                "kmeans": {
                    "name": "K-Means Clustering",
                    "type": "Unsupervised Learning",
                    "features": ["Product segmentation", "Performance grouping", "Elbow optimization"],
                    "best_for": "Categorizing products by sales patterns and value",
                    "endpoint": "/ml/clustering/segment-products"
                }
            },
            "anomaly_detection": {
                "isolation_forest": {
                    "name": "Isolation Forest",
                    "type": "Outlier Detection",
                    "features": ["Multivariate anomaly detection", "No training on labeled data", "Contamination control"],
                    "best_for": "Detecting fraudulent or unusual orders",
                    "endpoint": "/ml/anomaly/detect-orders"
                },
                "statistical": {
                    "name": "Statistical Methods",
                    "type": "Statistical Analysis",
                    "features": ["Z-score analysis", "IQR method", "Time-series patterns"],
                    "best_for": "Inventory and dealer behavior anomalies",
                    "endpoints": ["/ml/anomaly/detect-inventory", "/ml/anomaly/detect-dealer-behavior"]
                }
            }
        },
        "total_models": 5,
        "libraries": ["Prophet", "XGBoost", "scikit-learn", "pandas", "numpy"]
    }
