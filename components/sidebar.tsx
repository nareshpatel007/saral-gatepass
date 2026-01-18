'use client';

import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, LogOut, Menu, X, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';

const navItems = {
  security: [
    { href: '/security/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/security/today-visitors', label: "Today's Visitors", icon: Users },
  ],
  member: [
    { href: '/member/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/member/visitors', label: 'My Visitors', icon: Users },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/visitors', label: 'All Visitors', icon: Users },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/security-staff', label: 'Security Staff', icon: Shield },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const userNavItems = navItems[user.role] || [];

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold">Gatepass</h1>
        <p className="text-xs text-muted-foreground capitalize mt-1">
          {user.role}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {userNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-muted-foreground truncate">
            {user.name}
          </p>
          <ThemeToggle />
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border fixed left-0 top-0 h-screen">
        <NavContent />
      </aside>

      {/* Mobile Menu */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
        <h1 className="font-bold">Gatepass</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {isOpen && (
        <aside className="md:hidden fixed inset-0 top-12 z-30 bg-card border-r border-border overflow-y-auto">
          <NavContent />
        </aside>
      )}
    </>
  );
}
