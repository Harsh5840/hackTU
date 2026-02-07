'use client';

import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, MessageCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function BuyerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-mc-purple to-mc-red bg-clip-text text-transparent">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Track your orders and explore our paint collection
        </p>
      </div>

      {/* Telegram Bot Integration */}
      <Card className="p-6 bg-gradient-to-br from-mc-purple/10 to-mc-yellow/10 border-mc-purple/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-mc-purple rounded-lg">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Order via Telegram Bot</h3>
            <p className="text-gray-600 mb-4">
              For a faster ordering experience, use our Telegram bot with smart address collection and real-time tracking!
            </p>
            <div className="flex gap-3">
              <Button 
                className="bg-mc-purple hover:bg-mc-purple/90"
                onClick={() => window.open('https://t.me/ModernColoursBot', '_blank')}
              >
                Open @ModernColoursBot
              </Button>
              <Button 
                variant="outline"
                className="border-mc-purple text-mc-purple hover:bg-mc-purple/10"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/buyer/marketplace">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-mc-yellow/20 rounded-lg">
                <Package className="h-6 w-6 text-mc-purple" />
              </div>
              <div>
                <h3 className="font-semibold">Browse Products</h3>
                <p className="text-sm text-gray-600">View our catalog</p>
              </div>
            </div>
          </Card>
        </Link>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-mc-purple/20 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-mc-purple" />
            </div>
            <div>
              <h3 className="font-semibold">My Orders</h3>
              <p className="text-sm text-gray-600">Track deliveries</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-mc-red/20 rounded-lg">
              <BarChart3 className="h-6 w-6 text-mc-red" />
            </div>
            <div>
              <h3 className="font-semibold">Order History</h3>
              <p className="text-sm text-gray-600">View past orders</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Telegram Bot Features */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Telegram Bot Features</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-mc-purple/20 flex items-center justify-center text-mc-purple font-semibold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-medium">Smart Order Placement</h4>
              <p className="text-sm text-gray-600">
                7-step guided process: State → City → PIN → Address → Landmark → Quantity → Confirm
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-mc-yellow/20 flex items-center justify-center text-mc-purple font-semibold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-medium">Real-time Order Tracking</h4>
              <p className="text-sm text-gray-600">
                Use /track command with your order ID for instant status updates
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-mc-red/20 flex items-center justify-center text-mc-purple font-semibold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-medium">Product Catalog</h4>
              <p className="text-sm text-gray-600">
                Browse 8+ products with details, prices, and availability
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-mc-purple/20 flex items-center justify-center text-mc-purple font-semibold flex-shrink-0">
              4
            </div>
            <div>
              <h4 className="font-medium">Demand Analytics</h4>
              <p className="text-sm text-gray-600">
                ML-powered forecasts showing predicted demand (65-81 units)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Bot Commands Reference */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Commands</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <code className="text-mc-purple font-mono">/start</code>
            <span className="text-sm text-gray-600 ml-2">- Begin interaction</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <code className="text-mc-purple font-mono">/order</code>
            <span className="text-sm text-gray-600 ml-2">- Place new order</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <code className="text-mc-purple font-mono">/track &lt;id&gt;</code>
            <span className="text-sm text-gray-600 ml-2">- Track order</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <code className="text-mc-purple font-mono">/products</code>
            <span className="text-sm text-gray-600 ml-2">- Browse catalog</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <code className="text-mc-purple font-mono">/analytics</code>
            <span className="text-sm text-gray-600 ml-2">- View forecasts</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <code className="text-mc-purple font-mono">/help</code>
            <span className="text-sm text-gray-600 ml-2">- Get assistance</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
