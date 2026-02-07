'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isDealer, isBuyer, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Redirect based on user role
    if (isAdmin) {
      router.push('/admin');
    } else if (isDealer) {
      router.push('/dealer');
    } else if (isBuyer) {
      router.push('/buyer');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, isDealer, isBuyer, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
