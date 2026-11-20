import { request } from "./api";
import type {
  AlertItem,
  AlertSummary,
  AlertRules,
  CreateAlertPayload,
} from "../types/alert";

export const alertService = {
  async getAlerts(params?: { tab?: string; search?: string }): Promise<AlertItem[]> {
    const query = new URLSearchParams();
    if (params?.tab) query.append("tab", params.tab);
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<AlertItem[]>(`/alerts${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getAlertSummary(): Promise<AlertSummary | null> {
    const response = await request<AlertSummary>("/alerts/summary", {
      method: "GET",
    });
    return response.data || null;
  },

  async getAlertById(id: number): Promise<AlertItem> {
    const response = await request<AlertItem>(`/alerts/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async createAlert(payload: CreateAlertPayload): Promise<AlertItem> {
    const response = await request<AlertItem>("/alerts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async acknowledgeAlert(id: number): Promise<AlertItem> {
    const response = await request<AlertItem>(`/alerts/${id}/acknowledge`, {
      method: "PATCH",
    });
    return response.data;
  },

  async resolveAlert(id: number): Promise<AlertItem> {
    const response = await request<AlertItem>(`/alerts/${id}/resolve`, {
      method: "PATCH",
    });
    return response.data;
  },

  async markAllReviewed(): Promise<number> {
    const response = await request<number>("/alerts/mark-all-reviewed", {
      method: "POST",
    });
    return response.data ?? 0;
  },

  async getAlertRules(): Promise<AlertRules> {
    const response = await request<AlertRules>("/alerts/rules", {
      method: "GET",
    });
    return response.data;
  },

  async updateAlertRules(rules: AlertRules): Promise<AlertRules> {
    const response = await request<AlertRules>("/alerts/rules", {
      method: "PUT",
      body: JSON.stringify(rules),
    });
    return response.data;
  },
};
