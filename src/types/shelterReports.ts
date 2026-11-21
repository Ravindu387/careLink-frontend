export interface ShelterReportsFilterDto {
  dateRange: string;
  shelter: string;
  district: string;
}

export interface ShelterMetricsDto {
  occupancy: number;
  admissions: number;
  approved: number;
  resources: number;
  pending: number;
  rejected: number;
  departed: number;
  approvalCount: number;
  occupancyTrend: string;
  admissionsSubtitle: string;
  resourcesSubtitle: string;
}

export interface ShelterTrendDataPoint {
  day: string;
  value: number;
}

export interface ShelterReportItem {
  id: number;
  title: string;
  description: string;
  category: string;
  iconName: string;
  format?: string;
  lastGenerated?: string;
}

export interface ShelterReportsOverviewDto {
  filters: ShelterReportsFilterDto;
  metrics: ShelterMetricsDto;
  trendData: ShelterTrendDataPoint[];
  reports: ShelterReportItem[];
  shelters: string[];
  districts: string[];
  dateRanges: string[];
  generatedAt: string;
}
