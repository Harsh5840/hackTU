'use client';

import React from "react"

import { ProtectedRoute } from '@/components/protected-route';
import { AdminSidebar } from '@/components/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 md:ml-64 overflow-auto">
          <main className="p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
