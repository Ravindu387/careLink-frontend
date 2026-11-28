import { authFetch } from "./api";
export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  owner: string;
  updated: string;
  version: string;
  visibility: string;
  status: string;
  fileName?: string;
  fileUrl?: string;
  fileSizeBytes?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentMetrics {
  activeRecords: number;
  needsReview: number;
  verifiedPercentage: number;
  dueSoon: number;
  totalDocuments: number;
  needsActionCount: number;
  activeCount: number;
  completedCount: number;
  archivedCount: number;
  lastUpdated: string;
}

export interface CreateDocumentPayload {
  name: string;
  type: string;
  owner: string;
  visibility: string;
  status?: string;
  version?: string;
  fileName?: string;
  fileUrl?: string;
  fileSizeBytes?: number;
  description?: string;
}

export interface DocumentFilters {
  search?: string;
  tab?: string;
  type?: string;
  owner?: string;
  visibility?: string;
  status?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";

export const partnerDocumentService = {
  async getAll(filters?: DocumentFilters): Promise<DocumentItem[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.tab && filters.tab !== "All") params.append("tab", filters.tab);
    if (filters?.type && filters.type !== "All document types") {
      params.append("type", filters.type);
    }
    if (filters?.owner && filters.owner !== "All owners") {
      params.append("owner", filters.owner);
    }
    if (filters?.visibility && filters.visibility !== "All visibility") {
      params.append("visibility", filters.visibility);
    }
    if (filters?.status && filters.status !== "All statuses") {
      params.append("status", filters.status);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await authFetch(`${API_BASE}/api/documents${query}`);
    if (!response.ok) {
      throw new Error(`Failed to load documents: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getMetrics(): Promise<DocumentMetrics> {
    const response = await authFetch(`${API_BASE}/api/documents/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to load document metrics: ${response.status}`);
    }
    return response.json();
  },

  async getById(id: string): Promise<DocumentItem> {
    const response = await authFetch(`${API_BASE}/api/documents/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error(`Failed to load document ${id}: ${response.status}`);
    }
    return response.json();
  },

  async upload(payload: CreateDocumentPayload): Promise<DocumentItem> {
    const response = await authFetch(`${API_BASE}/api/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to upload document: ${response.status}`);
    }
    return response.json();
  },

  async updateStatus(id: string, status: string): Promise<DocumentItem> {
    const response = await authFetch(`${API_BASE}/api/documents/${encodeURIComponent(id)}/status`, {
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
    const response = await authFetch(`${API_BASE}/api/documents/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete document ${id}: ${response.status}`);
    }
  },

  async reset(): Promise<{ message: string; metrics: DocumentMetrics }> {
    const response = await authFetch(`${API_BASE}/api/documents/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to reset documents: ${response.status}`);
    }
    return response.json();
  },
};
