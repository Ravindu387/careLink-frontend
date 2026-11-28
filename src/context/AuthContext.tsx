import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import type {
  User,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  RegisterResponse,
} from "../types/auth";
import { authService } from "../services/authService";
import {
  type AppRole,
  getDashboardPathForRoles,
  normalizeAppRole,
  normalizeUserRoles,
  resolvePrimaryRole,
} from "../constants/roles";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: string[];
  normalizedRoles: AppRole[];
  primaryRole: AppRole | null;
  dashboardPath: string | null;
  permissions: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  getDashboardPath: () => string;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isJwtExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false; // Non-JWT mock token in tests
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    if (typeof payload.exp === "number") {
      return payload.exp * 1000 < Date.now();
    }
    return false;
  } catch {
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedToken = authService.getToken();
    if (storedToken && isJwtExpired(storedToken)) {
      authService.logout();
      return null;
    }
    return authService.getStoredUser();
  });
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = authService.getToken();
    if (storedToken && isJwtExpired(storedToken)) {
      authService.logout();
      return null;
    }
    return storedToken;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = authService.getToken();
    if (!currentToken || isJwtExpired(currentToken)) {
      authService.logout();
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
      setToken(authService.getToken());
    } catch {
      authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    const authData = await authService.login(payload);
    setUser(authData.user);
    setToken(authData.token);
    return authData;
  };

  const register = async (
    payload: RegisterPayload
  ): Promise<RegisterResponse> => {
    const regData = await authService.register(payload);
    if (regData.token && regData.user && !regData.requiresAdminApproval) {
      setUser(regData.user);
      setToken(regData.token);
    }
    return regData;
  };

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const roles = useMemo(() => user?.roles || [], [user]);
  const normalizedRoles = useMemo(() => normalizeUserRoles(roles), [roles]);
  const primaryRole = useMemo(() => resolvePrimaryRole(roles), [roles]);
  const dashboardPath = useMemo(() => getDashboardPathForRoles(roles), [roles]);
  const permissions = useMemo(() => user?.permissions || [], [user]);

  const isAccountActive = useMemo(() => {
    if (!user) return false;
    if (user.isActive === false) return false;
    if (user.requiresPasswordSetup) return false;
    if (
      user.accountStatus &&
      user.accountStatus !== "Active"
    ) {
      return false;
    }
    return true;
  }, [user]);

  const hasRole = useCallback(
    (targetRole: string): boolean => {
      if (!isAccountActive || !roles || roles.length === 0) return false;

      const canonicalTarget = normalizeAppRole(targetRole);
      if (canonicalTarget) {
        return normalizedRoles.includes(canonicalTarget);
      }

      const lower = targetRole.trim().toLowerCase();
      return roles.some((r) => r.trim().toLowerCase() === lower);
    },
    [isAccountActive, roles, normalizedRoles]
  );

  const hasAnyRole = useCallback(
    (targetRoles: string[]): boolean => {
      if (!targetRoles || targetRoles.length === 0) return isAccountActive;
      return targetRoles.some((r) => hasRole(r));
    },
    [isAccountActive, hasRole]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user || !isAccountActive) return false;

      if (hasRole("Admin")) {
        return true;
      }

      if (!permissions || permissions.length === 0) return false;
      return permissions.some(
        (p) => p.toLowerCase() === permission.toLowerCase()
      );
    },
    [user, isAccountActive, hasRole, permissions]
  );

  const hasAnyPermission = useCallback(
    (perms: string[]): boolean => {
      if (!perms || perms.length === 0) return isAccountActive;
      if (hasRole("Admin")) return true;
      return perms.some((p) => hasPermission(p));
    },
    [isAccountActive, hasRole, hasPermission]
  );

  const hasAllPermissions = useCallback(
    (perms: string[]): boolean => {
      if (!perms || perms.length === 0) return isAccountActive;
      if (hasRole("Admin")) return true;
      return perms.every((p) => hasPermission(p));
    },
    [isAccountActive, hasRole, hasPermission]
  );

  const getDashboardPath = useCallback((): string => {
    return dashboardPath || "/login";
  }, [dashboardPath]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user && !isJwtExpired(token),
        isLoading,
        roles,
        normalizedRoles,
        primaryRole,
        dashboardPath,
        permissions,
        hasRole,
        hasAnyRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getDashboardPath,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
