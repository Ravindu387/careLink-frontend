export interface EscalatedCase {
  id: string;
  category: string;
  applicant: string;
  location: string;
  priority: "Critical" | "High" | "Medium" | "Low" | string;
  aiPriority: "Critical" | "High" | "Medium" | "Low" | string;
  confidence: string;
  verification: string;
  assigned: string;
  age: string;
  status: "Under Review" | "Escalated" | "Assigned" | "Pending Info" | "Resolved" | string;
  event: string;
  minutes: number;
  escalationReason?: string;
  targetOrg?: string;
  coordinatorNotes?: string;
  createdAt?: string;
}

export interface EscalationStatsDto {
  totalEscalated: number;
  criticalCount: number;
  dueSoonCount: number;
  pendingInfoCount: number;
  recentlyUpdatedCount: number;
}

export interface EscalatedQueryDto {
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

export interface BulkEscalationActionRequest {
  caseIds: string[];
  action: "Escalate" | "De-escalate" | "AssignCoordinator" | "Resolve" | string;
  notes?: string;
  assignTo?: string;
}

export interface EscalationDecisionRequest {
  action: "Resolve" | "Reassign" | "RequestCrossOrg" | "UpdateNotes" | string;
  notes?: string;
  targetOrg?: string;
  assignTo?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
