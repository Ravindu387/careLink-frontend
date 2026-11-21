import { request } from "./api";
import type {
  Broadcast,
  AudienceOption,
  ChannelHealth,
  CommunicationsOverviewDto,
  CreateBroadcastRequest,
  BroadcastQueryDto,
  CommunicationDraftDto,
  SaveDraftRequest,
  PaginatedResult,
} from "../types/communications";

const initialBroadcasts: Broadcast[] = [
  {
    id: "BRD-001",
    title: "Shift reminder · North Ward",
    audience: "Volunteers assigned to TASK-782",
    delivered: 142,
    time: "12 min ago",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    channel: "In-app",
    channels: ["In-app"],
    status: "Delivered",
    message: "Please arrive at the assigned location before your scheduled shift.",
    sender: "Nadia Okafor (Coordinator)",
  },
  {
    id: "BRD-002",
    title: "Safety update · All teams",
    audience: "All active volunteers",
    delivered: 1204,
    time: "2 hr ago",
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    channel: "Email",
    channels: ["Email"],
    status: "Delivered",
    message: "Follow the updated field safety instructions during operations. Always wear high-visibility gear.",
    sender: "Elena Vance (Safety Lead)",
  },
  {
    id: "BRD-003",
    title: "Task cancellation · TASK-742",
    audience: "Volunteers assigned to TASK-742",
    delivered: 8,
    time: "5 hr ago",
    createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
    channel: "SMS",
    channels: ["SMS"],
    status: "Delivered",
    message: "The assigned task has been cancelled. Please contact your coordinator for re-assignment.",
    sender: "Nadia Okafor (Coordinator)",
  },
  {
    id: "BRD-004",
    title: "Weather Alert: Heavy Monsoon Inbound",
    audience: "North Ward volunteers",
    delivered: 142,
    time: "9 hr ago",
    createdAt: new Date(Date.now() - 540 * 60000).toISOString(),
    channel: "In-app, SMS",
    channels: ["In-app", "SMS"],
    status: "Delivered",
    message: "Localized heavy showers expected between 15:00 and 19:00. Shelter and water-repellent equipment mandatory.",
    sender: "Operations Command",
  },
];

const initialAudiences: AudienceOption[] = [
  { label: "Volunteers assigned to TASK-782", count: 18, category: "Task" },
  { label: "All active volunteers", count: 2184, category: "All" },
  { label: "Available volunteers", count: 642, category: "Availability" },
  { label: "North Ward volunteers", count: 142, category: "Ward" },
  { label: "Medical response teams", count: 58, category: "Specialist" },
  { label: "Logistics teams", count: 96, category: "Specialist" },
  { label: "Unassigned volunteers", count: 84, category: "Availability" },
  { label: "Evacuation Support volunteers", count: 112, category: "Task" },
];

const initialChannelHealth: ChannelHealth[] = [
  {
    channel: "In-app",
    status: "Operational",
    successRate: 99.8,
    latency: "0.4s",
    description: "Operational",
  },
  {
    channel: "Email",
    status: "Operational",
    successRate: 98.6,
    latency: "1.2s",
    description: "Operational",
  },
  {
    channel: "SMS",
    status: "Degraded",
    successRate: 92.1,
    latency: "4.6s",
    description: "Degraded",
  },
];

let fallbackBroadcasts: Broadcast[] = [...initialBroadcasts];
let fallbackDraft: CommunicationDraftDto | null = null;

export const communicationsService = {
  async getOverview(): Promise<{ data: CommunicationsOverviewDto; isLiveBackend: boolean }> {
    try {
      const response = await request<CommunicationsOverviewDto>("/communications/overview");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    return {
      data: {
        totalBroadcasts: fallbackBroadcasts.length,
        totalRecipientsDelivered: fallbackBroadcasts.reduce((acc, curr) => acc + curr.delivered, 0),
        activeVolunteers: 2184,
        deliverySuccessRate: 98.7,
        channelHealth: initialChannelHealth,
      },
      isLiveBackend: false,
    };
  },

  async getAudiences(): Promise<{ data: AudienceOption[]; isLiveBackend: boolean }> {
    try {
      const response = await request<AudienceOption[]>("/communications/audiences");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    return {
      data: initialAudiences,
      isLiveBackend: false,
    };
  },

  async getChannelHealth(): Promise<{ data: ChannelHealth[]; isLiveBackend: boolean }> {
    try {
      const response = await request<ChannelHealth[]>("/communications/channel-health");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    return {
      data: initialChannelHealth,
      isLiveBackend: false,
    };
  },

  async getBroadcasts(
    query: BroadcastQueryDto = {}
  ): Promise<{ data: PaginatedResult<Broadcast>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.channel) params.append("channel", query.channel);
      if (query.status) params.append("status", query.status);
      if (query.audience) params.append("audience", query.audience);
      if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));

      const url = `/communications/broadcasts${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<PaginatedResult<Broadcast>>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    let items = [...fallbackBroadcasts];

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter((b) =>
        [b.id, b.title, b.message, b.audience, b.channel].join(" ").toLowerCase().includes(s)
      );
    }

    if (query.channel && query.channel !== "All") {
      const c = query.channel.toLowerCase();
      items = items.filter((b) => b.channel.toLowerCase().includes(c));
    }

    if (query.status && query.status !== "All") {
      items = items.filter((b) => b.status.toLowerCase() === query.status?.toLowerCase());
    }

    if (query.audience && query.audience !== "All") {
      items = items.filter((b) => b.audience.toLowerCase().includes(query.audience!.toLowerCase()));
    }

    const page = query.pageNumber || 1;
    const size = query.pageSize || 20;
    const totalCount = items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    const paged = items.slice((page - 1) * size, page * size);

    return {
      data: {
        items: paged,
        totalCount,
        pageNumber: page,
        pageSize: size,
        totalPages,
      },
      isLiveBackend: false,
    };
  },

  async getBroadcastById(id: string): Promise<Broadcast | null> {
    try {
      const response = await request<Broadcast>(`/communications/broadcasts/${encodeURIComponent(id)}`);
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    return fallbackBroadcasts.find((b) => b.id.toLowerCase() === id.toLowerCase()) || null;
  },

  async createBroadcast(requestData: CreateBroadcastRequest): Promise<Broadcast> {
    try {
      const response = await request<Broadcast>("/communications/broadcasts", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
      if (response && response.success && response.data) {
        fallbackBroadcasts = [response.data, ...fallbackBroadcasts];
        return response.data;
      }
    } catch {
      // Fallback
    }

    const matchedAudience = initialAudiences.find((a) => a.label === requestData.audience);
    const deliveredCount = matchedAudience?.count ?? 45;

    const newRecord: Broadcast = {
      id: `BRD-${Date.now().toString().slice(-4)}`,
      title: requestData.title,
      audience: requestData.audience,
      delivered: deliveredCount,
      time: "Just now",
      createdAt: new Date().toISOString(),
      channel: requestData.channels.join(", "),
      channels: requestData.channels,
      status: "Delivered",
      message: requestData.message,
      sender: requestData.sender || "Nadia Okafor (Coordinator)",
    };

    fallbackBroadcasts = [newRecord, ...fallbackBroadcasts];
    return newRecord;
  },

  async deleteBroadcast(id: string): Promise<boolean> {
    try {
      const response = await request<boolean>(`/communications/broadcasts/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (response && response.success) {
        fallbackBroadcasts = fallbackBroadcasts.filter((b) => b.id.toLowerCase() !== id.toLowerCase());
        return true;
      }
    } catch {
      // Fallback
    }

    fallbackBroadcasts = fallbackBroadcasts.filter((b) => b.id.toLowerCase() !== id.toLowerCase());
    return true;
  },

  async resendBroadcast(id: string): Promise<Broadcast | null> {
    try {
      const response = await request<Broadcast>(`/communications/broadcasts/${encodeURIComponent(id)}/resend`, {
        method: "POST",
      });
      if (response && response.success && response.data) {
        fallbackBroadcasts = [
          response.data,
          ...fallbackBroadcasts.filter((b) => b.id !== response.data!.id),
        ];
        return response.data;
      }
    } catch {
      // Fallback
    }

    const item = fallbackBroadcasts.find((b) => b.id.toLowerCase() === id.toLowerCase());
    if (item) {
      const updated: Broadcast = {
        ...item,
        time: "Just now",
        createdAt: new Date().toISOString(),
      };
      fallbackBroadcasts = [updated, ...fallbackBroadcasts.filter((b) => b.id !== item.id)];
      return updated;
    }

    return null;
  },

  async getDraft(): Promise<CommunicationDraftDto | null> {
    try {
      const response = await request<CommunicationDraftDto>("/communications/draft");
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    if (fallbackDraft) {
      return fallbackDraft;
    }

    const local = localStorage.getItem("carelink_communication_draft");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return {
          id: "draft-local",
          title: parsed.title || "",
          message: parsed.message || "",
          audience: parsed.audience || "",
          channels: parsed.channels || ["In-app"],
          updatedAt: new Date().toISOString(),
        };
      } catch {
        // ignore
      }
    }

    return null;
  },

  async saveDraft(requestData: SaveDraftRequest): Promise<CommunicationDraftDto> {
    try {
      const response = await request<CommunicationDraftDto>("/communications/draft", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
      if (response && response.success && response.data) {
        fallbackDraft = response.data;
      }
    } catch {
      // Fallback
    }

    fallbackDraft = {
      id: "draft-saved",
      title: requestData.title,
      message: requestData.message,
      audience: requestData.audience,
      channels: requestData.channels,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("carelink_communication_draft", JSON.stringify(requestData));
    return fallbackDraft;
  },

  async clearDraft(): Promise<boolean> {
    try {
      await request<boolean>("/communications/draft", {
        method: "DELETE",
      });
    } catch {
      // Fallback
    }

    fallbackDraft = null;
    localStorage.removeItem("carelink_communication_draft");
    return true;
  },

  async exportCsv(query: BroadcastQueryDto = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.channel) params.append("channel", query.channel);
      if (query.status) params.append("status", query.status);
      if (query.audience) params.append("audience", query.audience);

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";
      const res = await fetch(`${API_BASE_URL}/communications/export?${params.toString()}`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const res = await this.getBroadcasts({ ...query, pageNumber: 1, pageSize: 1000 });
    const headers = [
      "Broadcast ID",
      "Title",
      "Target Audience",
      "Recipients Delivered",
      "Delivery Channels",
      "Status",
      "Message",
    ];

    const rows = res.data.items.map((item) => [
      item.id,
      item.title,
      item.audience,
      String(item.delivered),
      item.channel,
      item.status,
      item.message,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  },
};
