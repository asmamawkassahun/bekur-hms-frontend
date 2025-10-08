'use client';

import React from 'react';
import { usePermission, useUserAccess } from '@/hooks/usePermission';
import { AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export function PermissionGuard({
  permission,
  children,
  fallback,
  showAccessDenied = true,
}: PermissionGuardProps) {
  const hasPermission = usePermission(permission);

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showAccessDenied) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-lg">Access Denied</CardTitle>
        <CardDescription>
          You don&apos;t have permission to access this resource.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="w-full"
        >
          Go Back
        </Button>
      </CardContent>
    </Card>
  );
}

interface RoleGuardProps {
  role: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export function RoleGuard({
  role,
  children,
  fallback,
  showAccessDenied = true,
}: RoleGuardProps) {
  const { hasRole } = useUserAccess();

  if (hasRole(role)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showAccessDenied) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-lg">Access Denied</CardTitle>
        <CardDescription>
          You don&apos;t have the required role to access this resource.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="w-full"
        >
          Go Back
        </Button>
      </CardContent>
    </Card>
  );
}
