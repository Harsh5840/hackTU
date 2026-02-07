'use client';

import React from "react"

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireDealer?: boolean;
  requireBuyer?: boolean;
  requireWarehouse?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireDealer = false,
  requireBuyer = false,
  requireWarehouse = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isDealer, isBuyer, isWarehouseManager, isLoading, user } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = React.useState(false);

  useEffect(() => {
    // Check both context state AND localStorage for auth status
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('authToken');
    const hasUser = typeof window !== 'undefined' && localStorage.getItem('user');
    
    // If we're still loading, wait
    if (isLoading) {
      setShouldRender(false);
      return;
    }

    // Check authentication - use localStorage as backup if context isn't ready yet
    const isAuthed = isAuthenticated || (hasToken && hasUser);
    
    if (!isAuthed) {
      router.replace('/login');
      return;
    }

    // Get user from context or localStorage
    let currentUser = user;
    if (!currentUser && hasUser) {
      try {
        currentUser = JSON.parse(localStorage.getItem('user') || '');
      } catch (e) {
        router.replace('/login');
        return;
      }
    }

    // Role-based checks
    const userRole = currentUser?.role;
    const isAdminRole = userRole === 'SUPER_ADMIN' || userRole === 'COMPANY_ADMIN' || userRole === 'ADMIN';
    const isDealerRole = userRole === 'DEALER';
    const isBuyerRole = userRole === 'BUYER';
    const isWarehouseRole = userRole === 'WAREHOUSE_MANAGER';

    if (requireAdmin && !isAdminRole && !(isAdmin)) {
      router.replace('/unauthorized');
      return;
    }

    if (requireDealer && !isDealerRole && !(isDealer)) {
      router.replace('/unauthorized');
      return;
    }

    if (requireBuyer && !isBuyerRole && !(isBuyer)) {
      router.replace('/unauthorized');
      return;
    }

    if (requireWarehouse && !isWarehouseRole && !(isWarehouseManager)) {
      router.replace('/unauthorized');
      return;
    }

    // All checks passed
    setShouldRender(true);
  }, [isAuthenticated, isAdmin, isDealer, isBuyer, isWarehouseManager, isLoading, user, requireAdmin, requireDealer, requireBuyer, requireWarehouse, router]);

  if (isLoading || !shouldRender) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
