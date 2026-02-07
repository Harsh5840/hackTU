'use client';

import React from "react"

import { ProtectedRoute } from '@/components/protected-route';
import { DealerSidebar } from '@/components/dealer-sidebar';

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requireDealer>
      <div className="flex h-screen bg-gray-50">
        <DealerSidebar />
        <div className="flex-1 md:ml-64 overflow-auto">
          <main className="p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
