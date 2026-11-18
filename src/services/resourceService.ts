import { apiClient } from "./api";
import type {
  Resource,
  ResourceSummary,
  ResourceQueryParams,
  CreateResourceInput,
  UpdateResourceInput,
  RecordDistributionInput,
  ResourceDistribution,
  PagedResult,
} from "../types/resource";
import type { Shelter } from "../types/accommodation";

export const resourceService = {
  /**
   * Retrieves paginated resources with filters.
   */
  async getResources(params?: ResourceQueryParams): Promise<PagedResult<Resource>> {
    return apiClient.get<PagedResult<Resource>>("/resources", params as Record<string, any>);
  },

  /**
   * Retrieves all resources without pagination (useful for export).
   */
  async getAllResources(): Promise<Resource[]> {
    return apiClient.get<Resource[]>("/resources/all");
  },

  /**
   * Retrieves summary counts and KPI alert metrics for inventory.
   */
  async getResourceSummary(): Promise<ResourceSummary> {
    return apiClient.get<ResourceSummary>("/resources/summary");
  },

  /**
   * Retrieves a single resource by ID.
   */
  async getResourceById(id: string): Promise<Resource> {
    return apiClient.get<Resource>(`/resources/${id}`);
  },

  /**
   * Adds a new resource to inventory.
   */
  async createResource(data: CreateResourceInput): Promise<Resource> {
    return apiClient.post<Resource>("/resources", data);
  },

  /**
   * Updates an existing resource.
   */
  async updateResource(id: string, data: UpdateResourceInput): Promise<Resource> {
    return apiClient.put<Resource>(`/resources/${id}`, data);
  },

  /**
   * Records a distribution for a resource.
   */
  async recordDistribution(data: RecordDistributionInput): Promise<Resource> {
    return apiClient.post<Resource>("/resources/distributions", data);
  },

  /**
   * Gets history of resource distributions.
   */
  async getDistributions(resourceId?: string): Promise<ResourceDistribution[]> {
    return apiClient.get<ResourceDistribution[]>("/resources/distributions", {
      resourceId,
    });
  },

  /**
   * Deletes a resource from inventory.
   */
  async deleteResource(id: string): Promise<void> {
    return apiClient.delete<void>(`/resources/${id}`);
  },

  /**
   * Retrieves shelters for selection dropdowns.
   */
  async getShelters(): Promise<Shelter[]> {
    return apiClient.get<Shelter[]>("/shelters");
  },
};
