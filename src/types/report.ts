export interface ReportItem {
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
  createdAt: string;
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

export interface ReportFilterParams {
  search?: string;
  category?: string;
  format?: string;
}

export interface AnalyticsQueryParams {
  period?: string;
  operation?: string;
  warehouse?: string;
}

export interface AnalyticsKpi {
  requestsFulfilled: string;
  requestsFulfilledTrend: string;
  averageFulfilmentTime: string;
  averageFulfilmentTimeTrend: string;
  inventoryTurnover: string;
  inventoryTurnoverNote: string;
  stockLossRate: string;
  stockLossRateNote: string;
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

export interface AnalyticsDashboard {
  kpis: AnalyticsKpi;
  weeklyTrends: WeeklyTrend[];
  categoryDistributions: CategoryDistribution[];
  period: string;
  operation: string;
  warehouse: string;
export interface StatMetric {
  label: string;
  value: string;
  note: string;
  tone: "blue" | "green" | "amber" | "red" | string;
  change?: string;
}

export interface TrendPoint {
  month: string;
  activeUsers: number;
  newRegistrations: number;
  y: number;
}

export interface RoleDistributionItem {
  label: string;
  roleKey: string;
  count: number;
  value: string;
  width: string;
  percentage: number;
}

export interface ReportCatalogItem {
  id: string;
  title: string;
  description: string;
  category: string;
  iconKey: string;
  lastGenerated?: string;
  estimatedRecords: number;
}

export interface ReportFilter {
  dateRange: string;
  organisation?: string;
  region?: string;
}

export interface ReportFilterOptions {
  dateRanges: string[];
  organisations: string[];
  regions: string[];
}

export interface ReportOverview {
  stats: StatMetric[];
  adoptionTrend: TrendPoint[];
  adoptionGrowthBadge: string;
  totalRegisteredUsers: number;
  usersByRole: RoleDistributionItem[];
  reports: ReportCatalogItem[];
  appliedFilters: ReportFilter;
}

export interface ReportColumn {
  key: string;
  label: string;
  type: "text" | "number" | "badge" | "date" | string;
  align: "left" | "center" | "right" | string;
}

export interface ReportDetail {
  reportId: string;
  title: string;
  category: string;
  generatedAt: string;
  generatedBy: string;
  totalRecords: number;
  filterSummary: string;
  summaryMetrics: Record<string, string>;
  columns: ReportColumn[];
  rows: Record<string, any>[];
}

export interface ExportReportRequest {
  format: "csv" | "json";
  dateRange?: string;
  organisation?: string;
  region?: string;
  rationale?: string;
}
