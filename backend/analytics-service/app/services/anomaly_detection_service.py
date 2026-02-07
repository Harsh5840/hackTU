"""
Anomaly Detection for Supply Chain Intelligence
Identifies unusual patterns in orders, inventory, and dealer behavior
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import List, Dict
from datetime import datetime, timedelta

class AnomalyDetectionService:
    """
    Multi-method anomaly detection system:
    - Isolation Forest for multivariate anomalies
    - Statistical methods (Z-score, IQR)
    - Time-series pattern detection
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.isolation_forest = None
        
    def detect_order_anomalies(self, order_data: List[Dict], contamination: float = 0.1) -> Dict:
        """
        Detect unusual orders using Isolation Forest algorithm.
        
        Args:
            order_data: [
                {
                    'orderId': 'o1',
                    'dealerId': 'd1',
                    'totalAmount': 5000,
                    'itemCount': 10,
                    'orderDate': '2024-01-01',
                    'dealerOrderHistory': 20  # Number of previous orders
                }, ...
            ]
            contamination: Expected proportion of anomalies (default: 0.1 = 10%)
            
        Returns:
            Order data with anomaly flags and scores
        """
        if not order_data or len(order_data) < 10:
            return {'anomalies': [], 'message': 'Insufficient data for anomaly detection'}
            
        try:
            df = pd.DataFrame(order_data)
            
            # Feature Engineering
            df['avg_item_value'] = df['totalAmount'] / df['itemCount'].replace(0, 1)
            df['order_size_ratio'] = df['itemCount'] / df['dealerOrderHistory'].replace(0, 1)
            
            # Time-based features
            df['orderDate'] = pd.to_datetime(df['orderDate'])
            df['day_of_week'] = df['orderDate'].dt.dayofweek
            df['hour'] = df['orderDate'].dt.hour if 'orderDate' in df.columns else 12
            
            # Select features for anomaly detection
            feature_cols = [
                'totalAmount',
                'itemCount', 
                'avg_item_value',
                'order_size_ratio',
                'day_of_week'
            ]
            
            X = df[feature_cols].fillna(df[feature_cols].median())
            
            # Standardize
            X_scaled = self.scaler.fit_transform(X)
            
            # Apply Isolation Forest
            iso_forest = IsolationForest(
                contamination=contamination,
                random_state=42,
                n_estimators=100
            )
            
            # Predict: -1 for anomalies, 1 for normal
            df['anomaly'] = iso_forest.fit_predict(X_scaled)
            df['anomaly_score'] = iso_forest.score_samples(X_scaled)
            
            # Additional statistical checks
            df = self._add_statistical_flags(df)
            
            # Flag critical anomalies
            anomalies = df[df['anomaly'] == -1].copy()
            anomalies['severity'] = anomalies.apply(self._calculate_severity, axis=1)
            anomalies['reason'] = anomalies.apply(self._identify_anomaly_reason, axis=1)
            
            # Prepare results
            results = {
                'totalOrders': len(df),
                'anomalyCount': len(anomalies),
                'anomalyRate': round(len(anomalies) / len(df) * 100, 2),
                'anomalies': []
            }
            
            for _, row in anomalies.iterrows():
                results['anomalies'].append({
                    'orderId': row['orderId'],
                    'dealerId': row['dealerId'],
                    'totalAmount': float(row['totalAmount']),
                    'itemCount': int(row['itemCount']),
                    'anomalyScore': float(row['anomaly_score']),
                    'severity': row['severity'],
                    'reason': row['reason'],
                    'recommendedAction': self._get_anomaly_action(row['severity'])
                })
                
            return results
            
        except Exception as e:
            print(f"Anomaly detection failed: {str(e)}")
            return {'anomalies': [], 'error': str(e)}
    
    def detect_inventory_anomalies(self, inventory_data: List[Dict]) -> List[Dict]:
        """
        Detect unusual inventory patterns (sudden drops, spikes, stagnation).
        """
        if not inventory_data:
            return []
            
        try:
            df = pd.DataFrame(inventory_data)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values(['productId', 'warehouseId', 'timestamp'])
            
            anomalies = []
            
            # Group by product and warehouse
            for (product_id, warehouse_id), group in df.groupby(['productId', 'warehouseId']):
                if len(group) < 5:
                    continue
                    
                # Calculate stock changes
                group = group.copy()
                group['stock_change'] = group['quantity'].diff()
                group['stock_change_pct'] = group['stock_change'] / group['quantity'].shift(1) * 100
                
                # Detect sudden drops (> 50% decrease)
                sudden_drops = group[group['stock_change_pct'] < -50]
                
                # Detect sudden spikes (> 100% increase)
                sudden_spikes = group[group['stock_change_pct'] > 100]
                
                # Detect stagnation (no change for extended period)
                if len(group) >= 10:
                    recent_variance = group.tail(10)['quantity'].std()
                    if recent_variance < 1 and group.iloc[-1]['quantity'] < 10:
                        anomalies.append({
                            'type': 'stagnation',
                            'productId': product_id,
                            'warehouseId': warehouse_id,
                            'severity': 'medium',
                            'reason': 'Inventory has not changed recently and is low',
                            'action': 'Review demand and consider restocking or discontinuation'
                        })
                
                # Add drops to anomalies
                for _, row in sudden_drops.iterrows():
                    anomalies.append({
                        'type': 'sudden_drop',
                        'productId': product_id,
                        'warehouseId': warehouse_id,
                        'severity': 'high',
                        'timestamp': row['timestamp'].isoformat(),
                        'changePercent': float(row['stock_change_pct']),
                        'reason': f'Stock dropped by {abs(row["stock_change_pct"]):.1f}%',
                        'action': 'Investigate for data errors or unusual sales surge'
                    })
                
                # Add spikes to anomalies
                for _, row in sudden_spikes.iterrows():
                    anomalies.append({
                        'type': 'sudden_spike',
                        'productId': product_id,
                        'warehouseId': warehouse_id,
                        'severity': 'medium',
                        'timestamp': row['timestamp'].isoformat(),
                        'changePercent': float(row['stock_change_pct']),
                        'reason': f'Stock increased by {row["stock_change_pct"]:.1f}%',
                        'action': 'Verify large restock or data correction'
                    })
                    
            return anomalies
            
        except Exception as e:
            print(f"Inventory anomaly detection failed: {str(e)}")
            return []
    
    def detect_dealer_behavior_anomalies(self, dealer_metrics: List[Dict]) -> List[Dict]:
        """
        Identify dealers with unusual ordering patterns.
        """
        if not dealer_metrics or len(dealer_metrics) < 5:
            return []
            
        try:
            df = pd.DataFrame(dealer_metrics)
            
            # Calculate z-scores for key metrics
            df['order_freq_zscore'] = np.abs(
                (df['orderFrequency'] - df['orderFrequency'].mean()) / df['orderFrequency'].std()
            )
            df['order_value_zscore'] = np.abs(
                (df['avgOrderValue'] - df['avgOrderValue'].mean()) / df['avgOrderValue'].std()
            )
            df['payment_delay_zscore'] = np.abs(
                (df['avgPaymentDelay'] - df['avgPaymentDelay'].mean()) / df['avgPaymentDelay'].std()
            )
            
            # Flag dealers with z-score > 2.5 (outliers)
            anomalous_dealers = df[
                (df['order_freq_zscore'] > 2.5) | 
                (df['order_value_zscore'] > 2.5) |
                (df['payment_delay_zscore'] > 2.5)
            ]
            
            results = []
            for _, row in anomalous_dealers.iterrows():
                anomaly_type = []
                if row['order_freq_zscore'] > 2.5:
                    anomaly_type.append('unusual_order_frequency')
                if row['order_value_zscore'] > 2.5:
                    anomaly_type.append('unusual_order_value')
                if row['payment_delay_zscore'] > 2.5:
                    anomaly_type.append('unusual_payment_delay')
                    
                results.append({
                    'dealerId': row['dealerId'],
                    'anomalyTypes': anomaly_type,
                    'orderFrequency': float(row['orderFrequency']),
                    'avgOrderValue': float(row['avgOrderValue']),
                    'avgPaymentDelay': float(row['avgPaymentDelay']),
                    'severity': 'high' if len(anomaly_type) > 1 else 'medium',
                    'recommendation': self._get_dealer_anomaly_recommendation(anomaly_type)
                })
                
            return results
            
        except Exception as e:
            print(f"Dealer behavior detection failed: {str(e)}")
            return []
    
    def _add_statistical_flags(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add additional statistical anomaly flags"""
        # Z-score for order amount
        df['amount_zscore'] = np.abs(
            (df['totalAmount'] - df['totalAmount'].mean()) / df['totalAmount'].std()
        )
        df['is_amount_outlier'] = df['amount_zscore'] > 3
        
        # IQR method for item count
        Q1 = df['itemCount'].quantile(0.25)
        Q3 = df['itemCount'].quantile(0.75)
        IQR = Q3 - Q1
        df['is_itemcount_outlier'] = (
            (df['itemCount'] < Q1 - 1.5 * IQR) | 
            (df['itemCount'] > Q3 + 1.5 * IQR)
        )
        
        return df
    
    def _calculate_severity(self, row) -> str:
        """Calculate anomaly severity"""
        score = abs(row['anomaly_score'])
        
        if score > 0.5 or row['is_amount_outlier']:
            return 'critical'
        elif score > 0.3 or row['is_itemcount_outlier']:
            return 'high'
        else:
            return 'medium'
    
    def _identify_anomaly_reason(self, row) -> str:
        """Identify the main reason for anomaly"""
        reasons = []
        
        if row['is_amount_outlier']:
            reasons.append('Unusual order value')
        if row['is_itemcount_outlier']:
            reasons.append('Unusual item quantity')
        if row['order_size_ratio'] > 5:
            reasons.append('Significantly larger than dealer history')
        if row['avg_item_value'] > row['totalAmount'] / 2:
            reasons.append('Extremely high-value items')
            
        return ' | '.join(reasons) if reasons else 'Multiple unusual patterns detected'
    
    def _get_anomaly_action(self, severity: str) -> str:
        """Get recommended action based on severity"""
        actions = {
            'critical': 'URGENT: Verify order authenticity and payment method',
            'high': 'Review order details and contact dealer for confirmation',
            'medium': 'Monitor order processing, flag for review if issues arise'
        }
        return actions.get(severity, 'Monitor')
    
    def _get_dealer_anomaly_recommendation(self, anomaly_types: List[str]) -> str:
        """Get recommendation for dealer anomalies"""
        if 'unusual_payment_delay' in anomaly_types:
            return 'Review credit terms and payment history'
        elif 'unusual_order_frequency' in anomaly_types:
            return 'Contact dealer to understand ordering pattern changes'
        elif 'unusual_order_value' in anomaly_types:
            return 'Verify dealer business growth or potential issues'
        else:
            return 'Schedule account review with dealer'

anomaly_detection_service = AnomalyDetectionService()
