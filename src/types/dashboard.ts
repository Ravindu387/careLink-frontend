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
