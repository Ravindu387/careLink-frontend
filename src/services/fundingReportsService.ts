import { apiClient } from "./api";
import type {
  FundingAnalyticsReport,
  FundingAnalyticsQueryParams,
} from "../types/fundingReports";

const BASE = "/funding-reports";

export const fundingReportsService = {
  // GET /api/funding-reports/analytics
  getAnalytics: async (params: FundingAnalyticsQueryParams = {}): Promise<FundingAnalyticsReport> => {
    const query: Record<string, string> = {};
    if (params.dateRange) query.dateRange = params.dateRange;
    if (params.campaign && params.campaign !== "All campaigns") query.campaign = params.campaign;
    if (params.currency) query.currency = params.currency;
    return apiClient.get<FundingAnalyticsReport>(`${BASE}/analytics`, query);
  },
};

export default fundingReportsService;
