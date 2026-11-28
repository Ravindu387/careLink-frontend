import { authFetch } from "./api";
/**
 * Operation Dashboard Service
 * Connects the Emergency Operations Dashboard to the CareLink .NET backend.
 */

export interface DashboardKpi {
  title: string;
  value: string;
  detail: string;
  icon: string;
  color: "red" | "blue" | "amber" | "green" | "purple" | string;
  category?: string;
  numericValue?: number | null;
}

export interface ActiveCrisisBriefing {
  id: string;
  title: string;
  severity: string;
  level: number;
  activeSince: string;
  affectedDistrictsCount: number;
  leadAgency: string;
  nextBriefing: string;
  nextBriefingTime: string;
}

export interface WeeklyRequestTrend {
  day: string;
  received: number;
  fulfilled: number;
  date?: string | null;
}

export interface RecentActivity {
  id: string;
  title: string;
  location: string;
  district: string;
  time: string;
  status: "New" | "In Progress" | "Completed" | "Pending" | "Escalated" | string;
  timestamp: string;
  referenceId?: string | null;
}

export interface UpcomingBriefing {
  id: string;
  title: string;
  time: string;
  scheduledAt?: string | null;
  leadOrganisation: string;
  location: string;
  attendeesCount: number;
}

export interface OperationDashboardData {
  crisis: ActiveCrisisBriefing;
  kpis: DashboardKpi[];
  weeklyTrends: WeeklyRequestTrend[];
  recentActivities: RecentActivity[];
  upcomingBriefings: UpcomingBriefing[];
  activeOperationalPointsCount: number;
  lastSyncedAt: string;
}

export interface CreateActivityPayload {
  title: string;
  location: string;
  district?: string;
  status?: string;
  referenceId?: string;
}

export interface LogIncidentPayload {
  title: string;
  district: string;
  location: string;
  severity: "Critical" | "Major" | "Moderate" | "Minor" | string;
}

const FALLBACK_DATA: OperationDashboardData = {
  crisis: {
    id: "CR-2025-001",
    title: "Monsoon Floods 2025",
    severity: "SEVERITY 4 - MAJOR",
    level: 4,
    activeSince: "Active since 18 Jun · 4 districts affected",
    affectedDistrictsCount: 4,
    leadAgency: "National Disaster Authority",
    nextBriefing: "14:30 · in 42 min",
    nextBriefingTime: "14:30",
  },
  kpis: [
    {
      title: "Active crisis events",
      value: "3",
      detail: "1 severity level 4",
      icon: "AlertTriangle",
      color: "red",
    },
    {
      title: "Open requests",
      value: "1,284",
      detail: "86 today",
      icon: "Inbox",
      color: "blue",
    },
    {
      title: "Critical priority",
      value: "47",
      detail: "12 overdue",
      icon: "TrendingUp",
      color: "red",
    },
    {
      title: "Available resources",
      value: "68%",
      detail: "3 critical shortages",
      icon: "Package",
      color: "amber",
    },
    {
      title: "Active shelters",
      value: "38",
      detail: "8,642 people",
      icon: "Home",
      color: "green",
    },
    {
      title: "Response teams",
      value: "126",
      detail: "84 currently deployed",
      icon: "Users",
      color: "blue",
    },
    {
      title: "AI reviews pending",
      value: "8",
      detail: "3 critical cases",
      icon: "Sparkles",
      color: "purple",
    },
    {
      title: "Avg response time",
      value: "2h 18m",
      detail: "-18 min this week",
      icon: "Clock",
      color: "green",
    },
  ],
  weeklyTrends: [
    { day: "Mon", received: 45, fulfilled: 32 },
    { day: "Tue", received: 68, fulfilled: 48 },
    { day: "Wed", received: 52, fulfilled: 39 },
    { day: "Thu", received: 82, fulfilled: 61 },
    { day: "Fri", received: 65, fulfilled: 50 },
    { day: "Sat", received: 95, fulfilled: 73 },
    { day: "Sun", received: 72, fulfilled: 58 },
  ],
  recentActivities: [
    {
      id: "ACT-01",
      title: "Emergency shelter request received",
      location: "Riverside, North Ward",
      district: "North Ward",
      time: "5 minutes ago",
      status: "New",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      referenceId: "REQ-2841",
    },
    {
      id: "ACT-02",
      title: "Response team deployed",
      location: "Old Town, Central Ward",
      district: "Central Ward",
      time: "18 minutes ago",
      status: "In Progress",
      timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      referenceId: "TEAM-024",
    },
    {
      id: "ACT-03",
      title: "Resource allocation completed",
      location: "Port Industrial, Eastbank",
      district: "Eastbank",
      time: "32 minutes ago",
      status: "Completed",
      timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      referenceId: "DEP-104",
    },
  ],
  upcomingBriefings: [
    {
      id: "BRF-01",
      title: "Emergency coordination briefing",
      time: "Today · 14:30",
      scheduledAt: new Date(Date.now() + 42 * 60 * 1000).toISOString(),
      leadOrganisation: "National Disaster Authority",
      location: "Operations Command Room & Virtual Bridge",
      attendeesCount: 24,
    },
  ],
  activeOperationalPointsCount: 342,
  lastSyncedAt: new Date().toISOString(),
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";
const ENDPOINT = `${API_BASE}/api/operation-dashboard`;

export const operationDashboardService = {
  async getDashboard(): Promise<OperationDashboardData> {
    try {
      const response = await authFetch(ENDPOINT, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Using fallback operation dashboard data:", err);
      return FALLBACK_DATA;
    }
  },

  async getKpis(): Promise<DashboardKpi[]> {
    try {
      const response = await authFetch(`${ENDPOINT}/kpis`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch KPIs: ${response.status}`);
      }
      return await response.json();
    } catch {
      return FALLBACK_DATA.kpis;
    }
  },

  async getTrends(): Promise<WeeklyRequestTrend[]> {
    try {
      const response = await authFetch(`${ENDPOINT}/trends`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch trends: ${response.status}`);
      }
      return await response.json();
    } catch {
      return FALLBACK_DATA.weeklyTrends;
    }
  },

  async getActivities(limit = 10): Promise<RecentActivity[]> {
    try {
      const response = await authFetch(`${ENDPOINT}/activities?limit=${limit}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }
      return await response.json();
    } catch {
      return FALLBACK_DATA.recentActivities;
    }
  },

  async addActivity(payload: CreateActivityPayload): Promise<RecentActivity> {
    const response = await authFetch(`${ENDPOINT}/activities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to log activity: ${response.status}`);
    }

    return await response.json();
  },

  async logQuickIncident(payload: LogIncidentPayload): Promise<RecentActivity> {
    const response = await authFetch(`${ENDPOINT}/incident`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to log quick incident: ${response.status}`);
    }

    return await response.json();
  },

  async getBriefings(): Promise<UpcomingBriefing[]> {
    try {
      const response = await authFetch(`${ENDPOINT}/briefings`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch briefings: ${response.status}`);
      }
      return await response.json();
    } catch {
      return FALLBACK_DATA.upcomingBriefings;
    }
  },

  async reset(): Promise<boolean> {
    const response = await authFetch(`${ENDPOINT}/reset`, {
      method: "POST",
      headers: { Accept: "application/json" },
    });
    return response.ok;
  },
};
