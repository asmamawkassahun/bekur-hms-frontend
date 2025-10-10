'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { getProfile, initializeAuth } from '@/store/slices/authSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, user, error } = useSelector(
    (state: RootState) => state.auth,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Initialize auth state from cookies on mount
  useEffect(() => {
    if (!hasInitialized) {
      console.log('🔐 Dashboard layout: Initializing auth state...');
      dispatch(initializeAuth()).finally(() => {
        setHasInitialized(true);
      });
    }
  }, [dispatch, hasInitialized]);

  // Check authentication after initialization
  useEffect(() => {
    if (!hasInitialized) return;

    console.log('🔐 Dashboard layout auth check:', {
      isAuthenticated,
      loading,
      error,
    });

    if (error && !isRedirecting) {
      console.log(
        '🔐 Auth error detected, clearing tokens and redirecting to login',
      );
      setIsRedirecting(true);
      // Clear tokens and cookies when there's an auth error
      if (typeof document !== 'undefined') {
        document.cookie =
          'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      router.push('/login');
      return;
    }

    if (!isAuthenticated && !loading && !isRedirecting) {
      console.log('🔐 Not authenticated, redirecting to login');
      setIsRedirecting(true);
      // Clear any stale tokens
      if (typeof document !== 'undefined') {
        document.cookie =
          'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      router.push('/login');
    } else if (isAuthenticated) {
      console.log('🔐 User is authenticated, staying on dashboard');
      setIsRedirecting(false);
    }
  }, [isAuthenticated, loading, error, router, hasInitialized, isRedirecting]);

  // Load user profile and properties on mount
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getProfile());
      dispatch(fetchProperties({}));
    }
  }, [isAuthenticated, user, dispatch]);

  // Show loading state
  if (loading || !hasInitialized || isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar Skeleton */}
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state or redirect to login if not authenticated
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Drawer */}
      <MobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />

      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar
            sidebarOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen md:ml-64">
          <Header
            sidebarOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            onMobileMenuToggle={() => setMobileSidebarOpen(true)}
          />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
