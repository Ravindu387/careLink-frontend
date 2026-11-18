export type DonorVerification = "Verified" | "Under Review" | "Pending";
export type DonorStatusType = "Active" | "Restricted" | "Inactive";

export interface Donor {
  id: string;
  name: string;
  type: string;
  contact: string;
  scope: string;
  verification: DonorVerification;
  contributions: number;
  status: DonorStatusType;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DonorSummary {
  totalDonors: number;
  activeDonors: number;
  verifiedDonors: number;
  underReviewDonors: number;
  restrictedDonors: number;
  totalContributions: number;
}

export interface DonorQueryParams {
  search?: string;
  type?: string;
  verification?: string;
  status?: string;
  scope?: string;
  dateRange?: string;
  minContribution?: number;
  maxContribution?: number;
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

export interface CreateDonorInput {
  name: string;
  type: string;
  contact: string;
  scope: string;
  verification?: DonorVerification;
  contributions?: number;
  status?: DonorStatusType;
  address?: string;
  notes?: string;
}

export interface UpdateDonorInput {
  name?: string;
  type?: string;
  contact?: string;
  scope?: string;
  verification?: DonorVerification;
  contributions?: number;
  status?: DonorStatusType;
  address?: string;
  notes?: string;
}

export interface BulkDonorActionInput {
  ids: string[];
  action: "Activate" | "Restrict" | "Deactivate";
}
