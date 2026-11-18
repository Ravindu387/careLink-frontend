import { apiClient } from "./api";
import type {
  ResourceContribution,
  ResourceContributionQueryParams,
  PagedResourceContributions,
  CreateResourceContributionInput,
} from "../types/resourceContribution";

const BASE = "/resource-contributions";

export const resourceContributionService = {
  // GET /api/resource-contributions
  getPaged: async (
    params: ResourceContributionQueryParams = {}
  ): Promise<PagedResourceContributions> => {
    const query: Record<string, string | number> = {};
    if (params.search) query.search = params.search;
    if (params.type && params.type !== "All types") query.type = params.type;
    if (params.verification && params.verification !== "All verification states") {
      query.verification = params.verification;
    }
    if (params.status && params.status !== "All statuses") query.status = params.status;
    if (params.campaign && params.campaign !== "All campaigns") query.campaign = params.campaign;
    if (params.dateRange && params.dateRange !== "Date range") query.dateRange = params.dateRange;
    if (params.receivedDate) query.receivedDate = params.receivedDate;
    if (params.page) query.page = params.page;
    if (params.pageSize) query.pageSize = params.pageSize;

    return apiClient.get<PagedResourceContributions>(BASE, query);
  },

  // GET /api/resource-contributions/all
  getAll: async (
    params: ResourceContributionQueryParams = {}
  ): Promise<ResourceContribution[]> => {
    const query: Record<string, string | number> = {};
    if (params.search) query.search = params.search;
    if (params.type && params.type !== "All types") query.type = params.type;
    if (params.verification && params.verification !== "All verification states") {
      query.verification = params.verification;
    }
    if (params.status && params.status !== "All statuses") query.status = params.status;
    if (params.campaign && params.campaign !== "All campaigns") query.campaign = params.campaign;

    return apiClient.get<ResourceContribution[]>(`${BASE}/all`, query);
  },

  // GET /api/resource-contributions/:id
  getById: async (id: string): Promise<ResourceContribution> => {
    return apiClient.get<ResourceContribution>(`${BASE}/${encodeURIComponent(id)}`);
  },

  // POST /api/resource-contributions
  create: async (
    data: CreateResourceContributionInput
  ): Promise<ResourceContribution> => {
    return apiClient.post<ResourceContribution>(BASE, data);
  },

  // PATCH /api/resource-contributions/:id/verify
  verify: async (
    id: string,
    verification: string = "Verified"
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.patch<{ success: boolean; message: string }>(
      `${BASE}/${encodeURIComponent(id)}/verify`,
      { verification }
    );
  },

  // PATCH /api/resource-contributions/:id/allocate
  allocate: async (
    id: string,
    allocation: string = "Allocated"
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.patch<{ success: boolean; message: string }>(
      `${BASE}/${encodeURIComponent(id)}/allocate`,
      { allocation }
    );
  },

  // POST /api/resource-contributions/bulk-verify
  bulkVerify: async (
    ids: string[]
  ): Promise<{ success: boolean; count: number; message: string }> => {
    return apiClient.post<{ success: boolean; count: number; message: string }>(
      `${BASE}/bulk-verify`,
      { ids }
    );
  },

  // DELETE /api/resource-contributions/:id
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`${BASE}/${encodeURIComponent(id)}`);
  },
};

export default resourceContributionService;
