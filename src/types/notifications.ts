export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "Critical" | "Assignment" | "Duplicate" | "Evidence" | "Escalation" | "AI" | string;
  read: boolean;
  caseId: string;
  createdAt?: string;
}

export interface DeliveryServiceStatus {
  name: string;
  status: "Operational" | "Degraded" | "Offline" | string;
  message: string;
}

export interface NotificationSummaryDto {
  totalCount: number;
  unreadCount: number;
  criticalCount: number;
  assignmentCount: number;
  evidenceCount: number;
  duplicateCount: number;
  escalationCount: number;
  aiCount: number;
  deliveryServices: DeliveryServiceStatus[];
}

export interface NotificationPreferencesDto {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  criticalEnabled: boolean;
  assignmentEnabled: boolean;
  evidenceEnabled: boolean;
}

export interface NotificationQueryDto {
  tab?: string;
  search?: string;
  type?: string;
  unreadOnly?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateNotificationRequest {
  title: string;
  description: string;
  type: string;
  caseId: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
