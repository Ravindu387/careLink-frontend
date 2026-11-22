import { request } from "./api";
import type {
  ResourceDashboardData,
  DashboardRequestItem,
  RecordReceiptPayload,
  CreateResourceRequestPayload,
} from "../types/dashboard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const resourceDashboardService = {
  async getDashboardData(): Promise<ResourceDashboardData> {
    const response = await request<ResourceDashboardData>("/resource-dashboard", {
      method: "GET",
    });
    return response.data;
  },

  async getRequests(params?: { priority?: string; status?: string; search?: string }): Promise<DashboardRequestItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.priority && params.priority !== "All priorities") query.append("priority", params.priority);
    if (params?.status && params.status !== "All statuses") query.append("status", params.status);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<DashboardRequestItem[]>(`/resource-dashboard/requests${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async createRequest(payload: CreateResourceRequestPayload): Promise<DashboardRequestItem> {
    const response = await request<DashboardRequestItem>("/resource-dashboard/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async recordReceipt(payload: RecordReceiptPayload): Promise<boolean> {
    const response = await request<boolean>("/resource-dashboard/receipt", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.success;
  },

  getExportUrl(format: "csv" | "pdf" = "csv"): string {
    return `${API_BASE_URL}/resource-dashboard/export?format=${format}`;
  },

  async downloadSnapshot(format: "csv" | "pdf" = "csv"): Promise<void> {
    const url = this.getExportUrl(format);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `carelink-dashboard-snapshot-${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
