'use client';

import React from "react"

import { ProtectedRoute } from '@/components/protected-route';
import { BuyerSidebar } from '@/components/buyer-sidebar';

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requireBuyer>
      <div className="flex h-screen bg-gray-50">
        <BuyerSidebar />
        <div className="flex-1 md:ml-64 overflow-auto">
          <main className="p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
