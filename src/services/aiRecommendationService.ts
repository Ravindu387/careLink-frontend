import { request } from "./api";
import type {
  AiRecommendationDetail,
  AiRecommendationMetrics,
  AiRecommendationSummary,
  ApproveRecommendationPayload,
  DeferRecommendationPayload,
  GenerateCrisisAnalysisPayload,
  GenerateResourcePlanPayload,
  GenerateResponsePlanPayload,
  GenerateShelterPlanPayload,
  GenerateVolunteerPlanPayload,
  RecordDecisionPayload,
  RejectRecommendationPayload,
} from "../types/aiRecommendation";

export const aiRecommendationService = {
  async getRecommendations(params?: {
    status?: string;
    priority?: string;
    category?: string;
    crisisId?: string;
    search?: string;
  }): Promise<AiRecommendationSummary[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "All") query.append("status", params.status);
    if (params?.priority && params.priority !== "All") query.append("priority", params.priority);
    if (params?.category && params.category !== "All") query.append("category", params.category);
    if (params?.crisisId && params.crisisId !== "All") query.append("crisisId", params.crisisId);
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

  async approveRecommendation(
    id: string,
    payload?: ApproveRecommendationPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai-recommendations/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },

  async rejectRecommendation(
    id: string,
    payload: RejectRecommendationPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai-recommendations/${id}/reject`, {
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

  async generateCrisisAnalysis(
    crisisId: string,
    payload?: GenerateCrisisAnalysisPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai/crises/${encodeURIComponent(crisisId)}/analysis`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },

  async generateResourceRecommendations(
    crisisId: string,
    payload?: GenerateResourcePlanPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai/crises/${encodeURIComponent(crisisId)}/resources`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },

  async generateShelterRecommendations(
    crisisId: string,
    payload?: GenerateShelterPlanPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai/crises/${encodeURIComponent(crisisId)}/shelters`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },

  async generateVolunteerRecommendations(
    crisisId: string,
    payload?: GenerateVolunteerPlanPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai/crises/${encodeURIComponent(crisisId)}/volunteers`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },

  async generateResponsePlan(
    crisisId: string,
    payload?: GenerateResponsePlanPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai/crises/${encodeURIComponent(crisisId)}/response-plan`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },
};
