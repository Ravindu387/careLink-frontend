export interface CrisisEvent {
  id: string;
  name: string;
  type: string;
  severity: string;
  area: string;
  startDate: string;
  status: string;
  requests: string;
  coordinator: string;
  description?: string | null;
  affectedPeopleCount?: number;
  districtsCovered?: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CrisisEventMetrics {
  activeEvents: number;
  majorSeverityEvents: number;
  totalAffectedPeople: number;
  formattedAffectedPeople: string;
  assignedCoordinators: number;
  totalEvents: number;
  monitoringEvents: number;
  resolvedEvents: number;
  districtsCount: number;
}

export interface CreateCrisisEventPayload {
  name: string;
  type: string;
  severity: string;
  area: string;
  startDate?: string;
  coordinator: string;
  status?: string;
  description?: string;
  affectedPeopleCount?: number;
  districtsCovered?: number;
}

export interface UpdateCrisisEventPayload {
  name?: string;
  type?: string;
  severity?: string;
  area?: string;
  startDate?: string;
  coordinator?: string;
  status?: string;
  description?: string;
  affectedPeopleCount?: number;
  districtsCovered?: number;
}

export interface CrisisEventFilters {
  search?: string;
  type?: string;
  severity?: string;
  status?: string;
  dateRange?: string;
  showArchived?: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";

export const crisisEventService = {
  async getAll(filters?: CrisisEventFilters): Promise<CrisisEvent[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.type && filters.type !== "All crisis types") {
      params.append("type", filters.type);
    }
    if (filters?.severity && filters.severity !== "All severity levels") {
      params.append("severity", filters.severity);
    }
    if (filters?.status && filters.status !== "All statuses") {
      params.append("status", filters.status);
    }
    if (filters?.dateRange && filters.dateRange !== "Date range") {
      params.append("dateRange", filters.dateRange);
    }
    if (filters?.showArchived !== undefined) {
      params.append("showArchived", String(filters.showArchived));
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE}/api/crisisevents${query}`);
    if (!response.ok) {
      throw new Error(`Failed to load crisis events: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getMetrics(): Promise<CrisisEventMetrics> {
    const response = await fetch(`${API_BASE}/api/crisisevents/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to load crisis metrics: ${response.status}`);
    }
    return response.json();
  },

  async getById(id: string): Promise<CrisisEvent> {
    const response = await fetch(`${API_BASE}/api/crisisevents/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error(`Failed to load crisis event ${id}: ${response.status}`);
    }
    return response.json();
  },

  async create(payload: CreateCrisisEventPayload): Promise<CrisisEvent> {
    const response = await fetch(`${API_BASE}/api/crisisevents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create crisis event: ${response.status}`);
    }
    return response.json();
  },

  async update(id: string, payload: UpdateCrisisEventPayload): Promise<CrisisEvent> {
    const response = await fetch(`${API_BASE}/api/crisisevents/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update crisis event: ${response.status}`);
    }
    return response.json();
  },

  async updateStatus(id: string, status: string): Promise<CrisisEvent> {
    const response = await fetch(`${API_BASE}/api/crisisevents/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update status: ${response.status}`);
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/crisisevents/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete crisis event: ${response.status}`);
    }
  },

  async reset(): Promise<{ message: string; metrics: CrisisEventMetrics }> {
    const response = await fetch(`${API_BASE}/api/crisisevents/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to reset crisis events: ${response.status}`);
    }
    return response.json();
  },
};
