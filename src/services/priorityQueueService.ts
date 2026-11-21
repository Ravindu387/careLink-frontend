/**
 * Priority Queue Service
 * Connects the Emergency Coordinator Priority Queue view to the CareLink .NET backend.
 */

export interface PriorityQueueItem {
  id: string;
  category: string;
  location: string;
  crisisEvent: string;
  reported: string;
  priority: string;
  priorityLevel: "Critical" | "High" | "Medium" | "Low" | string;
  confidence: number;
  verification: string;
  assigned: string;
  age: string;
  status: "Under Review" | "Assigned" | "Submitted" | "In Progress" | "Escalated" | "Completed" | string;
  overdue: boolean;
  description?: string | null;
  affectedPeopleCount?: number;
  hasVulnerableMembers?: boolean;
  isLifeThreatening?: boolean;
  createdAt: string;
  assignedAt?: string | null;
}

export interface PriorityQueueMetrics {
  totalCount: number;
  unassignedCount: number;
  overdueCount: number;
  potentialDuplicatesCount: number;
  criticalOrOverdueRequiringAttentionCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  lastUpdated: string;
}

export interface SlaPolicy {
  level: string;
  time: string;
  targetMinutes: number;
  color: string;
  description: string;
}

export interface CreatePriorityRequestPayload {
  category: string;
  location: string;
  crisisEvent?: string;
  priority?: string;
  priorityLevel?: string;
  confidence?: number;
  assigned?: string;
  verification?: string;
  description?: string;
  affectedPeopleCount?: number;
}

export interface PriorityFilterParams {
  search?: string;
  tab?: string;
  crisisEvent?: string;
  priority?: string;
  category?: string;
  status?: string;
  organisation?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedPriorityQueueResponse {
  items: PriorityQueueItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const FALLBACK_METRICS: PriorityQueueMetrics = {
  totalCount: 1284,
  unassignedCount: 63,
  overdueCount: 12,
  potentialDuplicatesCount: 9,
  criticalOrOverdueRequiringAttentionCount: 12,
  criticalCount: 4,
  highCount: 8,
  mediumCount: 4,
  lowCount: 2,
  lastUpdated: new Date().toISOString(),
};

const FALLBACK_POLICIES: SlaPolicy[] = [
  {
    level: "Critical",
    time: "Immediate response",
    targetMinutes: 15,
    color: "bg-red-100 text-red-700",
    description: "Life-threatening triage or critical structural/rescue emergency requiring urgent dispatch.",
  },
  {
    level: "High",
    time: "Within 30 minutes",
    targetMinutes: 30,
    color: "bg-amber-100 text-amber-700",
    description: "Urgent medical supplies, displaced families, or potable water crisis.",
  },
  {
    level: "Medium",
    time: "Within 2 hours",
    targetMinutes: 120,
    color: "bg-sky-100 text-sky-700",
    description: "Accessible transport, secondary shelter allocation, and non-emergency field kit delivery.",
  },
  {
    level: "Low",
    time: "Within 24 hours",
    targetMinutes: 1440,
    color: "bg-slate-100 text-slate-700",
    description: "Standard humanitarian coordination, welfare checks, and administrative records.",
  },
];

const FALLBACK_DATA: PriorityQueueItem[] = [
  {
    id: "REQ-2841",
    category: "Emergency shelter",
    location: "Riverside, North Ward",
    crisisEvent: "Monsoon Floods 2025",
    reported: "12 min ago",
    priority: "Critical · 94%",
    priorityLevel: "Critical",
    confidence: 94,
    verification: "Evidence pending",
    assigned: "Unassigned",
    age: "18 min",
    status: "Under Review",
    overdue: true,
    description: "Ground floor flooding, 4 adults and 2 children displaced. Requires urgent shelter allocation.",
    affectedPeopleCount: 6,
    hasVulnerableMembers: true,
    isLifeThreatening: true,
import { request } from "./api";
import type {
  PriorityCase,
  PriorityQueueStatsDto,
  PriorityQueueQueryDto,
  ClaimPriorityCasesRequest,
  UpdatePriorityCaseRequest,
  PaginatedResult,
} from "../types/priorityQueue";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const initialCases: PriorityCase[] = [
  {
    id: "REQ-2841",
    category: "Emergency shelter",
    applicant: "D. Jayawardena - 6 people",
    location: "Riverside, North Ward",
    priority: "Critical",
    aiPriority: "Critical",
    confidence: "94% confidence",
    verification: "Evidence pending",
    assigned: "You",
    age: "18 min",
    status: "Under Review",
    event: "Flood Response",
    minutes: 18,
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: "REQ-2839",
    category: "Medical supplies",
    location: "Old Town, Sector 4",
    crisisEvent: "Monsoon Floods 2025",
    reported: "26 min ago",
    priority: "High · 91%",
    priorityLevel: "High",
    confidence: 91,
    verification: "Verified",
    assigned: "Medical Team 3",
    age: "34 min",
    status: "Assigned",
    overdue: false,
    description: "Critical diabetic insulin depleted due to flooding. Cold storage packs required immediately.",
    affectedPeopleCount: 2,
    hasVulnerableMembers: true,
    isLifeThreatening: false,
    createdAt: new Date(Date.now() - 34 * 60000).toISOString(),
    assignedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    applicant: "Community Clinic - 48 people",
    location: "Old Town, Sector 4",
    priority: "High",
    aiPriority: "High",
    confidence: "91% confidence",
    verification: "Verified",
    assigned: "You",
    age: "34 min",
    status: "Assigned",
    event: "Flood Response",
    minutes: 34,
    createdAt: new Date(Date.now() - 34 * 60000).toISOString(),
  },
  {
    id: "REQ-2836",
    category: "Food & water",
    location: "Eastbank, Sector 2",
    crisisEvent: "Monsoon Floods 2025",
    reported: "41 min ago",
    priority: "High · 87%",
    priorityLevel: "High",
    confidence: 87,
    applicant: "M. Rasheed - 3 people",
    location: "Eastbank, Sector 2",
    priority: "High",
    aiPriority: "High",
    confidence: "87% confidence",
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "49 min",
    status: "Submitted",
    overdue: false,
    description: "Family of 5 stranded on upper level with contaminated water supply. Urgent potable water needed.",
    affectedPeopleCount: 5,
    hasVulnerableMembers: false,
    isLifeThreatening: false,
    event: "Flood Response",
    minutes: 49,
    createdAt: new Date(Date.now() - 49 * 60000).toISOString(),
  },
  {
    id: "REQ-2821",
    category: "Rescue assistance",
    location: "North Ward",
    crisisEvent: "Monsoon Floods 2025",
    reported: "1 hr ago",
    priority: "Critical · 96%",
    priorityLevel: "Critical",
    confidence: 96,
    verification: "Verified",
    assigned: "Rescue Unit 2",
    age: "1h 34m",
    status: "Escalated",
    overdue: true,
    description: "Rising fast water at canal embankment. 3 citizens trapped on roof.",
    affectedPeopleCount: 3,
    hasVulnerableMembers: true,
    isLifeThreatening: true,
    createdAt: new Date(Date.now() - 94 * 60000).toISOString(),
    assignedAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: "REQ-2828",
    category: "Accessible transport",
    location: "Central Ward",
    crisisEvent: "Monsoon Floods 2025",
    reported: "1 hr ago",
    priority: "Medium · 82%",
    priorityLevel: "Medium",
    confidence: 82,
    verification: "Verified",
    assigned: "Mobility Team",
    age: "1h 12m",
    status: "In Progress",
    overdue: false,
    description: "Wheelchair user evacuation needed from ground floor flat. Specialized vehicle required.",
    affectedPeopleCount: 1,
    hasVulnerableMembers: true,
    isLifeThreatening: false,
    createdAt: new Date(Date.now() - 72 * 60000).toISOString(),
    assignedAt: new Date(Date.now() - 40 * 60000).toISOString(),
  },
  {
    id: "REQ-2819",
    category: "Medical supplies",
    location: "West District",
    crisisEvent: "Dengue Outbreak",
    reported: "2 hrs ago",
    priority: "High · 89%",
    priorityLevel: "High",
    confidence: 89,
    verification: "Verified",
    assigned: "Medical Team 2",
    age: "2h 10m",
    status: "Assigned",
    overdue: false,
    description: "Rapid diagnostic test kits and oral rehydration solution request for community center.",
    affectedPeopleCount: 40,
    hasVulnerableMembers: true,
    isLifeThreatening: false,
    createdAt: new Date(Date.now() - 130 * 60000).toISOString(),
    assignedAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: "REQ-2815",
    category: "Food & water",
    location: "Eastbank",
    crisisEvent: "Monsoon Floods 2025",
    reported: "3 hrs ago",
    priority: "High · 85%",
    priorityLevel: "High",
    confidence: 85,
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "3h 20m",
    status: "Submitted",
    overdue: true,
    description: "Community kitchen depleted of dry food rations for 120 flood evacuees.",
    affectedPeopleCount: 120,
    hasVulnerableMembers: false,
    isLifeThreatening: false,
    createdAt: new Date(Date.now() - 200 * 60000).toISOString(),
  },
  {
    id: "REQ-2808",
    category: "Emergency shelter",
    location: "Central Ward",
    crisisEvent: "Monsoon Floods 2025",
    reported: "4 hrs ago",
    priority: "Medium · 72%",
    priorityLevel: "Medium",
    confidence: 72,
    verification: "Verified",
    assigned: "Shelter Team 1",
    age: "4h 15m",
    status: "Completed",
    overdue: false,
    description: "Bedding and hygiene kits requested for community school refuge point.",
    affectedPeopleCount: 35,
    hasVulnerableMembers: false,
    isLifeThreatening: false,
    createdAt: new Date(Date.now() - 255 * 60000).toISOString(),
    assignedAt: new Date(Date.now() - 230 * 60000).toISOString(),
  },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";
const ENDPOINT = `${API_BASE}/api/priority-queue`;

export const priorityQueueService = {
  async getAll(params?: PriorityFilterParams): Promise<PriorityQueueItem[]> {
    try {
      const url = new URL(ENDPOINT);
      if (params) {
        if (params.search) url.searchParams.set("search", params.search);
        if (params.tab && params.tab !== "All requests") {
          url.searchParams.set("tab", params.tab);
        }
        if (params.crisisEvent && params.crisisEvent !== "All crisis events") {
          url.searchParams.set("crisisEvent", params.crisisEvent);
        }
        if (params.priority && params.priority !== "All priorities") {
          url.searchParams.set("priority", params.priority);
        }
        if (params.category && params.category !== "All categories") {
          url.searchParams.set("category", params.category);
        }
        if (params.status && params.status !== "All statuses") {
          url.searchParams.set("status", params.status);
        }
        if (params.organisation && params.organisation !== "All organisations") {
          url.searchParams.set("organisation", params.organisation);
        }
      }

      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch priority queue: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn("Using fallback priority queue data:", err);
      let list = [...FALLBACK_DATA];
      if (params) {
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter((i) =>
            [i.id, i.category, i.location, i.assigned, i.description || ""]
              .join(" ")
              .toLowerCase()
              .includes(s)
          );
        }
        if (params.tab === "Unassigned") {
          list = list.filter((i) => i.assigned === "Unassigned");
        } else if (params.tab === "Overdue") {
          list = list.filter((i) => i.overdue || i.status === "Escalated");
        } else if (params.tab === "Potential duplicates") {
          list = list.filter((i) => i.id === "REQ-2836");
        }
      }
      return list;
    }
  },

  async getPaged(params: PriorityFilterParams): Promise<PagedPriorityQueueResponse> {
    try {
      const url = new URL(`${ENDPOINT}/paged`);
      if (params.search) url.searchParams.set("search", params.search);
      if (params.tab && params.tab !== "All requests") {
        url.searchParams.set("tab", params.tab);
      }
      if (params.crisisEvent && params.crisisEvent !== "All crisis events") {
        url.searchParams.set("crisisEvent", params.crisisEvent);
      }
      if (params.priority && params.priority !== "All priorities") {
        url.searchParams.set("priority", params.priority);
      }
      if (params.category && params.category !== "All categories") {
        url.searchParams.set("category", params.category);
      }
      if (params.status && params.status !== "All statuses") {
        url.searchParams.set("status", params.status);
      }
      if (params.organisation && params.organisation !== "All organisations") {
        url.searchParams.set("organisation", params.organisation);
      }
      if (params.page) url.searchParams.set("page", String(params.page));
      if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch paged priority queue: ${response.status}`);
      }

      return await response.json();
    } catch {
      const all = await this.getAll(params);
      const page = params.page || 1;
      const pageSize = params.pageSize || 5;
      const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
      const items = all.slice((page - 1) * pageSize, page * pageSize);
      return {
        items,
        totalCount: all.length,
        page,
        pageSize,
        totalPages,
      };
    }
  },

  async getMetrics(): Promise<PriorityQueueMetrics> {
    try {
      const response = await fetch(`${ENDPOINT}/metrics`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Using fallback priority queue metrics:", err);
      return FALLBACK_METRICS;
    }
  },

  async getSlaPolicies(): Promise<SlaPolicy[]> {
    try {
      const response = await fetch(`${ENDPOINT}/sla-policy`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch SLA policies: ${response.status}`);
      }
      return await response.json();
    } catch {
      return FALLBACK_POLICIES;
    }
  },

  async getById(id: string): Promise<PriorityQueueItem> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      const found = FALLBACK_DATA.find((r) => r.id === id);
      if (found) return found;
      throw new Error(`Failed to fetch priority request ${id}: ${response.status}`);
    }
    return await response.json();
  },

  async create(payload: CreatePriorityRequestPayload): Promise<PriorityQueueItem> {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create priority request: ${response.status}`);
    }

    return await response.json();
  },

  async assignTeam(id: string, assignedTeam: string): Promise<PriorityQueueItem> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ assignedTeam }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to assign team: ${response.status}`);
    }

    return await response.json();
  },

  async updateStatus(id: string, status: string): Promise<PriorityQueueItem> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update status: ${response.status}`);
    }

    return await response.json();
  },

  async updatePriority(
    id: string,
    priorityLevel: string,
    confidence?: number,
    reason?: string
  ): Promise<PriorityQueueItem> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}/priority`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ priorityLevel, confidence, reason }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update priority: ${response.status}`);
    }

    return await response.json();
  },

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete priority request: ${response.status}`);
    }

    return response.ok;
  },

  async reset(): Promise<void> {
    const response = await fetch(`${ENDPOINT}/reset`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Failed to reset priority queue: ${response.status}`);
    }
    applicant: "P. Nadarajah - 5 people",
    location: "North Ward",
    priority: "Critical",
    aiPriority: "Critical",
    confidence: "96% confidence",
    verification: "Verified",
    assigned: "You",
    age: "1h 34m",
    status: "Escalated",
    event: "Storm Response",
    minutes: 94,
    createdAt: new Date(Date.now() - 94 * 60000).toISOString(),
  },
  {
    id: "REQ-2814",
    category: "Medicine",
    applicant: "R. Perera - 1 people",
    location: "West District",
    priority: "High",
    aiPriority: "Medium",
    confidence: "74% confidence",
    verification: "Needs information",
    assigned: "Unassigned",
    age: "2h 08m",
    status: "Pending Info",
    event: "Flood Response",
    minutes: 128,
    createdAt: new Date(Date.now() - 128 * 60000).toISOString(),
  },
  {
    id: "REQ-2802",
    category: "Clean water",
    applicant: "Community Center - 60 people",
    location: "South Ward, Sector 3",
    priority: "Critical",
    aiPriority: "Critical",
    confidence: "93% confidence",
    verification: "Verified",
    assigned: "Unassigned",
    age: "45 min",
    status: "Submitted",
    event: "Flood Response",
    minutes: 45,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "REQ-2795",
    category: "Emergency shelter",
    applicant: "A. Silva - 4 people",
    location: "Lowland Ward",
    priority: "Critical",
    aiPriority: "High",
    confidence: "89% confidence",
    verification: "Evidence pending",
    assigned: "Unassigned",
    age: "52 min",
    status: "Under Review",
    event: "Storm Response",
    minutes: 52,
    createdAt: new Date(Date.now() - 52 * 60000).toISOString(),
  },
];

let fallbackCases = [...initialCases];

export const priorityQueueService = {
  async getStats(): Promise<{ data: PriorityQueueStatsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<PriorityQueueStatsDto>("/priority-queue/stats");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback
    }

    const total = fallbackCases.length;
    const critical = fallbackCases.filter((c) => c.priority === "Critical").length;
    const dueSoon = fallbackCases.filter((c) => c.minutes <= 60).length;
    const pendingInfo = fallbackCases.filter((c) => c.status === "Pending Info").length;
    const recentlyUpdated = fallbackCases.filter((c) =>
      ["Under Review", "Assigned"].includes(c.status)
    ).length;
    const overdue = fallbackCases.filter((c) => c.priority === "Critical" && c.minutes > 30).length;

    return {
      data: {
        totalCases: total,
        criticalCount: critical,
        dueSoonCount: dueSoon,
        pendingInfoCount: pendingInfo,
        recentlyUpdatedCount: recentlyUpdated,
        overdueCount: overdue,
      },
      isLiveBackend: false,
    };
  },

  async getCases(
    query: PriorityQueueQueryDto
  ): Promise<{ data: PaginatedResult<PriorityCase>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.tab) params.append("tab", query.tab);
      if (query.search) params.append("search", query.search);
      if (query.event) params.append("event", query.event);
      if (query.priority) params.append("priority", query.priority);
      if (query.category) params.append("category", query.category);
      if (query.status) params.append("status", query.status);
      if (query.dateRange) params.append("dateRange", query.dateRange);
      if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));

      const url = `/priority-queue${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<PaginatedResult<PriorityCase>>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback
    }

    let list = [...fallbackCases];

    if (query.tab && query.tab !== "All") {
      if (query.tab === "Critical") {
        list = list.filter((c) => c.priority === "Critical");
      } else if (query.tab === "Due soon") {
        list = list.filter((c) => c.minutes <= 60);
      } else if (query.tab === "Pending information") {
        list = list.filter((c) => c.status === "Pending Info");
      } else if (query.tab === "Recently updated") {
        list = list.filter((c) => ["Under Review", "Assigned"].includes(c.status));
      }
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(s) ||
          c.applicant.toLowerCase().includes(s) ||
          c.location.toLowerCase().includes(s) ||
          c.category.toLowerCase().includes(s)
      );
    }

    if (query.event && query.event !== "All crisis events") {
      list = list.filter((c) => c.event.toLowerCase() === query.event?.toLowerCase());
    }

    if (query.priority && query.priority !== "All priorities") {
      list = list.filter((c) => c.priority.toLowerCase() === query.priority?.toLowerCase());
    }

    if (query.category && query.category !== "All categories") {
      list = list.filter((c) => c.category.toLowerCase() === query.category?.toLowerCase());
    }

    if (query.status && query.status !== "All statuses") {
      list = list.filter((c) => c.status.toLowerCase() === query.status?.toLowerCase());
    }

    if (query.dateRange && query.dateRange !== "Date range" && query.dateRange !== "All time") {
      if (query.dateRange === "Last 1 hour") {
        list = list.filter((c) => c.minutes <= 60);
      } else if (query.dateRange === "Last 24 hours") {
        list = list.filter((c) => c.minutes <= 1440);
      }
    }

    list.sort((a, b) => {
      const pOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      const diff = (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2);
      if (diff !== 0) return diff;
      return a.minutes - b.minutes;
    });

    const pageNumber = query.pageNumber || 1;
    const pageSize = query.pageSize || 5;
    const totalCount = list.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const items = list.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    return {
      data: {
        items,
        totalCount,
        pageNumber,
        pageSize,
        totalPages,
      },
      isLiveBackend: false,
    };
  },

  async claimCases(
    req: ClaimPriorityCasesRequest
  ): Promise<{ data: number; isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<number>("/priority-queue/claim", {
        method: "POST",
        body: JSON.stringify(req),
      });
      if (response && response.success) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || `${response.data} case(s) claimed successfully.`,
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    let count = 0;
    fallbackCases = fallbackCases.map((c) => {
      if (req.caseIds.includes(c.id)) {
        count++;
        return {
          ...c,
          assigned: req.assignTo || "You",
          status: "Assigned",
        };
      }
      return c;
    });

    return {
      data: count,
      isLiveBackend: false,
      message: `${count} case(s) claimed in demo mode.`,
    };
  },

  async updateCase(
    id: string,
    req: UpdatePriorityCaseRequest
  ): Promise<{ data: PriorityCase; isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<PriorityCase>(`/priority-queue/${id}`, {
        method: "PATCH",
        body: JSON.stringify(req),
      });
      if (response && response.success && response.data) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || `Case ${id} updated successfully.`,
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    const idx = fallbackCases.findIndex((c) => c.id === id);
    if (idx !== -1) {
      fallbackCases[idx] = {
        ...fallbackCases[idx],
        priority: req.priority || fallbackCases[idx].priority,
        status: req.status || fallbackCases[idx].status,
        assigned: req.assigned || fallbackCases[idx].assigned,
        notes: req.notes || fallbackCases[idx].notes,
      };
      return {
        data: fallbackCases[idx],
        isLiveBackend: false,
        message: `Case ${id} updated in demo mode.`,
      };
    }

    throw new Error(`Case ${id} not found.`);
  },

  async downloadExportCsv(query: PriorityQueueQueryDto): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (query.tab) params.append("tab", query.tab);
      if (query.search) params.append("search", query.search);
      if (query.event) params.append("event", query.event);
      if (query.priority) params.append("priority", query.priority);
      if (query.category) params.append("category", query.category);
      if (query.status) params.append("status", query.status);
      if (query.dateRange) params.append("dateRange", query.dateRange);

      const url = `${API_BASE_URL}/priority-queue/export?${params.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `carelink-priority-queue-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return;
      }
    } catch {
      // Backend export failed; fallback to client export
    }

    const headers = [
      "Case ID",
      "Category",
      "Applicant",
      "Location",
      "Priority",
      "AI Priority",
      "Confidence",
      "Verification",
      "Assigned",
      "Age",
      "Status",
      "Event",
    ];

    const rows = fallbackCases.map((item) => [
      item.id,
      item.category,
      item.applicant,
      item.location,
      item.priority,
      item.aiPriority,
      item.confidence,
      item.verification,
      item.assigned,
      item.age,
      item.status,
      item.event,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carelink-priority-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
