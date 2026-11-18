import { apiClient } from "./api";
import type {
  Donor,
  DonorSummary,
  DonorQueryParams,
  CreateDonorInput,
  UpdateDonorInput,
  BulkDonorActionInput,
  DonorStatusType,
  DonorVerification,
  PagedResult,
} from "../types/donor";

export const donorService = {
  /**
   * Retrieves paginated donors with search, filtering, and pagination.
   */
  async getDonors(params?: DonorQueryParams): Promise<PagedResult<Donor>> {
    return apiClient.get<PagedResult<Donor>>("/donors", params as Record<string, any>);
  },

  /**
   * Retrieves all donors without pagination (e.g. for complete export).
   */
  async getAllDonors(): Promise<Donor[]> {
    return apiClient.get<Donor[]>("/donors/all");
  },

  /**
   * Retrieves KPI summary metrics for donor management.
   */
  async getDonorSummary(): Promise<DonorSummary> {
    return apiClient.get<DonorSummary>("/donors/summary");
  },

  /**
   * Retrieves a single donor by ID.
   */
  async getDonorById(id: string): Promise<Donor> {
    return apiClient.get<Donor>(`/donors/${id}`);
  },

  /**
   * Registers a new donor profile.
   */
  async createDonor(data: CreateDonorInput): Promise<Donor> {
    return apiClient.post<Donor>("/donors", data);
  },

  /**
   * Updates an existing donor profile.
   */
  async updateDonor(id: string, data: UpdateDonorInput): Promise<Donor> {
    return apiClient.put<Donor>(`/donors/${id}`, data);
  },

  /**
   * Updates donor active/restricted/inactive status.
   */
  async updateStatus(id: string, status: DonorStatusType): Promise<Donor> {
    return apiClient.patch<Donor>(`/donors/${id}/status`, { status });
  },

  /**
   * Updates donor verification state.
   */
  async updateVerification(id: string, verification: DonorVerification): Promise<Donor> {
    return apiClient.patch<Donor>(`/donors/${id}/verification`, { verification });
  },

  /**
   * Performs bulk actions (Activate, Restrict, Deactivate) on selected donor IDs.
   */
  async bulkAction(data: BulkDonorActionInput): Promise<{ message: string; affectedCount: number }> {
    return apiClient.post<{ message: string; affectedCount: number }>("/donors/bulk", data);
  },

  /**
   * Deletes a donor profile.
   */
  async deleteDonor(id: string): Promise<void> {
    return apiClient.delete<void>(`/donors/${id}`);
  },
};
