'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { getProfile, initializeAuth } from '@/store/slices/authSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, user } = useSelector(
    (state: RootState) => state.auth,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize auth state from cookies on mount
  useEffect(() => {
    console.log('🔐 Dashboard layout: Initializing auth state...');
    dispatch(initializeAuth());
  }, [dispatch]);

  // Check authentication after initialization
  useEffect(() => {
    console.log('🔐 Dashboard layout auth check:', {
      isAuthenticated,
      loading,
    });
    if (!isAuthenticated && !loading) {
      console.log('🔐 Not authenticated, redirecting to login');
      router.push('/login');
    } else if (isAuthenticated) {
      console.log('🔐 User is authenticated, staying on dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // Load user profile and properties on mount
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getProfile());
      dispatch(fetchProperties({}));
    }
  }, [isAuthenticated, user, dispatch]);

  // Show loading state
  if (loading) {
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Fixed Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen ml-64">
          <Header
            sidebarOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
