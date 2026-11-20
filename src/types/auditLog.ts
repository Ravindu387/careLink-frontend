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
}
