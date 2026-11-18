import { apiClient } from "./api";
import type {
  Expenditure,
  ExpenditurePagedResult,
  ExpenditureSummary,
  ExpenditureQueryParams,
  CreateExpenditureInput,
  UpdateExpenditureInput,
  BulkExpenditureActionInput,
} from "../types/expenditure";

const BASE = "/expenditures";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "") q.set(key, String(val));
  }
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

export const expenditureService = {
  // GET /api/expenditures (paged + filtered)
  getPaged: async (params: ExpenditureQueryParams = {}): Promise<ExpenditurePagedResult> => {
    const query: Record<string, string | number | undefined> = {};
    if (params.search) query.search = params.search;
    if (params.type && params.type !== "All types") query.type = params.type;
    if (params.verification && params.verification !== "All verification states") query.verification = params.verification;
    if (params.paymentStatus && params.paymentStatus !== "All statuses") query.paymentStatus = params.paymentStatus;
    if (params.dateRange && params.dateRange !== "Date range") query.dateRange = params.dateRange;
    if (params.minAmount !== undefined) query.minAmount = params.minAmount;
    if (params.maxAmount !== undefined) query.maxAmount = params.maxAmount;
    if (params.page) query.page = params.page;
    if (params.pageSize) query.pageSize = params.pageSize;
    return apiClient.get<ExpenditurePagedResult>(`${BASE}${buildQuery(query)}`);
  },

  // GET /api/expenditures/all
  getAll: async (): Promise<Expenditure[]> => {
    return apiClient.get<Expenditure[]>(`${BASE}/all`);
  },

  // GET /api/expenditures/summary
  getSummary: async (): Promise<ExpenditureSummary> => {
    return apiClient.get<ExpenditureSummary>(`${BASE}/summary`);
  },

  // GET /api/expenditures/:id
  getById: async (id: string): Promise<Expenditure> => {
    return apiClient.get<Expenditure>(`${BASE}/${id}`);
  },

  // POST /api/expenditures
  create: async (data: CreateExpenditureInput): Promise<Expenditure> => {
    return apiClient.post<Expenditure>(BASE, data);
  },

  // PUT /api/expenditures/:id
  update: async (id: string, data: UpdateExpenditureInput): Promise<Expenditure> => {
    return apiClient.put<Expenditure>(`${BASE}/${id}`, data);
  },

  // PATCH /api/expenditures/:id/verification
  updateVerification: async (id: string, status: string): Promise<Expenditure> => {
    return apiClient.patch<Expenditure>(`${BASE}/${id}/verification`, { status });
  },

  // PATCH /api/expenditures/:id/payment
  updatePayment: async (id: string, status: string): Promise<Expenditure> => {
    return apiClient.patch<Expenditure>(`${BASE}/${id}/payment`, { status });
  },

  // POST /api/expenditures/bulk
  bulkAction: async (data: BulkExpenditureActionInput): Promise<{ updated: number; message: string }> => {
    return apiClient.post<{ updated: number; message: string }>(`${BASE}/bulk`, data);
  },

  // DELETE /api/expenditures/:id
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`${BASE}/${id}`);
  },
};

export default expenditureService;
