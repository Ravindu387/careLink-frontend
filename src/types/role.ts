export interface Role {
  id: string;
  name: string;
  purpose: string;
  usersCount: number;
  permissionsCount: number;
  isSystemRole: boolean;
  status: "Protected" | "Active";
}

export interface RoleDetails {
  id: string;
  name: string;
  purpose: string;
  usersCount: number;
  isSystemRole: boolean;
  permissions: string[];
}

export interface CreateRolePayload {
  name: string;
  purpose?: string;
  permissions: string[];
}

export interface UpdateRolePayload {
  name: string;
  purpose?: string;
}

export interface UpdateRolePermissionsPayload {
  permissions: string[];
}

export interface UpdateUserRolesPayload {
  roles: string[];
}

export interface Permission {
  name: string;
  displayName: string;
  category: string;
  description: string;
}

export interface PermissionCategory {
  category: string;
  count: number;
  permissions: Permission[];
}
