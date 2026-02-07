'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Home,
  Package,
  ShoppingCart,
  MessageCircle,
  User,
  LogOut,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/buyer' },
  { icon: ShoppingCart, label: 'Marketplace', href: '/buyer/marketplace' },
  { icon: Package, label: 'My Orders', href: '/buyer/orders' },
  { icon: MessageCircle, label: 'Telegram Bot', href: 'https://t.me/ModernColoursBot', external: true },
  { icon: User, label: 'Profile', href: '/buyer/profile' },
];

export function BuyerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleNavigation = (item: typeof menuItems[0]) => {
    if (item.external) {
      window.open(item.href, '_blank');
    } else {
      router.push(item.href);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-mc-purple text-white hover:bg-mc-purple/90"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-mc-purple to-mc-purple/90 text-white transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 z-40 flex flex-col shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mc-yellow via-mc-red to-mc-purple flex items-center justify-center">
              <span className="text-lg font-bold text-white">MC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Modern Colours</h1>
            </div>
          </div>
          <p className="text-sm text-white/70 ml-13">Buyer Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-mc-yellow text-gray-900 shadow-lg'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.external && (
                  <span className="ml-auto text-xs">↗</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-4">
            <p className="text-sm text-white/70">Logged in as</p>
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-white/60">{user?.role}</p>
          </div>
          <Button
            onClick={handleLogout}
            className="w-full bg-mc-red hover:bg-mc-red/90 text-white flex items-center justify-center gap-2 transition-all"
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
