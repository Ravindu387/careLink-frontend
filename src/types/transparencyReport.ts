export type ReportStatus = "Published" | "Draft" | "Under Review";

export interface TransparencyReport {
  id: string;
  title: string;
  reference: string;
  date: string;
  reportDate?: string;
  status: ReportStatus;
  description?: string;
  period?: string;
  verifiedContributions?: number;
  allocatedFunds?: number;
  expenditure?: number;
  availableBalance?: number;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransparencyAllocationArea {
  name: string;
  amount: string;
  percentage: number;
}

export interface TransparencyCompleteness {
  name: string;
  percentage: string;
  value: number;
}

export interface TransparencyMetrics {
  verifiedContributionsAmount: string;
  verifiedContributionsValue: number;
  verifiedContributionsCount: string;
  allocatedAmount: string;
  allocatedValue: number;
  allocatedPercentage: string;
  expenditureAmount: string;
  expenditureValue: number;
  expenditurePercentage: string;
  availableBalanceAmount: string;
  availableBalanceValue: number;
  availableBalancePercentage: string;
  featuredReportTitle: string;
  featuredReportPeriod: string;
  featuredReportTag: string;
  allocationAreas: TransparencyAllocationArea[];
  completeness: TransparencyCompleteness[];
}

export interface TransparencyReportQueryParams {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedTransparencyReports {
  items: TransparencyReport[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface CreateTransparencyReportInput {
  title: string;
  description?: string;
  period?: string;
  reference?: string;
  author?: string;
}
