import { apiClient } from "./api";
import type {
  Donation,
  DonationSummary,
  DonationQueryParams,
  CreateDonationInput,
  UpdateDonationInput,
  BulkDonationActionInput,
  DonationVerification,
  DonationAllocation,
  PagedResult,
} from "../types/donation";

export const donationService = {
  /**
   * Retrieves paginated donations with search, filters, tab, and pagination.
   */
  async getDonations(params?: DonationQueryParams): Promise<PagedResult<Donation>> {
    return apiClient.get<PagedResult<Donation>>("/donations", params as Record<string, any>);
  },

  /**
   * Retrieves all donations without pagination (e.g. for complete export).
   */
  async getAllDonations(): Promise<Donation[]> {
    return apiClient.get<Donation[]>("/donations/all");
  },

  /**
   * Retrieves summary counts and metrics for tabs and dashboard.
   */
  async getDonationSummary(): Promise<DonationSummary> {
    return apiClient.get<DonationSummary>("/donations/summary");
  },

  /**
   * Retrieves a single donation by ID.
   */
  async getDonationById(id: string): Promise<Donation> {
    return apiClient.get<Donation>(`/donations/${id}`);
  },

  /**
   * Records a new donation.
   */
  async createDonation(data: CreateDonationInput): Promise<Donation> {
    return apiClient.post<Donation>("/donations", data);
  },

  /**
   * Updates an existing donation.
   */
  async updateDonation(id: string, data: UpdateDonationInput): Promise<Donation> {
    return apiClient.put<Donation>(`/donations/${id}`, data);
  },

  /**
   * Updates verification status of a donation.
   */
  async updateVerification(id: string, verification: DonationVerification): Promise<Donation> {
    return apiClient.patch<Donation>(`/donations/${id}/verification`, { verification });
  },

  /**
   * Updates allocation status of a donation.
   */
  async updateAllocation(id: string, allocation: DonationAllocation): Promise<Donation> {
    return apiClient.patch<Donation>(`/donations/${id}/allocation`, { allocation });
  },

  /**
   * Performs a bulk action (Verify, Allocate, Flag, Hold) on selected donation IDs.
   */
  async bulkAction(data: BulkDonationActionInput): Promise<{ message: string; affectedCount: number }> {
    return apiClient.post<{ message: string; affectedCount: number }>("/donations/bulk", data);
  },

  /**
   * Deletes a donation record.
   */
  async deleteDonation(id: string): Promise<void> {
    return apiClient.delete<void>(`/donations/${id}`);
  },
};
