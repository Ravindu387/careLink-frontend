export type DonationType = "Monetary" | "Material";
export type DonationVerification = "Verified" | "Pending" | "Flagged";
export type DonationAllocation =
  | "Allocated"
  | "Partially Allocated"
  | "Unallocated"
  | "On Hold";

export type DonationTab =
  | "All records"
  | "Pending verification"
  | "Monetary"
  | "Material"
  | "Flagged";

export interface Donation {
  id: string;
  donor: string;
  type: DonationType;
  amount: string;
  numericAmount?: number;
  campaign: string;
  received: string;
  receivedDate?: string;
  verification: DonationVerification;
  allocation: DonationAllocation;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DonationSummary {
  totalRecords: number;
  pendingVerificationCount: number;
  monetaryCount: number;
  materialCount: number;
  flaggedCount: number;
  totalMonetaryValue: number;
  allocatedCount: number;
}

export interface DonationQueryParams {
  search?: string;
  tab?: string;
  type?: string;
  verification?: string;
  allocation?: string;
  campaign?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
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

export interface CreateDonationInput {
  donor: string;
  type: DonationType;
  amount: string;
  campaign: string;
  received?: string;
  verification?: DonationVerification;
  allocation?: DonationAllocation;
  notes?: string;
}

export interface UpdateDonationInput {
  donor?: string;
  type?: DonationType;
  amount?: string;
  campaign?: string;
  received?: string;
  verification?: DonationVerification;
  allocation?: DonationAllocation;
  notes?: string;
}

export interface BulkDonationActionInput {
  ids: string[];
  action: "Verify" | "Allocate" | "Flag" | "Hold";
}
