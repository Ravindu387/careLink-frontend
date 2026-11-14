import { request } from "./api";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "../types/auth";

const TOKEN_KEY = "carelink_token";
const USER_KEY = "carelink_user";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.data?.token) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    }

    return res.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.data?.token) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    }

    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await request<User>("/auth/me", {
      method: "GET",
    });

    if (res.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    }

    return res.data;
  },

  async getRoles(): Promise<string[]> {
    const res = await request<string[]>("/auth/roles", {
      method: "GET",
    });
    return res.data || [];
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
