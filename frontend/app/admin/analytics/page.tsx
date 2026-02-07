'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { AlertCircle, TrendingUp, TrendingDown, Package, MapPin, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface StockClassification {
  fastMoving: Array<{ id: string; sku: string; name: string; orderCount: number }>;
  slowMoving: Array<{ id: string; sku: string; name: string; orderCount: number }>;
  deadStock: Array<{ id: string; sku: string; name: string; orderCount: number }>;
  summary: {
    fastMovingCount: number;
    slowMovingCount: number;
    deadStockCount: number;
  };
}

interface LowStockAlert {
  productId: string;
  warehouseId: string;
  currentStock: number;
  reorderLevel: number;
  severity: 'critical' | 'warning';
}

interface RegionalSales {
  regions: Array<{
    state: string;
    totalSales: number;
    orderCount: number;
  }>;
  totalRegions: number;
}

interface DemandForecast {
  forecast: Array<{
    productId: string;
    productName: string;
    avgDailyDemand: number;
    forecastedDemand: number;
    forecastDays: number;
  }>;
  period: string;
}

export default function AnalyticsPage() {
  const [stockClassification, setStockClassification] = useState<StockClassification | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [regionalSales, setRegionalSales] = useState<RegionalSales | null>(null);
  const [demandForecast, setDemandForecast] = useState<DemandForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [classificationRes, alertsRes, regionalRes, forecastRes] = await Promise.all([
          api.getStockClassification(),
          api.getLowStockAlerts(20),
          api.getRegionalSales(),
          api.getDemandForecastSimple(7),
        ]);

        if (classificationRes.success) {
          setStockClassification(classificationRes.data);
        }
        if (alertsRes.success) {
          setLowStockAlerts(alertsRes.data);
        }
        if (regionalRes.success) {
          setRegionalSales(regionalRes.data);
        }
        if (forecastRes.success) {
          setDemandForecast(forecastRes.data);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Supply Chain Analytics</h1>
      </div>

      {/* Stock Classification Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fast-Moving Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stockClassification?.summary.fastMovingCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">High demand products (≥50 units)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slow-Moving Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stockClassification?.summary.slowMovingCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Low demand products (1-49 units)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dead Stock</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stockClassification?.summary.deadStockCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">No orders (30 days)</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle>Low Stock Alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {lowStockAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No low stock alerts at this time.</p>
          ) : (
            <div className="space-y-2">
              {lowStockAlerts.slice(0, 10).map((alert, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                      className={alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                    >
                      {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">Product: {alert.productId}</p>
                      <p className="text-xs text-muted-foreground">Warehouse: {alert.warehouseId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{alert.currentStock} units</p>
                    <p className="text-xs text-muted-foreground">Reorder at: {alert.reorderLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regional Sales Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-mc-purple" />
            <CardTitle>Regional Sales Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {regionalSales && regionalSales.regions.length > 0 ? (
            <>
              <div className="mb-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={regionalSales.regions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="totalSales" fill="#8b5cf6" name="Total Sales" />
                    <Bar dataKey="orderCount" fill="#a78bfa" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {regionalSales.regions.map((region, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="text-sm font-medium">{region.state}</p>
                      <p className="text-xs text-muted-foreground">{region.orderCount} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹{region.totalSales.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No regional sales data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Demand Forecast */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <CardTitle>7-Day Demand Forecast</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {demandForecast && demandForecast.forecast.length > 0 ? (
            <div className="space-y-3">
              {demandForecast.forecast.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      Avg daily: {item.avgDailyDemand} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{item.forecastedDemand} units</p>
                    <p className="text-xs text-muted-foreground">Next {item.forecastDays} days</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No forecast data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Stock Classification Details */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Fast-Moving Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fast-Moving Products</CardTitle>
          </CardHeader>
          <CardContent>
            {stockClassification?.fastMoving.length === 0 ? (
              <p className="text-xs text-muted-foreground">No fast-moving products.</p>
            ) : (
              <div className="space-y-2">
                {stockClassification?.fastMoving.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex justify-between text-xs">
                    <span className="truncate">{product.name}</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {product.orderCount}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slow-Moving Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Slow-Moving Products</CardTitle>
          </CardHeader>
          <CardContent>
            {stockClassification?.slowMoving.length === 0 ? (
              <p className="text-xs text-muted-foreground">No slow-moving products.</p>
            ) : (
              <div className="space-y-2">
                {stockClassification?.slowMoving.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex justify-between text-xs">
                    <span className="truncate">{product.name}</span>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      {product.orderCount}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dead Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dead Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {stockClassification?.deadStock.length === 0 ? (
              <p className="text-xs text-muted-foreground">No dead stock.</p>
            ) : (
              <div className="space-y-2">
                {stockClassification?.deadStock.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex justify-between text-xs">
                    <span className="truncate">{product.name}</span>
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      0
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
