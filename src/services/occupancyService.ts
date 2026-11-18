import { apiClient } from "./api";
import type {
  OccupancyShelter,
  Admission,
  RecordAdmissionInput,
  OccupancyThreshold,
  OccupancySummary,
} from "../types/occupancy";

const BASE_PATH = "/occupancy";

export const occupancyService = {
  async getShelters(): Promise<OccupancyShelter[]> {
    return apiClient.get<OccupancyShelter[]>(`${BASE_PATH}/shelters`);
  },

  async getSummary(): Promise<OccupancySummary> {
    return apiClient.get<OccupancySummary>(`${BASE_PATH}/summary`);
  },

  async getAdmissions(): Promise<Admission[]> {
    return apiClient.get<Admission[]>(`${BASE_PATH}/admissions`);
  },

  async recordAdmission(input: RecordAdmissionInput): Promise<Admission> {
    return apiClient.post<Admission>(`${BASE_PATH}/admissions`, input);
  },

  async getThresholds(): Promise<OccupancyThreshold> {
    return apiClient.get<OccupancyThreshold>(`${BASE_PATH}/thresholds`);
  },

  async saveThresholds(
    thresholds: OccupancyThreshold
  ): Promise<OccupancyThreshold> {
    return apiClient.put<OccupancyThreshold>(
      `${BASE_PATH}/thresholds`,
      thresholds
    );
  },
};
