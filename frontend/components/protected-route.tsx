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
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireDealer = false,
  requireBuyer = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isDealer, isBuyer, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.push('/unauthorized');
      return;
    }

    if (requireDealer && !isDealer) {
      router.push('/unauthorized');
      return;
    }

    if (requireBuyer && !isBuyer) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, isAdmin, isDealer, isBuyer, isLoading, requireAdmin, requireDealer, requireBuyer, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  if (requireDealer && !isDealer) {
    return null;
  }

  if (requireBuyer && !isBuyer) {
    return null;
  }

  return <>{children}</>;
}
