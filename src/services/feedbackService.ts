import { request } from "./api";
import type {
  FeedbackItem,
  CreateFeedbackPayload,
  FeedbackSummary,
  UpdateFeedbackStatusPayload,
} from "../types/feedback";

export const feedbackService = {
  async getFeedbacks(params?: {
    category?: string;
    rating?: number;
    status?: string;
    search?: string;
  }): Promise<FeedbackItem[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "all") {
      query.append("category", params.category);
    }
    if (params?.rating && params.rating > 0) {
      query.append("rating", params.rating.toString());
    }
    if (params?.status && params.status !== "all") {
      query.append("status", params.status);
    }
    if (params?.search) {
      query.append("search", params.search);
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<FeedbackItem[]>(`/feedback${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getFeedbackById(id: string): Promise<FeedbackItem> {
    const response = await request<FeedbackItem>(`/feedback/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getSummary(): Promise<FeedbackSummary> {
    const response = await request<FeedbackSummary>("/feedback/summary", {
      method: "GET",
    });
    return response.data;
  },

  async createFeedback(payload: CreateFeedbackPayload): Promise<FeedbackItem> {
    const response = await request<FeedbackItem>("/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateStatus(id: string, payload: UpdateFeedbackStatusPayload): Promise<FeedbackItem> {
    const response = await request<FeedbackItem>(`/feedback/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteFeedback(id: string): Promise<boolean> {
    const response = await request<boolean>(`/feedback/${id}`, {
      method: "DELETE",
    });
    return response.data;
  },
};
