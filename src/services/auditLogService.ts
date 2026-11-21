import { request } from "./api";
import type {
  AuditRecord,
  AuditLogStats,
  AuditLogQuery,
  CreateAuditLogRequest,
  ExportAuditLogRequest,
} from "../types/auditLog";
import type { PaginatedList } from "../types/securityEvent";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const auditLogService = {
  async getAuditLogs(query?: AuditLogQuery): Promise<PaginatedList<AuditRecord>> {
    const params = new URLSearchParams();
    if (query?.search) params.append("search", query.search);
    if (query?.action && query.action !== "All action types") {
      params.append("action", query.action);
    }
    if (query?.actor && query.actor !== "All users") {
      params.append("actor", query.actor);
    }
    if (query?.type && query.type !== "All record types") {
      params.append("type", query.type);
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
    const response = await request<PaginatedList<AuditRecord>>(`/audit-logs${queryString}`, {
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

  async getStats(): Promise<AuditLogStats | null> {
    const response = await request<AuditLogStats>("/audit-logs/stats", {
      method: "GET",
    });
    return response.data || null;
  },

  async getActionTypes(): Promise<string[]> {
    const response = await request<string[]>("/audit-logs/actions", {
      method: "GET",
    });
    return response.data || [];
  },

  async getRecordTypes(): Promise<string[]> {
    const response = await request<string[]>("/audit-logs/record-types", {
      method: "GET",
    });
    return response.data || [];
  },

  async getActors(): Promise<string[]> {
    const response = await request<string[]>("/audit-logs/actors", {
      method: "GET",
    });
    return response.data || [];
  },

  async getAuditLogById(id: string): Promise<AuditRecord | null> {
    const response = await request<AuditRecord>(`/audit-logs/${encodeURIComponent(id)}`, {
      method: "GET",
    });
    return response.data || null;
  },

  async createAuditLog(data: CreateAuditLogRequest): Promise<AuditRecord | null> {
    const response = await request<AuditRecord>("/audit-logs", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data || null;
  },

  async exportAuditLog(data: ExportAuditLogRequest): Promise<{ eventId: string | null }> {
    const token = localStorage.getItem("carelink_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/audit-logs/export`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMsg = "Failed to export audit logs.";
      try {
        const errorJson = await response.json();
        if (errorJson?.message) errorMsg = errorJson.message;
      } catch {
        // ignore json parse error
      }
      throw new Error(errorMsg);
    }

    const eventId = response.headers.get("X-Audit-Event-Id");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carelink-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return { eventId };
  },
};
