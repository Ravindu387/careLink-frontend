import { request } from "./api";
import type {
  ReportsFilterDto,
  ReportsAnalyticsResponse,
  ReportItem,
  AnalyticsKpi,
  CategoryBreakdown,
} from "../types/caseReports";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const fallbackReportsData: ReportsAnalyticsResponse = {
  filters: {
    dateRange: "18–25 June 2025",
    crisisEvent: "Monsoon Floods 2025",
    operationalArea: "All areas",
  },
  analytics: {
    received: 1947,
    resolved: 1502,
    resolutionRate: "77.1%",
    medianResponse: "2h 18m",
    aiOverrides: "8.4%",
    aiOverridesDetails: "126 of 1,498 reviews",
    receivedTrend: "+8% today",
    responseTrend: "-18 min this week",
  },
  categories: [
    { name: "Food & Water", value: 486 },
    { name: "Shelter", value: 394 },
    { name: "Medical", value: 318 },
    { name: "Transport", value: 246 },
    { name: "Accessibility", value: 128 },
    { name: "Other", value: 375 },
  ],
  resolutionTrend: [
    { day: "18 Jun", received: 120, resolved: 75 },
    { day: "19 Jun", received: 150, resolved: 100 },
    { day: "20 Jun", received: 165, resolved: 135 },
    { day: "21 Jun", received: 220, resolved: 180 },
    { day: "22 Jun", received: 210, resolved: 190 },
    { day: "23 Jun", received: 275, resolved: 225 },
    { day: "24 Jun", received: 315, resolved: 270 },
  ],
  reportLibrary: [
    {
      id: "REP-01",
      title: "Case Intake Report",
      description: "Analyse incoming cases, request volumes and categories across operational sectors.",
      iconKey: "Inbox",
      color: "bg-sky-50 text-sky-700",
    },
    {
      id: "REP-02",
      title: "Verification Report",
      description: "Review verification rates, evidence outcomes, and document authenticity ratios.",
      iconKey: "ShieldCheck",
      color: "bg-sky-50 text-sky-700",
    },
    {
      id: "REP-03",
      title: "Priority & SLA Report",
      description: "Analyse priority levels, overdue cases and response turnaround against SLA thresholds.",
      iconKey: "AlertTriangle",
      color: "bg-sky-50 text-sky-700",
    },
    {
      id: "REP-04",
      title: "Duplicate Review Report",
      description: "Review automated duplicate similarity detection accuracy and human verification decisions.",
      iconKey: "Copy",
      color: "bg-sky-50 text-sky-700",
    },
    {
      id: "REP-05",
      title: "Escalation Report",
      description: "Track escalated cases requiring coordinator intervention and high-risk case resolution.",
      iconKey: "ArrowUpToLine",
      color: "bg-sky-50 text-sky-700",
    },
    {
      id: "REP-06",
      title: "AI Decision Audit",
      description: "Review AI recommendations, confidence scores, and caseworker override justifications.",
      iconKey: "Sparkles",
      color: "bg-sky-50 text-sky-700",
    },
    {
      id: "REP-07",
      title: "Case Manager Performance",
      description: "Measure caseload distribution, active claim turnaround, and officer resolution efficiency.",
      iconKey: "Users",
      color: "bg-sky-50 text-sky-700",
    },
    {
      id: "REP-08",
      title: "Operational Area Summary",
      description: "Compare geographic operational demand, shelter capacity stress, and logistics supply bottlenecks.",
      iconKey: "ChartLine",
      color: "bg-sky-50 text-sky-700",
    },
  ],
  generatedAt: new Date().toISOString(),
};

export const caseReportsService = {
  /**
   * Fetches report analytics from the backend API.
   * If backend is offline, falls back to demo data based on selected area.
   */
  async getReportsAnalytics(filters: ReportsFilterDto): Promise<{ data: ReportsAnalyticsResponse; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (filters.dateRange) params.append("dateRange", filters.dateRange);
      if (filters.crisisEvent) params.append("crisisEvent", filters.crisisEvent);
      if (filters.operationalArea) params.append("operationalArea", filters.operationalArea);

      const response = await request<ReportsAnalyticsResponse>(`/casereports/analytics?${params.toString()}`, {
        method: "GET",
      });

      if (response && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
      return { data: fallbackReportsData, isLiveBackend: false };
    } catch (err) {
      console.warn("Backend unavailable, using local analytics fallback:", err);

      // Local fallback calculation based on area
      const area = filters.operationalArea;
      let kpi = fallbackReportsData.analytics;
      let categories = fallbackReportsData.categories;
      let trend = fallbackReportsData.resolutionTrend;

      if (area === "North Ward") {
        kpi = {
          received: 645,
          resolved: 498,
          resolutionRate: "77.2%",
          medianResponse: "1h 42m",
          aiOverrides: "7.2%",
          aiOverridesDetails: "46 of 645 reviews",
          receivedTrend: "+5% today",
          responseTrend: "-22 min this week",
        };
        categories = [
          { name: "Food & Water", value: 162 },
          { name: "Shelter", value: 145 },
          { name: "Medical", value: 110 },
          { name: "Transport", value: 85 },
          { name: "Accessibility", value: 45 },
          { name: "Other", value: 98 },
        ];
        trend = [
          { day: "18 Jun", received: 45, resolved: 30 },
          { day: "19 Jun", received: 55, resolved: 40 },
          { day: "20 Jun", received: 60, resolved: 50 },
          { day: "21 Jun", received: 80, resolved: 65 },
          { day: "22 Jun", received: 75, resolved: 68 },
          { day: "23 Jun", received: 95, resolved: 78 },
          { day: "24 Jun", received: 110, resolved: 92 },
        ];
      } else if (area === "South Ward") {
        kpi = {
          received: 523,
          resolved: 416,
          resolutionRate: "79.5%",
          medianResponse: "2h 05m",
          aiOverrides: "9.1%",
          aiOverridesDetails: "48 of 523 reviews",
          receivedTrend: "+7% today",
          responseTrend: "-15 min this week",
        };
        categories = [
          { name: "Food & Water", value: 135 },
          { name: "Shelter", value: 115 },
          { name: "Medical", value: 88 },
          { name: "Transport", value: 64 },
          { name: "Accessibility", value: 36 },
          { name: "Other", value: 85 },
        ];
        trend = [
          { day: "18 Jun", received: 35, resolved: 25 },
          { day: "19 Jun", received: 42, resolved: 32 },
          { day: "20 Jun", received: 48, resolved: 38 },
          { day: "21 Jun", received: 62, resolved: 50 },
          { day: "22 Jun", received: 58, resolved: 52 },
          { day: "23 Jun", received: 78, resolved: 62 },
          { day: "24 Jun", received: 88, resolved: 74 },
        ];
      }

      return {
        data: {
          filters,
          analytics: kpi,
          categories,
          resolutionTrend: trend,
          reportLibrary: fallbackReportsData.reportLibrary,
          generatedAt: new Date().toISOString(),
        },
        isLiveBackend: false,
      };
    }
  },

  /**
   * Fetches report templates
   */
  async getReportLibrary(): Promise<ReportItem[]> {
    try {
      const response = await request<ReportItem[]>("/casereports/library", { method: "GET" });
      return response.data || fallbackReportsData.reportLibrary;
    } catch {
      return fallbackReportsData.reportLibrary;
    }
  },

  /**
   * Downloads report CSV from backend API or generates client-side fallback
   */
  async downloadExportReport(
    filters: ReportsFilterDto,
    analytics: AnalyticsKpi,
    categories: CategoryBreakdown[]
  ): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append("dateRange", filters.dateRange);
      params.append("crisisEvent", filters.crisisEvent);
      params.append("operationalArea", filters.operationalArea);

      const token = localStorage.getItem("carelink_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/casereports/export?${params.toString()}`, { headers });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const safeArea = filters.operationalArea.replace(/\s+/g, "-").toLowerCase();
        a.download = `carelink-report-${safeArea}-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // fallback to client-side generation
    }

    // Client-side fallback export
    const rows = [
      ["CareLink - Case Reports & Analytics"],
      ["Date Range", filters.dateRange],
      ["Crisis Event", filters.crisisEvent],
      ["Operational Area", filters.operationalArea],
      [],
      ["Metric", "Value", "Trend / Details"],
      ["Cases Received", analytics.received, analytics.receivedTrend],
      ["Cases Resolved", analytics.resolved, analytics.resolutionRate],
      ["Median Response", analytics.medianResponse, analytics.responseTrend],
      ["AI Overrides", analytics.aiOverrides, analytics.aiOverridesDetails],
      [],
      ["Category", "Cases Count"],
      ...categories.map((c) => [c.name, c.value]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const safeArea = filters.operationalArea.replace(/\s+/g, "-").toLowerCase();
    link.setAttribute("download", `carelink-report-${safeArea}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
