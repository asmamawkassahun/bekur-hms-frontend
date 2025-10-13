// Staff Management Types

export type StaffRole = 'SUPER_ADMIN' | 'PROPERTY_MANAGER' | 'FRONT_DESK' | 'HOUSEKEEPING' | 'FINANCE_STAFF';

export interface Staff {
  id: string;
  userId: string;
  position: string;
  isActive: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  roles: Array<{
    role: {
      id: string;
      name: string;
      description?: string;
    };
  }>;
  properties: Array<{
    property: {
      id: string;
      name: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffData {
  userId: string;
  position: string;
  isActive?: boolean;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface UpdateStaffData {
  position?: string;
  isActive?: boolean;
}

export interface AssignRolesData {
  roleId: string;
}


