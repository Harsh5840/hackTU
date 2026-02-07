'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Package, MessageCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getOrders();
      setOrders(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchOrders}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-mc-purple to-mc-red bg-clip-text text-transparent">
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">Track your orders and delivery status</p>
        </div>
        <Button
          className="bg-mc-purple hover:bg-mc-purple/90"
          onClick={() => window.open('https://t.me/ModernColoursBot', '_blank')}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Place Order via Bot
        </Button>
      </div>

      {/* Telegram Bot Info */}
      <Card className="p-4 bg-mc-yellow/10 border-mc-yellow/30">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-mc-purple" />
          <div className="flex-1">
            <p className="text-sm font-medium">Track orders in real-time via Telegram</p>
            <p className="text-xs text-gray-600">Use <code className="bg-white px-1 rounded">/track &lt;orderId&gt;</code> command</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-mc-purple text-mc-purple"
            onClick={() => window.open('https://t.me/ModernColoursBot', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open Bot
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</h3>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-2xl font-bold text-mc-purple">₹{order.totalAmount}</p>
                <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
              </div>
            </div>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium mb-2">Delivery Address</p>
                <p className="text-sm text-gray-700">
                  {order.deliveryAddress.addressLine1}
                  {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
                </p>
                <p className="text-sm text-gray-700">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                </p>
              </div>
            )}

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="space-y-2 mb-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.productName || item.product?.name}</span>
                    <span className="font-medium">
                      {item.quantity} × ₹{item.unitPrice} = ₹{item.subtotal}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 border-mc-purple text-mc-purple hover:bg-mc-purple/10"
              >
                View Details
              </Button>
              <Button 
                className="bg-mc-purple hover:bg-mc-purple/90"
                onClick={() => window.open(`https://t.me/ModernColoursBot`, '_blank')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Track on Telegram
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No orders yet</p>
          <Button
            className="bg-mc-purple hover:bg-mc-purple/90"
            onClick={() => window.open('https://t.me/ModernColoursBot', '_blank')}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Place Your First Order
          </Button>
        </div>
      )}
    </div>
  );
}
