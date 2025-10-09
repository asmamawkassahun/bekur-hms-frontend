// Guest Types
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  idType?: 'PASSPORT' | 'ID_CARD' | 'DRIVER_LICENSE';
  idNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  loyaltyTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  preferences?: string[];
  specialRequests?: string[];
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  idType?: 'PASSPORT' | 'ID_CARD' | 'DRIVER_LICENSE';
  idNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  loyaltyTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  preferences?: string[];
  specialRequests?: string[];
  notes?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateGuestData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  idType?: 'PASSPORT' | 'ID_CARD' | 'DRIVER_LICENSE';
  idNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  loyaltyTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  preferences?: string[];
  specialRequests?: string[];
  notes?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateLoyaltyTierData {
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

// Guest Document Types
export interface GuestDocument {
  id: string;
  guestId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  description: string;
  createdAt: string;
}

export interface UploadDocumentData {
  file: File;
  description: string;
}
