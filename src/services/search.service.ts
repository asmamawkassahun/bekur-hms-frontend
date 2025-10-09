import { guestService } from '@/services/guest.service';
import { propertyService } from '@/services/property.service';
import { bedService, dormitoryService, roomService } from '@/services/room.service';
import { reservationService } from '@/services/reservation.service';
import type { Guest, Property, Room, Dormitory, Bed, Reservation, ApiResponse } from '@/types';

export type SearchModule = 'guests' | 'reservations' | 'rooms' | 'properties' | 'beds' | 'dormitories';

export interface GlobalSearchResult {
  guests: Guest[];
  reservations: Reservation[];
  rooms: Room[];
  properties: Property[];
  beds: Bed[];
  dormitories: Dormitory[];
}

const safeData = <T>(res: ApiResponse<T[]> | undefined): T[] => (res && res.data ? res.data : []) as T[];

export async function globalSearch(query: string, modules: SearchModule[], limitPerModule = 10): Promise<GlobalSearchResult> {
  const tasks: Partial<Record<SearchModule, Promise<ApiResponse<any[]>>>> = {};

  if (modules.includes('guests')) tasks.guests = guestService.search(query, { limit: limitPerModule });
  if (modules.includes('properties')) tasks.properties = propertyService.getAll({ search: query, limit: limitPerModule });
  if (modules.includes('rooms')) tasks.rooms = roomService.getAll({ search: query, limit: limitPerModule });
  if (modules.includes('dormitories')) tasks.dormitories = dormitoryService.getAll({ search: query, limit: limitPerModule });
  if (modules.includes('beds')) tasks.beds = bedService.getAll({ search: query, limit: limitPerModule });
  if (modules.includes('reservations')) tasks.reservations = reservationService.getAll({ search: query, limit: limitPerModule });

  const [guestsRes, propsRes, roomsRes, dormsRes, bedsRes, resvRes] = await Promise.all([
    tasks.guests?.catch(() => undefined) as any,
    tasks.properties?.catch(() => undefined) as any,
    tasks.rooms?.catch(() => undefined) as any,
    tasks.dormitories?.catch(() => undefined) as any,
    tasks.beds?.catch(() => undefined) as any,
    tasks.reservations?.catch(() => undefined) as any,
  ]);

  return {
    guests: safeData<Guest>(guestsRes),
    properties: safeData<Property>(propsRes),
    rooms: safeData<Room>(roomsRes),
    dormitories: safeData<Dormitory>(dormsRes),
    beds: safeData<Bed>(bedsRes),
    reservations: safeData<Reservation>(resvRes),
  };
}

export async function searchSuggestions(query: string): Promise<GlobalSearchResult> {
  // lightweight suggestions (top 3 each)
  return globalSearch(query, ['guests', 'rooms', 'reservations', 'properties'], 3);
}


