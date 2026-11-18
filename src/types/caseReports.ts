export interface ReportsFilterDto {
  dateRange: string;
  crisisEvent: string;
  operationalArea: string;
}

export interface AnalyticsKpi {
  received: number;
  resolved: number;
  resolutionRate: string;
  medianResponse: string;
  aiOverrides: string;
  aiOverridesDetails: string;
  receivedTrend: string;
  responseTrend: string;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
}

export interface DailyResolutionPoint {
  day: string;
  received: number;
  resolved: number;
}

export interface ReportItem {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  color: string;
}

export interface ReportsAnalyticsResponse {
  filters: ReportsFilterDto;
  analytics: AnalyticsKpi;
  categories: CategoryBreakdown[];
  resolutionTrend: DailyResolutionPoint[];
  reportLibrary: ReportItem[];
  generatedAt: string;
}
