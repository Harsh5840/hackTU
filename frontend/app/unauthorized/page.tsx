'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'ADMIN') {
      router.push('/admin');
    } else if (user?.role === 'DEALER') {
      router.push('/dealer');
    } else if (user?.role === 'BUYER') {
      router.push('/buyer');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-red-50">
      <Card className="w-full max-w-md p-8 shadow-lg text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGoBack}
            className="w-full bg-mc-purple hover:bg-mc-purple/90"
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            variant="outline"
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
