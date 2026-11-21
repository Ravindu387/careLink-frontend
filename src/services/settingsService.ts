import { request } from "./api";
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
