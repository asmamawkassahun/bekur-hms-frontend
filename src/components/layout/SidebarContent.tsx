'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { openModal } from '@/store/slices/uiSlice';
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
  MoreHorizontal,
  Bed,
  Home,
  BedDouble,
  Building,
  CreditCard,
  UserCog,
  ChevronDown,
} from 'lucide-react';

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [roomsExpanded, setRoomsExpanded] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  // Main navigation items
  const mainNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Reservations', icon: Calendar, href: '/dashboard/reservations' },
    { label: 'Guests', icon: Users, href: '/dashboard/guests' },
    { label: 'Dormitories', icon: Home, href: '/dashboard/dormitories' },
    { label: 'Beds', icon: BedDouble, href: '/dashboard/beds' },
    { label: 'Properties', icon: Building, href: '/dashboard/properties' },
  ];

  // Rooms submenu items
  const roomsSubmenu = [
    { label: 'Room Types', icon: BedDouble, href: '/dashboard/rooms/types' },
    { label: 'Rooms List', icon: Bed, href: '/dashboard/rooms/list' },
    { label: 'Add Room', icon: Plus, href: undefined },
  ];

  // Hotel Management section
  const hotelItems = [
    { label: 'Payments', icon: CreditCard, href: '/dashboard/payments' },
    { label: 'Invoices', icon: FileText, href: '/dashboard/invoices' },
    { label: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
    { label: 'Staff', icon: UserCog, href: '/dashboard/staff' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  // Bottom navigation
  const bottomNavItems = [
    { label: 'Get Help', icon: HelpCircle, href: '/dashboard/help' },
    { label: 'Search', icon: Search, href: '/dashboard/search' },
  ];

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground overflow-y-auto">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-sidebar-primary rounded-full flex items-center justify-center">
            <div className="h-4 w-4 bg-sidebar-primary-foreground rounded-full"></div>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Bekur HMS</h1>
          </div>
        </div>
      </div>

      {/* Quick Create Button */}
      <div className="px-4 pb-4">
        <Button
          className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 flex items-center justify-center cursor-pointer"
          onClick={handleNavigation}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
          <Calendar className="ml-2 h-4 w-4" />
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
                'w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer',
                active && 'bg-sidebar-accent text-sidebar-accent-foreground',
              )}
              asChild
            >
              <Link href={item.href} onClick={handleNavigation}>
                <Icon className="h-4 w-4 mr-3" />
                <span className="truncate">{item.label}</span>
              </Link>
            </Button>
          );
        })}

        {/* Expandable Rooms Section */}
        <button
          onClick={() => setRoomsExpanded(!roomsExpanded)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
            pathname.startsWith('/dashboard/rooms')
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
        >
          <div className="flex items-center">
            <Bed className="mr-3 h-4 w-4" />
            <span>Rooms</span>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              roomsExpanded && 'rotate-180',
            )}
          />
        </button>

        {roomsExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {roomsSubmenu.map((item) => {
              const Icon = item.icon;
              const active = item.href ? isActive(item.href) : false;

              return item.href ? (
                <Link key={item.label} href={item.href} onClick={handleNavigation}>
                  <div
                    className={cn(
                      'flex items-center px-3 py-2 rounded-md text-sm cursor-pointer',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'hover:bg-sidebar-accent/50',
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ) : (
                <button
                  key={item.label}
                  className={cn(
                    'w-full flex items-center px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-sidebar-accent/50'
                  )}
                  onClick={() => dispatch(openModal('addRoom'))}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Hotel Management Section */}
      <div className="px-2 pb-4">
        <Separator className="bg-sidebar-border mb-4" />
        <div className="px-2">
          <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
            Management
          </h3>
          <nav className="space-y-1">
            {hotelItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer',
                    active &&
                      'bg-sidebar-accent text-sidebar-accent-foreground',
                  )}
                  asChild
                >
                  <Link href={item.href} onClick={handleNavigation}>
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
                  'w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer',
                  active && 'bg-sidebar-accent text-sidebar-accent-foreground',
                )}
                asChild
              >
                <Link href={item.href} onClick={handleNavigation}>
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
            className="h-8 w-8 p-0 text-gray-400 hover:text-white cursor-pointer"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
