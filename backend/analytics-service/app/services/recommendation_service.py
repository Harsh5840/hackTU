import pandas as pd
import numpy as np

class RecommendationService:
    def recommend_stock(self, inventory_data: list[dict], sales_velocity: list[dict]):
        """
        Stock Recommendations based on Days of Supply and Sales Velocity.
        
        Input:
        - inventory_data: [{'productId': 'p1', 'warehouseId': 'w1', 'currentStock': 50}, ...]
        - sales_velocity: [{'productId': 'p1', 'avgDailySales': 5}, ...]
        """
        inventory_df = pd.DataFrame(inventory_data)
        velocity_df = pd.DataFrame(sales_velocity)
        
        if inventory_df.empty or velocity_df.empty:
            return []
            
        # Merge
        df = pd.merge(inventory_df, velocity_df, on='productId', how='left')
        df['avgDailySales'] = df['avgDailySales'].fillna(0)
        
        # Calculate Days of Supply (DoS)
        # Avoid division by zero
        df['days_of_supply'] = np.where(
            df['avgDailySales'] > 0, 
            df['currentStock'] / df['avgDailySales'], 
            999 # Infinite supply if no sales
        )
        
        recommendations = []
        
        for _, row in df.iterrows():
            status = 'OK'
            action = 'NONE'
            quantity = 0
            
            # Logic: Target 30 Days of Supply
            TARGET_DOS = 30
            MIN_DOS = 7
            
            if row['days_of_supply'] < MIN_DOS:
                status = 'CRITICAL_LOW'
                action = 'RESTOCK_URGENT'
                # Quantity to reach Target
                shortage_days = TARGET_DOS - row['days_of_supply']
                quantity = int(shortage_days * row['avgDailySales'])
                
            elif row['days_of_supply'] < TARGET_DOS:
                status = 'LOW'
                action = 'RESTOCK'
                shortage_days = TARGET_DOS - row['days_of_supply']
                quantity = int(shortage_days * row['avgDailySales'])
                
            elif row['days_of_supply'] > (TARGET_DOS * 3):
                status = 'OVERSTOCK'
                action = 'LIQUIDATE'
            
            if action != 'NONE':
                recommendations.append({
                    'warehouseId': row['warehouseId'],
                    'productId': row['productId'],
                    'currentStock': int(row['currentStock']),
                    'avgDailySales': float(row['avgDailySales']),
                    'daysOfSupply': float(round(row['days_of_supply'], 1)),
                    'status': status,
                    'recommendedAction': action,
                    'recommendedQuantity': quantity
                })
                
        return recommendations

recommendation_service = RecommendationService()
