import { apiClient } from "./api";
import type { FundingDashboardData } from "../types/fundingDashboard";

const BASE = "/funding-dashboard";

export const fundingDashboardService = {
  // GET /api/funding-dashboard
  getDashboardData: async (): Promise<FundingDashboardData> => {
    return apiClient.get<FundingDashboardData>(BASE);
  },
};

export default fundingDashboardService;
