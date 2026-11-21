export type NotificationCategory =
  | "Assignments"
  | "Verification"
  | "Safety"
  | "AI Matching"
  | "Communications";

export interface VolunteerNotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
  createdAt?: string;
  category: NotificationCategory;
  iconName?: string;
  color?: string;
  unread: boolean;
  urgent?: boolean;
  details: string;
  targetId?: string;
}

export interface DeliveryServiceStatus {
  name: string;
  status: "Operational" | "Degraded" | "Offline" | string;
  message: string;
}

export interface VolunteerNotificationSummaryDto {
  totalCount: number;
  unreadCount: number;
  urgentCount: number;
  assignmentCount: number;
  verificationCount: number;
  safetyCount: number;
  aiMatchingCount: number;
  communicationsCount: number;
  deliveryServices: DeliveryServiceStatus[];
}

export interface VolunteerPreferences {
  assignments: boolean;
  verification: boolean;
  safety: boolean;
  aiMatching: boolean;
  inApp: boolean;
  email: boolean;
  sms: boolean;
  urgentOnly: boolean;
}

export interface VolunteerNotificationQueryDto {
  tab?: string;
  search?: string;
  category?: string;
  unreadOnly?: boolean;
  urgentOnly?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateVolunteerNotificationRequest {
  title: string;
  description: string;
  category: NotificationCategory;
  details: string;
  urgent?: boolean;
  targetId?: string;
  iconName?: string;
  color?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
