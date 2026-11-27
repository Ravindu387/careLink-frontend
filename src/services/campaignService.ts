import { apiClient } from "./api";
import type {
  Campaign,
  CampaignSummary,
  CampaignQueryParams,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignStatus,
  PagedResult,
} from "../types/campaign";

export const campaignService = {
  /**
   * Retrieves paginated campaigns with search, filters, and pagination.
   */
  async getCampaigns(params?: CampaignQueryParams): Promise<PagedResult<Campaign>> {
    return apiClient.get<PagedResult<Campaign>>("/campaigns", params as Record<string, any>);
  },

  /**
   * Retrieves all campaigns without pagination.
   */
  async getAllCampaigns(): Promise<Campaign[]> {
    return apiClient.get<Campaign[]>("/campaigns/all");
  },

  /**
   * Retrieves KPI summary metrics for campaigns.
   */
  async getCampaignSummary(): Promise<CampaignSummary> {
    return apiClient.get<CampaignSummary>("/campaigns/summary");
  },

  /**
   * Retrieves a single campaign by ID.
   */
  async getCampaignById(id: string): Promise<Campaign> {
    return apiClient.get<Campaign>(`/campaigns/${id}`);
  },

  /**
   * Creates a new campaign.
   */
  async createCampaign(data: CreateCampaignInput): Promise<Campaign> {
    return apiClient.post<Campaign>("/campaigns", data);
  },

  /**
   * Updates an existing campaign.
   */
  async updateCampaign(id: string, data: UpdateCampaignInput): Promise<Campaign> {
    return apiClient.put<Campaign>(`/campaigns/${id}`, data);
  },

  /**
   * Updates a campaign's status.
   */
  async updateStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    return apiClient.patch<Campaign>(`/campaigns/${id}/status`, { status });
  },

  /**
   * Archives a campaign.
   */
  async archiveCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign>(`/campaigns/${id}/archive`, {});
  },

  /**
   * Restores an archived campaign back to Active.
   */
  async restoreCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign>(`/campaigns/${id}/restore`, {});
  },

  /**
   * Deletes a campaign.
   */
  async deleteCampaign(id: string): Promise<void> {
    return apiClient.delete<void>(`/campaigns/${id}`);
  },
};
