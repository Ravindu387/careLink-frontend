import { apiClient } from "./api";
import type {
  ReportsAnalytics,
  ReportsAnalyticsQueryParams,
  ReportDefinition,
} from "../types/reportsAnalytics";

const BASE_PATH = "/reports";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5277/api";

export const reportsAnalyticsService = {
  // GET /api/reports/analytics
  async getAnalytics(
    params?: ReportsAnalyticsQueryParams
  ): Promise<ReportsAnalytics> {
    return apiClient.get<ReportsAnalytics>(`${BASE_PATH}/analytics`, params);
  },

  // GET /api/reports/library
  async getLibrary(): Promise<ReportDefinition[]> {
    return apiClient.get<ReportDefinition[]>(`${BASE_PATH}/library`);
  },

  // GET /api/reports/export
  async exportCsv(
    reportTitle: string,
    params?: ReportsAnalyticsQueryParams
  ): Promise<Blob> {
    const url = new URL(
      `${API_BASE_URL.replace(/\/+$/, "")}${BASE_PATH}/export`
    );
    url.searchParams.append("reportTitle", reportTitle);
    if (params?.dateRange) url.searchParams.append("dateRange", params.dateRange);
    if (params?.shelter) url.searchParams.append("shelter", params.shelter);
    if (params?.district) url.searchParams.append("district", params.district);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "text/csv, application/octet-stream",
      },
    });

    if (!res.ok) {
      throw new Error(`Export failed with HTTP ${res.status}`);
    }

    return await res.blob();
  },
};

export default reportsAnalyticsService;
