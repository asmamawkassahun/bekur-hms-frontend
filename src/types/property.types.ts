// Property Types
export interface Property {
  id: string;
  name: string;
  type: string; // Property type (HOTEL, HOSTEL, RESORT, etc.)
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  currency: string;
  taxRate: number;
  hotelCode: string | null; // Aiosell hotel code for channel manager
  description?: string;
  policies?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyStats {
  totalRooms: number;
  totalBeds: number;
  occupiedRooms: number;
  occupiedBeds: number;
  occupancyRate: number;
  totalRevenue: number;
  averageRoomRate: number;
  averageBedRate: number;
}

export interface CreatePropertyData {
  name: string;
  type: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  currency: string;
  taxRate: number;
  hotelCode?: string; // Optional: Aiosell hotel code
  description?: string;
  policies?: string;
  isActive: boolean;
}

export interface UpdatePropertyData {
  name?: string;
  type?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  taxRate?: number;
  hotelCode?: string; // Optional: Aiosell hotel code
  description?: string;
  policies?: string;
  isActive?: boolean;
}
