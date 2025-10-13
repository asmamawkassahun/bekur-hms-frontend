'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
import {
  Menu,
  // Bell,
  Search,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { HeaderSkeleton } from '@/components/skeletons';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggle: () => void;
  onMobileMenuToggle: () => void;
  loading?: boolean;
}

export function Header({ sidebarOpen, onToggle, onMobileMenuToggle, loading = false }: HeaderProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show skeleton during loading
  if (loading) {
    return <HeaderSkeleton sidebarOpen={sidebarOpen} onToggle={onToggle} onMobileMenuToggle={onMobileMenuToggle} />;
  }

  return (
    <header className="h-16 bg-background border-b border-border px-6 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="md:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="hidden md:flex cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        {/* <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10 w-64" />
        </div> */}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        {/* <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Notifications</h4>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer">
                  <p className="text-sm font-medium">New reservation</p>
                  <p className="text-xs text-muted-foreground">
                    John Doe checked in
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">
                    $500 from Room 101
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer">
                  <p className="text-sm font-medium">Maintenance alert</p>
                  <p className="text-xs text-muted-foreground">
                    Room 203 needs cleaning
                  </p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover> */}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-secondary-foreground">
                  {user?.firstName?.[0] || 'S'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">
                  {user?.firstName || 'shadcn'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || 'm@example.com'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
