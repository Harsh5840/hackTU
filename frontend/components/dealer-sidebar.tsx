'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  User,
  LogOut,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dealer' },
  { icon: Package, label: 'Catalog', href: '/dealer/catalog' },
  { icon: ShoppingCart, label: 'Cart', href: '/dealer/cart' },
  { icon: History, label: 'Orders', href: '/dealer/orders' },
  { icon: User, label: 'Profile', href: '/dealer/profile' },
];

export function DealerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-indigo-600 text-white"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 z-40 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Modern Colours</h1>
          <p className="text-sm text-gray-400">Dealer Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="border-t border-gray-800 p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">Dealer</p>
          </div>
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        />
      )}
    </>
  );
}
