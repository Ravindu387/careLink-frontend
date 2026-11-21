import { request } from "./api";
import type {
  DashboardData,
  DashboardSummary,
  DashboardChartPoint,
  DashboardActivityItem,
  DashboardAlertItem,
} from "../types/dashboard";

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const res = await request<DashboardData>("/admin/dashboard", {
      method: "GET",
    });
    return res.data;
  },

  async getSummary(): Promise<DashboardSummary> {
    const res = await request<DashboardSummary>("/admin/dashboard/summary", {
      method: "GET",
    });
    return res.data;
  },

  async getWeeklyTrend(): Promise<DashboardChartPoint[]> {
    const res = await request<DashboardChartPoint[]>("/admin/dashboard/trend", {
      method: "GET",
    });
    return res.data || [];
  },

  async getRecentActivities(): Promise<DashboardActivityItem[]> {
    const res = await request<DashboardActivityItem[]>("/admin/dashboard/activity", {
      method: "GET",
    });
    return res.data || [];
  },

  async getActiveAlerts(): Promise<DashboardAlertItem[]> {
    const res = await request<DashboardAlertItem[]>("/admin/dashboard/alerts", {
      method: "GET",
    });
    return res.data || [];
  },
};
