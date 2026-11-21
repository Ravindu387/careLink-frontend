export type NotificationType =
  | "Emergency"
  | "Assistance"
  | "Volunteer"
  | "Resource"
  | "System";

export type NotificationPriority = "Critical" | "High" | "Normal" | "Low";

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  time: string;
  date: string;
  createdAt: string;
  location?: string;
  unread: boolean;
  action?: string;
  actionUrl?: string;
}

export interface NotificationStats {
  total: number;
  unreadCount: number;
  criticalCount: number;
  highPriorityCount: number;
  emergencyCount: number;
  assistanceCount: number;
  volunteerCount: number;
  resourceCount: number;
  systemCount: number;
}

export interface NotificationQuery {
  search?: string;
  type?: string;
  priority?: string;
  unreadOnly?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateNotificationRequest {
  type: NotificationType | string;
  title: string;
  message: string;
  priority?: NotificationPriority | string;
  location?: string;
  action?: string;
  actionUrl?: string;
  targetUserRole?: string;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  pushNotifications: boolean;
  emergencyCriticalSound: boolean;
  assistanceRequestsNotify: boolean;
  volunteerCheckInsNotify: boolean;
  lowResourceStockNotify: boolean;
  dailySummaryDigest: boolean;
}

export interface BatchNotificationAction {
  notificationIds: number[];
  action: "mark_read" | "mark_unread" | "archive" | "delete";
}
