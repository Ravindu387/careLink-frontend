import { request } from "./api";
import type {
  VolunteerSettingsDto,
  VolunteerChangePasswordRequest,
} from "../types/volunteerSettings";

const defaultSettings: VolunteerSettingsDto = {
  profile: {
    fullName: "Nadia Okafor",
    email: "nadia@reliefos.org",
    phone: "+94 77 412 8041",
    area: "Greater Riverton",
    photo: null,
  },
  matchingRules: {
    minimumScore: "70",
    travelDistance: "25",
    availability: true,
    verifiedSkills: true,
    experience: true,
    training: true,
    preventConflicts: true,
    humanApproval: true,
  },
  notificationSettings: {
    assignments: true,
    verification: true,
    safety: true,
    aiMatching: true,
    communications: true,
    inApp: true,
    email: true,
    sms: false,
    urgentOnly: false,
  },
  security: {
    twoFactor: true,
  },
  activeSessions: [
    {
      id: "sess-01",
      device: "Windows",
      browser: "Chrome",
      location: "Riverton Operations Center",
      lastActive: "Active now",
      isCurrent: true,
    },
    {
      id: "sess-02",
      device: "Android",
      browser: "CareLink Mobile",
      location: "Riverton Field Office",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
  ],
};

function getLocalSettings(): VolunteerSettingsDto {
  try {
    const raw = localStorage.getItem("carelink-coordinator-settings");
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return defaultSettings;
}

export const volunteerSettingsService = {
  /**
   * Retrieves volunteer coordinator settings from backend API or local cache
   */
  async getSettings(): Promise<{ data: VolunteerSettingsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerSettingsDto>("/volunteer/settings");
      if (response && response.success && response.data) {
        localStorage.setItem("carelink-coordinator-settings", JSON.stringify(response.data));
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fall through to local fallback
    }

    return {
      data: getLocalSettings(),
      isLiveBackend: false,
    };
  },

  /**
   * Updates settings on backend API and caches locally
   */
  async updateSettings(
    settings: VolunteerSettingsDto
  ): Promise<{ data: VolunteerSettingsDto; isLiveBackend: boolean; message: string }> {
    localStorage.setItem("carelink-coordinator-settings", JSON.stringify(settings));

    try {
      const response = await request<VolunteerSettingsDto>("/volunteer/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });

      if (response && response.success && response.data) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || "Settings saved successfully!",
        };
      }
    } catch {
      // Fallback saved locally
    }

    return {
      data: settings,
      isLiveBackend: false,
      message: "Settings saved to local workspace cache.",
    };
  },

  /**
   * Changes coordinator account password
   */
  async changePassword(requestData: VolunteerChangePasswordRequest): Promise<boolean> {
    try {
      const response = await request<boolean>("/volunteer/settings/change-password", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
      return !!(response && response.success);
    } catch {
      return requestData.newPassword.length >= 8 && requestData.newPassword === requestData.confirmPassword;
    }
  },

  /**
   * Revokes a session by ID
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    try {
      const response = await request<boolean>(`/volunteer/settings/sessions/${sessionId}`, {
        method: "DELETE",
      });
      return !!(response && response.success);
    } catch {
      const local = getLocalSettings();
      if (local.activeSessions) {
        local.activeSessions = local.activeSessions.filter((s) => s.id !== sessionId);
        localStorage.setItem("carelink-coordinator-settings", JSON.stringify(local));
      }
      return true;
    }
  },

  /**
   * Resets settings back to system defaults
   */
  async resetDefaults(): Promise<{ data: VolunteerSettingsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerSettingsDto>("/volunteer/settings/reset", {
        method: "POST",
      });
      if (response && response.success && response.data) {
        localStorage.setItem("carelink-coordinator-settings", JSON.stringify(response.data));
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    localStorage.setItem("carelink-coordinator-settings", JSON.stringify(defaultSettings));
    return {
      data: defaultSettings,
      isLiveBackend: false,
    };
  },
};
