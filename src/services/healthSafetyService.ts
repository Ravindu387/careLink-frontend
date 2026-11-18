import { apiClient } from "./api";
import type {
  HealthSafetyIncident,
  HealthSafetySummary,
  HealthSafetyMeta,
  HealthSafetyQueryParams,
  SafetyCheckItem,
  CreateHealthSafetyIncidentInput,
  UpdateHealthSafetyIncidentInput,
} from "../types/healthSafety";

const BASE_PATH = "/health-safety";

export const healthSafetyService = {
  async getIncidents(
    params?: HealthSafetyQueryParams
  ): Promise<HealthSafetyIncident[]> {
    return apiClient.get<HealthSafetyIncident[]>(BASE_PATH, params);
  },

  async getSummary(): Promise<HealthSafetySummary> {
    return apiClient.get<HealthSafetySummary>(`${BASE_PATH}/summary`);
  },

  async getMeta(): Promise<HealthSafetyMeta> {
    return apiClient.get<HealthSafetyMeta>(`${BASE_PATH}/meta`);
  },

  async getSafetyChecks(): Promise<SafetyCheckItem[]> {
    return apiClient.get<SafetyCheckItem[]>(`${BASE_PATH}/safety-checks`);
  },

  async getIncidentById(id: string): Promise<HealthSafetyIncident> {
    return apiClient.get<HealthSafetyIncident>(`${BASE_PATH}/${id}`);
  },

  async createIncident(
    input: CreateHealthSafetyIncidentInput
  ): Promise<HealthSafetyIncident> {
    return apiClient.post<HealthSafetyIncident>(BASE_PATH, input);
  },

  async updateIncident(
    id: string,
    input: UpdateHealthSafetyIncidentInput
  ): Promise<HealthSafetyIncident> {
    return apiClient.patch<HealthSafetyIncident>(`${BASE_PATH}/${id}`, input);
  },

  async deleteIncident(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },
};
