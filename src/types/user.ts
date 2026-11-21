export type UserStatus = "Active" | "Pending" | "Disabled";
export type Verification = "Verified" | "Pending Approval" | "Email Verified";

export interface UserDetails {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  nic?: string | null;
  address?: string | null;
  roles: string[];
  permissions?: string[];
  role: string;
  organizationId?: string | null;
  organizationName?: string | null;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  lastActive: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  disabledUsers: number;
  privilegedUsers: number;
}

export interface PaginatedList<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  nic?: string;
  address?: string;
  role: string;
  organizationId?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber?: string;
  nic?: string;
  address?: string;
  role?: string;
  organizationId?: string;
  isActive?: boolean;
}

export interface UserListQuery {
  search?: string;
  role?: string;
  status?: string;
  tab?: string;
  organization?: string;
  pageNumber?: number;
  pageSize?: number;
}
