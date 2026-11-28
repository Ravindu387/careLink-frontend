export type UserStatus =
  | "Active"
  | "PendingPasswordSetup"
  | "PendingApproval"
  | "Rejected"
  | "Disabled";

export type Verification =
  | "Verified"
  | "Pending Approval"
  | "Rejected"
  | "Setup Pending";

export interface UserDetails {
  id: string;
  userName?: string;
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
  organizationType?: string | null;
  registrationNumber?: string | null;
  isActive: boolean;
  accountStatus?: UserStatus | string;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  skills?: string | null;
  availability?: string | null;
  preferredLocation?: string | null;
  requiresPasswordSetup?: boolean;
  emailSent?: boolean;
  emailDeliveryStatus?: string | null;
  emailFailureCategory?: string | null;
  emailFailureDetail?: string | null;
  emailConfirmed: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  lastActive: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  pendingSetupUsers?: number;
  rejectedUsers?: number;
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
  organizationName?: string;
  skills?: string;
  availability?: string;
  preferredLocation?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber?: string;
  nic?: string;
  address?: string;
  role?: string;
  organizationId?: string;
  organizationName?: string;
  isActive?: boolean;
  accountStatus?: string;
  skills?: string;
  availability?: string;
  preferredLocation?: string;
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
