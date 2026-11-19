import React from "react";
import { useAuth } from "../../context/AuthContext";

interface RoleGuardProps {
  role?: string;
  roles?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  role,
  roles,
  fallback = null,
  children,
}) => {
  const { hasRole, hasAnyRole } = useAuth();

  let isAuthorized = true;

  if (role) {
    isAuthorized = hasRole(role);
  } else if (roles && roles.length > 0) {
    isAuthorized = hasAnyRole(roles);
  }

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
