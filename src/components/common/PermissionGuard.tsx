import React from "react";
import { useAuth } from "../../context/AuthContext";

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let isAuthorized = true;

  if (permission) {
    isAuthorized = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    isAuthorized = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
