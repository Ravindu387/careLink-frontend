import { apiClient } from "./api";
import type {
  FlaggedTransaction,
  FlaggedTransactionPagedResult,
  FlaggedTransactionSummary,
  FlaggedTransactionQueryParams,
  CreateFlaggedTransactionInput,
  UpdateFlaggedTransactionStatusInput,
} from "../types/flaggedTransaction";

const BASE = "/flagged-transactions";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "") q.set(key, String(val));
  }
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

export const flaggedTransactionService = {
  // GET /api/flagged-transactions (paged + filtered)
  getPaged: async (params: FlaggedTransactionQueryParams = {}): Promise<FlaggedTransactionPagedResult> => {
    const query: Record<string, string | number | undefined> = {};
    if (params.search) query.search = params.search;
    if (params.recordType && params.recordType !== "All record types") query.recordType = params.recordType;
    if (params.severity && params.severity !== "All severities") query.severity = params.severity;
    if (params.status && params.status !== "All statuses") query.status = params.status;
    if (params.dateSort && params.dateSort !== "Date flagged") query.dateSort = params.dateSort;
    if (params.page) query.page = params.page;
    if (params.pageSize) query.pageSize = params.pageSize;
    return apiClient.get<FlaggedTransactionPagedResult>(`${BASE}${buildQuery(query)}`);
  },

  // GET /api/flagged-transactions/all
  getAll: async (): Promise<FlaggedTransaction[]> => {
    return apiClient.get<FlaggedTransaction[]>(`${BASE}/all`);
  },

  // GET /api/flagged-transactions/summary
  getSummary: async (): Promise<FlaggedTransactionSummary> => {
    return apiClient.get<FlaggedTransactionSummary>(`${BASE}/summary`);
  },

  // GET /api/flagged-transactions/:id
  getById: async (id: string): Promise<FlaggedTransaction> => {
    return apiClient.get<FlaggedTransaction>(`${BASE}/${id}`);
  },

  // POST /api/flagged-transactions
  create: async (data: CreateFlaggedTransactionInput): Promise<FlaggedTransaction> => {
    return apiClient.post<FlaggedTransaction>(BASE, data);
  },

  // PATCH /api/flagged-transactions/:id/status
  updateStatus: async (id: string, data: UpdateFlaggedTransactionStatusInput): Promise<FlaggedTransaction> => {
    return apiClient.patch<FlaggedTransaction>(`${BASE}/${id}/status`, data);
  },

  // PATCH /api/flagged-transactions/:id/assign
  assignInvestigator: async (id: string, investigator: string): Promise<FlaggedTransaction> => {
    return apiClient.patch<FlaggedTransaction>(`${BASE}/${id}/assign`, { investigator });
  },

  // DELETE /api/flagged-transactions/:id
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`${BASE}/${id}`);
  },
};

export default flaggedTransactionService;
