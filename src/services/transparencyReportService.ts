import { apiClient } from "./api";
import type {
  TransparencyReport,
  TransparencyMetrics,
  TransparencyReportQueryParams,
  PagedTransparencyReports,
  CreateTransparencyReportInput,
} from "../types/transparencyReport";

const BASE = "/transparency-reports";

export const transparencyReportService = {
  // GET /api/transparency-reports
  getPaged: async (
    params: TransparencyReportQueryParams = {}
  ): Promise<PagedTransparencyReports> => {
    const query: Record<string, string | number> = {};
    if (params.search) query.search = params.search;
    if (params.type && params.type !== "All report types") query.type = params.type;
    if (params.status && params.status !== "All") query.status = params.status;
    if (params.page) query.page = params.page;
    if (params.pageSize) query.pageSize = params.pageSize;

    return apiClient.get<PagedTransparencyReports>(BASE, query);
  },

  // GET /api/transparency-reports/metrics
  getMetrics: async (): Promise<TransparencyMetrics> => {
    return apiClient.get<TransparencyMetrics>(`${BASE}/metrics`);
  },

  // GET /api/transparency-reports/:id
  getById: async (id: string): Promise<TransparencyReport> => {
    return apiClient.get<TransparencyReport>(`${BASE}/${encodeURIComponent(id)}`);
  },

  // POST /api/transparency-reports
  create: async (
    data: CreateTransparencyReportInput
  ): Promise<TransparencyReport> => {
    return apiClient.post<TransparencyReport>(BASE, data);
  },

  // PATCH /api/transparency-reports/:id/publish
  publish: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.patch<{ success: boolean; message: string }>(
      `${BASE}/${encodeURIComponent(id)}/publish`,
      {}
    );
  },

  // DELETE /api/transparency-reports/:id
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`${BASE}/${encodeURIComponent(id)}`);
  },
};

export default transparencyReportService;
