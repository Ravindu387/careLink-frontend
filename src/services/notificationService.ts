import { apiClient } from "./api";
import type {
  NotificationItem,
  NotificationSummary,
  NotificationPreference,
  NotificationQueryParams,
  PagedResult,
  CreateNotificationInput,
} from "../types/notification";

const BASE_PATH = "/notifications";

export const notificationService = {
  async getNotifications(
    params?: NotificationQueryParams
  ): Promise<PagedResult<NotificationItem>> {
    return apiClient.get<PagedResult<NotificationItem>>(BASE_PATH, params);
  },

  async getSummary(role: string = "ShelterAdmin"): Promise<NotificationSummary> {
    return apiClient.get<NotificationSummary>(`${BASE_PATH}/summary`, { role });
  },

  async getUnreadCount(role: string = "ShelterAdmin"): Promise<number> {
    const res = await apiClient.get<{ count: number }>(
      `${BASE_PATH}/unread-count`,
      { role }
    );
    return res.count;
  },

  async getPreferences(
    role: string = "ShelterAdmin"
  ): Promise<NotificationPreference> {
    return apiClient.get<NotificationPreference>(`${BASE_PATH}/preferences`, {
      role,
    });
  },

  async savePreferences(
    preferences: Partial<NotificationPreference>,
    role: string = "ShelterAdmin"
  ): Promise<NotificationPreference> {
    return apiClient.put<NotificationPreference>(
      `${BASE_PATH}/preferences?role=${encodeURIComponent(role)}`,
      preferences
    );
  },

  async getNotificationById(id: number): Promise<NotificationItem> {
    return apiClient.get<NotificationItem>(`${BASE_PATH}/${id}`);
  },

  async markAsRead(id: number): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(
      `${BASE_PATH}/${id}/read`,
      {}
    );
  },

  async markAllAsRead(
    role: string = "ShelterAdmin"
  ): Promise<{ count: number; message: string }> {
    return apiClient.post<{ count: number; message: string }>(
      `${BASE_PATH}/mark-all-read?role=${encodeURIComponent(role)}`,
      {}
    );
  },

  async createNotification(
    input: CreateNotificationInput
  ): Promise<NotificationItem> {
    return apiClient.post<NotificationItem>(BASE_PATH, input);
  },

  async deleteNotification(id: number): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },
};
