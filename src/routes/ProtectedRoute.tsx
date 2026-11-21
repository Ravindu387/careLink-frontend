import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
}

export default function ProtectedRoute({
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = false,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    hasAnyRole,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFF6F7]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#123B5C] border-t-transparent" />
          <p className="text-xs font-medium text-[#123B5C]">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasAnyRole(allowedRoles)) {
      return <Navigate to="/access-denied" state={{ from: location }} replace />;
    }
  }

  // Check granular permission authorization
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPerm = requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasPerm) {
      return <Navigate to="/access-denied" state={{ from: location }} replace />;
    }
  }

  return <Outlet />;
}
