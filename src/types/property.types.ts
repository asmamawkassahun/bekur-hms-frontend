// Property Types
export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  currency: string;
  taxRate: number;
  phone?: string;
  email?: string;
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
  address: string;
  city: string;
  country: string;
  timezone: string;
  currency: string;
  taxRate: number;
}

export interface UpdatePropertyData {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  taxRate?: number;
}
