'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(email, password);
      toast.success('Login successful!');
      
      // Redirect based on user role
      if (user && user.role) {
        switch (user.role) {
          case 'SUPER_ADMIN':
          case 'COMPANY_ADMIN':
          case 'ADMIN':
            router.replace('/admin');
            break;
          case 'DEALER':
            router.replace('/dealer');
            break;
          case 'WAREHOUSE_MANAGER':
            router.replace('/admin/warehouse');
            break;
          case 'BUYER':
            router.replace('/buyer');
            break;
          default:
            router.replace('/');
        }
      } else {
        router.replace('/');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-red-50">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mc-purple via-mc-yellow to-mc-red flex items-center justify-center">
              <span className="text-2xl font-bold text-white">MC</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-mc-purple to-mc-red bg-clip-text text-transparent">
            Modern Colours
          </h1>
          <p className="text-gray-600 mt-2">Supply Chain Management Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="border-mc-purple/20 focus:border-mc-purple focus:ring-mc-purple"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="border-mc-purple/20 focus:border-mc-purple focus:ring-mc-purple"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-mc-purple hover:bg-mc-purple/90 text-white transition-all"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-mc-purple hover:text-mc-red hover:underline font-medium transition-colors"
          >
            Register here
          </button>
        </p>
      </Card>
    </div>
  );
}
