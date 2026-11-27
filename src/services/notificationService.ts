/**
 * Notification Service
 * Connects Admin, Citizen, Emergency Coordinator, and Partner Officer notification centers
 * to the CareLink .NET backend with robust fallbacks.
 */

import { request, authFetch } from "./api";
import type {
  CitizenNotification,
  NotificationSummary,
  NotificationFilterParams,
  NotificationItem,
  NotificationStats,
  NotificationQuery,
  CreateNotificationRequest,
  BatchNotificationAction,
} from "../types/notification";
import type { PaginatedList } from "../types/securityEvent";

export type CoordinatorNotificationType =
  | "critical"
  | "ai"
  | "resource"
  | "shelter"
  | "partner"
  | "report"
  | "Urgent"
  | "Collaboration"
  | "Reporting"
  | "Agreement"
  | "Team"
  | "Resource"
  | string;

export type NotificationType = CoordinatorNotificationType;

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  category: CoordinatorNotificationType;
  unread: boolean;
  urgent?: boolean;
  reference: string;
  details: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  targetRole?: string;
  createdAt?: string;
}

export interface CoordinatorNotificationPreferences {
  critical?: boolean;
  ai?: boolean;
  resources?: boolean;
  shelter?: boolean;
  partner?: boolean;
  reports?: boolean;
  urgent?: boolean;
  referrals?: boolean;
  collaboration?: boolean;
  reporting?: boolean;
  team?: boolean;
  email?: boolean;
  push?: boolean;
  updatedAt?: string;
}

export type NotificationPreferences = CoordinatorNotificationPreferences;

export interface NotificationCounts {
  all: number;
  unread: number;
  critical: number;
  ai: number;
  resource: number;
  shelter: number;
  partner: number;
  report: number;
  urgent?: number;
  collaboration?: number;
  reporting?: number;
  team?: number;
  agreement?: number;
  lastUpdated?: string;
}

export interface NotificationFilters {
  search?: string;
  category?: string;
  unreadOnly?: boolean;
  urgentOnly?: boolean;
  role?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedNotifications {
  items: Notification[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  unreadCount: number;
}

export interface CoordinatorCreateNotificationPayload {
  title: string;
  description: string;
  category: CoordinatorNotificationType;
  urgent?: boolean;
  reference?: string;
  details?: string;
  actionUrl?: string;
  actionLabel?: string;
  targetRole?: string;
}

export type CreateNotificationPayload = CoordinatorCreateNotificationPayload;

export const FALLBACK_NOTIFICATIONS: Notification[] = [
  {
    id: "P-1",
    title: "Critical referral awaiting response",
    description: "REF-2841 · Emergency shelter · 6 people",
    time: "4 min ago",
    category: "Urgent",
    unread: true,
    urgent: true,
    reference: "REF-2841",
    details:
      "A critical emergency shelter referral has been received from the North Ward. Six affected people require urgent accommodation support. Please review and respond as soon as possible.",
    actionUrl: "/partner-officer/partner/assistance-referrals",
    actionLabel: "View Referral",
    targetRole: "partner",
  },
  {
    id: "P-2",
    title: "New collaboration request",
    description: "Mobile water distribution · North Ward",
    time: "12 min ago",
    category: "Collaboration",
    unread: true,
    urgent: false,
    reference: "COL-0742",
    details:
      "National Disaster Authority has requested collaboration for a mobile water distribution activity in North Ward. Your organisation is requested to provide vehicles and field staff.",
    actionUrl: "/partner-officer/partner/collaboration-requests",
    actionLabel: "View Request",
    targetRole: "partner",
  },
  {
    id: "P-3",
    title: "Resource delivery exception",
    description: "COM-1039 · Partial delivery recorded",
    time: "28 min ago",
    category: "Resource",
    unread: true,
    urgent: true,
    reference: "COM-1039",
    details:
      "A partial delivery has been recorded for commitment COM-1039. Some water purification tablets have not reached the destination. Please review the delivery status and coordinate with the logistics team.",
    actionUrl: "/partner-officer/partner/resource-sharing",
    actionLabel: "Review Delivery",
    targetRole: "partner",
  },
  {
    id: "P-4",
    title: "Partner report due today",
    description: "Daily activity report due at 18:00",
    time: "42 min ago",
    category: "Reporting",
    unread: true,
    urgent: false,
    reference: "RPT-1042",
    details:
      "Your Daily Partner Activity Report for Monsoon Floods 2025 must be submitted today before 18:00. The report is currently 82% complete and three sections require review.",
    actionUrl: "/partner-officer/partner/reports",
    actionLabel: "Open Report",
    targetRole: "partner",
  },
  {
    id: "P-5",
    title: "Agreement review required",
    description: "Safeguarding attestation due in 18 days",
    time: "1 hr ago",
    category: "Agreement",
    unread: false,
    urgent: false,
    reference: "AGR-0038",
    details:
      "Your organisation's safeguarding attestation requires review. Please verify the information and submit the updated agreement before the due date.",
    actionUrl: "/partner-officer/partner/documents",
    actionLabel: "Review Agreement",
    targetRole: "partner",
  },
  {
    id: "P-6",
    title: "Field team checked in",
    description: "North Ward distribution team · 12 members",
    time: "2 hr ago",
    category: "Team",
    unread: false,
    urgent: false,
    reference: "TEAM-0012",
    details:
      "The North Ward distribution team has successfully checked in. Twelve team members are currently active in the field and ready to continue the scheduled distribution activity.",
    actionUrl: "/partner-officer/partner/field-activities",
    actionLabel: "Field Activities",
    targetRole: "partner",
  },
];

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

const DEFAULT_COORDINATOR_PREFERENCES: CoordinatorNotificationPreferences = {
  critical: true,
  ai: true,
  resources: true,
  shelter: true,
  partner: true,
  reports: true,
  urgent: true,
  referrals: true,
  collaboration: true,
  reporting: true,
  team: true,
  email: false,
  push: true,
};

const ENDPOINT = "/api/notifications";

export const notificationService = {
  // Overloaded getNotifications
  async getNotifications(
    arg?: NotificationQuery | NotificationFilterParams
  ): Promise<any> {
    if (arg && "citizenName" in arg) {
      // Citizen consumer
      const query = new URLSearchParams();
      if (arg.citizenName) query.append("citizenName", arg.citizenName);
      if (arg.category && arg.category !== "All") {
        query.append("category", arg.category);
      }
      if (arg.unreadOnly) query.append("unreadOnly", "true");
      if (arg.search) query.append("search", arg.search);

      const queryString = query.toString() ? `?${query.toString()}` : "";
      try {
        const response = await request<CitizenNotification[]>(
          `/citizen/notifications${queryString}`,
          { method: "GET" }
        );
        const list = response.data || [];
        (list as any).items = list;
        (list as any).totalCount = list.length;
        return list;
      } catch {
        const fallback = [...MOCK_NOTIFICATIONS];
        (fallback as any).items = fallback;
        (fallback as any).totalCount = fallback.length;
        return fallback;
      }
    }

    // Admin consumer
    const query = arg as NotificationQuery | undefined;
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
    try {
      const response = await request<PaginatedList<NotificationItem>>(
        `/notifications${queryString}`,
        { method: "GET" }
      );
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
    } catch {
      return {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: query?.pageSize || 50,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    }
  },

  async getNotificationById(id: string | number): Promise<CitizenNotification> {
    const response = await request<CitizenNotification>(`/citizen/notifications/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getById(id: number): Promise<NotificationItem | null> {
    try {
      const response = await request<NotificationItem>(`/notifications/${id}`, {
        method: "GET",
      });
      return response.data || null;
    } catch {
      return null;
    }
  },

  async getStats(): Promise<NotificationStats> {
    try {
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
    } catch {
      return {
        total: 10,
        unreadCount: 5,
        criticalCount: 2,
        highPriorityCount: 3,
        emergencyCount: 4,
        assistanceCount: 3,
        volunteerCount: 1,
        resourceCount: 2,
        systemCount: 0,
      };
    }
  },

  async createNotification(
    data: CreateNotificationRequest | any
  ): Promise<any> {
    if (data.type && (data.message || data.title)) {
      const response = await request<NotificationItem>("/notifications", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data;
    }
    const response = await request<CitizenNotification>("/citizen/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async markAsRead(id: number | string): Promise<boolean> {
    try {
      if (typeof id === "number" || !isNaN(Number(id))) {
        const response = await request<boolean>(`/notifications/${id}/read`, {
          method: "PATCH",
        });
        return response.success;
      }
      const response = await authFetch(`${ENDPOINT}/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
        headers: { Accept: "application/json" },
      });
      return response.ok;
    } catch {
      return true;
    }
  },

  async markAllAsRead(citizenName?: string): Promise<any> {
    try {
      if (citizenName) {
        const query = `?citizenName=${encodeURIComponent(citizenName)}`;
        const response = await request<number>(`/citizen/notifications/mark-all-read${query}`, {
          method: "POST",
        });
        return response.data ?? 0;
      }
      const response = await request<boolean>("/notifications/mark-all-read", {
        method: "POST",
      });
      return response.success;
    } catch {
      return true;
    }
  },

  async archiveNotification(id: number | string): Promise<boolean> {
    try {
      const response = await request<boolean>(`/notifications/${id}`, {
        method: "DELETE",
      });
      return response.success;
    } catch {
      return true;
    }
  },

  async deleteNotification(id: string | number): Promise<boolean> {
    try {
      const response = await request<boolean>(`/citizen/notifications/${id}`, {
        method: "DELETE",
      });
      return response.data ?? response.success;
    } catch {
      return true;
    }
  },

  async batchAction(action: BatchNotificationAction): Promise<number> {
    try {
      const response = await request<number>("/notifications/batch", {
        method: "POST",
        body: JSON.stringify(action),
      });
      return response.data || 0;
    } catch {
      return action.notificationIds.length;
    }
  },

  async getSummary(citizenName?: string): Promise<NotificationSummary> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    try {
      const response = await request<NotificationSummary>(`/citizen/notifications/summary${query}`, {
        method: "GET",
      });
      return response.data;
    } catch {
      return {
        totalCount: MOCK_NOTIFICATIONS.length,
        unreadCount: MOCK_NOTIFICATIONS.filter((n) => n.unread).length,
        safetyAlertsCount: MOCK_NOTIFICATIONS.filter((n) => n.category === "Safety alerts").length,
        myRequestsCount: MOCK_NOTIFICATIONS.filter((n) => n.category === "My requests").length,
      };
    }
  },

  // Coordinator / Partner methods
  async getPaged(filters?: NotificationFilters): Promise<PagedNotifications> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category && filters.category !== "all") params.append("category", filters.category);
    if (filters?.unreadOnly) params.append("unreadOnly", "true");
    if (filters?.urgentOnly) params.append("urgentOnly", "true");
    if (filters?.role) params.append("role", filters.role);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.pageSize) params.append("pageSize", String(filters.pageSize));

    const query = params.toString() ? `?${params.toString()}` : "";
    try {
      const response = await authFetch(`${ENDPOINT}${query}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to load notifications: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Falling back to local notifications:", err);
      const filtered = FALLBACK_NOTIFICATIONS.filter((item) => {
        if (filters?.role && item.targetRole && item.targetRole !== "all" && item.targetRole !== filters.role) {
          return false;
        }
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          const match =
            item.title.toLowerCase().includes(s) ||
            item.description.toLowerCase().includes(s) ||
            item.reference.toLowerCase().includes(s) ||
            item.details.toLowerCase().includes(s);
          if (!match) return false;
        }
        if (filters?.category && filters.category !== "all") {
          const cat = filters.category.toLowerCase();
          if (cat === "unread") {
            if (!item.unread) return false;
          } else if (cat === "urgent") {
            if (!item.urgent && item.category.toLowerCase() !== "urgent") return false;
          } else if (item.category.toLowerCase() !== cat) {
            return false;
          }
        }
        if (filters?.unreadOnly && !item.unread) return false;
        if (filters?.urgentOnly && !item.urgent) return false;
        return true;
      });

      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 6;
      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);

      return {
        items,
        totalCount: filtered.length,
        page,
        pageSize,
        totalPages,
        unreadCount: filtered.filter((i) => i.unread).length,
      };
    }
  },

  async getAll(filters?: NotificationFilters): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category && filters.category !== "all") params.append("category", filters.category);
    if (filters?.unreadOnly) params.append("unreadOnly", "true");
    if (filters?.urgentOnly) params.append("urgentOnly", "true");
    if (filters?.role) params.append("role", filters.role);

    const query = params.toString() ? `?${params.toString()}` : "";
    try {
      const response = await authFetch(`${ENDPOINT}/all${query}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch all notifications: ${response.status}`);
      }
      return await response.json();
    } catch {
      return FALLBACK_NOTIFICATIONS.filter((item) => {
        if (filters?.role && item.targetRole && item.targetRole !== "all" && item.targetRole !== filters.role) {
          return false;
        }
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          const match =
            item.title.toLowerCase().includes(s) ||
            item.description.toLowerCase().includes(s) ||
            item.reference.toLowerCase().includes(s);
          if (!match) return false;
        }
        if (filters?.category && filters.category !== "all") {
          const cat = filters.category.toLowerCase();
          if (cat === "unread") {
            if (!item.unread) return false;
          } else if (cat === "urgent") {
            if (!item.urgent && item.category.toLowerCase() !== "urgent") return false;
          } else if (item.category.toLowerCase() !== cat) {
            return false;
          }
        }
        if (filters?.unreadOnly && !item.unread) return false;
        if (filters?.urgentOnly && !item.urgent) return false;
        return true;
      });
    }
  },

  async getMetrics(role?: string): Promise<NotificationCounts> {
    try {
      const query = role ? `?role=${encodeURIComponent(role)}` : "";
      const response = await authFetch(`${ENDPOINT}/metrics${query}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to load metrics: ${response.status}`);
      }
      return await response.json();
    } catch {
      const partnerFallback = FALLBACK_NOTIFICATIONS.filter(
        (n) => !role || n.targetRole === role || n.targetRole === "all"
      );
      return {
        all: partnerFallback.length,
        unread: partnerFallback.filter((n) => n.unread).length,
        urgent: partnerFallback.filter((n) => n.urgent).length,
        critical: partnerFallback.filter((n) => n.category.toLowerCase() === "critical").length,
        ai: partnerFallback.filter((n) => n.category.toLowerCase() === "ai").length,
        resource: partnerFallback.filter((n) => n.category.toLowerCase() === "resource").length,
        shelter: partnerFallback.filter((n) => n.category.toLowerCase() === "shelter").length,
        partner: partnerFallback.filter((n) => n.category.toLowerCase() === "partner").length,
        report: partnerFallback.filter((n) => n.category.toLowerCase() === "report").length,
        collaboration: partnerFallback.filter((n) => n.category.toLowerCase() === "collaboration").length,
        reporting: partnerFallback.filter((n) => n.category.toLowerCase() === "reporting").length,
        team: partnerFallback.filter((n) => n.category.toLowerCase() === "team").length,
        agreement: partnerFallback.filter((n) => n.category.toLowerCase() === "agreement").length,
      };
    }
  },

  async getPreferences(): Promise<any> {
    try {
      const response = await request<any>("/notifications/preferences", {
        method: "GET",
      });
      if (response && response.data) return response.data;
    } catch {
      // ignore
    }
    return DEFAULT_COORDINATOR_PREFERENCES;
  },

  async updatePreferences(prefs: any): Promise<any> {
    try {
      const response = await request<any>("/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(prefs),
      });
      if (response && response.data) return response.data;
    } catch {
      // ignore
    }
    return prefs;
  },

  async markRead(id: string): Promise<boolean> {
    return this.markAsRead(id);
  },

  async markAllRead(role?: string): Promise<number> {
    try {
      const query = role ? `?role=${encodeURIComponent(role)}` : "";
      const response = await authFetch(`${ENDPOINT}/mark-all-read${query}`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return 0;
      const data = await response.json();
      return data.readCount ?? 0;
    } catch {
      return 0;
    }
  },

  async create(payload: CoordinatorCreateNotificationPayload): Promise<Notification> {
    const response = await authFetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create notification: ${response.status}`);
    }

    return await response.json();
  },

  async delete(id: string): Promise<boolean> {
    const response = await authFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    return response.ok;
  },

  async reset(): Promise<boolean> {
    try {
      const response = await authFetch(`${ENDPOINT}/reset`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      return response.ok;
    } catch {
      return true;
    }
  },
};
