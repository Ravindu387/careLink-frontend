export interface PartnerReport {
  id: string;
  title: string;
  type: string;
  owner: string;
  period: string;
  submitted: string;
  status: string;
  progress: number;
  description?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeeklyReach {
  day: string;
  planned: number;
  reached: number;
}

export interface PerformanceTarget {
  title: string;
  target: string;
  value: number;
}

export interface ReportingSchedule {
  name: string;
  deadline: string;
  status: string;
}

export interface DailyReportReminder {
  title: string;
  deadline: string;
  subtitle: string;
  progress: number;
}

export interface PartnerReportsAnalytics {
  reportsSubmitted: string;
  onTimeRate: string;
  onTimeTrend: string;
  peopleReached: string;
  peopleReachedSubtitle: string;
  nextDeadline: string;
  nextDeadlineSubtitle: string;
  reminder: DailyReportReminder;
  weeklyReach: WeeklyReach[];
  performanceTargets: PerformanceTarget[];
  schedules: ReportingSchedule[];
  totalReports: number;
  needsActionCount: number;
  activeCount: number;
  completedCount: number;
  archivedCount: number;
  lastUpdated: string;
}

export interface CreatePartnerReportPayload {
  title: string;
  type: string;
  owner: string;
  period: string;
  status?: string;
  progress?: number;
  description?: string;
}

export interface UpdatePartnerReportPayload {
  title?: string;
  type?: string;
  owner?: string;
  period?: string;
  status?: string;
  progress?: number;
  description?: string;
}

export interface PartnerReportFilters {
  search?: string;
  tab?: string;
  type?: string;
  status?: string;
}

const API_BASE_URL = "/api/partner-reports";

class PartnerReportService {
  private fallbackReports: PartnerReport[] = [
    {
      id: "RPT-1042",
      title: "Daily Partner Activity Report",
      type: "Daily Report",
      owner: "Sara Khan",
      period: "22 Jun 2025",
      submitted: "22 Jun - 12:18",
      status: "Submitted",
      progress: 100,
      description: "Comprehensive overview of daily field distributions and WASH station visits across flood-affected zones.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "RPT-1038",
      title: "Food Distribution Progress Report",
      type: "Operational Report",
      owner: "Michael Torres",
      period: "21 Jun 2025",
      submitted: "21 Jun - 17:30",
      status: "Approved",
      progress: 100,
      description: "Summary of dry rations and nutritional supplement delivery to 420 displaced households in Zone 3.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "RPT-1034",
      title: "WASH Activity Report",
      type: "Sector Report",
      owner: "Nadia Silva",
      period: "20 Jun 2025",
      submitted: "20 Jun - 15:10",
      status: "Under Review",
      progress: 82,
      description: "Water purification unit setup and chlorine testing report across 5 emergency shelter camps.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "RPT-1029",
      title: "Shelter Assessment Report",
      type: "Assessment Report",
      owner: "Sara Khan",
      period: "19 Jun 2025",
      submitted: "19 Jun - 14:00",
      status: "Draft",
      progress: 65,
      description: "Structural damage and tarp repair evaluations across Northern Sector riverbank informal shelters.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "RPT-1020",
      title: "Nutrition Screening Report",
      type: "Sector Report",
      owner: "Michael Torres",
      period: "18 Jun 2025",
      submitted: "18 Jun - 11:20",
      status: "Approved",
      progress: 100,
      description: "MUAC assessment findings for 350 children under age 5 in community evacuation centers.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "RPT-1015",
      title: "Initial Rapid Assessment",
      type: "Assessment Report",
      owner: "Nadia Silva",
      period: "17 Jun 2025",
      submitted: "17 Jun - 09:45",
      status: "Archived",
      progress: 100,
      description: "Baseline multi-cluster initial emergency evaluation following river overflow incident.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private fallbackAnalytics: PartnerReportsAnalytics = {
    reportsSubmitted: "28",
    onTimeRate: "96%",
    onTimeTrend: "↑ 4% this month",
    peopleReached: "18.6K",
    peopleReachedSubtitle: "Across 4 sectors",
    nextDeadline: "4h 12m",
    nextDeadlineSubtitle: "Daily activity report",
    reminder: {
      title: "Daily Partner Activity Report · Monsoon Floods 2025",
      deadline: "DUE TODAY - 18:00",
      subtitle: "Progress saved · 82% complete · 3 sections require review",
      progress: 82,
    },
    weeklyReach: [
      { day: "Mon", planned: 3200, reached: 2800 },
      { day: "Tue", planned: 5400, reached: 4200 },
      { day: "Wed", planned: 7600, reached: 6800 },
      { day: "Thu", planned: 9200, reached: 8200 },
    ],
    performanceTargets: [
      { title: "Referral acceptance", target: "Target 90%", value: 92 },
      { title: "Resource delivery", target: "Target 95%", value: 88 },
      { title: "Shelter coverage", target: "Target 85%", value: 96 },
      { title: "Field activity completion", target: "Target 90%", value: 82 },
    ],
    schedules: [
      {
        name: "Daily Partner Activity Report",
        deadline: "Every day · 18:00",
        status: "Due today",
      },
      {
        name: "Weekly Operational Report",
        deadline: "Every Friday · 16:00",
        status: "Upcoming",
      },
      {
        name: "Monthly Performance Report",
        deadline: "Last day of month",
        status: "Upcoming",
      },
    ],
    totalReports: 6,
    needsActionCount: 2,
    activeCount: 2,
    completedCount: 3,
    archivedCount: 1,
    lastUpdated: new Date().toISOString(),
  };

  public async getAll(filters?: PartnerReportFilters): Promise<PartnerReport[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.tab && filters.tab !== "All") params.append("tab", filters.tab);
      if (filters?.type && filters.type !== "All report types") params.append("type", filters.type);
      if (filters?.status && filters.status !== "All statuses") params.append("status", filters.status);

      const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch partner reports: ${res.statusText}`);
      }
      return await res.json();
    } catch {
      let filtered = [...this.fallbackReports];
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.id.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q) ||
            r.owner.toLowerCase().includes(q)
        );
      }
      if (filters?.tab && filters.tab !== "All") {
        if (filters.tab === "Needs action" || filters.tab === "Active") {
          filtered = filtered.filter((r) => ["Draft", "Under Review"].includes(r.status));
        } else if (filters.tab === "Completed") {
          filtered = filtered.filter((r) => ["Submitted", "Approved"].includes(r.status));
        } else if (filters.tab === "Archived") {
          filtered = filtered.filter((r) => r.status === "Archived");
        }
      }
      if (filters?.type && filters.type !== "All report types") {
        filtered = filtered.filter((r) => r.type === filters.type);
      }
      if (filters?.status && filters.status !== "All statuses") {
        filtered = filtered.filter((r) => r.status === filters.status);
      }
      return filtered;
    }
  }

  public async getAnalytics(): Promise<PartnerReportsAnalytics> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics`);
      if (!res.ok) {
        throw new Error(`Failed to fetch reports analytics: ${res.statusText}`);
      }
      return await res.json();
    } catch {
      return this.fallbackAnalytics;
    }
  }

  public async getById(id: string): Promise<PartnerReport | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch report ${id}`);
      }
      return await res.json();
    } catch {
      return this.fallbackReports.find((r) => r.id === id) || null;
    }
  }

  public async create(payload: CreatePartnerReportPayload): Promise<PartnerReport> {
    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Failed to create report: ${res.statusText}`);
      }
      return await res.json();
    } catch {
      const newReport: PartnerReport = {
        id: `RPT-${Math.floor(1000 + Math.random() * 9000)}`,
        title: payload.title,
        type: payload.type,
        owner: payload.owner,
        period: payload.period,
        submitted: payload.status === "Submitted" ? "Just now" : "Not submitted",
        status: payload.status || "Draft",
        progress: payload.progress || 0,
        description: payload.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.fallbackReports.unshift(newReport);
      return newReport;
    }
  }

  public async update(id: string, payload: UpdatePartnerReportPayload): Promise<PartnerReport> {
    try {
      const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Failed to update report ${id}`);
      }
      return await res.json();
    } catch {
      const index = this.fallbackReports.findIndex((r) => r.id === id);
      if (index >= 0) {
        this.fallbackReports[index] = {
          ...this.fallbackReports[index],
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        return this.fallbackReports[index];
      }
      throw new Error(`Report ${id} not found`);
    }
  }

  public async updateStatus(id: string, status: string): Promise<PartnerReport> {
    try {
      const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update status for report ${id}`);
      }
      return await res.json();
    } catch {
      const index = this.fallbackReports.findIndex((r) => r.id === id);
      if (index >= 0) {
        this.fallbackReports[index] = {
          ...this.fallbackReports[index],
          status,
          updatedAt: new Date().toISOString(),
        };
        return this.fallbackReports[index];
      }
      throw new Error(`Report ${id} not found`);
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch {
      const index = this.fallbackReports.findIndex((r) => r.id === id);
      if (index >= 0) {
        this.fallbackReports.splice(index, 1);
        return true;
      }
      return false;
    }
  }

  public async reset(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/reset`, {
        method: "POST",
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const partnerReportService = new PartnerReportService();
