import { request } from "./api";
import type {
  CaseManagerSettingsDto,
  ChangePasswordRequest,
} from "../types/caseManagerSettings";

const defaultSettings: CaseManagerSettingsDto = {
  profile: {
    fullName: "Amina Mensah",
    email: "amina@response.org",
    phone: "+94 77 412 8041",
    area: "Greater Riverton",
    profileImage: null,
  },
  queue: {
    defaultPriority: "All priorities",
    defaultCategory: "All categories",
    defaultStatus: "All statuses",
    autoRefresh: true,
    showCriticalFirst: true,
    showMyCasesOnly: false,
  },
  notifications: {
    inAppNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
    criticalAlerts: true,
    assignmentAlerts: true,
    evidenceUpdates: true,
    escalationAlerts: true,
    aiRecommendations: false,
  },
  security: {
    twoFactor: true,
    loginAlerts: true,
  },
  activeSessions: [
    {
      id: "sess-01",
      device: "Windows",
      browser: "Chrome",
      location: "Colombo, Western Province",
      lastActive: "Active now",
      isCurrent: true,
    },
    {
      id: "sess-02",
      device: "Android",
      browser: "Chrome Mobile",
      location: "Riverton Field Office",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
  ],
};

let fallbackSettings = JSON.parse(
  localStorage.getItem("caseManagerSettings_backendFallback") || JSON.stringify(defaultSettings)
);

export const caseManagerSettingsService = {
  async getSettings(): Promise<{ data: CaseManagerSettingsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<CaseManagerSettingsDto>("/case-manager-settings");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback
    }

    return {
      data: fallbackSettings,
      isLiveBackend: false,
    };
  },

  async updateSettings(
    settings: CaseManagerSettingsDto
  ): Promise<{ data: CaseManagerSettingsDto; isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<CaseManagerSettingsDto>("/case-manager-settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      if (response && response.success && response.data) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || "Settings saved successfully.",
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    fallbackSettings = { ...settings };
    localStorage.setItem("caseManagerSettings_backendFallback", JSON.stringify(fallbackSettings));

    return {
      data: fallbackSettings,
      isLiveBackend: false,
      message: "Settings saved in demo mode.",
    };
  },

  async changePassword(
    req: ChangePasswordRequest
  ): Promise<{ isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<boolean>("/case-manager-settings/change-password", {
        method: "POST",
        body: JSON.stringify(req),
      });
      if (response && response.success) {
        return {
          isLiveBackend: true,
          message: response.message || "Password updated successfully.",
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    if (!req.currentPassword || !req.newPassword || req.newPassword.length < 8) {
      throw new Error("Password must have at least 8 characters.");
    }

    return {
      isLiveBackend: false,
      message: "Password change request processed (Demo Mode).",
    };
  },

  async revokeSession(
    sessionId: string
  ): Promise<{ isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<boolean>(`/case-manager-settings/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (response && response.success) {
        return {
          isLiveBackend: true,
          message: response.message || `Session ${sessionId} revoked successfully.`,
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    fallbackSettings.activeSessions = fallbackSettings.activeSessions.filter(
      (s: { id: string; device: string }) => s.id !== sessionId && s.device !== sessionId
    );
    localStorage.setItem("caseManagerSettings_backendFallback", JSON.stringify(fallbackSettings));

    return {
      isLiveBackend: false,
      message: `Session ${sessionId} revoked (Demo Mode).`,
    };
  },

  async resetDefaults(): Promise<{ data: CaseManagerSettingsDto; isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<CaseManagerSettingsDto>("/case-manager-settings/reset", {
        method: "POST",
      });
      if (response && response.success && response.data) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || "Settings reset to defaults.",
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    fallbackSettings = JSON.parse(JSON.stringify(defaultSettings));
    localStorage.removeItem("caseManagerSettings_backendFallback");

    return {
      data: fallbackSettings,
      isLiveBackend: false,
      message: "Settings reset to defaults (Demo Mode).",
    };
  },
};
