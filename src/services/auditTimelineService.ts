export interface AuditEvent {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  record: string;
  previous: string;
  current: string;
  rationale: string;
  type: string;
  ipAddress?: string | null;
  checksum: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface AuditTimelineMetrics {
  totalEvents: number;
  eventsToday: number;
  aiDecisionEvents: number;
  humanOverrideEvents: number;
  integrityScore: number;
  retentionPeriod: string;
  allRecordsVerified: boolean;
}

export interface CreateAuditEventPayload {
  action: string;
  actor: string;
  record: string;
  previous?: string;
  current: string;
  rationale: string;
  type: string;
  ipAddress?: string;
}

export interface AuditFilters {
  search?: string;
  action?: string;
  actor?: string;
  type?: string;
  dateRange?: string;
}

export interface VerifyIntegrityResponse {
  verified: boolean;
  status: string;
  recordsChecked: number;
  algorithm: string;
  timestamp: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";

export const auditTimelineService = {
  async getAll(filters?: AuditFilters): Promise<AuditEvent[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.action && filters.action !== "All action types") {
      params.append("action", filters.action);
    }
    if (filters?.actor && filters.actor !== "All users") {
      params.append("actor", filters.actor);
    }
    if (filters?.type && filters.type !== "All record types") {
      params.append("type", filters.type);
    }
    if (filters?.dateRange && filters.dateRange !== "Date range") {
      params.append("dateRange", filters.dateRange);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE}/api/audittimeline${query}`);
    if (!response.ok) {
      throw new Error(`Failed to load audit events: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getMetrics(): Promise<AuditTimelineMetrics> {
    const response = await fetch(`${API_BASE}/api/audittimeline/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to load audit metrics: ${response.status}`);
    }
    return response.json();
  },

  async getById(id: string): Promise<AuditEvent> {
    const response = await fetch(`${API_BASE}/api/audittimeline/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error(`Failed to load audit record ${id}: ${response.status}`);
    }
    return response.json();
  },

  async logEvent(payload: CreateAuditEventPayload): Promise<AuditEvent> {
    const response = await fetch(`${API_BASE}/api/audittimeline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to log audit event: ${response.status}`);
    }
    return response.json();
  },

  async verifyIntegrity(): Promise<VerifyIntegrityResponse> {
    const response = await fetch(`${API_BASE}/api/audittimeline/verify`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to verify audit integrity: ${response.status}`);
    }
    return response.json();
  },

  async reset(): Promise<{ message: string; metrics: AuditTimelineMetrics }> {
    const response = await fetch(`${API_BASE}/api/audittimeline/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to reset audit timeline: ${response.status}`);
    }
    return response.json();
  },
};
