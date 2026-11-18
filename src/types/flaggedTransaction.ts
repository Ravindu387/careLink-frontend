export type FlagStatus =
  | "Investigation Required"
  | "Under Review"
  | "Deferred"
  | "Resolved";

export type FlagSeverity = "High" | "Medium" | "Low";

export interface FlaggedTransaction {
  id: string;
  record: string;
  reason: string;
  amount: number;
  amountDisplay: string;
  party: string;
  severity: FlagSeverity;
  flagged: string;          // "22 Jun · 11:42" display
  flaggedAt: string;        // ISO date string
  status: FlagStatus;
  description: string;
  investigator: string;
  recordType: string;       // Donations | Expenditure | Allocations
  resolutionNotes: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FlaggedTransactionSummary {
  totalCount: number;
  openFlags: number;
  highPriority: number;
  underReview: number;
  resolved: number;
  highPriorityCombinedAmount: number;
}

export interface FlaggedTransactionPagedResult {
  items: FlaggedTransaction[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface FlaggedTransactionQueryParams {
  search?: string;
  recordType?: string;
  severity?: string;
  status?: string;
  dateSort?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateFlaggedTransactionInput {
  record: string;
  reason: string;
  amount: number;
  party: string;
  severity: string;
  description: string;
  investigator?: string;
  recordType?: string;
}

export interface UpdateFlaggedTransactionStatusInput {
  status: string;
  investigator?: string;
  resolutionNotes?: string;
}
