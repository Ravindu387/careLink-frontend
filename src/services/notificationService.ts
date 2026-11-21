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
  NotificationItem,
  NotificationStats,
  NotificationQuery,
  CreateNotificationRequest,
  NotificationPreferences,
  BatchNotificationAction,
} from "../types/notification";
import type { PaginatedList } from "../types/securityEvent";

export const notificationService = {
  async getNotifications(query?: NotificationQuery): Promise<PaginatedList<NotificationItem>> {
    const params = new URLSearchParams();
    if (query?.search) params.append("search", query.search);
    if (query?.type && query.type !== "All") params.append("type", query.type);
    if (query?.priority && query.priority !== "All priorities") {
      params.append("priority", query.priority);
    }
    if (query?.unreadOnly) params.append("unreadOnly", "true");
    if (query?.pageNumber) params.append("pageNumber", query.pageNumber.toString());
    if (query?.pageSize) params.append("pageSize", query.pageSize.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await request<PaginatedList<NotificationItem>>(`/notifications${queryString}`, {
      method: "GET",
    });

    return (
      response.data || {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: query?.pageSize || 50,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      }
    );
  },

  async getStats(): Promise<NotificationStats> {
    const response = await request<NotificationStats>("/notifications/stats", {
      method: "GET",
    });

    return (
      response.data || {
        total: 0,
        unreadCount: 0,
        criticalCount: 0,
        highPriorityCount: 0,
        emergencyCount: 0,
        assistanceCount: 0,
        volunteerCount: 0,
        resourceCount: 0,
        systemCount: 0,
      }
    );
  },

  async getById(id: number): Promise<NotificationItem | null> {
    const response = await request<NotificationItem>(`/notifications/${id}`, {
      method: "GET",
    });
    return response.data || null;
  },

  async createNotification(data: CreateNotificationRequest): Promise<NotificationItem> {
    const response = await request<NotificationItem>("/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.data) {
      throw new Error(response.message || "Failed to create notification.");
    }
    return response.data;
  },

  async markAsRead(id: number): Promise<boolean> {
    const response = await request<boolean>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
    return response.success;
  },

  async markAllAsRead(): Promise<boolean> {
    const response = await request<boolean>("/notifications/mark-all-read", {
      method: "POST",
    });
    return response.success;
  },

  async archiveNotification(id: number): Promise<boolean> {
    const response = await request<boolean>(`/notifications/${id}`, {
      method: "DELETE",
    });
    return response.success;
  },

  async batchAction(action: BatchNotificationAction): Promise<number> {
    const response = await request<number>("/notifications/batch", {
      method: "POST",
      body: JSON.stringify(action),
    });
    return response.data || 0;
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await request<NotificationPreferences>("/notifications/preferences", {
      method: "GET",
    });

    return (
      response.data || {
        emailAlerts: true,
        pushNotifications: true,
        emergencyCriticalSound: true,
        assistanceRequestsNotify: true,
        volunteerCheckInsNotify: true,
        lowResourceStockNotify: true,
        dailySummaryDigest: true,
      }
    );
  },

  async updatePreferences(
    preferences: NotificationPreferences
  ): Promise<NotificationPreferences> {
    const response = await request<NotificationPreferences>("/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });

    if (!response.data) {
      throw new Error(response.message || "Failed to update notification preferences.");
    }
    return response.data;
  },
};
