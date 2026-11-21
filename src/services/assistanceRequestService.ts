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
import { request } from "./api";
import type {
  AssistanceRequest,
  AssistanceRequestStats,
  AssistanceRequestQuery,
  CreateAssistanceRequestPayload,
  UpdateAssistanceRequestPayload,
} from "../types/assistanceRequest";
import type { PaginatedList } from "../types/user";

export const assistanceRequestService = {
  async getRequests(query?: AssistanceRequestQuery): Promise<PaginatedList<AssistanceRequest>> {
    const params = new URLSearchParams();
    if (query?.search) params.append("search", query.search);
    if (query?.status && query.status !== "All") params.append("status", query.status);
    if (query?.priority && query.priority !== "All") params.append("priority", query.priority);
    if (query?.category && query.category !== "All") params.append("category", query.category);
    if (query?.crisis) params.append("crisis", query.crisis);
    if (query?.pageNumber) params.append("pageNumber", query.pageNumber.toString());
    if (query?.pageSize) params.append("pageSize", query.pageSize.toString());

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await request<PaginatedList<AssistanceRequest>>(`/assistance-requests${qs}`, {
      method: "GET",
    });
    return res.data;
  },

  async getStats(): Promise<AssistanceRequestStats> {
    const res = await request<AssistanceRequestStats>("/assistance-requests/stats", {
      method: "GET",
    });
    return res.data;
  },

  async getById(id: string): Promise<AssistanceRequest> {
    const res = await request<AssistanceRequest>(`/assistance-requests/${id}`, {
      method: "GET",
    });
    return res.data;
  },

  async createRequest(payload: CreateAssistanceRequestPayload): Promise<AssistanceRequest> {
    const res = await request<AssistanceRequest>("/assistance-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateRequest(id: string, payload: UpdateAssistanceRequestPayload): Promise<AssistanceRequest> {
    const res = await request<AssistanceRequest>(`/assistance-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateStatus(id: string, status: string, reason?: string, note?: string): Promise<AssistanceRequest> {
    const res = await request<AssistanceRequest>(`/assistance-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason, note }),
    });
    return res.data;
  },

  async updatePriority(id: string, priority: string, rationale?: string): Promise<AssistanceRequest> {
    const res = await request<AssistanceRequest>(`/assistance-requests/${id}/priority`, {
      method: "PATCH",
      body: JSON.stringify({ priority, rationale }),
    });
    return res.data;
  },

  async assignRequest(id: string, assignedTo: string, instructions?: string): Promise<AssistanceRequest> {
    const res = await request<AssistanceRequest>(`/assistance-requests/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ assignedTo, instructions }),
    });
    return res.data;
  },

  async deleteRequest(id: string): Promise<boolean> {
    const res = await request<boolean>(`/assistance-requests/${id}`, {
      method: "DELETE",
    });
    return res.data ?? false;
  },
};
