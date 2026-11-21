import { request } from "./api";
import type {
  Report,
  ReportSchedule,
  AnalyticsDashboard,
  GenerateReportPayload,
  CreateReportSchedulePayload,
  AnalyticsQueryParams,
  ReportFilterParams,
} from "../types/reports";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const reportsService = {
  async getReports(params?: ReportFilterParams): Promise<Report[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category && params.category !== "All reports") {
      query.append("category", params.category);
    }
    if (params?.format && params.format !== "All formats") {
      query.append("format", params.format);
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<Report[]>(`/reports${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getReportById(id: number): Promise<Report> {
    const response = await request<Report>(`/reports/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async generateReport(payload: GenerateReportPayload): Promise<Report> {
    const response = await request<Report>("/reports/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteReport(id: number): Promise<boolean> {
    const response = await request<boolean>(`/reports/${id}`, {
      method: "DELETE",
    });
    return response.success;
  },

  async getSchedules(): Promise<ReportSchedule[]> {
    const response = await request<ReportSchedule[]>("/reports/schedules", {
      method: "GET",
    });
    return response.data || [];
  },

  async createSchedule(payload: CreateReportSchedulePayload): Promise<ReportSchedule> {
    const response = await request<ReportSchedule>("/reports/schedule", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteSchedule(id: number): Promise<boolean> {
    const response = await request<boolean>(`/reports/schedules/${id}`, {
      method: "DELETE",
    });
    return response.success;
  },

  async getAnalytics(params?: AnalyticsQueryParams): Promise<AnalyticsDashboard> {
    const query = new URLSearchParams();
    if (params?.period) query.append("period", params.period);
    if (params?.operation) query.append("operation", params.operation);
    if (params?.warehouse) query.append("warehouse", params.warehouse);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<AnalyticsDashboard>(`/reports/analytics${queryString}`, {
      method: "GET",
    });
    return response.data;
  },

  getExportUrl(params?: ReportFilterParams): string {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category && params.category !== "All reports") {
      query.append("category", params.category);
    }
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return `${API_BASE_URL}/reports/export${queryString}`;
  },
};
