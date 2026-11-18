import { apiClient } from "./api";
import type {
  MaintenanceRequest,
  MaintenanceSummary,
  MaintenanceMeta,
  MaintenanceQueryParams,
  PagedResult,
  CreateMaintenanceRequestInput,
  UpdateMaintenanceRequestInput,
} from "../types/maintenance";

const BASE_PATH = "/maintenance-requests";

export const maintenanceService = {
  async getRequests(
    params?: MaintenanceQueryParams
  ): Promise<PagedResult<MaintenanceRequest>> {
    return apiClient.get<PagedResult<MaintenanceRequest>>(BASE_PATH, params);
  },

  async getSummary(): Promise<MaintenanceSummary> {
    return apiClient.get<MaintenanceSummary>(`${BASE_PATH}/summary`);
  },

  async getMeta(): Promise<MaintenanceMeta> {
    return apiClient.get<MaintenanceMeta>(`${BASE_PATH}/meta`);
  },

  async getRequestById(id: string): Promise<MaintenanceRequest> {
    return apiClient.get<MaintenanceRequest>(`${BASE_PATH}/${id}`);
  },

  async createRequest(
    input: CreateMaintenanceRequestInput
  ): Promise<MaintenanceRequest> {
    return apiClient.post<MaintenanceRequest>(BASE_PATH, input);
  },

  async updateRequest(
    id: string,
    input: UpdateMaintenanceRequestInput
  ): Promise<MaintenanceRequest> {
    return apiClient.patch<MaintenanceRequest>(`${BASE_PATH}/${id}`, input);
  },

  async deleteRequest(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },
};
