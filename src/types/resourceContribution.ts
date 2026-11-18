export type ContributionVerification = "Verified" | "Pending" | "Flagged";
export type ContributionAllocation = "Allocated" | "Partially Allocated" | "Unallocated";

export interface ResourceContribution {
  id: string;
  donor: string;
  type: string;
  quantity: string;
  campaign: string;
  received: string;
  receivedDate?: string;
  verification: ContributionVerification;
  allocation: ContributionAllocation;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceContributionQueryParams {
  search?: string;
  type?: string;
  verification?: string;
  status?: string;
  campaign?: string;
  dateRange?: string;
  receivedDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResourceContributions {
  items: ResourceContribution[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface CreateResourceContributionInput {
  id?: string;
  donor: string;
  type: string;
  quantity: string;
  campaign: string;
  receivedDate?: string;
  received?: string;
  notes?: string;
}
