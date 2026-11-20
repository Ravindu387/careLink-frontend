export interface AssistanceRequest {
  id: string;
  category: string;
  location: string;
  crisisEvent: string;
  reported: string;
  priority: string;
  priorityLevel: string;
  confidence: number;
  verification: string;
  assigned: string;
  age: string;
  status: string;
  organisation: string;
  description?: string | null;
  affectedPeopleCount: number;
  hasVulnerableMembers: boolean;
  isLifeThreatening: boolean;
  isOverdue: boolean;
  isPotentialDuplicate: boolean;
  contactName?: string | null;
  contactPhone?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface AssistanceRequestMetrics {
  totalRequests: number;
  unassigned: number;
  overdue: number;
  potentialDuplicates: number;
  underReview: number;
  inProgress: number;
  completed: number;
  escalated: number;
}

export interface CreateAssistanceRequestPayload {
  category: string;
  location: string;
  crisisEvent?: string;
  priority?: string;
  verification?: string;
  assigned?: string;
  organisation?: string;
  status?: string;
  description?: string;
  affectedPeopleCount?: number;
  hasVulnerableMembers?: boolean;
  isLifeThreatening?: boolean;
  contactName?: string;
  contactPhone?: string;
}

export interface UpdateAssistanceRequestPayload {
  category?: string;
  location?: string;
  priority?: string;
  verification?: string;
  assigned?: string;
  status?: string;
  organisation?: string;
  description?: string;
  affectedPeopleCount?: number;
  hasVulnerableMembers?: boolean;
  isLifeThreatening?: boolean;
}

export interface AssignPayload {
  assigned: string;
  organisation?: string;
}

export interface UpdateStatusPayload {
  status: string;
  reason?: string;
}

export interface AssistanceRequestFilters {
  search?: string;
  tab?: string;
  crisisEvent?: string;
  priority?: string;
  category?: string;
  status?: string;
  organisation?: string;
  verifiedOnly?: boolean;
  unassignedOnly?: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";

export const assistanceRequestService = {
  async getAll(filters?: AssistanceRequestFilters): Promise<AssistanceRequest[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.tab && filters.tab !== "All requests") params.append("tab", filters.tab);
    if (filters?.crisisEvent && filters.crisisEvent !== "All crisis events") {
      params.append("crisisEvent", filters.crisisEvent);
    }
    if (filters?.priority && filters.priority !== "All priorities") {
      params.append("priority", filters.priority);
    }
    if (filters?.category && filters.category !== "All categories") {
      params.append("category", filters.category);
    }
    if (filters?.status && filters.status !== "All statuses") {
      params.append("status", filters.status);
    }
    if (filters?.organisation && filters.organisation !== "All organisations") {
      params.append("organisation", filters.organisation);
    }
    if (filters?.verifiedOnly) params.append("verifiedOnly", "true");
    if (filters?.unassignedOnly) params.append("unassignedOnly", "true");

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE}/api/assistancerequests${query}`);
    if (!response.ok) {
      throw new Error(`Failed to load assistance requests: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getMetrics(): Promise<AssistanceRequestMetrics> {
    const response = await fetch(`${API_BASE}/api/assistancerequests/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to load metrics: ${response.status}`);
    }
    return response.json();
  },

  async getById(id: string): Promise<AssistanceRequest> {
    const response = await fetch(`${API_BASE}/api/assistancerequests/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error(`Failed to load assistance request ${id}: ${response.status}`);
    }
    return response.json();
  },

  async create(payload: CreateAssistanceRequestPayload): Promise<AssistanceRequest> {
    const response = await fetch(`${API_BASE}/api/assistancerequests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create assistance request: ${response.status}`);
    }
    return response.json();
  },

  async update(id: string, payload: UpdateAssistanceRequestPayload): Promise<AssistanceRequest> {
    const response = await fetch(`${API_BASE}/api/assistancerequests/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update assistance request: ${response.status}`);
    }
    return response.json();
  },

  async assign(id: string, payload: AssignPayload): Promise<AssistanceRequest> {
    const response = await fetch(`${API_BASE}/api/assistancerequests/${encodeURIComponent(id)}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to assign request: ${response.status}`);
    }
    return response.json();
  },

  async updateStatus(id: string, payload: UpdateStatusPayload): Promise<AssistanceRequest> {
    const response = await fetch(`${API_BASE}/api/assistancerequests/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update status: ${response.status}`);
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/assistancerequests/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete request: ${response.status}`);
    }
  },

  async reset(): Promise<{ message: string; metrics: AssistanceRequestMetrics }> {
    const response = await fetch(`${API_BASE}/api/assistancerequests/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to reset assistance requests: ${response.status}`);
    }
    return response.json();
  },
};
