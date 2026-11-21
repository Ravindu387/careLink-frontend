import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { User, LoginPayload, RegisterPayload, AuthResponse } from "../types/auth";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: string[];
  permissions: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    if (!authService.isAuthenticated()) {
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
      // If token expired or invalid, log out cleanly
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

  const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const authData = await authService.register(payload);
    setUser(authData.user);
    setToken(authData.token);
    return authData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const roles = useMemo(() => user?.roles || [], [user]);
  const permissions = useMemo(() => user?.permissions || [], [user]);

  const hasRole = useCallback((targetRole: string): boolean => {
    if (!roles || roles.length === 0) return false;
    const lower = targetRole.toLowerCase();

    // Check direct match
    if (roles.some((r) => r.toLowerCase() === lower)) return true;

    // Check alias: "admin" matches "admin" or "systemadmin"
    if (lower === "admin" || lower === "systemadmin") {
      return roles.some((r) => {
        const rLower = r.toLowerCase();
        return rLower === "admin" || rLower === "systemadmin";
      });
    }

    return false;
  }, [roles]);

  const hasAnyRole = useCallback((targetRoles: string[]): boolean => {
    if (!targetRoles || targetRoles.length === 0) return true;
    return targetRoles.some((r) => hasRole(r));
  }, [hasRole]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;

    // Admins have access to everything
    if (hasRole("Admin") || hasRole("SystemAdmin")) {
      return true;
    }

    if (!permissions || permissions.length === 0) return false;
    return permissions.some((p) => p.toLowerCase() === permission.toLowerCase());
  }, [user, hasRole, permissions]);

  const hasAnyPermission = useCallback((perms: string[]): boolean => {
    if (!perms || perms.length === 0) return true;
    if (hasRole("Admin") || hasRole("SystemAdmin")) return true;
    return perms.some((p) => hasPermission(p));
  }, [hasRole, hasPermission]);

  const hasAllPermissions = useCallback((perms: string[]): boolean => {
    if (!perms || perms.length === 0) return true;
    if (hasRole("Admin") || hasRole("SystemAdmin")) return true;
    return perms.every((p) => hasPermission(p));
  }, [hasRole, hasPermission]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        roles,
        permissions,
        hasRole,
        hasAnyRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
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
