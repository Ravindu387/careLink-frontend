import { request } from "./api";
import type {
  CitizenNotification,
  CreateNotificationPayload,
  NotificationSummary,
  NotificationFilterParams,
} from "../types/notification";

export const MOCK_NOTIFICATIONS: CitizenNotification[] = [
  {
    id: 1,
    type: "alert",
    title: "Evacuation alert for Riverside",
    description: "Move to North Ward Community Hall using Market Road.",
    time: "12 min ago",
    unread: true,
    category: "Safety alerts",
    actionUrl: "/citizen/safety-updates",
  },
  {
    id: 2,
    type: "message",
    title: "New message from Case Support",
    description: "Accessible shelter space is being confirmed.",
    time: "1 hour ago",
    unread: true,
    category: "My requests",
    actionUrl: "/citizen/messages",
  },
  {
    id: 3,
    type: "delivery",
    title: "Your delivery is on the way",
    description: "Food and water delivery expected by 14:20.",
    time: "42 min ago",
    unread: true,
    category: "My requests",
    actionUrl: "/citizen/my-requests",
  },
  {
    id: 4,
    type: "shelter",
    title: "Shelter availability updated",
    description: "Riverton High School has 48 spaces available.",
    time: "1 hr ago",
    unread: true,
    category: "Safety alerts",
    actionUrl: "/citizen/shelters",
  },
  {
    id: 5,
    type: "medical",
    title: "Medical request completed",
    description: "Support delivery was confirmed.",
    time: "1 day ago",
    unread: false,
    category: "My requests",
    actionUrl: "/citizen/my-requests",
  },
];

export const notificationService = {
  async getNotifications(params?: NotificationFilterParams): Promise<CitizenNotification[]> {
    const query = new URLSearchParams();
    if (params?.citizenName) query.append("citizenName", params.citizenName);
    if (params?.category && params.category !== "All") {
      query.append("category", params.category);
    }
    if (params?.unreadOnly) query.append("unreadOnly", "true");
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<CitizenNotification[]>(`/citizen/notifications${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getNotificationById(id: string | number): Promise<CitizenNotification> {
    const response = await request<CitizenNotification>(`/citizen/notifications/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async createNotification(payload: CreateNotificationPayload): Promise<CitizenNotification> {
    const response = await request<CitizenNotification>("/citizen/notifications", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async markAsRead(id: string | number): Promise<boolean> {
    const response = await request<boolean>(`/citizen/notifications/${id}/read`, {
      method: "PATCH",
    });
    return response.data ?? response.success;
  },

  async markAllAsRead(citizenName?: string): Promise<number> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<number>(`/citizen/notifications/mark-all-read${query}`, {
      method: "POST",
    });
    return response.data ?? 0;
  },

  async deleteNotification(id: string | number): Promise<boolean> {
    const response = await request<boolean>(`/citizen/notifications/${id}`, {
      method: "DELETE",
    });
    return response.data ?? response.success;
  },

  async getSummary(citizenName?: string): Promise<NotificationSummary> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<NotificationSummary>(`/citizen/notifications/summary${query}`, {
      method: "GET",
    });
    return response.data;
  },
};
