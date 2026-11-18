import { request } from "./api";
import type {
  Integration,
  IntegrationLog,
  PlatformHealthOverview,
  IntegrationActionRequest,
} from "../types/integration";

export const integrationService = {
  async getIntegrations(params?: { type?: string; health?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.type && params.type !== "All service types") query.append("type", params.type);
    if (params?.health && params.health !== "All health states") query.append("health", params.health);
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<Integration[]>(`/integrations${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getOverview() {
    const response = await request<PlatformHealthOverview>("/integrations/overview", {
      method: "GET",
    });
    return response.data;
  },

  async getIntegrationById(id: string) {
    const response = await request<Integration>(`/integrations/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getLogs(integrationId: string) {
    const response = await request<IntegrationLog[]>(`/integrations/${integrationId}/logs`, {
      method: "GET",
    });
    return response.data || [];
  },

  async runHealthCheck() {
    const response = await request<Integration[]>("/integrations/health-check", {
      method: "POST",
    });
    return response.data || [];
  },

  async retryIntegration(id: string, data: IntegrationActionRequest) {
    const response = await request<Integration>(`/integrations/${id}/retry`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async recordAction(data: IntegrationActionRequest, integrationId?: string) {
    const query = integrationId ? `?integrationId=${encodeURIComponent(integrationId)}` : "";
    const response = await request<boolean>(`/integrations/record-action${query}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },
};
