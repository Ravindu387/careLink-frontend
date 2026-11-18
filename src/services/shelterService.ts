import { apiClient } from "./api";
import type {
  ShelterItem,
  ShelterSummary,
  ShelterQueryParams,
  CreateShelterInput,
  PagedResult,
} from "../types/shelter";

export const shelterService = {
  /**
   * Retrieves paged shelters with search, filters, and pagination.
   */
  async getShelters(params?: ShelterQueryParams): Promise<PagedResult<ShelterItem>> {
    return apiClient.get<PagedResult<ShelterItem>>("/shelters/paged", params as Record<string, any>);
  },

  /**
   * Retrieves all shelters without pagination (useful for export and dropdowns).
   */
  async getAllShelters(): Promise<ShelterItem[]> {
    return apiClient.get<ShelterItem[]>("/shelters/all");
  },

  /**
   * Retrieves summary counts for shelter management KPI cards.
   */
  async getShelterSummary(): Promise<ShelterSummary> {
    return apiClient.get<ShelterSummary>("/shelters/summary");
  },

  /**
   * Retrieves a single shelter by ID.
   */
  async getShelterById(id: string): Promise<ShelterItem> {
    return apiClient.get<ShelterItem>(`/shelters/${id}`);
  },

  /**
   * Registers a new shelter.
   */
  async createShelter(data: CreateShelterInput): Promise<ShelterItem> {
    return apiClient.post<ShelterItem>("/shelters", data);
  },
};
