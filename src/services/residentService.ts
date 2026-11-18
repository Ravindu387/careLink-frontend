import { apiClient } from "./api";
import type {
  Resident,
  ResidentQueryParams,
  ResidentSummary,
  CreateResidentInput,
  UpdateResidentInput,
  ResidentStatus,
  PagedResult,
} from "../types/resident";
import type { Shelter } from "../types/accommodation";

export const residentService = {
  /**
   * Retrieves paginated residents with search, filters, and pagination.
   */
  async getResidents(params?: ResidentQueryParams): Promise<PagedResult<Resident>> {
    return apiClient.get<PagedResult<Resident>>("/residents", params as Record<string, any>);
  },

  /**
   * Retrieves all residents without pagination (useful for export).
   */
  async getAllResidents(): Promise<Resident[]> {
    return apiClient.get<Resident[]>("/residents/all");
  },

  /**
   * Retrieves summary counts and KPI metrics for resident management.
   */
  async getResidentSummary(): Promise<ResidentSummary> {
    return apiClient.get<ResidentSummary>("/residents/summary");
  },

  /**
   * Retrieves a single resident by ID.
   */
  async getResidentById(id: string): Promise<Resident> {
    return apiClient.get<Resident>(`/residents/${id}`);
  },

  /**
   * Registers a new resident.
   */
  async createResident(data: CreateResidentInput): Promise<Resident> {
    return apiClient.post<Resident>("/residents", data);
  },

  /**
   * Updates an existing resident.
   */
  async updateResident(id: string, data: UpdateResidentInput): Promise<Resident> {
    return apiClient.put<Resident>(`/residents/${id}`, data);
  },

  /**
   * Updates resident status.
   */
  async updateResidentStatus(id: string, status: ResidentStatus): Promise<Resident> {
    return apiClient.patch<Resident>(`/residents/${id}/status`, { status });
  },

  /**
   * Checks out a resident.
   */
  async checkoutResident(id: string): Promise<Resident> {
    return apiClient.post<Resident>(`/residents/${id}/checkout`, {});
  },

  /**
   * Deletes a resident record.
   */
  async deleteResident(id: string): Promise<void> {
    return apiClient.delete<void>(`/residents/${id}`);
  },

  /**
   * Retrieves all shelters for dropdown selection.
   */
  async getShelters(): Promise<Shelter[]> {
    return apiClient.get<Shelter[]>("/shelters");
  },
};
