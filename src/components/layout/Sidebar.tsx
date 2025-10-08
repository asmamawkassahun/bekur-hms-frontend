'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Search,
  Plus,
  Mail,
  MoreHorizontal,
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Main navigation items
  const mainNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Lifecycle', icon: BarChart3, href: '/dashboard/lifecycle' },
    { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { label: 'Projects', icon: Calendar, href: '/dashboard/projects' },
    { label: 'Team', icon: Users, href: '/dashboard/team' },
  ];

  // Documents section
  const documentItems = [
    { label: 'Data Library', icon: BarChart3, href: '/dashboard/data-library' },
    { label: 'Reports', icon: FileText, href: '/dashboard/reports' },
    {
      label: 'Word Assistant',
      icon: FileText,
      href: '/dashboard/word-assistant',
    },
    { label: 'More', icon: MoreHorizontal, href: '/dashboard/more' },
  ];

  // Bottom navigation
  const bottomNavItems = [
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
    { label: 'Get Help', icon: HelpCircle, href: '/dashboard/help' },
    { label: 'Search', icon: Search, href: '/dashboard/search' },
  ];

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
            <div className="h-4 w-4 bg-gray-900 rounded-full"></div>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Acme Inc.</h1>
          </div>
        </div>
      </div>

      {/* Quick Create Button */}
      <div className="px-4 pb-4">
        <Button className="w-full bg-black text-white hover:bg-gray-800 flex items-center justify-center">
          <Plus className="mr-2 h-4 w-4" />
          Quick Create
          <Mail className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                'w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800',
                active && 'bg-gray-800 text-white',
              )}
              asChild
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4 mr-3" />
                <span className="truncate">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Documents Section */}
      <div className="px-2 pb-4">
        <Separator className="bg-gray-700 mb-4" />
        <div className="px-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Documents
          </h3>
          <nav className="space-y-1">
            {documentItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800',
                    active && 'bg-gray-800 text-white',
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4 mr-3" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-2 pb-4">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  'w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800',
                  active && 'bg-gray-800 text-white',
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="px-4 py-3 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.firstName?.[0] || 'S'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName || 'shadcn'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || 'm@example.com'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
