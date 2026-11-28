import { authFetch } from "./api";
/**
 * Situation Report Service
 * Connects the Situation Reports interface to the CareLink .NET backend.
 */

export interface SituationReport {
  id: string; // e.g. "SITREP 024"
  title: string;
  period: string;
  status: "Approved" | "Published" | "Draft";
  preparedBy: string;
  approvedBy: string;
  recipients: number;
  event: string;
  executiveSummary?: string;
  keyHighlights?: string;
  operationalChallenges?: string;
  createdAt?: string;
  approvedAt?: string;
  publishedAt?: string;
}

export interface SituationReportMetrics {
  publishedCount: number;
  draftCount: number;
  totalRecipients: number;
  nextReportDue: string;
  nextReportId: string;
  latestApproved?: SituationReport | null;
  totalReports: number;
}

export interface SituationReportFilters {
  search?: string;
  event?: string;
  status?: string;
  dateRange?: string;
}

export interface CreateSituationReportPayload {
  title: string;
  event: string;
  period?: string;
  preparedBy?: string;
  executiveSummary?: string;
  keyHighlights?: string;
  operationalChallenges?: string;
}

export interface UpdateSituationReportStatusPayload {
  status: "Approved" | "Published" | "Draft";
  approvedBy?: string;
  recipients?: number;
}

const DEFAULT_REPORTS: SituationReport[] = [
  {
    id: "SITREP 024",
    title: "Greater Riverton Flood Response",
    period: "22 June 2025 · 08:00–12:00 UTC",
    status: "Approved",
    preparedBy: "Operations Analysis Team",
    approvedBy: "Amina Mensah",
    recipients: 48,
    event: "Monsoon Floods 2025",
    executiveSummary: "Kelani basin water levels stabilizing at 8.2m. Search and rescue operations completed in Sector 3 with 1,284 individuals evacuated safely to designated community shelters.",
  },
  {
    id: "SITREP 023",
    title: "Greater Riverton Flood Response",
    period: "22 June 2025 · 06:00–08:00 UTC",
    status: "Published",
    preparedBy: "Operations Analysis Team",
    approvedBy: "Amina Mensah",
    recipients: 48,
    event: "Monsoon Floods 2025",
    executiveSummary: "Overnight precipitation reached 142mm. Red alert flash flood warnings issued for Greater Riverton lowland zones.",
  },
  {
    id: "SITREP 022",
    title: "North Ridge Landslide Response",
    period: "21 June 2025 · 16:00–20:00 UTC",
    status: "Approved",
    preparedBy: "Emergency Coordination Team",
    approvedBy: "Amina Mensah",
    recipients: 32,
    event: "North Ridge Landslide",
    executiveSummary: "Geological surveillance team confirmed slope stabilization along arterial highway B-24.",
  },
  {
    id: "SITREP 021",
    title: "Eastbank Emergency Response",
    period: "20 June 2025 · 08:00–12:00 UTC",
    status: "Draft",
    preparedBy: "Operations Analysis Team",
    approvedBy: "Pending approval",
    recipients: 0,
    event: "Monsoon Floods 2025",
    executiveSummary: "Initial damage assessment and resource requisition compilation for Eastbank Industrial Corridor.",
  },
];

const DEFAULT_METRICS: SituationReportMetrics = {
  publishedCount: 3,
  draftCount: 1,
  totalRecipients: 128,
  nextReportDue: "2h 18m",
  nextReportId: "SITREP 025",
  latestApproved: DEFAULT_REPORTS[0],
  totalReports: 4,
};

const BASE_URL = "/api/situation-reports";

export const situationReportService = {
  async getAll(filters?: SituationReportFilters): Promise<SituationReport[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.event && filters.event !== "All crisis events") {
      params.append("event", filters.event);
    }
    if (filters?.status && filters.status !== "All report states") {
      params.append("status", filters.status);
    }
    if (filters?.dateRange && filters.dateRange !== "Date range") {
      params.append("dateRange", filters.dateRange);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    try {
      const response = await authFetch(`${BASE_URL}${query}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch {
      return DEFAULT_REPORTS.filter((r) => {
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          const match =
            r.id.toLowerCase().includes(s) ||
            r.title.toLowerCase().includes(s) ||
            r.event.toLowerCase().includes(s);
          if (!match) return false;
        }
        if (filters?.event && filters.event !== "All crisis events") {
          if (r.event !== filters.event) return false;
        }
        if (filters?.status && filters.status !== "All report states") {
          if (r.status !== filters.status) return false;
        }
        return true;
      });
    }
  },

  async getMetrics(): Promise<SituationReportMetrics> {
    try {
      const response = await authFetch(`${BASE_URL}/metrics`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch {
      return DEFAULT_METRICS;
    }
  },

  async getById(id: string): Promise<SituationReport | null> {
    try {
      const response = await authFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch {
      return DEFAULT_REPORTS.find((r) => r.id === id) || null;
    }
  },

  async create(payload: CreateSituationReportPayload): Promise<SituationReport> {
    const response = await authFetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to create situation report: ${err}`);
    }

    return await response.json();
  },

  async updateStatus(
    id: string,
    payload: UpdateSituationReportStatusPayload
  ): Promise<SituationReport> {
    const response = await authFetch(`${BASE_URL}/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to update status: ${err}`);
    }

    return await response.json();
  },

  async delete(id: string): Promise<boolean> {
    try {
      const response = await authFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  async reset(): Promise<boolean> {
    try {
      const response = await authFetch(`${BASE_URL}/reset`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
