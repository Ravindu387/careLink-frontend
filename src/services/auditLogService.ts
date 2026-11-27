import { request, authFetch } from "./api";
import type {
  AuditRecord,
  AuditLogSummary,
  CreateAuditLogPayload,
  AuditLogQueryParams,
  AuditLogStats,
  AuditLogQuery,
  CreateAuditLogRequest,
  ExportAuditLogRequest,
} from "../types/auditLog";
import type { PaginatedList } from "../types/securityEvent";

export interface AuditEvent {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  record: string;
  recordType: string;
  change: string;
  rationale: string;
  actionType: string;
  date: string;
  previous?: string;
  current?: string;
  checksum?: string;
  isVerified?: boolean;
}

export interface AuditLogFilters {
  search?: string;
  action?: string;
  actionType?: string;
  actor?: string;
  user?: string;
  recordType?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  dateRange?: string;
}

export interface AuditLogMetrics {
  totalEvents: number;
  eventsToday: number;
  aiDecisionEvents: number;
  humanOverrideEvents: number;
  integrityScore: number;
  retentionPeriod: string;
  allRecordsVerified: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const auditLogService = {
  async getAll(filters?: AuditLogFilters): Promise<AuditEvent[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.action && filters.action !== "All action types") {
      params.append("action", filters.action);
    }
    if (filters?.actionType && filters.actionType !== "All") {
      params.append("actionType", filters.actionType);
    }
    if (filters?.actor && filters.actor !== "All users") {
      params.append("actor", filters.actor);
    }
    if (filters?.user && filters.user !== "All users") {
      params.append("user", filters.user);
    }
    if (filters?.recordType && filters.recordType !== "All record types") {
      params.append("recordType", filters.recordType);
    }
    if (filters?.type && filters.type !== "All record types") {
      params.append("type", filters.type);
    }
    if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.append("dateTo", filters.dateTo);
    if (filters?.dateRange && filters.dateRange !== "Date range") {
      params.append("dateRange", filters.dateRange);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await authFetch(`${API_BASE_URL}/audit-logs${query}`);
    if (!response.ok) {
      throw new Error(`Failed to load audit log: ${response.status} ${response.statusText}`);
    }
    const json = await response.json();
    return Array.isArray(json) ? json : json.items || [];
  },

  async getMetrics(): Promise<AuditLogMetrics> {
    const response = await authFetch(`${API_BASE_URL}/audit-logs/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to load audit metrics: ${response.status}`);
    }
    return response.json();
  },

  async getById(id: string): Promise<AuditEvent> {
    const response = await authFetch(`${API_BASE_URL}/audit-logs/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error(`Failed to load audit record ${id}: ${response.status}`);
    }
    return response.json();
  },

  async verifyIntegrity(): Promise<{ verified: boolean; status: string; recordsChecked: number }> {
    const response = await authFetch(`${API_BASE_URL}/audit-logs/verify`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to verify audit log integrity: ${response.status}`);
    }
    return response.json();
  },

  async reset(): Promise<{ message: string; metrics: AuditLogMetrics }> {
    const response = await authFetch(`${API_BASE_URL}/audit-logs/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to reset audit log: ${response.status}`);
    }
    return response.json();
  },

  async getAuditLogs(
    paramsOrQuery?: AuditLogQueryParams | AuditLogQuery
  ): Promise<PaginatedList<AuditRecord> & AuditRecord[]> {
    const params = new URLSearchParams();
    if (paramsOrQuery?.search) params.append("search", paramsOrQuery.search);
    const action = (paramsOrQuery as any)?.action || (paramsOrQuery as any)?.actionType;
    if (action && action !== "All action types" && action !== "All") {
      params.append("action", action);
    }
    if (paramsOrQuery?.actor && paramsOrQuery.actor !== "All users") {
      params.append("actor", paramsOrQuery.actor);
    }
    const recType = (paramsOrQuery as any)?.type || (paramsOrQuery as any)?.recordType;
    if (recType && recType !== "All record types") {
      params.append("type", recType);
    }
    if (paramsOrQuery?.dateFilter && paramsOrQuery.dateFilter !== "All time" && paramsOrQuery.dateFilter !== "All dates") {
      params.append("dateFilter", paramsOrQuery.dateFilter);
    }
    if ((paramsOrQuery as any)?.startDate) params.append("startDate", (paramsOrQuery as any).startDate);
    if ((paramsOrQuery as any)?.endDate) params.append("endDate", (paramsOrQuery as any).endDate);
    if ((paramsOrQuery as any)?.pageNumber) {
      params.append("pageNumber", (paramsOrQuery as any).pageNumber.toString());
    }
    if ((paramsOrQuery as any)?.pageSize) {
      params.append("pageSize", (paramsOrQuery as any).pageSize.toString());
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await request<any>(`/audit-logs${queryString}`, {
      method: "GET",
    });

    const rawData = response.data;
    let list: any[] = [];
    let totalCount = 0;
    let pageNumber = (paramsOrQuery as any)?.pageNumber || 1;
    let pageSize = (paramsOrQuery as any)?.pageSize || 10;
    let totalPages = 1;

    if (Array.isArray(rawData)) {
      list = [...rawData];
      totalCount = rawData.length;
    } else if (rawData?.items && Array.isArray(rawData.items)) {
      list = [...rawData.items];
      totalCount = rawData.totalCount ?? rawData.items.length;
      pageNumber = rawData.pageNumber ?? pageNumber;
      pageSize = rawData.pageSize ?? pageSize;
      totalPages = rawData.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));
    }

    // Attach pagination properties directly to the array so both array-based callers and PaginatedList callers work seamlessly
    const result = list as any;
    result.items = list;
    result.totalCount = totalCount;
    result.pageNumber = pageNumber;
    result.pageSize = pageSize;
    result.totalPages = totalPages;
    result.hasPreviousPage = pageNumber > 1;
    result.hasNextPage = pageNumber < totalPages;

    return result;
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

  async getAuditLogSummary(): Promise<AuditLogSummary | null> {
    const response = await request<AuditLogSummary>("/audit-logs/summary", {
      method: "GET",
    });
    return response.data || null;
  },

  async createAuditLog(
    payload: CreateAuditLogPayload | CreateAuditLogRequest
  ): Promise<AuditRecord | null> {
    const response = await request<AuditRecord>("/audit-logs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data || null;
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
    return `${API_BASE_URL}/audit-logs/export${queryString}`;
  },

  async exportAuditLog(data: ExportAuditLogRequest): Promise<{ eventId: string | null }> {
    const token = localStorage.getItem("carelink_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await authFetch(`${API_BASE_URL}/audit-logs/export`, {
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
