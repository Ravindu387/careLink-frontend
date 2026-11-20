import { request } from "./api";
import type {
  AuditRecord,
  AuditLogSummary,
  CreateAuditLogPayload,
  AuditLogQueryParams,
} from "../types/auditLog";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const auditLogService = {
  async getAuditLogs(params?: AuditLogQueryParams): Promise<AuditRecord[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.actionType && params.actionType !== "All action types") {
      query.append("actionType", params.actionType);
    }
    if (params?.actor && params.actor !== "All users") {
      query.append("actor", params.actor);
    }
    if (params?.recordType && params.recordType !== "All record types") {
      query.append("recordType", params.recordType);
    }
    if (params?.dateFilter && params.dateFilter !== "All dates") {
      query.append("dateFilter", params.dateFilter);
    }
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<AuditRecord[]>(`/auditlogs${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getAuditLogById(id: string): Promise<AuditRecord> {
    const response = await request<AuditRecord>(`/auditlogs/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getAuditLogSummary(): Promise<AuditLogSummary | null> {
    const response = await request<AuditLogSummary>("/auditlogs/summary", {
      method: "GET",
    });
    return response.data || null;
  },

  async createAuditLog(payload: CreateAuditLogPayload): Promise<AuditRecord> {
    const response = await request<AuditRecord>("/auditlogs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  getExportUrl(params?: AuditLogQueryParams): string {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.actionType && params.actionType !== "All action types") {
      query.append("actionType", params.actionType);
    }
    if (params?.actor && params.actor !== "All users") {
      query.append("actor", params.actor);
    }
    if (params?.recordType && params.recordType !== "All record types") {
      query.append("recordType", params.recordType);
    }
    if (params?.dateFilter && params.dateFilter !== "All dates") {
      query.append("dateFilter", params.dateFilter);
    }
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return `${API_BASE_URL}/auditlogs/export${queryString}`;
  },
};
