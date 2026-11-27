export type CampaignStatus = "Active" | "Completed" | "Archived";

export interface Campaign {
  id: string;
  name: string;
  event: string;
  period: string;
  raised: number;
  target: number;
  status: CampaignStatus;
  startDate?: string;
  endDate: string;
  progressPercentage?: number;
  description?: string;
}

export interface CampaignSummary {
  activeCampaigns: number;
  combinedTarget: number;
  totalRaised: number;
  endingSoon: number;
  fundingProgressPercentage?: number;
}

export interface CampaignQueryParams {
  search?: string;
  event?: string;
  status?: string;
  progress?: string;
  minTarget?: number;
  maxTarget?: number;
  includeArchived?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateCampaignInput {
  name: string;
  event: string;
  target: number;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface UpdateCampaignInput {
  name?: string;
  event?: string;
  target?: number;
  raised?: number;
  status?: CampaignStatus;
  startDate?: string;
  endDate?: string;
  description?: string;
}
