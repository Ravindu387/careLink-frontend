import { request } from "./api";
import type {
  ResourceRequest,
  ResourceRequestSummary,
  CreateResourceRequestPayload,
  UpdateResourceRequestStatusPayload,
  ResourceRequestQueryParams,
} from "../types/resourceRequest";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const resourceRequestService = {
  async getRequests(params?: ResourceRequestQueryParams): Promise<ResourceRequest[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.priority && params.priority !== "All priorities") query.append("priority", params.priority);
    if (params?.category && params.category !== "All categories") query.append("category", params.category);
    if (params?.requester && params.requester !== "All requesters") query.append("requester", params.requester);
    if (params?.status && params.status !== "All statuses") query.append("status", params.status);
    if (params?.tab && params.tab !== "All") query.append("tab", params.tab);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<ResourceRequest[]>(`/resource-requests${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getRequestById(id: string): Promise<ResourceRequest> {
    const response = await request<ResourceRequest>(`/resource-requests/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getSummary(): Promise<ResourceRequestSummary> {
    const response = await request<ResourceRequestSummary>("/resource-requests/summary", {
      method: "GET",
    });
    return response.data;
  },

  async createRequest(payload: CreateResourceRequestPayload): Promise<ResourceRequest> {
    const response = await request<ResourceRequest>("/resource-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateRequestStatus(id: string, payload: UpdateResourceRequestStatusPayload): Promise<ResourceRequest> {
    const response = await request<ResourceRequest>(`/resource-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteRequest(id: string): Promise<boolean> {
    const response = await request<boolean>(`/resource-requests/${id}`, {
      method: "DELETE",
    });
    return response.success;
  },

  getExportUrl(params?: ResourceRequestQueryParams, format: "csv" | "pdf" = "csv"): string {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.priority && params.priority !== "All priorities") query.append("priority", params.priority);
    if (params?.category && params.category !== "All categories") query.append("category", params.category);
    if (params?.requester && params.requester !== "All requesters") query.append("requester", params.requester);
    if (params?.status && params.status !== "All statuses") query.append("status", params.status);
    if (params?.tab && params.tab !== "All") query.append("tab", params.tab);
    query.append("format", format);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return `${API_BASE_URL}/resource-requests/export${queryString}`;
  },

  async downloadExport(params?: ResourceRequestQueryParams, format: "csv" | "pdf" = "csv"): Promise<void> {
    const url = this.getExportUrl(params, format);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `carelink-resource-requests-${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
