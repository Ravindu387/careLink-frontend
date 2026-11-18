export type AllocationApproval = "Approved" | "Under Review" | "Rejected";
export type AllocationDisbursement = "Disbursed" | "68% Disbursed" | "Pending" | "Not Disbursed" | string;

export interface FundAllocation {
  id: string;
  amount: number;
  source: string;
  purpose: string;
  recipient: string;
  date: string; // "22 Jun" display format
  allocationDate: string; // ISO date string
  approval: AllocationApproval;
  disbursement: AllocationDisbursement;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundAllocationSummary {
  totalAllocated: number;
  totalDisbursed: number;
  totalPending: number;
  approvedCount: number;
  underReviewCount: number;
  rejectedCount: number;
  disbursedCount: number;
  totalCount: number;
  bySource: Record<string, number>;
}

export interface FundAllocationPagedResult {
  items: FundAllocation[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface FundAllocationQueryParams {
  search?: string;
  source?: string;
  approval?: string;
  disbursement?: string;
  dateRange?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateFundAllocationInput {
  amount: number;
  source: string;
  purpose: string;
  recipient: string;
  allocationDate: string; // ISO date string
  notes?: string;
}

export interface UpdateFundAllocationInput {
  amount: number;
  source: string;
  purpose: string;
  recipient: string;
  allocationDate: string;
  approval?: string;
  disbursement?: string;
  notes?: string;
}

export interface BulkFundAllocationActionInput {
  ids: string[];
  /** Approve | Reject | Disburse */
  action: string;
}
