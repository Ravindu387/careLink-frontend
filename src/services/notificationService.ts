import { request } from "./api";
import type {
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
