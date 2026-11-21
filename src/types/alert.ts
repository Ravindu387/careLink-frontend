export type AlertSeverity =
  | "Critical"
  | "Delayed"
  | "Low Stock"
  | "Near Capacity"
  | "Expiring Soon"
  | "Warning";

export type AlertStatus = "Open" | "Acknowledged" | "Resolved";

export interface AlertItem {
  id: number;
  title: string;
  description: string;
  location: string;
  time: string;
  severity: AlertSeverity;
  status: AlertStatus;
  icon: "alert" | "truck" | "warehouse" | "clock";
  assignedTo?: string;
  createdAt?: string;
}

export interface AlertSummary {
  totalCount: number;
  criticalCount: number;
  warningCount: number;
  acknowledgedCount: number;
  resolvedCount: number;
}

export interface AlertRules {
  critical: boolean;
  lowStock: boolean;
  capacity: boolean;
  dispatch: boolean;
  expiry: boolean;
}

export interface CreateAlertPayload {
  title: string;
  description: string;
  location: string;
  severity: AlertSeverity;
  icon?: string;
  assignedTo?: string;
}
