"""
Product Clustering & Segmentation using K-Means
Groups similar products for optimized inventory management
"""

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from typing import List, Dict

class ProductClusteringService:
    """
    Advanced product segmentation using multiple ML techniques:
    - K-Means clustering for product grouping
    - PCA for dimensionality reduction
    - Feature engineering from sales patterns
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.pca = None
        self.kmeans_model = None
        
    def segment_products(self, product_data: List[Dict], n_clusters: int = 4) -> List[Dict]:
        """
        Cluster products based on sales patterns, velocity, and value.
        
        Args:
            product_data: [
                {
                    'productId': 'p1',
                    'totalSales': 5000,
                    'orderCount': 25,
                    'avgOrderValue': 200,
                    'pricePerUnit': 50,
                    'currentStock': 100
                }, ...
            ]
            n_clusters: Number of clusters (default: 4)
            
        Returns:
            Product data with cluster assignments and insights
        """
        if not product_data or len(product_data) < n_clusters:
            return []
            
        try:
            df = pd.DataFrame(product_data)
            
            # Feature Engineering
            df['revenue_per_order'] = df['totalSales'] / df['orderCount'].replace(0, 1)
            df['stock_turnover'] = df['orderCount'] / df['currentStock'].replace(0, 1)
            df['velocity_score'] = df['orderCount'] * df['avgOrderValue']
            df['value_category'] = df['pricePerUnit'] * df['currentStock']
            
            # Select features for clustering
            feature_cols = [
                'totalSales', 
                'orderCount', 
                'avgOrderValue',
                'revenue_per_order',
                'stock_turnover',
                'velocity_score',
                'value_category'
            ]
            
            X = df[feature_cols].fillna(0)
            
            # Standardize features
            X_scaled = self.scaler.fit_transform(X)
            
            # Apply K-Means
            kmeans = KMeans(n_clusters=min(n_clusters, len(df)), random_state=42, n_init=10)
            df['cluster'] = kmeans.fit_predict(X_scaled)
            
            # Calculate cluster characteristics
            cluster_profiles = self._profile_clusters(df)
            
            # Assign meaningful labels
            df['segment_name'] = df['cluster'].map(cluster_profiles)
            
            # Prepare results
            results = []
            for _, row in df.iterrows():
                results.append({
                    'productId': row['productId'],
                    'cluster': int(row['cluster']),
                    'segment': cluster_profiles[row['cluster']],
                    'velocityScore': float(row['velocity_score']),
                    'stockTurnover': float(row['stock_turnover']),
                    'recommendations': self._get_cluster_recommendations(row['cluster'], cluster_profiles)
                })
                
            # Add cluster summary
            cluster_summary = self._generate_cluster_summary(df, cluster_profiles)
            
            return {
                'products': results,
                'clusterSummary': cluster_summary,
                'totalClusters': n_clusters,
                'algorithm': 'K-Means'
            }
            
        except Exception as e:
            print(f"Clustering failed: {str(e)}")
            return []
    
    def _profile_clusters(self, df: pd.DataFrame) -> Dict[int, str]:
        """Assign meaningful names to clusters based on characteristics"""
        cluster_means = df.groupby('cluster').agg({
            'totalSales': 'mean',
            'orderCount': 'mean',
            'stock_turnover': 'mean',
            'velocity_score': 'mean'
        })
        
        # Rank clusters by performance
        cluster_means['performance_score'] = (
            cluster_means['totalSales'] * 0.4 +
            cluster_means['orderCount'] * 0.3 +
            cluster_means['velocity_score'] * 0.3
        )
        
        cluster_means = cluster_means.sort_values('performance_score', ascending=False)
        
        labels = {}
        cluster_list = cluster_means.index.tolist()
        
        if len(cluster_list) >= 4:
            labels[cluster_list[0]] = "Star Products" # High value, high velocity
            labels[cluster_list[1]] = "Growth Potential" # Medium-high performance
            labels[cluster_list[2]] = "Steady Performers" # Consistent but moderate
            labels[cluster_list[3]] = "Review Needed" # Low performance
        elif len(cluster_list) == 3:
            labels[cluster_list[0]] = "Top Performers"
            labels[cluster_list[1]] = "Average Performers"
            labels[cluster_list[2]] = "Underperformers"
        elif len(cluster_list) == 2:
            labels[cluster_list[0]] = "High Performers"
            labels[cluster_list[1]] = "Low Performers"
        else:
            labels[cluster_list[0]] = "Single Cluster"
            
        return labels
    
    def _get_cluster_recommendations(self, cluster: int, profiles: Dict[int, str]) -> List[str]:
        """Generate actionable recommendations based on cluster"""
        segment = profiles.get(cluster, "Unknown")
        
        recommendations = {
            "Star Products": [
                "Prioritize inventory replenishment",
                "Increase marketing budget allocation",
                "Ensure consistent stock availability"
            ],
            "Growth Potential": [
                "Test promotional campaigns",
                "Monitor for upward trends",
                "Optimize pricing strategy"
            ],
            "Steady Performers": [
                "Maintain current stock levels",
                "Standard reorder procedures",
                "Monitor for changes"
            ],
            "Review Needed": [
                "Consider liquidation",
                "Reduce inventory levels",
                "Analyze whether to discontinue"
            ],
            "Top Performers": [
                "Maximize availability",
                "Premium placement in catalog"
            ],
            "Average Performers": [
                "Maintain regular oversight",
                "Look for improvement opportunities"
            ],
            "Underperformers": [
                "Evaluate continuation",
                "Reduce stock commitment"
            ]
        }
        
        return recommendations.get(segment, ["Monitor performance"])
    
    def _generate_cluster_summary(self, df: pd.DataFrame, profiles: Dict[int, str]) -> List[Dict]:
        """Generate summary statistics for each cluster"""
        summary = []
        
        for cluster_id, segment_name in profiles.items():
            cluster_data = df[df['cluster'] == cluster_id]
            
            if len(cluster_data) > 0:
                summary.append({
                    'clusterId': int(cluster_id),
                    'segmentName': segment_name,
                    'productCount': len(cluster_data),
                    'avgSales': float(cluster_data['totalSales'].mean()),
                    'avgOrderCount': float(cluster_data['orderCount'].mean()),
                    'totalRevenue': float(cluster_data['totalSales'].sum())
                })
                
        return sorted(summary, key=lambda x: x['totalRevenue'], reverse=True)
    
    def optimize_cluster_count(self, product_data: List[Dict], max_clusters: int = 8) -> Dict:
        """
        Use Elbow Method to find optimal number of clusters
        """
        if not product_data or len(product_data) < 3:
            return {'optimal_clusters': 2}
            
        try:
            df = pd.DataFrame(product_data)
            
            # Feature Engineering (same as segment_products)
            df['revenue_per_order'] = df['totalSales'] / df['orderCount'].replace(0, 1)
            df['stock_turnover'] = df['orderCount'] / df['currentStock'].replace(0, 1)
            df['velocity_score'] = df['orderCount'] * df['avgOrderValue']
            
            feature_cols = ['totalSales', 'orderCount', 'avgOrderValue', 
                          'revenue_per_order', 'stock_turnover', 'velocity_score']
            
            X = df[feature_cols].fillna(0)
            X_scaled = self.scaler.fit_transform(X)
            
            # Calculate inertia for different cluster counts
            inertias = []
            K_range = range(2, min(max_clusters + 1, len(df)))
            
            for k in K_range:
                kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
                kmeans.fit(X_scaled)
                inertias.append(kmeans.inertia_)
            
            # Find elbow point (simple method: maximum distance from line)
            if len(inertias) > 2:
                # Calculate rate of change
                differences = np.diff(inertias)
                optimal_k = int(np.argmax(differences) + 2)  # +2 due to range starting at 2
            else:
                optimal_k = 3
            
            return {
                'optimal_clusters': optimal_k,
                'tested_range': list(K_range),
                'inertia_values': inertias,
                'recommendation': f'Use {optimal_k} clusters for optimal segmentation'
            }
            
        except Exception as e:
            print(f"Elbow optimization failed: {str(e)}")
            return {'optimal_clusters': 4}

product_clustering_service = ProductClusteringService()
