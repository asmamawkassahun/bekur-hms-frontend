import {
  LayoutDashboard,
  Building,
  Calendar,
  Users,
  Bed,
  Home,
  BedDouble,
  CreditCard,
  FileText,
  BarChart,
  UserCog,
  Settings,
  LogIn,
  ClipboardList,
  Wrench,
  Calculator,
  DollarSign,
} from 'lucide-react';
import { MenuItem, UserRole } from '@/types';

export const menuItems: Record<UserRole, MenuItem[]> = {
  SUPER_ADMIN: [
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
      label: 'Reservations',
      icon: Calendar,
      href: '/dashboard/reservations',
      permission: 'reservation:read',
    },
    {
      label: 'Guests',
      icon: Users,
      href: '/dashboard/guests',
      permission: 'guest:read',
    },
    {
      label: 'Rooms',
      icon: Bed,
      href: '/dashboard/rooms',
      permission: 'room:read',
    },
    {
      label: 'Dormitories',
      icon: Home,
      href: '/dashboard/dormitories',
      permission: 'dormitory:read',
    },
    {
      label: 'Beds',
      icon: BedDouble,
      href: '/dashboard/beds',
      permission: 'bed:read',
    },
    {
      label: 'Payments',
      icon: CreditCard,
      href: '/dashboard/payments',
      permission: 'payment:read',
    },
    {
      label: 'Invoices',
      icon: FileText,
      href: '/dashboard/invoices',
      permission: 'invoice:read',
    },
    {
      label: 'Reports',
      icon: BarChart,
      href: '/dashboard/reports',
      permission: 'report:operational',
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
  ],
  PROPERTY_MANAGER: [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      permission: undefined,
    },
    {
      label: 'Reservations',
      icon: Calendar,
      href: '/dashboard/reservations',
      permission: 'reservation:read',
    },
    {
      label: 'Guests',
      icon: Users,
      href: '/dashboard/guests',
      permission: 'guest:read',
    },
    {
      label: 'Rooms',
      icon: Bed,
      href: '/dashboard/rooms',
      permission: 'room:read',
    },
    {
      label: 'Dormitories',
      icon: Home,
      href: '/dashboard/dormitories',
      permission: 'dormitory:read',
    },
    {
      label: 'Beds',
      icon: BedDouble,
      href: '/dashboard/beds',
      permission: 'bed:read',
    },
    {
      label: 'Payments',
      icon: CreditCard,
      href: '/dashboard/payments',
      permission: 'payment:read',
    },
    {
      label: 'Invoices',
      icon: FileText,
      href: '/dashboard/invoices',
      permission: 'invoice:read',
    },
    {
      label: 'Reports',
      icon: BarChart,
      href: '/dashboard/reports',
      permission: 'report:operational',
    },
    {
      label: 'Staff',
      icon: UserCog,
      href: '/dashboard/staff',
      permission: 'staff:manage',
    },
    {
      label: 'Pricing',
      icon: DollarSign,
      href: '/dashboard/pricing',
      permission: 'pricing:manage',
    },
  ],
  FRONT_DESK: [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      permission: undefined,
    },
    {
      label: 'Reservations',
      icon: Calendar,
      href: '/dashboard/reservations',
      permission: 'reservation:read',
    },
    {
      label: 'Guests',
      icon: Users,
      href: '/dashboard/guests',
      permission: 'guest:read',
    },
    {
      label: 'Check-In/Out',
      icon: LogIn,
      href: '/dashboard/check-in-out',
      permission: 'reservation:checkin',
    },
    {
      label: 'Payments',
      icon: CreditCard,
      href: '/dashboard/payments',
      permission: 'payment:read',
    },
    {
      label: 'Availability',
      icon: Calendar,
      href: '/dashboard/availability',
      permission: 'room:read',
    },
  ],
  HOUSEKEEPING: [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      permission: undefined,
    },
    {
      label: 'Room Status',
      icon: Bed,
      href: '/dashboard/room-status',
      permission: 'room:update-status',
    },
    {
      label: 'Cleaning Schedule',
      icon: ClipboardList,
      href: '/dashboard/cleaning',
      permission: 'room:read',
    },
    {
      label: 'Maintenance',
      icon: Wrench,
      href: '/dashboard/maintenance',
      permission: 'room:update-status',
    },
  ],
  FINANCE_STAFF: [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      permission: undefined,
    },
    {
      label: 'Payments',
      icon: CreditCard,
      href: '/dashboard/payments',
      permission: 'payment:read',
    },
    {
      label: 'Invoices',
      icon: FileText,
      href: '/dashboard/invoices',
      permission: 'invoice:read',
    },
    {
      label: 'Financial Reports',
      icon: BarChart,
      href: '/dashboard/reports/financial',
      permission: 'report:financial',
    },
    {
      label: 'Reconciliation',
      icon: Calculator,
      href: '/dashboard/reconciliation',
      permission: 'payment:reconcile',
    },
  ],
};

/**
 * Get menu items for a user based on their roles and permissions
 */
export function getMenuForUser(
  roles: string[],
  permissions: string[],
): MenuItem[] {
  // Use the primary role (first role) to determine menu structure
  const primaryRole = roles[0] as UserRole;
  const roleMenu = menuItems[primaryRole] || menuItems.FRONT_DESK;

  // Filter menu items based on permissions
  return roleMenu.filter(
    (item) => !item.permission || permissions.includes(item.permission),
  );
}

/**
 * Check if a menu item is accessible to the user
 */
export function isMenuItemAccessible(
  item: MenuItem,
  roles: string[],
  permissions: string[],
): boolean {
  if (!item.permission) {
    return true; // No permission required
  }

  return permissions.includes(item.permission);
}

/**
 * Get all permissions required for a specific role
 */
export function getPermissionsForRole(role: UserRole): string[] {
  const menu = menuItems[role] || [];
  return menu
    .map((item) => item.permission)
    .filter((permission): permission is string => !!permission);
}
