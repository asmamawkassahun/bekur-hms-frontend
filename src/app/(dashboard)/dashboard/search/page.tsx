'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search</h1>
          <p className="text-muted-foreground mt-1">
            Search across all hotel data and records
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Global Search</CardTitle>
          <CardDescription>
            This feature is coming soon. You'll be able to search across all
            hotel data including guests, reservations, rooms, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Features will include:
          </p>
          <ul className="mt-4 text-sm text-muted-foreground space-y-1">
            <li>• Global search across all modules</li>
            <li>• Advanced filters and sorting</li>
            <li>• Quick actions from search results</li>
            <li>• Search history and saved searches</li>
            <li>• Real-time search suggestions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
