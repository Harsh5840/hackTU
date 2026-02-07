from typing import List, Dict, Any
from datetime import datetime, timedelta
import httpx
import os

ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://order-service:3003")
INVENTORY_SERVICE_URL = os.getenv("INVENTORY_SERVICE_URL", "http://inventory-service:3002")
DEALER_SERVICE_URL = os.getenv("DEALER_SERVICE_URL", "http://dealer-service:3004")

async def get_stock_classification() -> Dict[str, Any]:
    """Classify products as fast-moving, slow-moving, or dead stock"""
    async with httpx.AsyncClient() as client:
        # Fetch products and orders
        products_res = await client.get(f"{INVENTORY_SERVICE_URL}/api/inventory/products")
        orders_res = await client.get(f"{ORDER_SERVICE_URL}/api/orders?limit=1000")
        
        if products_res.status_code != 200 or orders_res.status_code != 200:
            return {"error": "Failed to fetch data"}
        
        products = products_res.json().get("data", [])
        orders = orders_res.json().get("data", [])
        
        # Calculate order frequency per product (last 30 days)
        from datetime import timezone
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        product_order_count = {}
        
        for order in orders:
            if "items" in order and order["items"]:
                order_date = datetime.fromisoformat(order["createdAt"].replace("Z", "+00:00"))
                if order_date >= thirty_days_ago:
                    for item in order["items"]:
                        product_id = item.get("productId", "")
                        product_order_count[product_id] = product_order_count.get(product_id, 0) + int(item.get("quantity", 0))
        
        # Classify products
        fast_moving = []
        slow_moving = []
        dead_stock = []
        
        for product in products:
            product_id = product.get("sku", "")
            order_qty = product_order_count.get(product_id, 0)
            
            product_info = {
                "id": product.get("id"),
                "sku": product_id,
                "name": product.get("name"),
                "orderCount": order_qty,
                "isActive": product.get("isActive", True)
            }
            
            if order_qty >= 50:  # High demand
                fast_moving.append(product_info)
            elif order_qty > 0 and order_qty < 50:  # Low demand
                slow_moving.append(product_info)
            else:  # No orders
                dead_stock.append(product_info)
        
        return {
            "fastMoving": sorted(fast_moving, key=lambda x: x["orderCount"], reverse=True),
            "slowMoving": sorted(slow_moving, key=lambda x: x["orderCount"], reverse=True),
            "deadStock": dead_stock,
            "summary": {
                "fastMovingCount": len(fast_moving),
                "slowMovingCount": len(slow_moving),
                "deadStockCount": len(dead_stock)
            }
        }

async def get_low_stock_alerts(threshold: int = 20) -> List[Dict[str, Any]]:
    """Get products with inventory below threshold"""
    async with httpx.AsyncClient() as client:
        # Fetch inventory data
        inventory_res = await client.get(f"{INVENTORY_SERVICE_URL}/api/inventory")
        
        if inventory_res.status_code != 200:
            return []
        
        inventory_data = inventory_res.json().get("data", [])
        
        low_stock_items = []
        for item in inventory_data:
            if item.get("currentStock", 0) <= threshold:
                low_stock_items.append({
                    "productId": item.get("productId"),
                    "warehouseId": item.get("warehouseId"),
                    "currentStock": item.get("currentStock", 0),
                    "reorderLevel": threshold,
                    "severity": "critical" if item.get("currentStock", 0) <= 5 else "warning"
                })
        
        return sorted(low_stock_items, key=lambda x: x["currentStock"])

async def get_regional_sales() -> Dict[str, Any]:
    """Get sales distribution by dealer region"""
    async with httpx.AsyncClient() as client:
        orders_res = await client.get(f"{ORDER_SERVICE_URL}/api/orders?limit=1000")
        dealers_res = await client.get(f"{DEALER_SERVICE_URL}/api/dealers?limit=1000")
        
        if orders_res.status_code != 200 or dealers_res.status_code != 200:
            return {"regions": []}
        
        orders = orders_res.json().get("data", [])
        dealers = dealers_res.json().get("data", [])
        
        # Map dealer IDs to states
        dealer_state_map = {d.get("userId", d.get("id")): d.get("state", "Unknown") for d in dealers}
        
        # Aggregate sales by state
        state_sales = {}
        for order in orders:
            dealer_id = order.get("dealerId", "")
            state = dealer_state_map.get(dealer_id, "Unknown")
            amount = float(order.get("totalAmount", 0))
            
            if state not in state_sales:
                state_sales[state] = {"state": state, "totalSales": 0, "orderCount": 0}
            
            state_sales[state]["totalSales"] += amount
            state_sales[state]["orderCount"] += 1
        
        regions = sorted(state_sales.values(), key=lambda x: x["totalSales"], reverse=True)
        
        return {
            "regions": regions,
            "totalRegions": len(regions)
        }

async def get_demand_forecast(days: int = 7) -> Dict[str, Any]:
    """Simple demand forecast based on historical average"""
    async with httpx.AsyncClient() as client:
        orders_res = await client.get(f"{ORDER_SERVICE_URL}/api/orders?limit=1000")
        products_res = await client.get(f"{INVENTORY_SERVICE_URL}/api/inventory/products")
        
        if orders_res.status_code != 200 or products_res.status_code != 200:
            return {"forecast": []}
        
        orders = orders_res.json().get("data", [])
        products = products_res.json().get("data", [])
        
        # Calculate average daily orders for last 30 days
        from datetime import timezone
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        daily_product_demand = {}
        
        for order in orders:
            order_date = datetime.fromisoformat(order["createdAt"].replace("Z", "+00:00"))
            if order_date >= thirty_days_ago and "items" in order:
                for item in order["items"]:
                    product_id = item.get("productId", "")
                    qty = int(item.get("quantity", 0))
                    
                    if product_id not in daily_product_demand:
                        daily_product_demand[product_id] = []
                    daily_product_demand[product_id].append(qty)
        
        # Calculate average and forecast
        forecast_data = []
        for product in products[:10]:  # Top 10 products
            product_id = product.get("sku", "")
            demands = daily_product_demand.get(product_id, [])
            
            if demands:
                avg_daily = sum(demands) / len(demands)
                forecast_qty = int(avg_daily * days)
            else:
                avg_daily = 0
                forecast_qty = 0
            
            forecast_data.append({
                "productId": product_id,
                "productName": product.get("name"),
                "avgDailyDemand": round(avg_daily, 2),
                "forecastedDemand": forecast_qty,
                "forecastDays": days
            })
        
        return {
            "forecast": sorted(forecast_data, key=lambda x: x["forecastedDemand"], reverse=True),
            "period": f"{days} days"
        }
