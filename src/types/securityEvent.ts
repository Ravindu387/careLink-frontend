export type SecuritySeverity = "High" | "Medium" | "Low";

export type SecurityEventStatus = "Investigating" | "Review Required" | "Resolved";

export interface SecurityEvent {
  id: string;
  type: string;
  user: string;
  source: string;
  severity: SecuritySeverity;
  status: SecurityEventStatus;
  timestamp: string;
  createdAt: string;
  description?: string;
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  environment?: string;
}

export interface SecurityEventStats {
  openEvents: number;
  openEventsDetail: string;
  highSeverityEvents: number;
  highSeverityDetail: string;
  blockedAttempts: number;
  blockedAttemptsDetail: string;
  resolvedToday: number;
  resolvedTodayDetail: string;
  threatLevel: string;
  threatHeadline: string;
  monitoringStatus: string;
  totalEvents: number;
}

export interface SecurityEventQuery {
  search?: string;
  severity?: string;
  type?: string;
  status?: string;
  dateFilter?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateSecurityEventRequest {
  type: string;
  user: string;
  source: string;
  severity: SecuritySeverity;
  status?: SecurityEventStatus;
  description?: string;
  environment?: string;
}

export interface UpdateSecurityEventStatusRequest {
  status: SecurityEventStatus;
  resolutionNote?: string;
}

export interface RecordPolicyActionRequest {
  policyTitle: string;
  environment: string;
  scope: string;
  approvalType: string;
  policyReason: string;
  relatedEventId?: string;
}

export interface SecurityPolicyAction {
  id: string;
  policyTitle: string;
  environment: string;
  scope: string;
  approvalType: string;
  policyReason: string;
  performedBy: string;
  relatedEventId?: string;
  createdAt: string;
}

export interface PaginatedList<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
