export type ExpenditureVerification = "Verified" | "Pending Review" | "Rejected";
export type ExpenditurePaymentStatus = "Paid" | "On Hold" | "Pending";
export type ExpenditureType = "Shelter" | "Transport" | "Medical" | "Water" | "Other";

export interface Expenditure {
  id: string;
  amount: number;
  description: string;
  recipient: string;
  invoice: string;
  date: string;              // "21 Jun" display format
  expenseDate: string;       // ISO date string
  verification: ExpenditureVerification;
  paymentStatus: ExpenditurePaymentStatus;
  type: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenditureSummary {
  totalExpenditure: number;
  totalPaid: number;
  totalPending: number;
  totalOnHold: number;
  pendingReviewCount: number;
  verifiedCount: number;
  rejectedCount: number;
  paidCount: number;
  onHoldCount: number;
  totalCount: number;
  byType: Record<string, number>;
}

export interface ExpenditurePagedResult {
  items: Expenditure[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ExpenditureQueryParams {
  search?: string;
  type?: string;
  verification?: string;
  paymentStatus?: string;
  dateRange?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateExpenditureInput {
  amount: number;
  description: string;
  recipient: string;
  invoice: string;
  expenseDate: string;      // ISO date e.g. "2026-06-21"
  type: string;
  notes?: string;
}

export interface UpdateExpenditureInput {
  amount: number;
  description: string;
  recipient: string;
  invoice: string;
  expenseDate: string;
  type: string;
  notes?: string;
}

export interface BulkExpenditureActionInput {
  ids: string[];
  /** Approve | Reject | Pay | Hold */
  action: string;
}
