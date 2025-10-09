'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserCog } from 'lucide-react';

export default function StaffPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff</h1>
          <p className="text-muted-foreground mt-1">
            Manage hotel staff and user accounts
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserCog className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Staff Management</CardTitle>
          <CardDescription>
            This feature is coming soon. You'll be able to manage staff
            accounts, roles, and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Features will include:
          </p>
          <ul className="mt-4 text-sm text-muted-foreground space-y-1">
            <li>• Add and manage staff accounts</li>
            <li>• Assign roles and permissions</li>
            <li>• Track staff activity</li>
            <li>• Manage staff schedules</li>
            <li>• Staff performance analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
