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

export interface DashboardSummary {
  openRequestsCount: number;
  openRequestsTodayDelta: number;
  criticalRequestsCount: number;
  overdueCriticalCount: number;
  peopleInSheltersCount: number;
  shelterCapacityPercentage: number;
  resourcesAvailablePercentage: number;
  resourceShortagesCount: number;
  totalRegisteredUsers: number;
  activeUsersCount: number;
  pendingVerificationCount: number;
  activeVolunteersCount: number;
  pendingPartnerApprovalsCount: number;
  activeCrisisName: string;
  activeCrisisStatus: string;
  roleDistribution: { role: string; count: number }[];
}

export interface DashboardChartPoint {
  day: string;
  received: number;
  fulfilled: number;
}

export interface DashboardRequestPreview {
  id: string;
  description: string;
  category: string;
  location: string;
  priority: string;
  status: string;
  affectedPeople: number;
  contact: string;
  critical: boolean;
  timeAgo: string;
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  icon: string;
  color: string;
  timestamp: string;
}

export interface DashboardAlertItem {
  id: string;
  title: string;
  description: string;
  severity: string;
  timeAgo: string;
  timestamp: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  weeklyTrend: DashboardChartPoint[];
  urgentRequests: DashboardRequestPreview[];
  recentActivities: DashboardActivityItem[];
  activeAlerts: DashboardAlertItem[];
}
