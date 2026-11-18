import { apiClient } from "./api";
import type {
  CreateDisasterUpdateInput,
  DisasterUpdate,
  DisasterUpdateQueryParams,
  DisasterUpdateSummary,
  EmergencyContact,
} from "../types/disasterUpdate";

export const disasterUpdateService = {
  /**
   * Retrieves disaster updates with optional filters.
   */
  async getUpdates(
    params?: DisasterUpdateQueryParams
  ): Promise<DisasterUpdate[]> {
    return apiClient.get<DisasterUpdate[]>(
      "/disaster-updates",
      params as Record<string, any>
    );
  },

  /**
   * Retrieves aggregated counts and the latest critical alert.
   */
  async getSummary(): Promise<DisasterUpdateSummary> {
    return apiClient.get<DisasterUpdateSummary>("/disaster-updates/summary");
  },

  /**
   * Retrieves verified emergency contacts.
   */
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return apiClient.get<EmergencyContact[]>("/disaster-updates/emergency-contacts");
  },

  /**
   * Retrieves a single disaster update by ID.
   */
  async getUpdateById(id: string): Promise<DisasterUpdate> {
    return apiClient.get<DisasterUpdate>(`/disaster-updates/${id}`);
  },

  /**
   * Creates a new disaster update or saves a draft.
   */
  async createUpdate(
    data: CreateDisasterUpdateInput
  ): Promise<DisasterUpdate> {
    return apiClient.post<DisasterUpdate>("/disaster-updates", data);
  },

  /**
   * Toggles the archive status of an update.
   */
  async toggleArchive(id: string): Promise<DisasterUpdate> {
    return apiClient.patch<DisasterUpdate>(`/disaster-updates/${id}/archive`, {});
  },

  /**
   * Publishes a saved draft announcement.
   */
  async publishDraft(id: string): Promise<DisasterUpdate> {
    return apiClient.post<DisasterUpdate>(`/disaster-updates/${id}/publish`, {});
  },

  /**
   * Deletes a disaster update or draft.
   */
  async deleteUpdate(id: string): Promise<void> {
    return apiClient.delete<void>(`/disaster-updates/${id}`);
  },
};
