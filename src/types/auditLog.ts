export interface AuditRecord {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  record: string;
  change: string;
  rationale: string;
  actionType: string;
  recordType: string;
  date: string;
  createdAt?: string;
  type?: string;
  environment?: string;
  ipAddress?: string;
}

export interface CreateAuditLogPayload {
  action: string;
  actor?: string;
  record: string;
  change: string;
  rationale: string;
  actionType?: string;
  recordType?: string;
  date?: string;
}

export interface AuditLogQueryParams {
  search?: string;
  actionType?: string;
  actor?: string;
  recordType?: string;
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogSummary {
  totalLogs: number;
  approvalsCount: number;
  dispatchesCount: number;
  inventoryCount: number;
  todayCount: number;
  actorId?: string;
  timestamp: string;
  createdAt: string;
  record: string;
  change: string;
  rationale: string;
  type: string;
  environment?: string;
  ipAddress?: string;
  metadata?: string;
}

export interface AuditLogStats {
  totalRecords: number;
  retentionPeriod: string;
  uniqueActors: number;
  actionsToday: number;
  actionTypes: string[];
  recordTypes: string[];
  actors: string[];
}

export interface AuditLogQuery {
  search?: string;
  action?: string;
  actor?: string;
  type?: string;
  dateFilter?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateAuditLogRequest {
  action: string;
  actor: string;
  actorId?: string;
  record: string;
  change: string;
  rationale: string;
  type: string;
  environment?: string;
  ipAddress?: string;
  metadata?: string;
}

export interface ExportAuditLogRequest {
  actionTitle: string;
  environment: string;
  scope: string;
  approvalType: string;
  rationale: string;
  selectedRecordId?: string;
  search?: string;
  action?: string;
  actor?: string;
  type?: string;
  dateFilter?: string;
}
