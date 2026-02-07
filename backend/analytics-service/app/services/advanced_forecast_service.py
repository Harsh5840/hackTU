"""
Advanced Demand Forecasting using Prophet (Meta/Facebook)
Industry-standard time-series forecasting with automatic seasonality detection
"""

import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, timedelta
import logging

# Suppress Prophet's verbose logging
logging.getLogger('prophet').setLevel(logging.WARNING)
logging.getLogger('cmdstanpy').setLevel(logging.WARNING)

class AdvancedForecastService:
    """
    Prophet-based forecasting system that handles:
    - Automatic seasonality detection (daily, weekly, yearly)
    - Trend changes and growth patterns
    - Holiday effects (can be extended)
    - Uncertainty intervals (confidence bands)
    """
    
    def __init__(self):
        self.model = None
        
    def predict_demand_prophet(self, sales_data: list[dict], forecast_days: int = 30):
        """
        Forecast demand using Facebook Prophet with seasonality.
        
        Args:
            sales_data: [{'date': '2024-01-01', 'quantity': 100}, ...]
            forecast_days: Number of days to forecast ahead
            
        Returns:
            List of predictions with confidence intervals
        """
        if not sales_data or len(sales_data) < 7:
            # Need at least 7 days for Prophet
            return self._fallback_forecast(sales_data, forecast_days)
            
        try:
            # Prepare data for Prophet (requires 'ds' and 'y' columns)
            df = pd.DataFrame(sales_data)
            df['date'] = pd.to_datetime(df['date'])
            df = df.groupby('date')['quantity'].sum().reset_index()
            df.columns = ['ds', 'y']
            df = df.sort_values('ds')
            
            # Configure Prophet
            model = Prophet(
                daily_seasonality=True if len(df) > 14 else False,
                weekly_seasonality=True if len(df) > 14 else False,
                yearly_seasonality=False,  # Not enough data typically
                changepoint_prior_scale=0.05,  # More flexible trend
                seasonality_prior_scale=10.0,
                interval_width=0.95  # 95% confidence interval
            )
            
            # Fit model
            model.fit(df)
            
            # Create future dataframe
            future = model.make_future_dataframe(periods=forecast_days)
            
            # Predict
            forecast = model.predict(future)
            
            # Extract only future predictions
            last_date = df['ds'].max()
            future_forecast = forecast[forecast['ds'] > last_date]
            
            # Format results
            predictions = []
            for _, row in future_forecast.iterrows():
                predictions.append({
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'predicted_quantity': int(max(0, row['yhat'])),  # No negative demand
                    'lower_bound': int(max(0, row['yhat_lower'])),
                    'upper_bound': int(max(0, row['yhat_upper'])),
                    'trend': float(row['trend']),
                    'confidence': 0.95
                })
                
            return predictions
            
        except Exception as e:
            print(f"Prophet forecast failed: {str(e)}, using fallback")
            return self._fallback_forecast(sales_data, forecast_days)
    
    def predict_with_features(self, sales_data: list[dict], features: dict, forecast_days: int = 30):
        """
        Enhanced forecasting with additional features (price, promotions, etc.)
        Uses XGBoost for multi-feature prediction
        """
        try:
            from xgboost import XGBRegressor
            from sklearn.preprocessing import StandardScaler
            
            if not sales_data or len(sales_data) < 10:
                return self.predict_demand_prophet(sales_data, forecast_days)
            
            df = pd.DataFrame(sales_data)
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            # Feature Engineering
            df['day_of_week'] = df['date'].dt.dayofweek
            df['day_of_month'] = df['date'].dt.day
            df['month'] = df['date'].dt.month
            df['days_since_start'] = (df['date'] - df['date'].min()).dt.days
            
            # Add lag features (yesterday's demand)
            df['lag_1'] = df['quantity'].shift(1)
            df['lag_7'] = df['quantity'].shift(7)
            df['rolling_avg_7'] = df['quantity'].rolling(window=7, min_periods=1).mean()
            
            # Drop NaN from lag features
            df = df.fillna(df['quantity'].mean())
            
            feature_cols = ['day_of_week', 'day_of_month', 'month', 'days_since_start', 
                           'lag_1', 'lag_7', 'rolling_avg_7']
            
            X = df[feature_cols]
            y = df['quantity']
            
            # Train model
            model = XGBRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
            model.fit(X, y)
            
            # Generate future predictions
            predictions = []
            last_date = df['date'].max()
            last_quantity = df['quantity'].iloc[-1]
            last_lag_7 = df['quantity'].iloc[-7] if len(df) >= 7 else last_quantity
            rolling_avg = df['quantity'].tail(7).mean()
            
            for i in range(1, forecast_days + 1):
                future_date = last_date + timedelta(days=i)
                
                future_features = {
                    'day_of_week': future_date.dayofweek,
                    'day_of_month': future_date.day,
                    'month': future_date.month,
                    'days_since_start': (future_date - df['date'].min()).days,
                    'lag_1': last_quantity,
                    'lag_7': last_lag_7,
                    'rolling_avg_7': rolling_avg
                }
                
                X_future = pd.DataFrame([future_features])
                pred = model.predict(X_future)[0]
                
                predictions.append({
                    'date': future_date.strftime('%Y-%m-%d'),
                    'predicted_quantity': int(max(0, pred)),
                    'model': 'XGBoost',
                    'confidence': 0.85
                })
                
                # Update for next iteration
                last_quantity = pred
                
            return predictions
            
        except Exception as e:
            print(f"XGBoost forecast failed: {str(e)}, falling back to Prophet")
            return self.predict_demand_prophet(sales_data, forecast_days)
    
    def _fallback_forecast(self, sales_data: list[dict], forecast_days: int):
        """Simple moving average fallback for insufficient data"""
        if not sales_data:
            return []
            
        df = pd.DataFrame(sales_data)
        avg_quantity = df['quantity'].mean()
        
        predictions = []
        if sales_data:
            last_date = pd.to_datetime(df['date'].max())
        else:
            last_date = datetime.now()
            
        for i in range(1, forecast_days + 1):
            future_date = last_date + timedelta(days=i)
            predictions.append({
                'date': future_date.strftime('%Y-%m-%d'),
                'predicted_quantity': int(max(0, avg_quantity)),
                'model': 'MovingAverage',
                'note': 'Insufficient data for Prophet/XGBoost'
            })
            
        return predictions
    
    def get_forecast_accuracy(self, sales_data: list[dict], test_size: int = 7):
        """
        Calculate forecast accuracy using MAPE (Mean Absolute Percentage Error)
        """
        if len(sales_data) < test_size + 7:
            return None
            
        # Split data
        train_data = sales_data[:-test_size]
        test_data = sales_data[-test_size:]
        
        # Generate forecast
        forecast = self.predict_demand_prophet(train_data, forecast_days=test_size)
        
        # Calculate MAPE
        actual = [d['quantity'] for d in test_data]
        predicted = [f['predicted_quantity'] for f in forecast[:test_size]]
        
        mape = np.mean([abs(a - p) / max(a, 1) for a, p in zip(actual, predicted)]) * 100
        
        return {
            'mape': round(mape, 2),
            'accuracy': round(100 - mape, 2),
            'interpretation': 'Excellent' if mape < 10 else 'Good' if mape < 20 else 'Fair'
        }

advanced_forecast_service = AdvancedForecastService()
