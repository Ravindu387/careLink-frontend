export interface VerificationCase {
  id: string;
  category: string;
  applicant: string;
  location: string;
  priority: "Critical" | "High" | "Medium" | "Low" | string;
  aiPriority: "Critical" | "High" | "Medium" | "Low" | string;
  confidence: string;
  verification: "Evidence pending" | "Contact verified" | "Needs information" | "Verified" | "Rejected" | string;
  assigned: string;
  age: string;
  status: "Under Review" | "Submitted" | "Pending Info" | "Verified" | "Rejected" | string;
  submissionAge: string;
  evidenceNotes?: string;
  documents?: string[];
  createdAt?: string;
}

export interface VerificationStatistics {
  awaitingReview: number;
  awaitingReviewDesc: string;
  verifiedToday: number;
  verifiedTodayDesc: string;
  informationRequested: number;
  informationRequestedDesc: string;
  rejectedToday: number;
  rejectedTodayDesc: string;
  oldestPendingAge: string;
}

export interface VerificationAnalyticsResponse {
  statistics: VerificationStatistics;
  totalCases: number;
  cases: VerificationCase[];
  lastUpdated: string;
}

export interface VerificationDecisionRequest {
  decision: "Verify" | "RequestInfo" | "Reject" | string;
  rationale?: string;
  verifiedBy?: string;
}

export interface VerificationQueryDto {
  search?: string;
  evidenceState?: string;
  priority?: string;
  category?: string;
  ageFilter?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
