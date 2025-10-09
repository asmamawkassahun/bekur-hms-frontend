// Room Types
export interface Room {
  id: string;
  propertyId: string;
  number: string;
  type: 'Single' | 'Double' | 'Twin' | 'Suite' | 'Family';
  capacity: number;
  amenities: string[];
  basePrice: number;
  floor: number;
  status:
    | 'AVAILABLE'
    | 'OCCUPIED'
    | 'CLEANING'
    | 'MAINTENANCE'
    | 'OUT_OF_ORDER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomData {
  propertyId: string;
  number: string;
  type: 'Single' | 'Double' | 'Twin' | 'Suite' | 'Family';
  capacity: number;
  amenities: string[];
  basePrice: number;
  floor: number;
}

export interface UpdateRoomData {
  type?: 'Single' | 'Double' | 'Twin' | 'Suite' | 'Family';
  capacity?: number;
  amenities?: string[];
  basePrice?: number;
  floor?: number;
}

export interface UpdateRoomStatusData {
  status:
    | 'AVAILABLE'
    | 'OCCUPIED'
    | 'CLEANING'
    | 'MAINTENANCE'
    | 'OUT_OF_ORDER';
}

// Dormitory Types
export interface Dormitory {
  id: string;
  propertyId: string;
  name: string;
  type: "Men's" | "Women's" | 'Mixed';
  capacity: number;
  basePrice: number;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDormitoryData {
  propertyId: string;
  name: string;
  type: "Men's" | "Women's" | 'Mixed';
  capacity: number;
  basePrice: number;
  amenities: string[];
}

export interface UpdateDormitoryData {
  name?: string;
  type?: "Men's" | "Women's" | 'Mixed';
  capacity?: number;
  basePrice?: number;
  amenities?: string[];
}

// Bed Types
export interface Bed {
  id: string;
  dormitoryId: string;
  number: string;
  basePrice: number;
  status:
    | 'AVAILABLE'
    | 'OCCUPIED'
    | 'CLEANING'
    | 'MAINTENANCE'
    | 'OUT_OF_ORDER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBedData {
  dormitoryId: string;
  number: string;
  basePrice: number;
}

export interface UpdateBedData {
  basePrice?: number;
}

export interface UpdateBedStatusData {
  status:
    | 'AVAILABLE'
    | 'OCCUPIED'
    | 'CLEANING'
    | 'MAINTENANCE'
    | 'OUT_OF_ORDER';
}
