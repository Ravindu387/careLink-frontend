export interface MyCase {
  id: string;
  category: string;
  applicant: string;
  location: string;
  priority: "Critical" | "High" | "Medium" | "Low" | string;
  confidence: string;
  verification: string;
  assigned: string;
  age: string;
  status: "Under Review" | "Assigned" | "Escalated" | "Submitted" | "Resolved" | string;
  event: string;
  description?: string;
  notes?: string;
  createdAt?: string;
}

export interface MyCasesStatsDto {
  totalCases: number;
  criticalCount: number;
  dueSoonCount: number;
  pendingInfoCount: number;
  recentlyUpdatedCount: number;
}

export interface MyCasesQueryDto {
  tab?: string;
  search?: string;
  priority?: string;
  category?: string;
  status?: string;
  event?: string;
  dateRange?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateMyCaseRequest {
  category: string;
  applicantName: string;
  peopleCount: number;
  location: string;
  priority: string;
  event: string;
  description?: string;
}

export interface UpdateMyCaseStatusRequest {
  status: string;
  notes?: string;
  priority?: string;
}

export interface BulkMyCasesActionRequest {
  caseIds: string[];
  action: "Resolve" | "Escalate" | "Reassign" | "UnderReview" | string;
  notes?: string;
  assignTo?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
