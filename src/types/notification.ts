export type NotificationType =
  | "alert"
  | "message"
  | "delivery"
  | "shelter"
  | "medical";

export interface CitizenNotification {
  id: string | number;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  category: "Safety alerts" | "My requests" | string;
  actionUrl?: string;
  citizenName?: string;
  createdAt?: string;
  readAt?: string;
}

export interface CreateNotificationPayload {
  type: NotificationType;
  title: string;
  description: string;
  category: string;
  actionUrl?: string;
  citizenName?: string;
}

export interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
  safetyAlertsCount: number;
  myRequestsCount: number;
}

export interface NotificationFilterParams {
  citizenName?: string;
  category?: string;
  unreadOnly?: boolean;
  search?: string;
}
