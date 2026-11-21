import { request } from "./api";
import type {
  AiRecommendationDetail,
  AiRecommendationMetrics,
  AiRecommendationSummary,
  DeferRecommendationPayload,
  RecordDecisionPayload,
} from "../types/aiRecommendation";

export const aiRecommendationService = {
  async getRecommendations(params?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<AiRecommendationSummary[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "All") query.append("status", params.status);
    if (params?.priority && params.priority !== "All") query.append("priority", params.priority);
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await request<AiRecommendationSummary[]>(`/ai-recommendations${queryString}`, {
      method: "GET",
    });
    return res.data || [];
  },

  async getMetrics(): Promise<AiRecommendationMetrics> {
    const res = await request<AiRecommendationMetrics>("/ai-recommendations/metrics", {
      method: "GET",
    });
    return res.data;
  },

  async getRecommendationById(id: string): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai-recommendations/${id}`, {
      method: "GET",
    });
    return res.data;
  },

  async getRecommendationByRequestId(requestId: string): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai-recommendations/by-request/${requestId}`, {
      method: "GET",
    });
    return res.data;
  },

  async recordDecision(
    id: string,
    payload: RecordDecisionPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai-recommendations/${id}/decision`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deferRecommendation(
    id: string,
    payload?: DeferRecommendationPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai-recommendations/${id}/defer`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },

  async resetRecommendation(id: string): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai-recommendations/${id}/reset`, {
      method: "POST",
    });
    return res.data;
  },
};
