'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ label, value, icon, color }: MetricCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  basePrice: number;
  discountPercentage: number;
  sellingPrice: number;
  mrp: number;
  unit: string;
  minOrderQuantity: number;
  packSize: number;
  finishType: string;
  shadeCode: string;
  hexColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  dealerId: string;
  status: string;
  totalAmount: number | string;
  taxAmount: number | string;
  discountAmount: number | string;
  finalAmount: number | string;
  paymentMethod: string;
  paymentStatus: string;
  items?: Array<{
    productId: string;
    quantity: number;
  }>;
  createdAt: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  totalCapacity: number;
  currentUtilization: number;
  isActive: boolean;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dealerCount, setDealerCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, ordersRes, warehousesRes, dealersRes] = await Promise.all([
          api.getProducts(),
          api.getOrders({ limit: 100 }),
          api.getWarehouses(),
          api.getDealers({ limit: 1000 }),
        ]);

        if (productsRes.success) {
          setProducts(productsRes.data);
          // Count products with low stock (simple heuristic: inactive products)
          setLowStockCount(productsRes.data.filter((p: any) => !p.isActive).length);
        }

        if (ordersRes.success) {
          setOrders(ordersRes.data);
        }

        if (warehousesRes.success) {
          setWarehouses(warehousesRes.data);
        }

        if (dealersRes.success) {
          // Count active dealers (accountStatus = ACTIVE or null/undefined)
          setDealerCount(dealersRes.data.filter((d: any) => !d.accountStatus || d.accountStatus === 'ACTIVE').length);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Revenue data - calculate from last 7 days of orders
  const revenueData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return last7Days.map((date) => {
      const dayOrders = orders.filter((order) => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      const revenue = dayOrders.reduce((sum, order) => {
        if (!order.finalAmount) return sum;
        const amount = typeof order.finalAmount === 'string' ? parseFloat(order.finalAmount) : order.finalAmount;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      return {
        date: dayLabels[date.getDay()],
        revenue: Math.round(revenue),
      };
    });
  }, [orders]);

  // Top products data - count from order items
  const topProductsData = React.useMemo(() => {
    const productCounts: Record<string, { name: string; sales: number }> = {};

    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (!item.productId || !item.quantity) return;
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            if (!productCounts[product.id]) {
              productCounts[product.id] = {
                name: product.name ? product.name.substring(0, 15) : 'Unknown',
                sales: 0,
              };
            }
            productCounts[product.id].sales += item.quantity;
          }
        });
      }
    });

    return Object.values(productCounts)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders, products]);

  // Order status distribution - count from actual orders
  const orderStatusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      PENDING: 0,
      APPROVED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
    };

    orders.forEach((order) => {
      if (order.status) {
        const status = order.status.toUpperCase();
        if (status in counts) {
          counts[status]++;
        }
      }
    });

    return counts;
  }, [orders]);

  // Warehouse utilization
  const warehouseData = warehouses
    .filter((w) => w.code && typeof w.currentUtilization === 'number')
    .map((w) => ({
      name: w.code,
      utilization: w.currentUtilization,
    }));

  const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Orders"
          value={orders.length}
          icon={<ShoppingCart className="text-white" size={24} />}
          color="bg-blue-500"
        />
        <MetricCard
          label="Active Dealers"
          value={dealerCount}
          icon={<Users className="text-white" size={24} />}
          color="bg-indigo-500"
        />
        <MetricCard
          label="Products"
          value={products.length}
          icon={<Package className="text-white" size={24} />}
          color="bg-green-500"
        />
        <MetricCard
          label="Low Stock Alerts"
          value={lowStockCount}
          icon={<AlertTriangle className="text-white" size={24} />}
          color="bg-red-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Products</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Order Status Distribution */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status Distribution</h2>
        <div className="space-y-3">
          {['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'].map((status, i) => {
            const count = orderStatusCounts[status] || 0;
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm text-gray-600">{status}</span>
                </div>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Orders */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Order #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{order.orderNumber || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                    {order.finalAmount 
                      ? `₹${formatPrice(typeof order.finalAmount === 'string' ? parseFloat(order.finalAmount) : order.finalAmount)}`
                      : '₹0'
                    }
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'APPROVED'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status || 'PENDING'}
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
