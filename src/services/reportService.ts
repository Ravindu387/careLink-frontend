import { request, authFetch } from "./api";
import type {
  ReportItem,
  ReportSchedule,
  GenerateReportPayload,
  CreateReportSchedulePayload,
  ReportFilterParams,
  AnalyticsQueryParams,
  AnalyticsDashboard,
  ReportOverview,
  ReportFilter,
  ReportFilterOptions,
  ReportCatalogItem,
  ReportDetail,
  ExportReportRequest,
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

  async createReport(payload: GenerateReportPayload): Promise<ReportItem> {
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

  async getOverview(filter?: ReportFilter): Promise<ReportOverview> {
    const params = new URLSearchParams();
    if (filter?.dateRange) params.append("dateRange", filter.dateRange);
    if (filter?.organisation && filter.organisation !== "All organisations") {
      params.append("organisation", filter.organisation);
    }
    if (filter?.region && filter.region !== "All regions") {
      params.append("region", filter.region);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await request<ReportOverview>(`/reports/overview${queryString}`, {
      method: "GET",
    });

    if (!response.data) {
      throw new Error("Failed to load report overview.");
    }
    return response.data;
  },

  async getFilterOptions(): Promise<ReportFilterOptions> {
    const response = await request<ReportFilterOptions>("/reports/filter-options", {
      method: "GET",
    });

    return (
      response.data || {
        dateRanges: ["Last 30 days", "Last 7 days", "This year", "All time"],
        organisations: ["All organisations"],
        regions: ["All regions"],
      }
    );
  },

  async getCatalog(): Promise<ReportCatalogItem[]> {
    const response = await request<ReportCatalogItem[]>("/reports/catalog", {
      method: "GET",
    });

    return response.data || [];
  },

  async generateReport(reportId: string, filter?: ReportFilter): Promise<ReportDetail> {
    const params = new URLSearchParams();
    if (filter?.dateRange) params.append("dateRange", filter.dateRange);
    if (filter?.organisation && filter.organisation !== "All organisations") {
      params.append("organisation", filter.organisation);
    }
    if (filter?.region && filter.region !== "All regions") {
      params.append("region", filter.region);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await request<ReportDetail>(`/reports/${encodeURIComponent(reportId)}${queryString}`, {
      method: "GET",
    });

    if (!response.data) {
      throw new Error("Failed to generate report.");
    }
    return response.data;
  },

  async exportReport(
    reportId: string,
    data: ExportReportRequest
  ): Promise<{ fileName: string }> {
    const token = localStorage.getItem("carelink_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await authFetch(`${API_BASE_URL}/reports/${encodeURIComponent(reportId)}/export`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMsg = "Failed to export report.";
      try {
        const errorJson = await response.json();
        if (errorJson?.message) errorMsg = errorJson.message;
      } catch {
        // ignore JSON parse error
      }
      throw new Error(errorMsg);
    }

    let fileName = `carelink-report-${reportId}-${new Date().toISOString().slice(0, 10)}.${data.format || "csv"}`;
    const disposition = response.headers.get("Content-Disposition");
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, "").trim();
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return { fileName };
  },
};
