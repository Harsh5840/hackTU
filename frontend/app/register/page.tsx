'use client';

import React from "react"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'BUYER' as 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'WAREHOUSE_MANAGER' | 'DEALER' | 'BUYER' | 'ADMIN',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const user = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      });
      
      toast.success('Registration successful!');
      
      // Redirect based on user role
      if (user && user.role) {
        switch (user.role) {
          case 'SUPER_ADMIN':
          case 'COMPANY_ADMIN':
          case 'ADMIN':
            router.push('/admin');
            break;
          case 'DEALER':
            router.push('/dealer');
            break;
          case 'BUYER':
            router.push('/buyer');
            break;
          default:
            router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-red-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mc-purple via-mc-yellow to-mc-red flex items-center justify-center">
              <span className="text-2xl font-bold text-white">MC</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-mc-purple to-mc-red bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-600 mt-2">Join Modern Colours Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={isLoading}
                className="border-mc-purple/20 focus:border-mc-purple focus:ring-mc-purple"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                disabled={isLoading}
                className="border-mc-purple/20 focus:border-mc-purple focus:ring-mc-purple"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
              className="border-mc-purple/20 focus:border-mc-purple focus:ring-mc-purple"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <Select
              value={formData.role}
              onValueChange={(value: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'WAREHOUSE_MANAGER' | 'DEALER' | 'BUYER' | 'ADMIN') => 
                setFormData({ ...formData, role: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="border-mc-purple/20 focus:border-mc-purple focus:ring-mc-purple">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUYER">Buyer</SelectItem>
                <SelectItem value="DEALER">Dealer</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
              className="border-mc-purple/20 focus:border-mc-purple focus:ring-mc-purple"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-mc-purple hover:text-mc-red hover:underline font-medium transition-colors"
          >
            Sign in here
          </button>
        </p>
      </Card>
    </div>
  );
}
