export interface Report {
  id: number;
  name: string;
  category: string;
  period: string;
  generated: string;
  format: string;
  downloadUrl?: string;
  createdAt?: string;
}

export interface ReportSchedule {
  id: number;
  name: string;
  email: string;
  frequency: string;
  format: string;
  period: string;
  isActive: boolean;
  createdAt?: string;
}

export interface WeeklyTrend {
  label: string;
  received: number;
  fulfilled: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface AnalyticsKpis {
  requestsFulfilled: string;
  requestsFulfilledTrend: string;
  averageFulfilmentTime: string;
  averageFulfilmentTimeTrend: string;
  inventoryTurnover: string;
  inventoryTurnoverNote: string;
  stockLossRate: string;
  stockLossRateNote: string;
}

export interface AnalyticsDashboard {
  kpis: AnalyticsKpis;
  weeklyTrends: WeeklyTrend[];
  categoryDistributions: CategoryDistribution[];
  period: string;
  operation: string;
  warehouse: string;
}

export interface GenerateReportPayload {
  name: string;
  category: string;
  period: string;
  format: string;
}

export interface CreateReportSchedulePayload {
  name: string;
  email: string;
  frequency: string;
  format: string;
  period?: string;
}

export interface AnalyticsQueryParams {
  period?: string;
  operation?: string;
  warehouse?: string;
}

export interface ReportFilterParams {
  search?: string;
  category?: string;
  format?: string;
}
