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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";

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
    const response = await fetch(`${API_BASE}/api/audit-log${query}`);
    if (!response.ok) {
      throw new Error(`Failed to load audit log: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getMetrics(): Promise<AuditLogMetrics> {
    const response = await fetch(`${API_BASE}/api/audit-log/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to load audit metrics: ${response.status}`);
    }
    return response.json();
  },

  async getById(id: string): Promise<AuditEvent> {
    const response = await fetch(`${API_BASE}/api/audit-log/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error(`Failed to load audit record ${id}: ${response.status}`);
    }
    return response.json();
  },

  async verifyIntegrity(): Promise<{ verified: boolean; status: string; recordsChecked: number }> {
    const response = await fetch(`${API_BASE}/api/audit-log/verify`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to verify audit log integrity: ${response.status}`);
    }
    return response.json();
  },

  async reset(): Promise<{ message: string; metrics: AuditLogMetrics }> {
    const response = await fetch(`${API_BASE}/api/audit-log/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to reset audit log: ${response.status}`);
    }
    return response.json();
  },
};
