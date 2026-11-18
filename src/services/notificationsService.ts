import { request } from "./api";
import type {
  NotificationItem,
  NotificationSummaryDto,
  NotificationPreferencesDto,
  NotificationQueryDto,
  CreateNotificationRequest,
  PaginatedResult,
} from "../types/notifications";

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Critical case overdue",
    description: "REQ-2821 exceeded critical review SLA.",
    time: "3 min ago",
    type: "Critical",
    read: false,
    caseId: "REQ-2821",
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 2,
    title: "New case assigned to you",
    description: "REQ-2841 · Emergency shelter.",
    time: "12 min ago",
    type: "Assignment",
    read: false,
    caseId: "REQ-2841",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 3,
    title: "Potential duplicate detected",
    description: "REQ-2836 matches REQ-2811 at 88%.",
    time: "28 min ago",
    type: "Duplicate",
    read: false,
    caseId: "REQ-2836",
    createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
  },
  {
    id: 4,
    title: "Citizen supplied requested information",
    description: "REQ-2814 · Prescription uploaded.",
    time: "42 min ago",
    type: "Evidence",
    read: false,
    caseId: "REQ-2814",
    createdAt: new Date(Date.now() - 42 * 60000).toISOString(),
  },
  {
    id: 5,
    title: "Escalation acknowledged",
    description: "Emergency Coordinator accepted REQ-2821.",
    time: "1 hr ago",
    type: "Escalation",
    read: true,
    caseId: "REQ-2821",
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 6,
    title: "AI recommendation ready",
    description: "REQ-2841 · 94% confidence.",
    time: "2 hr ago",
    type: "AI",
    read: true,
    caseId: "REQ-2841",
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: 7,
    title: "New case assigned to your team",
    description: "REQ-2839 · Medical supplies.",
    time: "3 hr ago",
    type: "Assignment",
    read: true,
    caseId: "REQ-2839",
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
  },
  {
    id: 8,
    title: "Evidence verification completed",
    description: "REQ-2828 · Documents successfully verified.",
    time: "4 hr ago",
    type: "Evidence",
    read: true,
    caseId: "REQ-2828",
    createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
  },
  {
    id: 9,
    title: "Critical priority updated",
    description: "REQ-2789 · Priority changed to Critical.",
    time: "5 hr ago",
    type: "Critical",
    read: true,
    caseId: "REQ-2789",
    createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
  },
  {
    id: 10,
    title: "AI recommendation ready",
    description: "REQ-2761 · Resource matching completed.",
    time: "6 hr ago",
    type: "AI",
    read: true,
    caseId: "REQ-2761",
    createdAt: new Date(Date.now() - 360 * 60000).toISOString(),
  },
  {
    id: 11,
    title: "Potential duplicate detected",
    description: "REQ-2701 matches REQ-2689 at 81%.",
    time: "Yesterday",
    type: "Duplicate",
    read: true,
    caseId: "REQ-2701",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 12,
    title: "Case escalation received",
    description: "REQ-2650 requires senior review.",
    time: "Yesterday",
    type: "Escalation",
    read: true,
    caseId: "REQ-2650",
    createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
];

let fallbackNotifications = [...initialNotifications];

let fallbackPreferences: NotificationPreferencesDto = {
  inAppEnabled: true,
  emailEnabled: true,
  pushEnabled: true,
  criticalEnabled: true,
  assignmentEnabled: true,
  evidenceEnabled: true,
};

export const notificationsService = {
  async getSummary(): Promise<{ data: NotificationSummaryDto; isLiveBackend: boolean }> {
    try {
      const response = await request<NotificationSummaryDto>("/notifications/summary");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback
    }

    const unread = fallbackNotifications.filter((n) => !n.read).length;
    const critical = fallbackNotifications.filter((n) => n.type === "Critical").length;
    const assignment = fallbackNotifications.filter((n) => n.type === "Assignment").length;
    const evidence = fallbackNotifications.filter((n) => n.type === "Evidence").length;
    const duplicate = fallbackNotifications.filter((n) => n.type === "Duplicate").length;
    const escalation = fallbackNotifications.filter((n) => n.type === "Escalation").length;
    const ai = fallbackNotifications.filter((n) => n.type === "AI").length;

    return {
      data: {
        totalCount: fallbackNotifications.length,
        unreadCount: unread,
        criticalCount: critical,
        assignmentCount: assignment,
        evidenceCount: evidence,
        duplicateCount: duplicate,
        escalationCount: escalation,
        aiCount: ai,
        deliveryServices: [
          { name: "In-app notifications", status: "Operational", message: "In-app operational" },
          { name: "Email notifications", status: "Operational", message: "Email operational" },
          { name: "SMS notifications", status: "Degraded", message: "SMS provider degraded" },
        ],
      },
      isLiveBackend: false,
    };
  },

  async getNotifications(
    query: NotificationQueryDto
  ): Promise<{ data: PaginatedResult<NotificationItem>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.tab) params.append("tab", query.tab);
      if (query.search) params.append("search", query.search);
      if (query.type) params.append("type", query.type);
      if (query.unreadOnly !== undefined) params.append("unreadOnly", String(query.unreadOnly));
      if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));

      const url = `/notifications${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<PaginatedResult<NotificationItem>>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback
    }

    let list = [...fallbackNotifications];

    if (query.tab && query.tab !== "All") {
      if (query.tab === "Unread") {
        list = list.filter((n) => !n.read);
      } else if (query.tab === "Critical") {
        list = list.filter((n) => n.type === "Critical");
      } else if (query.tab === "Assignments") {
        list = list.filter((n) => n.type === "Assignment");
      } else if (query.tab === "Evidence") {
        list = list.filter((n) => n.type === "Evidence");
      }
    }

    if (query.unreadOnly) {
      list = list.filter((n) => !n.read);
    }

    if (query.type && query.type !== "All") {
      list = list.filter((n) => n.type.toLowerCase() === query.type?.toLowerCase());
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.description.toLowerCase().includes(s) ||
          n.caseId.toLowerCase().includes(s)
      );
    }

    const pageNumber = query.pageNumber || 1;
    const pageSize = query.pageSize || 6;
    const totalCount = list.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const items = list.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    return {
      data: {
        items,
        totalCount,
        pageNumber,
        pageSize,
        totalPages,
      },
      isLiveBackend: false,
    };
  },

  async markAsRead(id: number): Promise<{ isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<boolean>(`/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (response && response.success) {
        return { isLiveBackend: true, message: response.message || "Notification marked as read." };
      }
    } catch {
      // Backend unavailable; fallback
    }

    const item = fallbackNotifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
    }

    return {
      isLiveBackend: false,
      message: `Notification ${id} marked as read (Demo Mode).`,
    };
  },

  async markAllAsRead(): Promise<{ isLiveBackend: boolean; count: number; message: string }> {
    try {
      const response = await request<number>("/notifications/mark-all-read", {
        method: "POST",
      });
      if (response && response.success) {
        return {
          isLiveBackend: true,
          count: response.data,
          message: response.message || "All notifications marked as read.",
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    let count = 0;
    fallbackNotifications = fallbackNotifications.map((n) => {
      if (!n.read) count++;
      return { ...n, read: true };
    });

    return {
      isLiveBackend: false,
      count,
      message: `${count} notification(s) marked as read (Demo Mode).`,
    };
  },

  async deleteNotification(id: number): Promise<{ isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<boolean>(`/notifications/${id}`, {
        method: "DELETE",
      });
      if (response && response.success) {
        return { isLiveBackend: true, message: response.message || "Notification deleted." };
      }
    } catch {
      // Backend unavailable; fallback
    }

    fallbackNotifications = fallbackNotifications.filter((n) => n.id !== id);
    return {
      isLiveBackend: false,
      message: `Notification ${id} deleted (Demo Mode).`,
    };
  },

  async createNotification(
    req: CreateNotificationRequest
  ): Promise<{ data: NotificationItem; isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<NotificationItem>("/notifications", {
        method: "POST",
        body: JSON.stringify(req),
      });
      if (response && response.success && response.data) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || "Notification created.",
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    const nextId =
      fallbackNotifications.length > 0
        ? Math.max(...fallbackNotifications.map((n) => n.id)) + 1
        : 1;

    const newItem: NotificationItem = {
      id: nextId,
      title: req.title,
      description: req.description,
      type: req.type || "Assignment",
      read: false,
      caseId: req.caseId,
      time: "Just now",
      createdAt: new Date().toISOString(),
    };

    fallbackNotifications.unshift(newItem);

    return {
      data: newItem,
      isLiveBackend: false,
      message: "Notification created (Demo Mode).",
    };
  },

  async getPreferences(): Promise<{
    data: NotificationPreferencesDto;
    isLiveBackend: boolean;
  }> {
    try {
      const response = await request<NotificationPreferencesDto>("/notifications/preferences");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback
    }

    return {
      data: { ...fallbackPreferences },
      isLiveBackend: false,
    };
  },

  async updatePreferences(
    prefs: NotificationPreferencesDto
  ): Promise<{ data: NotificationPreferencesDto; isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<NotificationPreferencesDto>("/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(prefs),
      });
      if (response && response.success && response.data) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || "Notification preferences updated.",
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    fallbackPreferences = { ...prefs };

    return {
      data: { ...prefs },
      isLiveBackend: false,
      message: "Notification preferences updated (Demo Mode).",
    };
  },
};
