'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, UserPlus, Calendar, DollarSign } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      label: 'New Reservation',
      href: '/dashboard/reservations/new-booking',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Add Guest',
      href: '/dashboard/guests',
      icon: UserPlus,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Check-In',
      href: '/dashboard/reservations/check-in',
      icon: Calendar,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    // {
    //   label: 'Record Payment',
    //   href: '/dashboard/payments',
    //   icon: DollarSign,
    //   color: 'bg-orange-500 hover:bg-orange-600',
    // },
  ];

  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  className={`w-full h-24 flex flex-col items-center justify-center gap-2 ${action.color} text-white cursor-pointer`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
