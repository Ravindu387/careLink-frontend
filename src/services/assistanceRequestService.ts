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
