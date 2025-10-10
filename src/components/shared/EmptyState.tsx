import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileX, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  icon: Icon = FileX,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <Card className={`bg-card border-0 shadow-sm ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} className="cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
