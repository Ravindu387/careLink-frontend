export interface FundingFinancialStats {
  monetaryDonations: number;
  monetaryDonationsDisplay: string;
  monetaryThisWeek: number;
  monetaryThisWeekDisplay: string;

  materialContributions: number;
  materialContributionsDisplay: string;
  materialNote: string;

  allocatedFunds: number;
  allocatedFundsDisplay: string;
  allocatedPercentage: number;
  allocatedNote: string;

  recordedExpenditure: number;
  recordedExpenditureDisplay: string;
  expenditurePercentage: number;
  expenditureNote: string;

  activeCampaignsCount: number;
  campaignsAboveTargetCount: number;
  activeCampaignsNote: string;

  pendingVerificationCount: number;
  pendingVerificationAmount: number;
  pendingVerificationDisplay: string;
  pendingVerificationNote: string;

  availableBalance: number;
  availableBalanceDisplay: string;
  availableBalanceNote: string;

  flaggedRecordsCount: number;
  highPriorityFlagsCount: number;
  flaggedRecordsNote: string;
}

export interface FundingWeeklyChartItem {
  day: string;
  date: string;
  receivedAmount: number;
  allocatedAmount: number;
  receivedPercentage: number;
  allocatedPercentage: number;
}

export interface FundingCampaignPerformanceItem {
  id: string;
  name: string;
  raised: number;
  target: number;
  displayAmount: string;
  percentage: number;
}

export interface FundingRecentDonationItem {
  reference: string;
  donor: string;
  type: string;
  amount: string;
  campaign: string;
  received: string;
  verification: "Verified" | "Pending" | string;
  allocation: "Partially Allocated" | "Unallocated" | "Allocated" | string;
}

export interface FundingAttentionItem {
  title: string;
  description: string;
  type: "critical" | "warning" | "info";
  link?: string;
}

export interface FundingDashboardData {
  financialStats: FundingFinancialStats;
  weeklyChart: FundingWeeklyChartItem[];
  weeklyReceivedTotal: number;
  weeklyReceivedDisplay: string;
  campaignPerformance: FundingCampaignPerformanceItem[];
  recentDonations: FundingRecentDonationItem[];
  attentionItems: FundingAttentionItem[];
}
