// Bed Type Types
export interface BedType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBedTypeData {
  name: string;
  description?: string;
}

export interface UpdateBedTypeData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Room Type Bed Configuration
export interface RoomTypeBed {
  id: string;
  bedTypeId: string;
  quantity: number;
  bedType: BedType;
}

// Room Type Types
export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  roomSize?: number;
  sizeUnit?: 'SQ_FT' | 'SQ_M';
  adultCapacity: number;
  childCapacity: number;
  basePrice: number;
  amenities: string[];
  images?: string[];
  reserveCondition?: string;
  roomCode?: string; // Aiosell room code
  ratePlanCodes?: string[]; // Aiosell rate plan codes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  beds: RoomTypeBed[];
}

export interface CreateRoomTypeData {
  propertyId: string;
  name: string;
  description?: string;
  roomSize?: number;
  sizeUnit?: 'SQ_FT' | 'SQ_M';
  adultCapacity: number;
  childCapacity: number;
  basePrice: number;
  amenities: string[];
  images?: string[];
  reserveCondition?: string;
  roomCode?: string; // Aiosell room code
  ratePlanCodes?: string[]; // Aiosell rate plan codes
  beds: Array<{ bedTypeId: string; quantity: number }>;
}

export interface UpdateRoomTypeData {
  name?: string;
  description?: string;
  roomSize?: number;
  sizeUnit?: 'SQ_FT' | 'SQ_M';
  adultCapacity?: number;
  childCapacity?: number;
  basePrice?: number;
  amenities?: string[];
  images?: string[];
  reserveCondition?: string;
}

// Room Types (Updated to use Room Types)
export interface Room {
  id: string;
  basePrice: number;
  propertyId: string;
  roomTypeId: string;
  roomType?: RoomType;
  number: string;
  floor: number;
  status: RoomStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateRoomData {
  propertyId: string;
  roomTypeId: string;
  number: string;
  floor: number;
  status: RoomStatus;
  isActive: boolean;
}

export interface UpdateRoomData {
  number?: string;
  floor?: number;
  status?: RoomStatus;
  isActive?: boolean;
}

export interface UpdateRoomStatusData {
  status: RoomStatus;
}

export interface BulkCreateRoomsData {
  propertyId: string;
  roomTypeId: string;
  floor: number;
  prefix: string;
  count: number;
  startingNumber: number;
}

// Room Status Type
export type RoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'OUT_OF_ORDER';

// Dormitory Types (Keep existing for dormitory management)
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
  isActive: boolean;
}

export interface UpdateDormitoryData {
  propertyId?: string;
  name?: string;
  type?: "Men's" | "Women's" | 'Mixed';
  capacity?: number;
  basePrice?: number;
  amenities?: string[];
  isActive?: boolean;
}

// Bed Types (Keep existing for dormitory bed management)
export interface Bed {
  id: string;
  dormitoryId: string;
  number: string;
  basePrice: number;
  status: BedStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional relational/extended fields
  bedTypeId?: string;
  bedType?: BedType;
  dormitory?: Dormitory;
  currency?: string;
  amenities?: string[];
  description?: string;
}

export interface CreateBedData {
  dormitoryId: string;
  number: string;
  basePrice: number;
  bedTypeId?: string;
  isActive?: boolean;
  description?: string;
  amenities?: string[];
  currency?: string;
}

export interface UpdateBedData {
  dormitoryId?: string;
  number?: string;
  basePrice?: number;
  isActive?: boolean;
  bedTypeId?: string;
  description?: string;
  amenities?: string[];
  currency?: string;
}

export interface UpdateBedStatusData {
  status: BedStatus;
}

// Bed Status Type
export type BedStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'OUT_OF_ORDER';

// Occupancy Calendar Types
export interface OccupiedRoomDetail {
  roomId: string;
  roomNumber: string;
  roomTypeName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
}

export interface DailyOccupancy {
  date: string; // YYYY-MM-DD format
  occupancyRate: number; // Percentage (0-100)
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  occupiedRoomDetails: OccupiedRoomDetail[];
}
