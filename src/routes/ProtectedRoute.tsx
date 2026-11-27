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
    user,
    isAuthenticated,
    isLoading,
    normalizedRoles,
    hasAnyRole,
    hasAllPermissions,
    hasAnyPermission,
  } = useAuth();
  const location = useLocation();

  // 1. Wait for authentication and role restoration before redirecting
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFF6F7]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#123B5C] border-t-transparent" />
          <p className="text-sm font-medium text-[#123B5C]">
            Verifying authorization...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated users -> redirect to /login preserving target location
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Enforce account setup and status restrictions
  if (
    user.requiresPasswordSetup ||
    user.accountStatus === "PendingPasswordSetup"
  ) {
    return <Navigate to="/setup-password" replace />;
  }

  if (
    user.isActive === false ||
    (user.accountStatus && user.accountStatus !== "Active")
  ) {
    return (
      <Navigate
        to="/access-denied"
        state={{
          from: location,
          reason: user.accountStatus || "AccountInactive",
        }}
        replace
      />
    );
  }

  // 4. Reject accounts with missing or unrecognized role claims
  if (!normalizedRoles || normalizedRoles.length === 0) {
    return (
      <Navigate
        to="/access-denied"
        state={{ from: location, reason: "MissingRoleClaims" }}
        replace
      />
    );
  }

  // 5. Check role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasAnyRole(allowedRoles)) {
      return (
        <Navigate
          to="/access-denied"
          state={{
            from: location,
            reason: "InsufficientRole",
            requiredRoles: allowedRoles,
          }}
          replace
        />
      );
    }
  }

  // 6. Check granular permission authorization
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPerm = requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasPerm) {
      return (
        <Navigate
          to="/access-denied"
          state={{
            from: location,
            reason: "InsufficientPermissions",
          }}
          replace
        />
      );
    }
  }

  return <Outlet />;
}
