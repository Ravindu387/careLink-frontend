import { request } from "./api";
import type {
  ReportOverview,
  ReportFilter,
  ReportFilterOptions,
  ReportCatalogItem,
  ReportDetail,
  ExportReportRequest,
} from "../types/report";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const reportService = {
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

    const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(reportId)}/export`, {
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
