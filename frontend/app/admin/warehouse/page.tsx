'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Package, TrendingUp, AlertTriangle, Warehouse as WarehouseIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: string;
  city: string;
  state: string;
  totalCapacity: number;
  currentUtilization: number;
  isActive: boolean;
}

interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  maxStockLevel: number;
}

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

export default function WarehouseDashboard() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [warehousesRes, inventoryRes] = await Promise.all([
          api.getWarehouses(),
          api.getInventory(),
        ]);

        if (warehousesRes.success) {
          setWarehouses(warehousesRes.data);
        }

        if (inventoryRes.success) {
          setInventory(inventoryRes.data);
        }
      } catch (error) {
        toast.error('Failed to load warehouse data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const totalCapacity = warehouses.reduce((sum, w) => {
    return sum + (w.totalCapacity || 0);
  }, 0);
  
  const avgUtilization = warehouses.length > 0
    ? warehouses.reduce((sum, w) => sum + (w.currentUtilization || 0), 0) / warehouses.length
    : 0;
    
  const lowStockItems = inventory.filter(i => 
    typeof i.availableQuantity === 'number' && 
    typeof i.reorderLevel === 'number' && 
    i.availableQuantity <= i.reorderLevel
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-mc-purple to-mc-red bg-clip-text text-transparent">
          Warehouse Management
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor inventory across all warehouses
        </p>
      </div>

      {/* Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <MetricCard
          label="Total Warehouses"
          value={warehouses.length}
          icon={<WarehouseIcon className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <MetricCard
          label="Total Capacity"
          value={`${totalCapacity.toLocaleString()} units`}
          icon={<Package className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <MetricCard
          label="Avg Utilization"
          value={`${avgUtilization.toFixed(1)}%`}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
        <MetricCard
          label="Low Stock Alerts"
          value={lowStockItems}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* Warehouses List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Warehouses</h2>
        <div className="space-y-4">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{warehouse.name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-600">
                    {warehouse.code || 'N/A'} • {warehouse.city || 'N/A'}, {warehouse.state || 'N/A'} • {warehouse.type || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Utilization</p>
                  <p className="text-2xl font-bold text-mc-purple">
                    {(warehouse.currentUtilization || 0).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Capacity: {(warehouse.totalCapacity || 0).toLocaleString()} units
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Low Stock Items */}
      {lowStockItems > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900">Low Stock Alert</h3>
              <p className="text-sm text-red-700 mt-1">
                {lowStockItems} items are below reorder level. Review inventory and place orders.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
