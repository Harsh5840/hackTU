'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { Eye, Download } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
  taxAmount?: number | string;
  discountAmount?: number | string;
}

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: string;
  status?: string;
  totalAmount: number | string;
  subtotal?: number | string;
  taxAmount: number | string;
  paymentStatus: string;
  deliveryAddress: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.getOrders();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <Link href="/dealer/catalog">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Continue Shopping
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No orders yet</p>
          <Link href="/dealer/catalog">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Start Shopping
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Order #
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Date
                </th>
                <th className="text-right py-4 px-6 font-semibold text-gray-900">
                  Amount
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">
                  Payment
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-900">
                    ₹{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(0) : parseFloat(order.totalAmount as any || '0').toFixed(0)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        STATUS_COLORS[order.orderStatus || order.status || 'PENDING'] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.orderStatus || order.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setDetailsOpen(true);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.orderNumber}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p
                    className={`font-semibold inline-block px-3 py-1 rounded-full text-xs ${
                      STATUS_COLORS[selectedOrder.orderStatus || selectedOrder.status || 'PENDING'] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedOrder.orderStatus || selectedOrder.status || 'PENDING'}
                  </p>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Delivery Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{selectedOrder.deliveryAddress.line1}</p>
                  <p>
                    {selectedOrder.deliveryAddress.city},{' '}
                    {selectedOrder.deliveryAddress.state}{' '}
                    {selectedOrder.deliveryAddress.pincode}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-600">Product</th>
                      <th className="text-right py-2 text-gray-600">Qty</th>
                      <th className="text-right py-2 text-gray-600">Price</th>
                      <th className="text-right py-2 text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 text-gray-900">{item.productName || 'Unknown Product'}</td>
                        <td className="text-right text-gray-600">{item.quantity}</td>
                        <td className="text-right text-gray-600">
                          ₹{typeof item.unitPrice === 'number' ? item.unitPrice.toFixed(0) : parseFloat(item.unitPrice as any || '0').toFixed(0)}
                        </td>
                        <td className="text-right font-semibold text-gray-900">
                          ₹{typeof item.lineTotal === 'number' ? item.lineTotal.toFixed(0) : parseFloat(item.lineTotal as any || '0').toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pricing Summary */}
              <div className="space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{typeof selectedOrder.subtotal === 'number' ? selectedOrder.subtotal.toFixed(0) : parseFloat(selectedOrder.subtotal as any || selectedOrder.totalAmount || '0').toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₹{typeof selectedOrder.taxAmount === 'number' ? selectedOrder.taxAmount.toFixed(0) : parseFloat(selectedOrder.taxAmount as any || '0').toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{typeof selectedOrder.totalAmount === 'number' ? selectedOrder.totalAmount.toFixed(0) : parseFloat(selectedOrder.totalAmount as any || '0').toFixed(0)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline">Download Invoice</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Track Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
