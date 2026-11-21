import { request } from "./api";
import type {
  VolunteerNotificationItem,
  VolunteerNotificationSummaryDto,
  VolunteerPreferences,
  VolunteerNotificationQueryDto,
  CreateVolunteerNotificationRequest,
  PaginatedResult,
} from "../types/volunteerNotifications";

const initialNotifications: VolunteerNotificationItem[] = [
  {
    id: 1,
    title: "Urgent task needs two rescue drivers",
    description: "TASK-782 · North Ward",
    time: "3 min ago",
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    category: "Safety",
    iconName: "AlertTriangle",
    color: "bg-[#fdebec] text-[#dc3545]",
    unread: true,
    urgent: true,
    details:
      "An urgent evacuation transport task requires two additional rescue drivers in North Ward. Please coordinate available volunteers immediately.",
    targetId: "TASK-782",
  },
  {
    id: 2,
    title: "4 priority verifications awaiting review",
    description: "Nursing and heavy vehicle skills",
    time: "18 min ago",
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    category: "Verification",
    iconName: "ShieldCheck",
    color: "bg-[#fff3df] text-[#b87813]",
    unread: true,
    urgent: false,
    details:
      "Four volunteer verification applications require coordinator review. These include nursing qualifications and heavy vehicle driving certifications.",
    targetId: "VER-401",
  },
  {
    id: 3,
    title: "AI match ready for approval",
    description: "TASK-774 · 6 recommended volunteers",
    time: "31 min ago",
    createdAt: new Date(Date.now() - 31 * 60000).toISOString(),
    category: "AI Matching",
    iconName: "Sparkles",
    color: "bg-[#f0eafb] text-[#7953c6]",
    unread: true,
    urgent: false,
    details:
      "The AI matching service has identified six suitable volunteers for TASK-774. Review the recommendations and approve or reject the proposed matches.",
    targetId: "TASK-774",
  },
  {
    id: 4,
    title: "Volunteer team checked in",
    description: "TASK-779 · Central Clinic",
    time: "1 hr ago",
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    category: "Assignments",
    iconName: "Check",
    color: "bg-[#e5f5ef] text-[#239879]",
    unread: false,
    urgent: false,
    details:
      "The assigned volunteer team has successfully checked in at Central Clinic. Their field activity status is now active.",
    targetId: "TASK-779",
  },
  {
    id: 5,
    title: "42 certifications expiring soon",
    description: "Review within 30 days",
    time: "2 hr ago",
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    category: "Verification",
    iconName: "Award",
    color: "bg-[#fff3df] text-[#b87813]",
    unread: false,
    urgent: false,
    details:
      "There are 42 volunteer certifications scheduled to expire within the next 30 days. Review the certification attention queue and contact affected volunteers.",
    targetId: "EXP-30",
  },
  {
    id: 6,
    title: "Broadcast delivery completed",
    description: "1,204 of 1,204 recipients",
    time: "3 hr ago",
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    category: "Communications",
    iconName: "MessageSquare",
    color: "bg-[#e8f1f6] text-[#287fa9]",
    unread: false,
    urgent: false,
    details:
      "The latest operational safety update was successfully delivered to all 1,204 intended recipients.",
    targetId: "BRD-002",
  },
  {
    id: 7,
    title: "New volunteer assignment accepted",
    description: "ASGN-4421 · Elena Rossi",
    time: "4 hr ago",
    createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
    category: "Assignments",
    iconName: "Users",
    color: "bg-[#e5f5ef] text-[#239879]",
    unread: true,
    urgent: false,
    details:
      "Elena Rossi has accepted the evacuation support assignment. The volunteer is scheduled to report to North Ward.",
    targetId: "ASGN-4421",
  },
  {
    id: 8,
    title: "Safety incident reported",
    description: "West District · Field alert",
    time: "5 hr ago",
    createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
    category: "Safety",
    iconName: "AlertTriangle",
    color: "bg-[#fdebec] text-[#dc3545]",
    unread: true,
    urgent: true,
    details:
      "A field safety incident has been reported in West District. Review the incident information and coordinate an appropriate response.",
    targetId: "INC-109",
  },
  {
    id: 9,
    title: "Volunteer verification approved",
    description: "Maya Fernando · First Aid",
    time: "6 hr ago",
    createdAt: new Date(Date.now() - 360 * 60000).toISOString(),
    category: "Verification",
    iconName: "ShieldCheck",
    color: "bg-[#e5f5ef] text-[#239879]",
    unread: false,
    urgent: false,
    details:
      "Maya Fernando's First Aid qualification has been reviewed and approved.",
    targetId: "VER-392",
  },
  {
    id: 10,
    title: "AI matching model updated",
    description: "Model version 2.4",
    time: "Yesterday",
    createdAt: new Date(Date.now() - 1440 * 60000).toISOString(),
    category: "AI Matching",
    iconName: "Sparkles",
    color: "bg-[#f0eafb] text-[#7953c6]",
    unread: false,
    urgent: false,
    details:
      "The volunteer matching model has been updated to version 2.4 with improvements to suitability scoring.",
    targetId: "MDL-24",
  },
];

let fallbackNotifications = [...initialNotifications];

let fallbackPreferences: VolunteerPreferences = {
  assignments: true,
  verification: true,
  safety: true,
  aiMatching: true,
  inApp: true,
  email: true,
  sms: false,
  urgentOnly: false,
};

export const volunteerNotificationsService = {
  async getSummary(): Promise<{ data: VolunteerNotificationSummaryDto; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerNotificationSummaryDto>("/volunteer/notifications/summary");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    const unread = fallbackNotifications.filter((n) => n.unread).length;
    const urgent = fallbackNotifications.filter((n) => n.urgent && n.unread).length;
    const assignment = fallbackNotifications.filter((n) => n.category === "Assignments").length;
    const verification = fallbackNotifications.filter((n) => n.category === "Verification").length;
    const safety = fallbackNotifications.filter((n) => n.category === "Safety").length;
    const aiMatching = fallbackNotifications.filter((n) => n.category === "AI Matching").length;
    const communications = fallbackNotifications.filter((n) => n.category === "Communications").length;

    return {
      data: {
        totalCount: fallbackNotifications.length,
        unreadCount: unread,
        urgentCount: urgent,
        assignmentCount: assignment,
        verificationCount: verification,
        safetyCount: safety,
        aiMatchingCount: aiMatching,
        communicationsCount: communications,
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
    query: VolunteerNotificationQueryDto = {}
  ): Promise<{ data: PaginatedResult<VolunteerNotificationItem>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.tab) params.append("tab", query.tab);
      if (query.search) params.append("search", query.search);
      if (query.category) params.append("category", query.category);
      if (query.unreadOnly !== undefined) params.append("unreadOnly", String(query.unreadOnly));
      if (query.urgentOnly !== undefined) params.append("urgentOnly", String(query.urgentOnly));
      if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));

      const url = `/volunteer/notifications${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<PaginatedResult<VolunteerNotificationItem>>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    let list = [...fallbackNotifications];

    if (query.tab && query.tab !== "All") {
      if (query.tab === "Unread") {
        list = list.filter((n) => n.unread);
      } else {
        list = list.filter((n) => n.category.toLowerCase() === query.tab?.toLowerCase());
      }
    }

    if (query.unreadOnly) {
      list = list.filter((n) => n.unread);
    }

    if (query.urgentOnly) {
      list = list.filter((n) => n.urgent);
    }

    if (query.category && query.category !== "All") {
      list = list.filter((n) => n.category.toLowerCase() === query.category?.toLowerCase());
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.description.toLowerCase().includes(s) ||
          n.category.toLowerCase().includes(s) ||
          n.details.toLowerCase().includes(s)
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

  async getById(id: number): Promise<VolunteerNotificationItem | null> {
    try {
      const response = await request<VolunteerNotificationItem>(`/volunteer/notifications/${id}`);
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    return fallbackNotifications.find((n) => n.id === id) || null;
  },

  async markAsRead(id: number): Promise<boolean> {
    try {
      const response = await request<boolean>(`/volunteer/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (response && response.success) {
        fallbackNotifications = fallbackNotifications.map((n) =>
          n.id === id ? { ...n, unread: false } : n
        );
        return true;
      }
    } catch {
      // Fallback
    }

    fallbackNotifications = fallbackNotifications.map((n) =>
      n.id === id ? { ...n, unread: false } : n
    );
    return true;
  },

  async markAllAsRead(): Promise<number> {
    try {
      const response = await request<number>("/volunteer/notifications/mark-all-read", {
        method: "POST",
      });
      if (response && response.success) {
        fallbackNotifications = fallbackNotifications.map((n) => ({ ...n, unread: false }));
        return response.data;
      }
    } catch {
      // Fallback
    }

    let count = 0;
    fallbackNotifications = fallbackNotifications.map((n) => {
      if (n.unread) count++;
      return { ...n, unread: false };
    });
    return count;
  },

  async deleteNotification(id: number): Promise<boolean> {
    try {
      const response = await request<boolean>(`/volunteer/notifications/${id}`, {
        method: "DELETE",
      });
      if (response && response.success) {
        fallbackNotifications = fallbackNotifications.filter((n) => n.id !== id);
        return true;
      }
    } catch {
      // Fallback
    }

    fallbackNotifications = fallbackNotifications.filter((n) => n.id !== id);
    return true;
  },

  async createNotification(
    req: CreateVolunteerNotificationRequest
  ): Promise<VolunteerNotificationItem> {
    try {
      const response = await request<VolunteerNotificationItem>("/volunteer/notifications", {
        method: "POST",
        body: JSON.stringify(req),
      });
      if (response && response.success && response.data) {
        fallbackNotifications = [response.data, ...fallbackNotifications];
        return response.data;
      }
    } catch {
      // Fallback
    }

    const nextId =
      fallbackNotifications.length > 0
        ? Math.max(...fallbackNotifications.map((n) => n.id)) + 1
        : 1;

    const newItem: VolunteerNotificationItem = {
      id: nextId,
      title: req.title,
      description: req.description,
      category: req.category,
      unread: true,
      urgent: req.urgent ?? false,
      details: req.details,
      targetId: req.targetId,
      time: "Just now",
      createdAt: new Date().toISOString(),
      iconName: req.iconName || (req.urgent ? "AlertTriangle" : "Check"),
      color: req.color || (req.urgent ? "bg-[#fdebec] text-[#dc3545]" : "bg-[#e5f5ef] text-[#239879]"),
    };

    fallbackNotifications = [newItem, ...fallbackNotifications];
    return newItem;
  },

  async getPreferences(): Promise<VolunteerPreferences> {
    try {
      const response = await request<VolunteerPreferences>("/volunteer/notifications/preferences");
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    const local = localStorage.getItem("carelink_notification_preferences");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }

    return { ...fallbackPreferences };
  },

  async updatePreferences(prefs: VolunteerPreferences): Promise<VolunteerPreferences> {
    try {
      const response = await request<VolunteerPreferences>("/volunteer/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(prefs),
      });
      if (response && response.success && response.data) {
        fallbackPreferences = response.data;
      }
    } catch {
      // Fallback
    }

    fallbackPreferences = { ...prefs };
    localStorage.setItem("carelink_notification_preferences", JSON.stringify(prefs));
    return fallbackPreferences;
  },

  async exportCsv(query: VolunteerNotificationQueryDto = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query.tab) params.append("tab", query.tab);
      if (query.search) params.append("search", query.search);
      if (query.category) params.append("category", query.category);

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";
      const res = await fetch(`${API_BASE_URL}/volunteer/notifications/export?${params.toString()}`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const res = await this.getNotifications({ ...query, pageNumber: 1, pageSize: 1000 });
    const headers = ["ID", "Title", "Description", "Category", "Urgent", "Unread", "Details"];
    const rows = res.data.items.map((item) => [
      String(item.id),
      item.title,
      item.description,
      item.category,
      item.urgent ? "Yes" : "No",
      item.unread ? "Unread" : "Read",
      item.details,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  },
};
