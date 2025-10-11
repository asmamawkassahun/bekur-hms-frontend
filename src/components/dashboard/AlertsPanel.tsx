'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertItem {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface AlertsPanelProps {
  alerts: AlertItem[];
}

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case 'high':
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        variant: 'destructive' as const,
      };
    case 'medium':
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        variant: 'default' as const,
      };
    default:
      return {
        icon: <Info className="h-4 w-4" />,
        variant: 'default' as const,
      };
  }
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Alerts & Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => {
            const config = getSeverityConfig(alert.severity);
            return (
              <Alert key={alert.id} variant={config.variant}>
                {config.icon}
                <AlertDescription className="ml-2">
                  {alert.message}
                </AlertDescription>
              </Alert>
            );
          })}
          {alerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No alerts at this time
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
