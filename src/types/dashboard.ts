export interface DashboardStat {
  title: string;
  value: string;
  note: string;
  icon: string;
  color: "blue" | "orange" | "red" | "green";
}

export interface DashboardCriticalAlert {
  shortagesCount: number;
  title: string;
  description: string;
  pendingRequestsCount: number;
  districtsCount: number;
}

export interface DashboardStockMovement {
  day: string;
  received: number;
  issued: number;
}

export interface DashboardStockHealth {
  name: string;
  value: number;
  color: string;
}

export interface DashboardRequestItem {
  id: string;
  unit: string;
  resource: string;
  quantity: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  category?: string;
  source: string;
  age: string;
  status: "Awaiting Approval" | "Partially Available" | "Allocated" | "Processing" | "Fulfilled";
  createdAt?: string;
}

export interface DashboardActivity {
  icon: string;
  title: string;
  detail: string;
  time: string;
}

export interface DashboardQuickAction {
  icon: string;
  label: string;
  targetPath: string;
  actionType: "navigate" | "modal";
}

export interface ResourceDashboardData {
  stats: DashboardStat[];
  criticalAlert: DashboardCriticalAlert;
  stockMovement: DashboardStockMovement[];
  stockHealth: DashboardStockHealth[];
  priorityRequests: DashboardRequestItem[];
  recentActivities: DashboardActivity[];
  quickActions: DashboardQuickAction[];
  primaryHub: string;
  activeOperation: string;
}

export interface RecordReceiptPayload {
  resource: string;
  category: string;
  quantity: number;
  warehouse: string;
  supplier?: string;
  receivedBy?: string;
  notes?: string;
}

export interface CreateResourceRequestPayload {
  unit: string;
  resource: string;
  quantity: string;
  priority: string;
  category: string;
  source: string;
}
