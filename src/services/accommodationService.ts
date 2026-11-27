import { apiClient } from "./api";
import type {
  AccommodationRequest,
  AccommodationRequestQueryParams,
  CreateAccommodationRequestInput,
  PagedResult,
  RequestCounts,
  RequestStatus,
  Shelter,
} from "../types/accommodation";

export const accommodationService = {
  /**
   * Retrieves paginated accommodation requests with filters.
   */
  async getRequests(
    params?: AccommodationRequestQueryParams
  ): Promise<PagedResult<AccommodationRequest>> {
    return apiClient.get<PagedResult<AccommodationRequest>>(
      "/accommodation-requests",
      params as Record<string, any>
    );
  },

  /**
   * Retrieves aggregated request counts for status tabs.
   */
  async getRequestCounts(): Promise<RequestCounts> {
    return apiClient.get<RequestCounts>("/accommodation-requests/counts");
  },

  /**
   * Retrieves a single accommodation request by ID.
   */
  async getRequestById(id: string): Promise<AccommodationRequest> {
    return apiClient.get<AccommodationRequest>(`/accommodation-requests/${id}`);
  },

  /**
   * Creates a new accommodation request.
   */
  async createRequest(
    data: CreateAccommodationRequestInput
  ): Promise<AccommodationRequest> {
    return apiClient.post<AccommodationRequest>("/accommodation-requests", data);
  },

  /**
   * Updates an accommodation request's status.
   */
  async updateRequestStatus(
    id: string,
    status: RequestStatus
  ): Promise<AccommodationRequest> {
    return apiClient.patch<AccommodationRequest>(
      `/accommodation-requests/${id}/status`,
      { status }
    );
  },

  /**
   * Deletes an accommodation request.
   */
  async deleteRequest(id: string): Promise<void> {
    return apiClient.delete<void>(`/accommodation-requests/${id}`);
  },

  /**
   * Retrieves all shelters for dropdowns and filtering.
   */
  async getShelters(): Promise<Shelter[]> {
    return apiClient.get<Shelter[]>("/shelters");
  },
};
