export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  nic?: string;
  address?: string;
  roles: string[];
  permissions: string[];
  organizationId?: string;
  organizationName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  nic?: string;
  address?: string;
  role?: string;
  organizationId?: string;
}
