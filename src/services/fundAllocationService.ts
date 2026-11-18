import { apiClient } from "./api";
import type {
  FundAllocation,
  FundAllocationPagedResult,
  FundAllocationSummary,
  FundAllocationQueryParams,
  CreateFundAllocationInput,
  UpdateFundAllocationInput,
  BulkFundAllocationActionInput,
} from "../types/fundAllocation";

const BASE = "/fund-allocations";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "") q.set(key, String(val));
  }
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

export const fundAllocationService = {
  // GET /api/fund-allocations (paged + filtered)
  getPaged: async (params: FundAllocationQueryParams = {}): Promise<FundAllocationPagedResult> => {
    const query: Record<string, string | number | undefined> = {};
    if (params.search) query.search = params.search;
    if (params.source && params.source !== "All types") query.source = params.source;
    if (params.approval && params.approval !== "All verification states") query.approval = params.approval;
    if (params.disbursement && params.disbursement !== "All statuses") query.disbursement = params.disbursement;
    if (params.dateRange && params.dateRange !== "Date range") query.dateRange = params.dateRange;
    if (params.minAmount !== undefined) query.minAmount = params.minAmount;
    if (params.maxAmount !== undefined) query.maxAmount = params.maxAmount;
    if (params.page) query.page = params.page;
    if (params.pageSize) query.pageSize = params.pageSize;
    return apiClient.get<FundAllocationPagedResult>(`${BASE}${buildQuery(query)}`);
  },

  // GET /api/fund-allocations/all
  getAll: async (): Promise<FundAllocation[]> => {
    return apiClient.get<FundAllocation[]>(`${BASE}/all`);
  },

  // GET /api/fund-allocations/summary
  getSummary: async (): Promise<FundAllocationSummary> => {
    return apiClient.get<FundAllocationSummary>(`${BASE}/summary`);
  },

  // GET /api/fund-allocations/:id
  getById: async (id: string): Promise<FundAllocation> => {
    return apiClient.get<FundAllocation>(`${BASE}/${id}`);
  },

  // POST /api/fund-allocations
  create: async (data: CreateFundAllocationInput): Promise<FundAllocation> => {
    return apiClient.post<FundAllocation>(BASE, data);
  },

  // PUT /api/fund-allocations/:id
  update: async (id: string, data: UpdateFundAllocationInput): Promise<FundAllocation> => {
    return apiClient.put<FundAllocation>(`${BASE}/${id}`, data);
  },

  // PATCH /api/fund-allocations/:id/approval
  updateApproval: async (id: string, status: string): Promise<FundAllocation> => {
    return apiClient.patch<FundAllocation>(`${BASE}/${id}/approval`, { status });
  },

  // PATCH /api/fund-allocations/:id/disbursement
  updateDisbursement: async (id: string, status: string): Promise<FundAllocation> => {
    return apiClient.patch<FundAllocation>(`${BASE}/${id}/disbursement`, { status });
  },

  // POST /api/fund-allocations/bulk
  bulkAction: async (data: BulkFundAllocationActionInput): Promise<{ updated: number; message: string }> => {
    return apiClient.post<{ updated: number; message: string }>(`${BASE}/bulk`, data);
  },

  // DELETE /api/fund-allocations/:id
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`${BASE}/${id}`);
  },
};

export default fundAllocationService;
