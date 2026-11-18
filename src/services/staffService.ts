import { apiClient } from "./api";
import type {
  Staff,
  ShiftDay,
  StaffSummary,
  StaffQueryParams,
  CreateStaffInput,
  UpdateStaffInput,
  PagedResult,
} from "../types/staff";

export const staffService = {
  /**
   * Retrieves paginated staff members with search, filters, and pagination.
   */
  async getStaff(params?: StaffQueryParams): Promise<PagedResult<Staff>> {
    return apiClient.get<PagedResult<Staff>>("/staff", params as Record<string, any>);
  },

  /**
   * Retrieves all staff members without pagination.
   */
  async getAllStaff(): Promise<Staff[]> {
    return apiClient.get<Staff[]>("/staff/all");
  },

  /**
   * Retrieves KPI summary metrics for staff management.
   */
  async getStaffSummary(): Promise<StaffSummary> {
    return apiClient.get<StaffSummary>("/staff/summary");
  },

  /**
   * Retrieves weekly shift coverage data.
   */
  async getCoverage(shelter?: string): Promise<ShiftDay[]> {
    const params = shelter ? { shelter } : undefined;
    return apiClient.get<ShiftDay[]>("/staff/coverage", params);
  },

  /**
   * Updates weekly shift coverage data.
   */
  async updateCoverage(coverage: ShiftDay[]): Promise<ShiftDay[]> {
    return apiClient.put<ShiftDay[]>("/staff/coverage", coverage);
  },

  /**
   * Retrieves a single staff member by ID.
   */
  async getStaffById(id: string): Promise<Staff> {
    return apiClient.get<Staff>(`/staff/${id}`);
  },

  /**
   * Registers a new staff member.
   */
  async createStaff(data: CreateStaffInput): Promise<Staff> {
    return apiClient.post<Staff>("/staff", data);
  },

  /**
   * Updates an existing staff member.
   */
  async updateStaff(id: string, data: UpdateStaffInput): Promise<Staff> {
    return apiClient.patch<Staff>(`/staff/${id}`, data);
  },

  /**
   * Deletes a staff member.
   */
  async deleteStaff(id: string): Promise<void> {
    return apiClient.delete<void>(`/staff/${id}`);
  },
};
