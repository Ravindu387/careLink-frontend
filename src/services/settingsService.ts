import { apiClient } from "./api";
import type {
  ProfileData,
  ShelterSettingsData,
  SecuritySettingsData,
  NotificationSettingsData,
} from "../types/settings";

// ── Profile ──────────────────────────────────────────────────────────────────

export const getProfile = (): Promise<ProfileData> =>
  apiClient.get<ProfileData>("/settings/profile");

export const updateProfile = (data: ProfileData): Promise<ProfileData> =>
  apiClient.put<ProfileData>("/settings/profile", data);

// ── Shelter ───────────────────────────────────────────────────────────────────

export const getShelterSettings = (): Promise<ShelterSettingsData> =>
  apiClient.get<ShelterSettingsData>("/settings/shelter");

export const updateShelterSettings = (
  data: ShelterSettingsData
): Promise<ShelterSettingsData> =>
  apiClient.put<ShelterSettingsData>("/settings/shelter", data);

// ── Security ──────────────────────────────────────────────────────────────────

export const getSecuritySettings = (): Promise<SecuritySettingsData> =>
  apiClient.get<SecuritySettingsData>("/settings/security");

export const updateSecuritySettings = (
  data: SecuritySettingsData
): Promise<{ message: string }> =>
  apiClient.put<{ message: string }>("/settings/security", data);

// ── Notifications ─────────────────────────────────────────────────────────────

export const getNotificationSettings =
  (): Promise<NotificationSettingsData> =>
    apiClient.get<NotificationSettingsData>("/settings/notifications");

export const updateNotificationSettings = (
  data: NotificationSettingsData
): Promise<NotificationSettingsData> =>
  apiClient.put<NotificationSettingsData>("/settings/notifications", data);
