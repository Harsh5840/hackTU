'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatPrice, formatPercent } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, CreditCard, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface DealerProfile {
  id: string;
  dealerCode: string;
  businessName: string;
  creditLimit: number;
  availableCredit: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
  createdAt: string;
}

export default function DealerDashboard() {
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDealerData();
  }, []);

  const loadDealerData = async () => {
    try {
      setIsLoading(true);
      // Load real data from APIs
      const [profileRes, ordersRes] = await Promise.all([
        api.getDealerProfile(),
        api.getOrders({ limit: 5 }),
      ]);

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      }
      
      if (ordersRes.success && ordersRes.data) {
        setRecentOrders(ordersRes.data.slice(0, 5));
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12">Failed to load dealer profile</div>;
  }

  const usedCredit = profile.creditLimit - profile.availableCredit;
  const creditUsagePercent = (usedCredit / profile.creditLimit) * 100;
  const pendingOrders = recentOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'APPROVED'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-1">{profile.businessName}</p>
        </div>
        <Link href="/dealer/catalog">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
            <ShoppingCart size={18} />
            Start Shopping
          </Button>
        </Link>
      </div>

      {/* Credit & Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Credit Limit</p>
            <CreditCard className="text-indigo-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{profile.creditLimit.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Available Credit</p>
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-green-600">
            ₹{profile.availableCredit.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Used Credit</p>
            <CreditCard className="text-orange-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-orange-600">
            ₹{usedCredit.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Pending Orders</p>
            <Clock className="text-blue-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-blue-600">{pendingOrders}</p>
        </Card>
      </div>

      {/* Credit Usage Bar */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Credit Usage</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Used: ₹{usedCredit.toLocaleString()}</span>
            <span className="text-gray-600">{formatPercent(creditUsagePercent)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all"
              style={{ width: `${creditUsagePercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <Link href="/dealer/orders" className="text-indigo-600 hover:underline text-sm">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Order #
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Date
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">
                  Amount
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    ₹{formatPrice(order.finalAmount)}
                  </td>
                  <td className="py-3 px-4 text-center">
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
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dealer/catalog">
            <Button className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
              Browse Catalog
            </Button>
          </Link>
          <Link href="/dealer/cart">
            <Button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100">
              View Cart
            </Button>
          </Link>
          <Link href="/dealer/orders">
            <Button className="w-full bg-green-50 text-green-600 hover:bg-green-100">
              View Orders
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
