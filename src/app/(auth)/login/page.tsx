'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { login, initializeAuth } from '@/store/slices/authSlice';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const { error: showError } = useNotification();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check if user is already authenticated on mount
  useEffect(() => {
    console.log('🔐 Login page: Checking if user is already authenticated...');
    dispatch(initializeAuth());
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log(
        '🔐 Login page: User is already authenticated, redirecting to dashboard',
      );
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const onLoginSubmit = async (data: LoginFormData) => {
    console.log('🔐 Login form submitted with data:', data);
    console.log('🔐 Current auth state before login:', {
      loading,
      isAuthenticated: false,
    });

    try {
      console.log('🔐 Dispatching login action...');
      const result = await dispatch(login(data)).unwrap();
      console.log('🔐 Login action completed successfully:', result);

      console.log('🔐 Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('🔐 Login failed with error:', error);
      console.error('🔐 Error type:', typeof error);
      console.error('🔐 Error details:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.';
      console.log('🔐 Showing error message:', errorMessage);
      showError(errorMessage);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('🔐 Form submit event triggered');
    e.preventDefault();
    console.log('🔐 Calling loginForm.handleSubmit...');
    loginForm.handleSubmit(onLoginSubmit)(e);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">VIGOR HMS</h1>
          <p className="mt-2 text-sm text-gray-600">Hotel Management System</p>
          <p className="mt-1 text-xs text-gray-500">
            A TURKY'S GROUP OF COMPANIES
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...loginForm.register('email')}
                  disabled={loading}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...loginForm.register('password')}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
