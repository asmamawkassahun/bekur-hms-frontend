'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { verifyOTP, resendOTP } from '@/store/slices/authSlice';
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
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

type OTPFormData = z.infer<typeof otpSchema>;

function VerifyOTPForm() {
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const { success, error: showError } = useNotification();

  const email = searchParams.get('email') || '';

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Start countdown when component mounts
  useEffect(() => {
    setCountdown(60);
  }, []);

  const onSubmit = async (data: OTPFormData) => {
    try {
      await dispatch(verifyOTP({ email, otp: data.otp })).unwrap();
      success('OTP verified successfully!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'OTP verification failed. Please try again.';
      showError(errorMessage);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  const handleResendOTP = async () => {
    try {
      await dispatch(resendOTP(email)).unwrap();
      setCountdown(60);
      setCanResend(false);
      success('OTP resent successfully!');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to resend OTP. Please try again.';
      showError(errorMessage);
    }
  };

  const handleOTPChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    form.setValue('otp', numericValue);
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Invalid Request
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Email address is required for OTP verification.
              </p>
              <Button asChild className="mt-4">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Bekur HMS</h1>
          <p className="mt-2 text-sm text-gray-600">Hotel Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify OTP</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={form.watch('otp')}
                  onChange={(e) => handleOTPChange(e.target.value)}
                  disabled={loading}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                {form.formState.errors.otp && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || form.watch('otp').length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              {canResend ? (
                <Button
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Resend OTP
                </Button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend available in {countdown} seconds
                </p>
              )}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyOTPForm />
    </Suspense>
  );
}
