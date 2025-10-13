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
import { Logo } from '@/components/ui/logo';
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
  UserCog,
  ChevronDown,
  Globe,
  LucideBarChart3,
  DollarSign,
} from 'lucide-react';

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [roomsExpanded, setRoomsExpanded] = useState(false);
  const [dormitoriesExpanded, setDormitoriesExpanded] = useState(false);
  const [reservationsExpanded, setReservationsExpanded] = useState(false);

  // Get user permissions from auth state
  const userPermissions = auth.permissions || [];

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

  // Helper to check if user has permission
  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    return userPermissions.includes(permission);
  };

  // Main navigation items with permissions
  const mainNavItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      permission: undefined,
    },
    {
      label: 'Properties',
      icon: Building,
      href: '/dashboard/properties',
      permission: 'property:read',
    },
    {
      label: 'Guests',
      icon: Users,
      href: '/dashboard/guests',
      permission: 'guest:read',
    },
    // {
    //   label: 'Beds',
    //   icon: BedDouble,
    //   href: '/dashboard/beds',
    //   permission: 'bed:read',
    // },
  ];

  // Rooms submenu items
  const roomsSubmenu = [
    {
      label: 'Room Types',
      icon: BedDouble,
      href: '/dashboard/rooms/types',
      permission: 'room-type:read',
    },
    {
      label: 'Rooms List',
      icon: Bed,
      href: '/dashboard/rooms/list',
      permission: 'room:read',
    },
    {
      label: 'Add Room',
      icon: Plus,
      href: undefined,
      permission: 'room:create',
    },
    {
      label: 'Occupancy Calendar',
      icon: Calendar,
      href: '/dashboard/rooms/occupancy-calendar',
      permission: 'room:read',
    },
  ];

  // Dormitories submenu items
  const dormitoriesSubmenu = [
    {
      label: 'Dormitories',
      icon: Home,
      href: '/dashboard/dormitories',
      permission: 'dormitory:read',
    },
    {
      label: 'Occupancy Calendar',
      icon: Calendar,
      href: '/dashboard/dormitories/occupancy-calendar',
      permission: 'dormitory:read',
    },
  ];

  // Reservations submenu items
  const reservationSubmenu = [
    {
      label: 'Reservation List',
      icon: Calendar,
      href: '/dashboard/reservations/list',
      permission: 'reservation:read',
    },
    {
      label: 'New Booking',
      icon: Plus,
      href: '/dashboard/reservations/new-booking',
      permission: 'reservation:create',
    },
    {
      label: 'Check in',
      icon: Calendar,
      href: '/dashboard/reservations/check-in',
      permission: 'reservation:checkin',
    },
    {
      label: 'Check out',
      icon: Calendar,
      href: '/dashboard/reservations/check-out',
      permission: 'reservation:checkout',
    },
    {
      label: 'Booking Types',
      icon: FileText,
      href: '/dashboard/reservations/booking-types',
      permission: 'booking-type:read',
    },
    {
      label: 'Booking Sources',
      icon: Globe,
      href: '/dashboard/reservations/booking-sources',
      permission: 'booking-source:read',
    },
  ];

  // Hotel Management section
  const hotelItems = [
    {
      label: 'Channel Manager',
      icon: Globe,
      href: '/dashboard/aiosell',
      permission: 'aiosell:view-logs',
    },
    // {
    //   label: 'Payments',
    //   icon: CreditCard,
    //   href: '/dashboard/payments',
    //   permission: 'payment:read',
    // },
    // {
    //   label: 'Invoices',
    //   icon: FileText,
    //   href: '/dashboard/invoices',
    //   permission: 'invoice:read',
    // },
    {
      label: 'Rate Management',
      icon: DollarSign,
      href: '/dashboard/rate-management',
      permission: 'pricing:manage',
    },
    {
      label: 'Reports',
      icon: BarChart3,
      href: '/dashboard/reports',
      permission: 'report:operational',
    },
    {
      label: 'Night Audit',
      icon: LucideBarChart3,
      href: '/dashboard/night-audit',
      permission: 'night-audit:read',
    },
    {
      label: 'Staff',
      icon: UserCog,
      href: '/dashboard/staff',
      permission: 'staff:manage',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      permission: 'system:settings',
    },
  ];

  // Bottom navigation
  const bottomNavItems = [
    {
      label: 'Get Help',
      icon: HelpCircle,
      href: '/dashboard/help',
      permission: undefined,
    },
    {
      label: 'Search',
      icon: Search,
      href: '/dashboard/search',
      permission: undefined,
    },
  ];

  // Check if rooms section should be visible
  const hasAnyRoomPermission = roomsSubmenu.some((item) =>
    hasPermission(item.permission),
  );
  // Check if dormitories section should be visible
  const hasAnyDormitoryPermission = dormitoriesSubmenu.some((item) =>
    hasPermission(item.permission),
  );
  // Check if reservations section should be visible
  const hasAnyReservationPermission = reservationSubmenu.some((item) =>
    hasPermission(item.permission),
  );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground overflow-y-auto">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-4">
        <Logo size="md" showText={true} />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {mainNavItems
          .filter((item) => hasPermission(item.permission))
          .map((item) => {
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
        {hasAnyRoomPermission && (
          <>
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
                {roomsSubmenu
                  .filter((item) => hasPermission(item.permission))
                  .map((item) => {
                    const Icon = item.icon;
                    const active = item.href ? isActive(item.href) : false;

                    return item.href ? (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={handleNavigation}
                      >
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
                          'w-full flex items-center px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-sidebar-accent/50',
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
          </>
        )}

        {/* Expandable Dormitories Section */}
        {hasAnyDormitoryPermission && (
          <>
            <button
              onClick={() => setDormitoriesExpanded(!dormitoriesExpanded)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
                pathname.startsWith('/dashboard/dormitories')
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <div className="flex items-center">
                <Home className="mr-3 h-4 w-4" />
                <span>Dormitories</span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  dormitoriesExpanded && 'rotate-180',
                )}
              />
            </button>

            {dormitoriesExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {dormitoriesSubmenu
                  .filter((item) => hasPermission(item.permission))
                  .map((item) => {
                    const Icon = item.icon;
                    const active = item.href ? isActive(item.href) : false;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={handleNavigation}
                      >
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
                    );
                  })}
              </div>
            )}
          </>
        )}

        {/* Expandable Reservations Section */}
        {hasAnyReservationPermission && (
          <>
            <button
              onClick={() => setReservationsExpanded(!reservationsExpanded)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
                pathname.startsWith('/dashboard/reservations')
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <div className="flex items-center">
                <Calendar className="mr-3 h-4 w-4" />
                <span>Reservations</span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  reservationsExpanded && 'rotate-180',
                )}
              />
            </button>

            {reservationsExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {reservationSubmenu
                  .filter((item) => hasPermission(item.permission))
                  .map((item) => {
                    const Icon = item.icon;
                    const active = item.href ? isActive(item.href) : false;

                    return item.href ? (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={handleNavigation}
                      >
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
                    ) : null;
                  })}
              </div>
            )}
          </>
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
            {hotelItems
              .filter((item) => hasPermission(item.permission))
              .map((item) => {
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
          {bottomNavItems
            .filter((item) => hasPermission(item.permission))
            .map((item) => {
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

      {/* User Profile */}
      <div className="px-4 py-3 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {auth.user?.firstName?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {auth.user?.firstName || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {auth.user?.email || 'user@example.com'}
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
