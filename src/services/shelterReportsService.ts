import { request, authFetch } from "./api";
import type {
  ShelterReportsFilterDto,
  ShelterReportsOverviewDto,
  ShelterMetricsDto,
  ShelterTrendDataPoint,
  ShelterReportItem,
} from "../types/shelterReports";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const fallbackShelterData: Record<string, ShelterMetricsDto> = {
  "All shelters": {
    occupancy: 66.2,
    admissions: 342,
    approved: 84,
    resources: 12480,
    pending: 14,
    rejected: 7,
    departed: 158,
    approvalCount: 287,
    occupancyTrend: "+4.8% in period",
    admissionsSubtitle: "158 departures",
    resourcesSubtitle: "Across 8 categories",
  },
  "Riverton Central": {
    occupancy: 92,
    admissions: 128,
    approved: 88,
    resources: 4200,
    pending: 5,
    rejected: 2,
    departed: 42,
    approvalCount: 113,
    occupancyTrend: "+6.2% in period",
    admissionsSubtitle: "42 departures",
    resourcesSubtitle: "Across 8 categories",
  },
  "North Community": {
    occupancy: 57,
    admissions: 84,
    approved: 82,
    resources: 3100,
    pending: 4,
    rejected: 2,
    departed: 38,
    approvalCount: 69,
    occupancyTrend: "+3.1% in period",
    admissionsSubtitle: "38 departures",
    resourcesSubtitle: "Across 6 categories",
  },
  "St. Mary Civic": {
    occupancy: 100,
    admissions: 65,
    approved: 76,
    resources: 2200,
    pending: 3,
    rejected: 2,
    departed: 32,
    approvalCount: 49,
    occupancyTrend: "+8.5% in period",
    admissionsSubtitle: "32 departures",
    resourcesSubtitle: "Across 5 categories",
  },
  "Lakeside Sports": {
    occupancy: 49,
    admissions: 65,
    approved: 90,
    resources: 2980,
    pending: 2,
    rejected: 1,
    departed: 46,
    approvalCount: 59,
    occupancyTrend: "-1.4% in period",
    admissionsSubtitle: "46 departures",
    resourcesSubtitle: "Across 7 categories",
  },
};

const defaultReports: ShelterReportItem[] = [
  {
    id: 1,
    title: "Shelter Occupancy Report",
    description: "Capacity, occupancy rates, and available bed allocations across shelters.",
    category: "Shelter",
    iconName: "FileText",
    lastGenerated: "Today, 14:10",
  },
  {
    id: 2,
    title: "Resident Registration Report",
    description: "Admissions, departures, special needs, and resident demographic profiles.",
    category: "Residents",
    iconName: "Users",
    lastGenerated: "Today, 13:45",
  },
  {
    id: 3,
    title: "Bed Availability Report",
    description: "Room and bed status, turnover efficiency, and real-time vacancies.",
    category: "Shelter",
    iconName: "BedDouble",
    lastGenerated: "Yesterday",
  },
  {
    id: 4,
    title: "Resource Inventory Report",
    description: "Stock levels, replenishment alerts, distribution, and expiry schedules.",
    category: "Resources",
    iconName: "Package",
    lastGenerated: "Today, 10:15",
  },
  {
    id: 5,
    title: "Accommodation Request Report",
    description: "Intake outcomes, assignment times, intake approvals, and reject ratios.",
    category: "Requests",
    iconName: "ClipboardList",
    lastGenerated: "2 days ago",
  },
  {
    id: 6,
    title: "Staff Activity Report",
    description: "Staff shifts, duty attendance, task rotations, and responsibilities.",
    category: "Staff",
    iconName: "UserRound",
    lastGenerated: "Yesterday",
  },
  {
    id: 7,
    title: "Health & Safety Report",
    description: "Field incidents, medical aid reports, inspections, and hazard mitigation.",
    category: "Health",
    iconName: "HeartPulse",
    lastGenerated: "Today, 08:30",
  },
  {
    id: 8,
    title: "Shelter Performance Overview",
    description: "Cross-shelter operational metrics, SLA benchmarks, and resource utilization.",
    category: "Performance",
    iconName: "ChartNoAxesColumn",
    lastGenerated: "Today, 11:00",
  },
];

const defaultTrend: ShelterTrendDataPoint[] = [
  { day: "18 Jun", value: 48 },
  { day: "19 Jun", value: 55 },
  { day: "20 Jun", value: 54 },
  { day: "21 Jun", value: 65 },
  { day: "22 Jun", value: 64 },
  { day: "23 Jun", value: 77 },
  { day: "24 Jun", value: 83 },
];

export const shelterReportsService = {
  /**
   * Retrieves comprehensive shelter reports overview
   */
  async getOverview(
    filters: ShelterReportsFilterDto
  ): Promise<{ data: ShelterReportsOverviewDto; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (filters.dateRange) params.append("dateRange", filters.dateRange);
      if (filters.shelter) params.append("shelter", filters.shelter);
      if (filters.district) params.append("district", filters.district);

      const url = `/shelter/reports/overview${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<ShelterReportsOverviewDto>(url);

      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fall through to local fallback
    }

    const selectedMetrics = fallbackShelterData[filters.shelter] || fallbackShelterData["All shelters"];
    let factor = selectedMetrics.occupancy / 66.2;

    const trend = defaultTrend.map((t) => ({
      day: t.day,
      value: Math.min(100, Math.max(15, Math.round(t.value * factor))),
    }));

    return {
      data: {
        filters,
        metrics: selectedMetrics,
        trendData: trend,
        reports: defaultReports,
        shelters: [
          "All shelters",
          "Riverton Central",
          "North Community",
          "St. Mary Civic",
          "Lakeside Sports",
        ],
        districts: [
          "All districts",
          "Central District",
          "North District",
          "Eastbank",
          "West District",
        ],
        dateRanges: [
          "18–25 June 2025",
          "Last 7 days",
          "Last 30 days",
          "This month",
          "Last month",
        ],
        generatedAt: new Date().toISOString(),
      },
      isLiveBackend: false,
    };
  },

  /**
   * Export overview report as CSV blob
   */
  async exportOverviewCsv(filters: ShelterReportsFilterDto): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (filters.dateRange) params.append("dateRange", filters.dateRange);
      if (filters.shelter) params.append("shelter", filters.shelter);
      if (filters.district) params.append("district", filters.district);

      const token = localStorage.getItem("carelink_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await authFetch(`${API_BASE_URL}/shelter/reports/export?${params.toString()}`, { headers });
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const overviewRes = await this.getOverview(filters);
    const m = overviewRes.data.metrics;

    const rows = [
      ["CareLink - Shelter Reports & Analytics"],
      ["Date Range", filters.dateRange],
      ["Shelter", filters.shelter],
      ["District", filters.district],
      [],
      ["Metric", "Value", "Context"],
      ["Average Occupancy", `${m.occupancy}%`, m.occupancyTrend],
      ["New Admissions", String(m.admissions), m.admissionsSubtitle],
      ["Requests Approved", `${m.approved}%`, `${m.approvalCount} of ${m.admissions} approved`],
      ["Resources Distributed", String(m.resources), m.resourcesSubtitle],
      ["Pending Requests", String(m.pending), "Under verification"],
      ["Rejected Requests", String(m.rejected), "Capacity or criteria limit"],
      ["Departures", String(m.departed), "Processed departures"],
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  },

  /**
   * Export individual report item as CSV blob
   */
  async exportReportItemCsv(reportTitle: string, filters: ShelterReportsFilterDto): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append("reportTitle", reportTitle);
      if (filters.dateRange) params.append("dateRange", filters.dateRange);
      if (filters.shelter) params.append("shelter", filters.shelter);
      if (filters.district) params.append("district", filters.district);

      const token = localStorage.getItem("carelink_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await authFetch(`${API_BASE_URL}/shelter/reports/export/item?${params.toString()}`, { headers });
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const overviewRes = await this.getOverview(filters);
    const m = overviewRes.data.metrics;

    const rows = [
      [`CareLink - ${reportTitle}`],
      ["Date Range", filters.dateRange],
      ["Shelter", filters.shelter],
      ["District", filters.district],
      [],
      ["Metric", "Value", "Status"],
      ["Average Occupancy", `${m.occupancy}%`, "Target: <85%"],
      ["New Admissions", String(m.admissions), "Normal intake"],
      ["Requests Approved", `${m.approvalCount} (${m.approved}%)`, "Verified compliant"],
      ["Resources Distributed", `${m.resources} units`, "Dispatched"],
      ["Pending In Queue", String(m.pending), "Pending verification"],
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  },
};
