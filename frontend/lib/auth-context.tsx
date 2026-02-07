'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'WAREHOUSE_MANAGER' | 'DEALER' | 'BUYER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'WAREHOUSE_MANAGER' | 'DEALER' | 'BUYER' | 'ADMIN';
  }) => Promise<User>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDealer: boolean;
  isBuyer: boolean;
  isWarehouseManager: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Simple login without JWT - determine role from email pattern
      let role: User['role'] = 'BUYER';
      let firstName = 'User';
      let lastName = 'Name';
      
      if (email.includes('admin')) {
        role = 'ADMIN';
        firstName = 'Admin';
        lastName = 'User';
      } else if (email.includes('warehouse')) {
        role = 'WAREHOUSE_MANAGER';
        firstName = 'Warehouse';
        lastName = 'Manager';
      } else if (email.includes('dealer')) {
        role = 'DEALER';
        firstName = 'Dealer';
        lastName = 'User';
      } else {
        role = 'BUYER';
        firstName = 'Buyer';
        lastName = 'User';
      }
      
      const newUser: User = {
        id: Math.random().toString(36).substring(7),
        email,
        firstName,
        lastName,
        role
      };
      
      setToken('demo-token');
      setUser(newUser);
      localStorage.setItem('authToken', 'demo-token');
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'WAREHOUSE_MANAGER' | 'DEALER' | 'BUYER' | 'ADMIN';
  }) => {
    // Simple registration without backend call
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'BUYER'
    };
    
    setToken('demo-token');
    setUser(newUser);
    localStorage.setItem('authToken', 'demo-token');
    localStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    register,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'SUPER_ADMIN' || user?.role === 'COMPANY_ADMIN' || user?.role === 'ADMIN',
    isDealer: user?.role === 'DEALER',
    isBuyer: user?.role === 'BUYER',
    isWarehouseManager: user?.role === 'WAREHOUSE_MANAGER',
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
