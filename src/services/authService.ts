import { request } from "./api";
import type {
  AuthResponse,
  LoginPayload,
  PartnerAdditionalInfoSubmission,
  RegisterPayload,
  RegisterResponse,
  SetupPasswordPayload,
  User,
} from "../types/auth";

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

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const res = await request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.data?.token && res.data?.user && !res.data?.requiresAdminApproval) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    }

    return res.data;
  },

  async submitPartnerAdditionalInfo(
    payload: PartnerAdditionalInfoSubmission
  ): Promise<string> {
    const res = await request<boolean>("/auth/partner-additional-info", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return (
      res.message ||
      "Additional verification information submitted successfully."
    );
  },

  async verifySetupToken(email: string, token: string): Promise<boolean> {
    const res = await request<boolean>(
      `/auth/verify-setup-token?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
      {
        method: "GET",
      }
    );
    return res.data ?? false;
  },

  async setupPassword(payload: SetupPasswordPayload): Promise<string> {
    const res = await request<boolean>("/auth/setup-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.message || "Password configured successfully. You can now sign in.";
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

  async getPublicRoles(): Promise<string[]> {
    const res = await request<string[]>("/auth/public-roles", {
      method: "GET",
    });
    return res.data || ["Citizen", "Volunteer", "PartnerOfficer"];
  },

  async resendVerification(email: string): Promise<string> {
    const res = await request<string>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return res.message || "Verification email sent successfully.";
  },

  async verifyEmail(email: string, token: string): Promise<boolean> {
    const res = await request<boolean>(
      `/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
      {
        method: "GET",
      }
    );
    return res.data ?? false;
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
