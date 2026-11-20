export interface Collaboration {
  id: string;
  title: string;
  partner: string;
  sector: string;
  area: string;
  support: string;
  startDate: string;
  status: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
}

export interface CollaborationMetrics {
  openCollaborations: number;
  awaitingResponse: number;
  activePartnerships: number;
  completedThisMonth: number;
  totalCollaborations: number;
  sectorsCount: number;
  partnersCount: number;
  needsActionCount: number;
  activeCount: number;
  completedCount: number;
  archivedCount: number;
  lastUpdated: string;
}

export interface CreateCollaborationPayload {
  title: string;
  partner: string;
  sector: string;
  area: string;
  support: string;
  startDate: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateCollaborationPayload {
  title?: string;
  partner?: string;
  sector?: string;
  area?: string;
  support?: string;
  startDate?: string;
  status?: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CollaborationFilters {
  search?: string;
  tab?: string;
  sector?: string;
  partner?: string;
  area?: string;
  status?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";

export const collaborationRequestService = {
  async getAll(filters?: CollaborationFilters): Promise<Collaboration[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.tab && filters.tab !== "All") params.append("tab", filters.tab);
    if (filters?.sector && filters.sector !== "All sectors") {
      params.append("sector", filters.sector);
    }
    if (filters?.partner && filters.partner !== "All partners") {
      params.append("partner", filters.partner);
    }
    if (filters?.area && filters.area !== "All operational areas") {
      params.append("area", filters.area);
    }
    if (filters?.status && filters.status !== "All statuses") {
      params.append("status", filters.status);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE}/api/collaboration-requests${query}`);
    if (!response.ok) {
      throw new Error(`Failed to load collaboration requests: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getMetrics(): Promise<CollaborationMetrics> {
    const response = await fetch(`${API_BASE}/api/collaboration-requests/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to load collaboration metrics: ${response.status}`);
    }
    return response.json();
  },

  async getById(id: string): Promise<Collaboration> {
    const response = await fetch(`${API_BASE}/api/collaboration-requests/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error(`Failed to load collaboration ${id}: ${response.status}`);
    }
    return response.json();
  },

  async create(payload: CreateCollaborationPayload): Promise<Collaboration> {
    const response = await fetch(`${API_BASE}/api/collaboration-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create collaboration request: ${response.status}`);
    }
    return response.json();
  },

  async update(id: string, payload: UpdateCollaborationPayload): Promise<Collaboration> {
    const response = await fetch(`${API_BASE}/api/collaboration-requests/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update collaboration request: ${response.status}`);
    }
    return response.json();
  },

  async updateStatus(id: string, status: string): Promise<Collaboration> {
    const response = await fetch(`${API_BASE}/api/collaboration-requests/${encodeURIComponent(id)}/status`, {
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
    const response = await fetch(`${API_BASE}/api/collaboration-requests/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete collaboration ${id}: ${response.status}`);
    }
  },

  async reset(): Promise<{ message: string; metrics: CollaborationMetrics }> {
    const response = await fetch(`${API_BASE}/api/collaboration-requests/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to reset collaboration requests: ${response.status}`);
    }
    return response.json();
  },
};
