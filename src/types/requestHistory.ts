export interface HistoryEvent {
  id: string;
  caseId: string;
  action: string;
  actor: string;
  change: string;
  rationale: string;
  timestamp: string;
  eventType: string;
  details?: string;
  createdAt?: string;
}

export interface RequestHistoryStatsDto {
  totalEvents: number;
  decisionsCount: number;
  assignmentsCount: number;
  verificationsCount: number;
  escalationsCount: number;
}

export interface RequestHistoryQueryDto {
  search?: string;
  eventType?: string;
  actor?: string;
  caseId?: string;
  dateRange?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface LogHistoryEventRequest {
  caseId: string;
  action: string;
  actor: string;
  change: string;
  rationale: string;
  eventType: string;
  details?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
