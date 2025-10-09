// Staff Management Types

export type StaffRole = 'SUPER_ADMIN' | 'PROPERTY_MANAGER' | 'FRONT_DESK' | 'HOUSEKEEPING' | 'FINANCE_STAFF';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: StaffRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: StaffRole[];
  temporaryPassword?: string;
  isActive?: boolean;
}

export interface UpdateStaffData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles?: StaffRole[];
  isActive?: boolean;
}

export interface AssignRolesData {
  roles: StaffRole[];
}


