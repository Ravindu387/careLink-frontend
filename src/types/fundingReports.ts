export interface FundingAnalyticsMetrics {
  fundsReceived: number;
  fundsReceivedDisplay: string;
  fundsReceivedGrowth: string;

  allocationRate: number;
  allocatedAmount: number;
  allocatedSubtitle: string;

  expenditureRate: number;
  expendedAmount: number;
  expenditureSubtitle: string;

  verificationRate: number;
  pendingRecordsCount: number;
  verificationSubtitle: string;
}

export interface FundingTrendPoint {
  month: string;
  amount: number;
  coordinateX: number;
  coordinateY: number;
}

export interface FundingAnalyticsTrend {
  growth: string;
  currency: string;
  points: FundingTrendPoint[];
  svgLineD: string;
  svgAreaD: string;
}

export interface FundingContributionSource {
  name: string;
  amount: number;
  displayAmount: string;
  percentage: number;
}

export interface FundingAnalyticsReport {
  metrics: FundingAnalyticsMetrics;
  trend: FundingAnalyticsTrend;
  sources: FundingContributionSource[];
  combinedSourceValue: number;
  combinedSourceDisplay: string;
  availableCampaigns: string[];
}

export interface FundingAnalyticsQueryParams {
  dateRange?: string;
  campaign?: string;
  currency?: string;
}
