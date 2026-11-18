export type NotificationType =
  | "All"
  | "Unread"
  | "Critical"
  | "Requests"
  | "Inventory"
  | "System"
  | "Flags"
  | "Verification"
  | "Campaigns"
  | "Allocation"
  | "Expenditure"
  | "Reports";

export type NotificationCategory =
  | "Flags"
  | "Verification"
  | "Campaigns"
  | "Allocation"
  | "Expenditure"
  | "Reports"
  | "Critical"
  | "Requests"
  | "Inventory"
  | "System";

export type NotificationIconType =
  | "request"
  | "warning"
  | "inventory"
  | "medical"
  | "maintenance"
  | "resident"
  | "alert"
  | "clock"
  | "check"
  | "file"
  | "campaign"
  | "shield";

export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  type: string;
  time: string;
  createdAtUtc?: string;
  icon: NotificationIconType | string;
  unread: boolean;
  details: string;
  reference?: string;
  category?: string;
  role?: string;
}

export interface NotificationSummary {
  unreadCount: number;
  criticalCount: number;
  requestCount: number;
  inventoryCount: number;
  systemCount: number;
  flagsCount?: number;
  verificationCount?: number;
  campaignsCount?: number;
  allocationCount?: number;
  expenditureCount?: number;
  reportsCount?: number;
  totalCount: number;
}

export interface NotificationPreference {
  role: string;
  inApp: boolean;
  email: boolean;
  sms: boolean;
  critical: boolean;
  requests?: boolean;
  inventory?: boolean;
  system?: boolean;
  verification?: boolean;
  campaigns?: boolean;
  reports?: boolean;
}

export interface NotificationQueryParams {
  search?: string;
  type?: string;
  unread?: boolean;
  role?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface CreateNotificationInput {
  title: string;
  description: string;
  type?: string;
  icon?: string;
  details?: string;
  reference?: string;
  role?: string;
}
