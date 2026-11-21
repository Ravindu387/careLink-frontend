import { request } from "./api";
import type {
  ResourceManagerSettings,
  UpdateSettingsPayload,
  ProfileSettings,
  InventoryRulesSettings,
  DispatchPreferencesSettings,
  NotificationPreferencesSettings,
  SecuritySettings,
} from "../types/settings";

export const settingsService = {
  async getSettings(): Promise<ResourceManagerSettings> {
    const response = await request<ResourceManagerSettings>("/settings", {
      method: "GET",
    });
    return response.data;
  },

  async updateSettings(payload: UpdateSettingsPayload): Promise<ResourceManagerSettings> {
    const response = await request<ResourceManagerSettings>("/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async resetSettings(): Promise<ResourceManagerSettings> {
    const response = await request<ResourceManagerSettings>("/settings/reset", {
      method: "POST",
    });
    return response.data;
  },

  async updateProfile(profile: ProfileSettings): Promise<ProfileSettings> {
    const response = await request<ProfileSettings>("/settings/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
    return response.data;
  },

  async updateInventory(inventory: InventoryRulesSettings): Promise<InventoryRulesSettings> {
    const response = await request<InventoryRulesSettings>("/settings/inventory", {
      method: "PUT",
      body: JSON.stringify(inventory),
    });
    return response.data;
  },

  async updateDispatch(dispatch: DispatchPreferencesSettings): Promise<DispatchPreferencesSettings> {
    const response = await request<DispatchPreferencesSettings>("/settings/dispatch", {
      method: "PUT",
      body: JSON.stringify(dispatch),
    });
    return response.data;
  },

  async updateNotifications(
    notifications: NotificationPreferencesSettings
  ): Promise<NotificationPreferencesSettings> {
    const response = await request<NotificationPreferencesSettings>("/settings/notifications", {
      method: "PUT",
      body: JSON.stringify(notifications),
    });
    return response.data;
  },

  async updateSecurity(security: SecuritySettings): Promise<SecuritySettings> {
    const response = await request<SecuritySettings>("/settings/security", {
      method: "PUT",
      body: JSON.stringify(security),
    });
    return response.data;
import type { SystemSettings } from "../types/settings";

export const settingsService = {
  async getSettings(): Promise<SystemSettings> {
    const res = await request<SystemSettings>("/settings", {
      method: "GET",
    });
    return res.data;
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await request<SystemSettings>("/settings", {
      method: "PUT",
      body: JSON.stringify({ settings }),
    });
    return res.data;
  },

  async resetDefaults(): Promise<SystemSettings> {
    const res = await request<SystemSettings>("/settings/reset", {
      method: "POST",
    });
    return res.data;
  },
};
