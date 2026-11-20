export interface PriorityCase {
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
  notes?: string;
  createdAt?: string;
}

export interface PriorityQueueStatsDto {
  totalCases: number;
  criticalCount: number;
  dueSoonCount: number;
  pendingInfoCount: number;
  recentlyUpdatedCount: number;
  overdueCount: number;
}

export interface PriorityQueueQueryDto {
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

export interface ClaimPriorityCasesRequest {
  caseIds: string[];
  assignTo?: string;
}

export interface UpdatePriorityCaseRequest {
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
