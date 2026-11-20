/**
 * Settings Service
 * Connects the Emergency Coordinator and Partner Officer Settings pages
 * to the CareLink .NET backend API.
 */

export interface CoordinatorProfile {
  fullName: string;
  email: string;
  phone: string;
  area: string;
  role?: string;
  initials?: string;
  badgeNumber?: string;
}

export interface CoordinatorOperational {
  autoRefresh: boolean;
  aiRecommendations: boolean;
  criticalAlerts: boolean;
  liveMap: boolean;
  defaultPriority: string;
  refreshInterval: string;
}

export interface CoordinatorNotifications {
  critical: boolean;
  ai: boolean;
  resources: boolean;
  shelters: boolean;
  partners: boolean;
  reports: boolean;
  email: boolean;
  browser: boolean;
}

export interface CoordinatorSecurity {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: string;
  lastPasswordChangedAt?: string;
}

export interface UserSession {
  id: string;
  title: string;
  description: string;
  deviceType: "desktop" | "mobile" | string;
  time: string;
  ipAddress?: string;
  current: boolean;
  lastActiveAt?: string;
}

export interface CoordinatorSettingsState {
  profile: CoordinatorProfile;
  operational: CoordinatorOperational;
  notifications: CoordinatorNotifications;
  security: CoordinatorSecurity;
  sessions: UserSession[];
  updatedAt?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResult {
  success: boolean;
  message: string;
}

export interface PartnerProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface PartnerOrganisation {
  name: string;
  registration: string;
  type: string;
  location: string;
  timezone: string;
  language: string;
  currency: string;
}

export interface PartnerSharing {
  referrals: boolean;
  resources: boolean;
  activities: boolean;
  reports: boolean;
  documents: boolean;
  publicProfile: boolean;
}

export interface PartnerNotifications {
  urgent: boolean;
  referrals: boolean;
  collaboration: boolean;
  resources: boolean;
  reports: boolean;
  team: boolean;
  email: boolean;
  push: boolean;
}

export interface PartnerSecurity {
  twoFactor: boolean;
  loginAlerts: boolean;
  sessionTimeout: string;
}

export interface PartnerSettingsState {
  profile: PartnerProfile;
  organisation: PartnerOrganisation;
  sharing: PartnerSharing;
  notifications: PartnerNotifications;
  security: PartnerSecurity;
  updatedAt?: string;
}

const DEFAULT_COORDINATOR_STATE: CoordinatorSettingsState = {
  profile: {
    fullName: "Amina Mensah",
    email: "amina@response.org",
    phone: "+94 77 412 8041",
    area: "Greater Riverton",
    role: "Emergency Coordinator",
    initials: "AM",
    badgeNumber: "EC-8842",
  },
  operational: {
    autoRefresh: true,
    aiRecommendations: true,
    criticalAlerts: true,
    liveMap: true,
    defaultPriority: "High",
    refreshInterval: "30 seconds",
  },
  notifications: {
    critical: true,
    ai: true,
    resources: true,
    shelters: true,
    partners: true,
    reports: true,
    email: true,
    browser: true,
  },
  security: {
    twoFactorEnabled: true,
    loginAlerts: true,
    sessionTimeout: "30 minutes",
  },
  sessions: [
    {
      id: "sess-001",
      title: "Windows - Chrome",
      description: "Current session · Windows desktop",
      deviceType: "desktop",
      time: "Active now",
      ipAddress: "192.168.1.100",
      current: true,
    },
    {
      id: "sess-002",
      title: "Mobile device",
      description: "Previously logged-in mobile device",
      deviceType: "mobile",
      time: "Last active 2 hours ago",
      ipAddress: "172.56.21.8",
      current: false,
    },
    {
      id: "sess-003",
      title: "Field HQ Terminal",
      description: "Emergency command center workstation",
      deviceType: "desktop",
      time: "Last active 1 day ago",
      ipAddress: "192.168.1.145",
      current: false,
    },
  ],
};

const DEFAULT_PARTNER_STATE: PartnerSettingsState = {
  profile: {
    fullName: "Sara Khan",
    email: "sara@globalrelief.org",
    phone: "+94 77 412 8014",
    role: "Partner Officer",
  },
  organisation: {
    name: "Global Relief Network",
    registration: "ORG-027",
    type: "International NGO",
    location: "Central Ward, Greater Riverton",
    timezone: "Asia/Colombo",
    language: "English",
    currency: "LKR",
  },
  sharing: {
    referrals: true,
    resources: true,
    activities: true,
    reports: false,
    documents: true,
    publicProfile: true,
  },
  notifications: {
    urgent: true,
    referrals: true,
    collaboration: true,
    resources: true,
    reports: true,
    team: false,
    email: true,
    push: true,
  },
  security: {
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: "30 minutes",
  },
};

const API_BASE = import.meta.env.VITE_API_URL || "";

export const settingsService = {
  // ================= Coordinator Settings =================

  async getCoordinatorSettings(): Promise<CoordinatorSettingsState> {
    try {
      const response = await fetch(`${API_BASE}/api/settings`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch {
      return DEFAULT_COORDINATOR_STATE;
    }
  },

  async updateCoordinatorProfile(profile: CoordinatorProfile): Promise<CoordinatorProfile> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update profile (${response.status})`);
      }
      return await response.json();
    } catch (err: any) {
      if (err.message && !err.message.includes("Failed to fetch")) {
        throw err;
      }
      return profile;
    }
  },

  async updateCoordinatorOperational(
    operational: CoordinatorOperational
  ): Promise<CoordinatorOperational> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/operational`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(operational),
      });
      if (!response.ok) {
        throw new Error(`Failed to update operational settings (${response.status})`);
      }
      return await response.json();
    } catch {
      return operational;
    }
  },

  async updateCoordinatorNotifications(
    notifications: CoordinatorNotifications
  ): Promise<CoordinatorNotifications> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(notifications),
      });
      if (!response.ok) {
        throw new Error(`Failed to update notification settings (${response.status})`);
      }
      return await response.json();
    } catch {
      return notifications;
    }
  },

  async changeCoordinatorPassword(payload: ChangePasswordPayload): Promise<ChangePasswordResult> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/security/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          message: data?.message || data?.errors?.NewPassword?.[0] || "Failed to update password.",
        };
      }
      return {
        success: true,
        message: data?.message || "Password updated successfully.",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Network error while changing password.",
      };
    }
  },

  async getCoordinatorSessions(): Promise<UserSession[]> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/sessions`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Failed to load sessions");
      return await response.json();
    } catch {
      return DEFAULT_COORDINATOR_STATE.sessions;
    }
  },

  async revokeCoordinatorSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/sessions/${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  async resetCoordinatorSettings(): Promise<CoordinatorSettingsState> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/reset`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Failed to reset settings");
      return await response.json();
    } catch {
      return DEFAULT_COORDINATOR_STATE;
    }
  },

  // ================= Partner Officer Settings =================

  async getPartnerSettings(): Promise<PartnerSettingsState> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/partner`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
    } catch {
      return DEFAULT_PARTNER_STATE;
    }
  },

  async updatePartnerProfile(profile: PartnerProfile): Promise<PartnerProfile> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/partner/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        throw new Error("Failed to update partner profile");
      }
      return await response.json();
    } catch {
      return profile;
    }
  },

  async updatePartnerOrganisation(organisation: PartnerOrganisation): Promise<PartnerOrganisation> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/partner/organisation`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(organisation),
      });
      if (!response.ok) {
        throw new Error("Failed to update organisation defaults");
      }
      return await response.json();
    } catch {
      return organisation;
    }
  },

  async updatePartnerSharing(sharing: PartnerSharing): Promise<PartnerSharing> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/partner/sharing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(sharing),
      });
      if (!response.ok) {
        throw new Error("Failed to update data sharing preferences");
      }
      return await response.json();
    } catch {
      return sharing;
    }
  },

  async updatePartnerNotifications(notifications: PartnerNotifications): Promise<PartnerNotifications> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/partner/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(notifications),
      });
      if (!response.ok) {
        throw new Error("Failed to update partner notifications");
      }
      return await response.json();
    } catch {
      return notifications;
    }
  },

  async updatePartnerSecurity(security: PartnerSecurity): Promise<PartnerSecurity> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/partner/security`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(security),
      });
      if (!response.ok) {
        throw new Error("Failed to update partner security settings");
      }
      return await response.json();
    } catch {
      return security;
    }
  },

  async changePartnerPassword(payload: ChangePasswordPayload): Promise<ChangePasswordResult> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/partner/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          message: data?.message || data?.errors?.NewPassword?.[0] || "Failed to update password.",
        };
      }
      return {
        success: true,
        message: data?.message || "Password updated successfully.",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Network error while changing password.",
      };
    }
  },

  async resetPartnerSettings(): Promise<PartnerSettingsState> {
    try {
      const response = await fetch(`${API_BASE}/api/settings/partner/reset`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Failed to reset partner settings");
      return await response.json();
    } catch {
      return DEFAULT_PARTNER_STATE;
    }
  },
};
