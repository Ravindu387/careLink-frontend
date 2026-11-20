import { request } from "./api";
import type {
  ReportItem,
  ReportSchedule,
  GenerateReportPayload,
  CreateReportSchedulePayload,
  ReportFilterParams,
  AnalyticsQueryParams,
  AnalyticsDashboard,
} from "../types/report";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const reportService = {
  async getReports(params?: ReportFilterParams): Promise<ReportItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category && params.category !== "All reports") {
      query.append("category", params.category);
    }
    if (params?.format && params.format !== "All formats") {
      query.append("format", params.format);
    }
    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<ReportItem[]>(`/reports${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getReportById(id: number): Promise<ReportItem> {
    const response = await request<ReportItem>(`/reports/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async generateReport(payload: GenerateReportPayload): Promise<ReportItem> {
    const response = await request<ReportItem>("/reports/generate", {
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

  async toggleSchedule(id: number): Promise<ReportSchedule> {
    const response = await request<ReportSchedule>(`/reports/schedules/${id}/toggle`, {
      method: "PATCH",
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
    if (params?.warehouse && params.warehouse !== "All warehouses") {
      query.append("warehouse", params.warehouse);
    }
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const response = await request<AnalyticsDashboard>(`/reports/analytics${queryString}`, {
      method: "GET",
    });
    return response.data;
  },

  getExportUrl(params?: ReportFilterParams, format: "csv" | "pdf" = "csv"): string {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category && params.category !== "All reports") {
      query.append("category", params.category);
    }
    if (params?.format && params.format !== "All formats") {
      query.append("format", params.format);
    }
    query.append("format", format);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return `${API_BASE_URL}/reports/export${queryString}`;
  },

  getSingleReportExportUrl(id: number, format: "csv" | "pdf" = "csv"): string {
    return `${API_BASE_URL}/reports/${id}/export?format=${format}`;
  },

  async downloadExport(params?: ReportFilterParams, format: "csv" | "pdf" = "csv"): Promise<void> {
    const url = this.getExportUrl(params, format);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `carelink-reports-${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async downloadSingleReport(id: number, reportName: string, format: "csv" | "pdf" = "csv"): Promise<void> {
    const url = this.getSingleReportExportUrl(id, format);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${reportName.replace(/[^a-zA-Z0-9_-]/g, "_")}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
