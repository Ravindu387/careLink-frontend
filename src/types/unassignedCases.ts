export interface UnassignedCase {
  id: string;
  category: string;
  applicant: string;
  location: string;
  priority: string;
  aiPriority: string;
  confidence: string;
  verification: string;
  assigned: string;
  age: string;
  status: string;
  event: string;
  minutes: number;
  contactNumber?: string;
  householdSize?: number;
  description?: string;
  notes?: string;
  createdAt?: string;
}

export interface UnassignedCasesStatsDto {
  totalCases: number;
  criticalCount: number;
  dueSoonCount: number;
  pendingInfoCount: number;
  recentlyUpdatedCount: number;
}

export interface UnassignedCasesQueryDto {
  tab?: string;
  search?: string;
  event?: string;
  priority?: string;
  category?: string;
  status?: string;
  dateRange?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ClaimUnassignedCasesRequest {
  caseIds: string[];
  assignTo?: string;
}

export interface AssignUnassignedCaseRequest {
  caseId: string;
  assignedTo: string;
  notes?: string;
}

export interface UpdateUnassignedCaseRequest {
  priority?: string;
  status?: string;
  assigned?: string;
  notes?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
