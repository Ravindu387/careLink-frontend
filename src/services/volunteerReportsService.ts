import { request } from "./api";
import type {
  VolunteerReportsOverviewDto,
  VolunteerAnalyticsData,
  TrendDataPoint,
  SkillHoursBreakdown,
  VolunteerReportItem,
  VolunteerReportsQueryDto,
} from "../types/volunteerReports";

const defaultTrend: TrendDataPoint[] = [
  { date: "18 Jun", value: 22 },
  { date: "19 Jun", value: 35 },
  { date: "20 Jun", value: 34 },
  { date: "21 Jun", value: 51 },
  { date: "22 Jun", value: 50 },
  { date: "23 Jun", value: 72 },
  { date: "24 Jun", value: 83 },
];

const defaultSkills: SkillHoursBreakdown[] = [
  { name: "Logistics", hours: 3480, percentage: 24.4 },
  { name: "Shelter support", hours: 2860, percentage: 20.0 },
  { name: "Medical", hours: 2240, percentage: 15.7 },
  { name: "Transport", hours: 1980, percentage: 13.9 },
  { name: "Translation", hours: 1120, percentage: 7.8 },
  { name: "Rescue", hours: 980, percentage: 6.9 },
];

const defaultReports: VolunteerReportItem[] = [
  {
    id: 1,
    title: "Volunteer Roster Report",
    description: "View registered volunteers, availability, skills and assignments.",
    iconName: "Users",
    category: "Volunteer Management",
    lastGenerated: "Today, 14:10",
  },
  {
    id: 2,
    title: "Task Completion Report",
    description: "Analyze created, assigned and completed response tasks.",
    iconName: "ListChecks",
    category: "Task Management",
    lastGenerated: "Today, 12:45",
  },
  {
    id: 3,
    title: "Volunteer Hours Report",
    description: "Review volunteer working hours and contribution statistics.",
    iconName: "Clock",
    category: "Volunteer Performance",
    lastGenerated: "Yesterday",
  },
  {
    id: 4,
    title: "Verification & Compliance",
    description: "Monitor volunteer verification and qualification compliance.",
    iconName: "ShieldCheck",
    category: "Compliance",
    lastGenerated: "2 days ago",
  },
  {
    id: 5,
    title: "Training Readiness",
    description: "Analyze training completion and certification readiness.",
    iconName: "Award",
    category: "Training",
    lastGenerated: "3 days ago",
  },
  {
    id: 6,
    title: "Safety & Incident Report",
    description: "Review field incidents, safety alerts and incident-free shifts.",
    iconName: "AlertTriangle",
    category: "Safety",
    lastGenerated: "Today, 09:15",
  },
  {
    id: 7,
    title: "Performance by Area",
    description: "Compare volunteer performance across operational areas.",
    iconName: "Activity",
    category: "Performance",
    lastGenerated: "Yesterday",
  },
  {
    id: 8,
    title: "AI Matching Decisions",
    description: "Review AI recommendations, matching scores and human approvals.",
    iconName: "Sparkles",
    category: "AI Operations",
    lastGenerated: "Today, 11:20",
  },
];

export const volunteerReportsService = {
  async getOverview(
    query: VolunteerReportsQueryDto = {}
  ): Promise<{ data: VolunteerReportsOverviewDto; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.dateRange) params.append("dateRange", query.dateRange);
      if (query.operationalArea) params.append("operationalArea", query.operationalArea);
      if (query.skillGroup) params.append("skillGroup", query.skillGroup);

      const url = `/volunteer/reports/overview${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<VolunteerReportsOverviewDto>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    let multiplier = 1;
    if (query.operationalArea && query.operationalArea !== "All areas") {
      multiplier *= 0.65;
    }
    if (query.skillGroup && query.skillGroup !== "All skills") {
      multiplier *= 0.45;
    }

    const analytics: VolunteerAnalyticsData = {
      tasksCompleted: Math.round(1284 * multiplier),
      volunteerHours: Math.round(14280 * multiplier),
      acceptanceRate: 92,
      incidentFreeRate: 98.7,
      activeVolunteers: Math.round(2184 * multiplier),
      totalShifts: Math.round(3418 * multiplier),
      completionRate: "89.4% completion",
      hoursComparison: "+12% vs previous week",
      invitationsCount: "3,418 invitations",
      incidentsSummary: "18 minor incidents",
    };

    const trendData = defaultTrend.map((t) => ({
      ...t,
      value: Math.round(t.value * multiplier),
    }));

    const skillData =
      query.skillGroup && query.skillGroup !== "All skills"
        ? defaultSkills
            .filter((s) => s.name.toLowerCase() === query.skillGroup?.toLowerCase())
            .map((s) => ({ ...s, percentage: 100 }))
        : defaultSkills.map((s) => ({ ...s, hours: Math.round(s.hours * multiplier) }));

    return {
      data: {
        analytics,
        trendData,
        skillData,
        reports: defaultReports,
        operationalAreas: ["All areas", "North Ward", "Central Ward", "Eastbank", "West District", "South Ward"],
        skillGroups: ["All skills", "Logistics", "Shelter support", "Medical", "Transport", "Translation", "Rescue"],
        dateRanges: ["18-25 June 2025", "Last 7 days", "Last 30 days", "Last 90 days", "This month", "This year"],
      },
      isLiveBackend: false,
    };
  },

  async exportOverview(query: VolunteerReportsQueryDto = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query.dateRange) params.append("dateRange", query.dateRange);
      if (query.operationalArea) params.append("operationalArea", query.operationalArea);
      if (query.skillGroup) params.append("skillGroup", query.skillGroup);

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";
      const res = await fetch(`${API_BASE_URL}/volunteer/reports/export?${params.toString()}`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const overviewRes = await this.getOverview(query);
    const data = overviewRes.data;

    const rows = [
      ["CareLink - Reports & Analytics"],
      ["Date Range", query.dateRange || "18-25 June 2025"],
      ["Operational Area", query.operationalArea || "All areas"],
      ["Skill Group", query.skillGroup || "All skills"],
      [],
      ["Metric", "Value"],
      ["Tasks Completed", String(data.analytics.tasksCompleted)],
      ["Volunteer Hours", String(data.analytics.volunteerHours)],
      ["Acceptance Rate", `${data.analytics.acceptanceRate}%`],
      ["Incident-free Shifts", `${data.analytics.incidentFreeRate}%`],
      [],
      ["Skill Group", "Volunteer Hours", "Percentage"],
      ...data.skillData.map((s) => [s.name, String(s.hours), `${s.percentage ?? 0}%`]),
    ];

    const csv = rows
      .map((row) => row.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  },

  async exportReportItem(id: number, query: VolunteerReportsQueryDto = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query.dateRange) params.append("dateRange", query.dateRange);
      if (query.operationalArea) params.append("operationalArea", query.operationalArea);
      if (query.skillGroup) params.append("skillGroup", query.skillGroup);

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";
      const res = await fetch(`${API_BASE_URL}/volunteer/reports/library/${id}/export?${params.toString()}`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const report = defaultReports.find((r) => r.id === id) || {
      id,
      title: "Operational Report",
      category: "General",
    };

    const rows = [
      [`CareLink Report: ${report.title}`],
      ["Category", report.category],
      ["Date Range", query.dateRange || "18-25 June 2025"],
      ["Area", query.operationalArea || "All areas"],
      ["Skill Group", query.skillGroup || "All skills"],
      [],
      ["Record ID", "Item Name", "Status", "Volunteer Assigned", "Hours"],
      ["REC-001", `${report.title} Item 1`, "Completed", "Elena Rossi", "18"],
      ["REC-002", `${report.title} Item 2`, "Completed", "Daniel Okafor", "24"],
      ["REC-003", `${report.title} Item 3`, "Completed", "Lin Wei", "12"],
    ];

    const csv = rows
      .map((row) => row.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  },
};
