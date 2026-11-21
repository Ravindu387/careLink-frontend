import { useAuth } from "../context/AuthContext";

export function usePermission(permissionOrPermissions?: string | string[]) {
  const { permissions, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  const isAllowed = !permissionOrPermissions
    ? true
    : Array.isArray(permissionOrPermissions)
      ? hasAnyPermission(permissionOrPermissions)
      : hasPermission(permissionOrPermissions);

  return {
    isAllowed,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
  };
}
