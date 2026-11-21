import { request } from "./api";
import type {
  VerificationRequestItem,
  VerificationStats,
  VerificationQuery,
  VerificationDecisionPayload,
} from "../types/verification";
import type { PaginatedList } from "../types/user";

export const verificationService = {
  async getRequests(query?: VerificationQuery): Promise<PaginatedList<VerificationRequestItem>> {
    const params = new URLSearchParams();
    if (query?.search) params.append("search", query.search);
    if (query?.type && query.type !== "All types") params.append("type", query.type);
    if (query?.priority && query.priority !== "All priorities") params.append("priority", query.priority);
    if (query?.status && query.status !== "All statuses") params.append("status", query.status);
    if (query?.pageNumber) params.append("pageNumber", query.pageNumber.toString());
    if (query?.pageSize) params.append("pageSize", query.pageSize.toString());

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await request<PaginatedList<VerificationRequestItem>>(`/verification${qs}`, {
      method: "GET",
    });
    return res.data;
  },

  async getStats(): Promise<VerificationStats> {
    const res = await request<VerificationStats>("/verification/stats", {
      method: "GET",
    });
    return res.data;
  },

  async getTypes(): Promise<string[]> {
    const res = await request<string[]>("/verification/types", {
      method: "GET",
    });
    return res.data || [];
  },

  async getById(id: string): Promise<VerificationRequestItem> {
    const res = await request<VerificationRequestItem>(`/verification/${id}`, {
      method: "GET",
    });
    return res.data;
  },

  async recordDecision(id: string, payload: VerificationDecisionPayload): Promise<VerificationRequestItem> {
    const res = await request<VerificationRequestItem>(`/verification/${id}/decision`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
