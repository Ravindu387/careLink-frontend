import { request, authFetch } from "./api";
import type {
  SecurityEvent,
  SecurityEventStats,
  SecurityEventQuery,
  CreateSecurityEventRequest,
  UpdateSecurityEventStatusRequest,
  RecordPolicyActionRequest,
  SecurityPolicyAction,
  PaginatedList,
} from "../types/securityEvent";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const securityEventService = {
  async getEvents(query?: SecurityEventQuery): Promise<PaginatedList<SecurityEvent>> {
    const params = new URLSearchParams();
    if (query?.search) params.append("search", query.search);
    if (query?.severity && query.severity !== "All severities") {
      params.append("severity", query.severity);
    }
    if (query?.type && query.type !== "All event types") {
      params.append("type", query.type);
    }
    if (query?.status && query.status !== "All statuses") {
      params.append("status", query.status);
    }
    if (query?.dateFilter && query.dateFilter !== "All time") {
      params.append("dateFilter", query.dateFilter);
    }
    if (query?.pageNumber) {
      params.append("pageNumber", query.pageNumber.toString());
    }
    if (query?.pageSize) {
      params.append("pageSize", query.pageSize.toString());
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await request<PaginatedList<SecurityEvent>>(`/security-events${queryString}`, {
      method: "GET",
    });

    return (
      response.data || {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: query?.pageSize || 10,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      }
    );
  },

  async getStats(): Promise<SecurityEventStats | null> {
    const response = await request<SecurityEventStats>("/security-events/stats", {
      method: "GET",
    });
    return response.data || null;
  },

  async getEventTypes(): Promise<string[]> {
    const response = await request<string[]>("/security-events/types", {
      method: "GET",
    });
    return response.data || [];
  },

  async getEventById(id: string): Promise<SecurityEvent | null> {
    const response = await request<SecurityEvent>(`/security-events/${encodeURIComponent(id)}`, {
      method: "GET",
    });
    return response.data || null;
  },

  async createEvent(data: CreateSecurityEventRequest): Promise<SecurityEvent | null> {
    const response = await request<SecurityEvent>("/security-events", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data || null;
  },

  async updateEventStatus(
    id: string,
    data: UpdateSecurityEventStatusRequest
  ): Promise<SecurityEvent | null> {
    const response = await request<SecurityEvent>(
      `/security-events/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
    return response.data || null;
  },

  async recordPolicyAction(
    data: RecordPolicyActionRequest
  ): Promise<SecurityPolicyAction | null> {
    const response = await request<SecurityPolicyAction>(
      "/security-events/policy-actions",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data || null;
  },

  async downloadExportCsv(query?: SecurityEventQuery): Promise<void> {
    const params = new URLSearchParams();
    if (query?.search) params.append("search", query.search);
    if (query?.severity && query.severity !== "All severities") {
      params.append("severity", query.severity);
    }
    if (query?.type && query.type !== "All event types") {
      params.append("type", query.type);
    }
    if (query?.status && query.status !== "All statuses") {
      params.append("status", query.status);
    }
    if (query?.dateFilter && query.dateFilter !== "All time") {
      params.append("dateFilter", query.dateFilter);
    }

    const token = localStorage.getItem("carelink_token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await authFetch(`${API_BASE_URL}/security-events/export-csv${queryString}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to export security events report.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-events-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
