'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search as SearchIcon } from 'lucide-react';
import { debounce, formatDateTime, truncateText } from '@/lib/utils';
import {
  globalSearch,
  searchSuggestions,
  type SearchModule,
} from '@/services/search.service';
import type { Guest, Property, Room, Reservation } from '@/types';
import { useNotification } from '@/hooks/useNotification';
import type { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api/error-handler';

type SortOption = 'relevance' | 'recent';

export default function SearchPage() {
  const { error } = useNotification();
  const [q, setQ] = useState('');
  const [modules, setModules] = useState<SearchModule[]>([
    'guests',
    'reservations',
    'rooms',
    'properties',
  ]);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [results, setResults] = useState({
    guests: [],
    reservations: [],
    rooms: [],
    properties: [],
    beds: [],
    dormitories: [],
  } as any);
  const [suggestions, setSuggestions] = useState({
    guests: [],
    reservations: [],
    rooms: [],
    properties: [],
  } as any);
  const [loading, setLoading] = useState(false);

  const runSuggestions = useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const value = args[0] as string;
        if (!value.trim()) {
          setSuggestions({
            guests: [],
            reservations: [],
            rooms: [],
            properties: [],
          });
          return undefined;
        }
        searchSuggestions(value)
          .then((data) => setSuggestions(data))
          .catch(() => {
            /* ignore */
          });
        return undefined;
      }, 250),
    [],
  );

  useEffect(() => {
    runSuggestions(q);
  }, [q, runSuggestions]);

  const runSearch = async () => {
    if (!q.trim()) {
      setResults({
        guests: [],
        reservations: [],
        rooms: [],
        properties: [],
        beds: [],
        dormitories: [],
      });
      return;
    }
    setLoading(true);
    try {
      const data = await globalSearch(q, modules, 10);
      // Ensure all properties are arrays
      setResults({
        guests: Array.isArray(data.guests) ? data.guests : [],
        reservations: Array.isArray(data.reservations) ? data.reservations : [],
        rooms: Array.isArray(data.rooms) ? data.rooms : [],
        properties: Array.isArray(data.properties) ? data.properties : [],
        beds: Array.isArray(data.beds) ? data.beds : [],
        dormitories: Array.isArray(data.dormitories) ? data.dormitories : [],
      });
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (m: SearchModule) => {
    setModules((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Global Search</h1>
          <p className="text-muted-foreground mt-1">
            Search across guests, reservations, rooms, properties, and more
          </p>
        </div>
      </div>

      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-3 space-y-2">
            <Label>Query</Label>
            <div className="flex items-center gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search guests, rooms, reservations..."
              />
              <Button
                className="bg-primary cursor-pointer"
                onClick={runSearch}
                disabled={loading}
              >
                <SearchIcon className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
            {q &&
              suggestions.guests.length +
              suggestions.rooms.length +
              suggestions.reservations.length +
              suggestions.properties.length >
              0 && (
                <div className="mt-2 rounded-md border p-2 text-xs text-muted-foreground">
                  <div className="mb-1 font-medium text-foreground">
                    Suggestions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.guests.slice(0, 3).map((g: Guest) => (
                      <span key={g.id}>
                        Guest: {g.firstName} {g.lastName}
                      </span>
                    ))}
                    {suggestions.rooms.slice(0, 3).map((r: Room) => (
                      <span key={r.id}>
                        Room: {r.number} • {r.roomType?.name || 'N/A'}
                      </span>
                    ))}
                    {suggestions.reservations
                      .slice(0, 3)
                      .map((r: Reservation) => (
                        <span key={r.id}>
                          Reservation: {formatDateTime(r.checkIn)} →{' '}
                          {formatDateTime(r.checkOut)}
                        </span>
                      ))}
                    {suggestions.properties.slice(0, 3).map((p: Property) => (
                      <span key={p.id}>Property: {p.name}</span>
                    ))}
                  </div>
                </div>
              )}
          </div>
          <div className="space-y-2">
            <Label>Sort</Label>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as SortOption)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Modules</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'guests',
                  'reservations',
                  'rooms',
                  'properties',
                  'beds',
                  'dormitories',
                ] as SearchModule[]
              ).map((m) => (
                <Badge
                  key={m}
                  variant={modules.includes(m) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleModule(m)}
                >
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ResultSection
            title={`Guests (${results.guests.length})`}
            items={results.guests}
            render={(g: Guest) => (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {g.firstName} {g.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {g.email} • {g.phone}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Loyalty: {g.loyaltyTier || 'N/A'}
                </div>
              </div>
            )}
          />
          <Separator />
          <ResultSection
            title={`Reservations (${results.reservations.length})`}
            items={results.reservations}
            render={(r: Reservation) => (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {formatDateTime(r.checkIn)} →{' '}
                    {formatDateTime(r.checkOut)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Status: {r.status}
                  </div>
                </div>
                <div className="text-xs">{truncateText(r.notes || '', 40)}</div>
              </div>
            )}
          />
          <Separator />
          <ResultSection
            title={`Rooms (${results.rooms.length})`}
            items={results.rooms}
            render={(r: Room) => (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {r.number} • {r.roomType?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Property ID: {r.propertyId}
                  </div>
                </div>
                <Badge
                  variant={r.status === 'AVAILABLE' ? 'default' : 'secondary'}
                >
                  {r.status}
                </Badge>
              </div>
            )}
          />
          <Separator />
          <ResultSection
            title={`Properties (${results.properties.length})`}
            items={results.properties}
            render={(p: Property) => (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.city}, {p.country}
                  </div>
                </div>
                <Badge variant={p.isActive ? 'default' : 'secondary'}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ResultSection<T>({
  title,
  items,
  render,
}: {
  title: string;
  items: T[];
  render: (item: T) => JSX.Element;
}) {
  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-foreground">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {safeItems.map((it, idx) => (
          <div key={idx} className="rounded-md border p-3">
            {render(it)}
          </div>
        ))}
        {safeItems.length === 0 && (
          <div className="text-xs text-muted-foreground">No results</div>
        )}
      </div>
    </div>
  );
}
