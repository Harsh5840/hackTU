'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ForecastData {
  date: string;
  predicted_quantity: number;
}

interface StockRecommendation {
  productId: string;
  warehouseId: string;
  recommendedQuantity: number;
  reason: string;
  priority: string;
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [timeRange, setTimeRange] = useState('30');
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);

  // Mock data for sales trends
  const salesTrendData = [
    { month: 'Jan', sales: 45000 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 48000 },
    { month: 'Apr', sales: 61000 },
    { month: 'May', sales: 55000 },
    { month: 'Jun', sales: 67000 },
  ];

  // Mock data for product category distribution
  const categoryData = [
    { name: 'Interior Paints', value: 35, fill: '#3B82F6' },
    { name: 'Exterior Paints', value: 25, fill: '#6366F1' },
    { name: 'Wood Finishes', value: 20, fill: '#10B981' },
    { name: 'Primers', value: 20, fill: '#F59E0B' },
  ];

  // Mock warehouse inventory distribution
  const warehouseData = [
    { warehouse: 'Mumbai', inventory: 2500, capacity: 10000 },
    { warehouse: 'Delhi', inventory: 4200, capacity: 15000 },
    { warehouse: 'Bangalore', inventory: 3100, capacity: 8000 },
  ];

  // Mock demand forecast
  const mockForecast = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() + i * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predicted_quantity: Math.floor(Math.random() * 50) + 30,
  }));

  // Mock recommendations
  const mockRecommendations: StockRecommendation[] = [
    {
      productId: 'P-100',
      warehouseId: 'WH-MUM-01',
      recommendedQuantity: 500,
      reason: 'Low stock relative to demand',
      priority: 'HIGH',
    },
    {
      productId: 'P-200',
      warehouseId: 'WH-DEL-01',
      recommendedQuantity: 300,
      reason: 'Approaching reorder point',
      priority: 'MEDIUM',
    },
    {
      productId: 'P-101',
      warehouseId: 'WH-BLR-01',
      recommendedQuantity: 200,
      reason: 'Seasonal demand increase',
      priority: 'MEDIUM',
    },
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedProduct, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      // Simulate API calls
      setForecastData(mockForecast);
      setRecommendations(mockRecommendations);
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444'];

  if (isLoading && forecastData.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product
            </label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="P-100">Ultra White Satin</SelectItem>
                <SelectItem value="P-101">Royal Blue Matt</SelectItem>
                <SelectItem value="P-200">WeatherShield White</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={loadAnalyticsData}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales (30 days)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹3,28,000</p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp size={16} /> 12.5% increase
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Order Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹12,500</p>
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <TrendingDown size={16} /> 2.3% decrease
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Inventory Turnover</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">4.2x</p>
              <p className="text-sm text-gray-600 mt-2">Per month average</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesTrendData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Sales by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Demand Forecast */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Demand Forecast (Next 30 Days)
        </h2>
        {forecastData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="predicted_quantity"
                stroke="#6366F1"
                strokeWidth={2}
                dot={false}
                name="Predicted Quantity"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No forecast data available
          </div>
        )}
      </Card>

      {/* Warehouse Inventory Distribution */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Warehouse Inventory Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={warehouseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="warehouse" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="inventory" fill="#3B82F6" name="Current Inventory" />
            <Bar dataKey="capacity" fill="#E5E7EB" name="Total Capacity" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Stock Recommendations */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Stock Recommendations
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Product ID
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Warehouse
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">
                  Recommended Qty
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Reason
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {rec.productId}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{rec.warehouseId}</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {rec.recommendedQuantity} units
                  </td>
                  <td className="py-3 px-4 text-gray-600">{rec.reason}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        rec.priority === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : rec.priority === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
