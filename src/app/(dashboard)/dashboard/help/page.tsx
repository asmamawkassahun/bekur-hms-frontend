'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground mt-1">
            Get help and support for using the hotel management system
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Help Center</CardTitle>
          <CardDescription>
            This feature is coming soon. You'll have access to comprehensive
            help documentation and support resources.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Features will include:
          </p>
          <ul className="mt-4 text-sm text-muted-foreground space-y-1">
            <li>• User guide and tutorials</li>
            <li>• FAQ section</li>
            <li>• Video tutorials</li>
            <li>• Contact support</li>
            <li>• System status</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
