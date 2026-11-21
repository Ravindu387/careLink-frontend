export interface DuplicateCase {
  id: string;
  primaryCase: string;
  duplicateCase: string;
  factors: string;
  score: number;
  confidence: "High" | "Medium" | "Low" | string;
  status: "Awaiting Review" | "Deferred" | "Confirmed" | "Not Duplicate" | string;
  category: string;
  detected: string;
  description: string;
  reviewNotes?: string;
  createdAt?: string;
}

export interface DuplicatesStatsDto {
  totalMatches: number;
  awaitingReviewCount: number;
  highConfidenceCount: number;
  confirmedCount: number;
  deferredCount: number;
  notDuplicateCount: number;
}

export interface DuplicateQueryDto {
  search?: string;
  similarity?: string;
  status?: string;
  category?: string;
  dateRange?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface UpdateDuplicateStatusRequest {
  status: string;
  notes?: string;
}

export interface MergeCasesRequest {
  matchId: string;
  primaryCaseId: string;
  duplicateCaseId: string;
  resolutionNotes?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
