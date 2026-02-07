import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

class ForecastService:
    def predict_demand(self, sales_data: list[dict]):
        """
        Simple forecasting using Linear Regression for demonstration.
        In production, use Prophet or ARIMA.
        Input: [{'date': '2024-01-01', 'quantity': 100}, ...]
        """
        if not sales_data:
            return []
            
        df = pd.DataFrame(sales_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Feature Engineering: Days since start
        df['days'] = (df['date'] - df['date'].min()).dt.days
        
        X = df[['days']]
        y = df['quantity']
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Forecast for next 30 days
        last_day = df['days'].max()
        future_days = np.array(range(last_day + 1, last_day + 31)).reshape(-1, 1)
        
        predictions = model.predict(future_days)
        
        forecast = []
        start_date = df['date'].max()
        for i, pred in enumerate(predictions):
            future_date = start_date + pd.Timedelta(days=i + 1)
            forecast.append({
                'date': future_date.isoformat(),
                'predicted_quantity': int(max(0, pred)) # No negative demand
            })
            
        return forecast

forecast_service = ForecastService()
