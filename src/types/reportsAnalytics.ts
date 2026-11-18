export interface ReportsMetrics {
  occupancy: number;
  admissions: number;
  approved: number;
  approvalCount: number;
  resources: number;
  pending: number;
  rejected: number;
  departed: number;
  occupancyChange: string;
}

export interface TrendPoint {
  day: string;
  value: number;
}

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  iconKey: string;
}

export interface ReportsAnalytics {
  metrics: ReportsMetrics;
  trendData: TrendPoint[];
  shelters: string[];
  districts: string[];
  dateRanges: string[];
  appliedFilters: Record<string, string>;
}

export interface ReportsAnalyticsQueryParams {
  dateRange?: string;
  shelter?: string;
  district?: string;
}
