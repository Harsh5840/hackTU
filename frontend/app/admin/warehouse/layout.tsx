'use client';

import React from "react"

import { ProtectedRoute } from '@/components/protected-route';
import { WarehouseSidebar } from '@/components/warehouse-sidebar';

export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requireWarehouse>
      <div className="flex h-screen bg-gray-50">
        <WarehouseSidebar />
        <div className="flex-1 md:ml-64 overflow-auto">
          <main className="p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
