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
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "49 min",
    status: "Submitted",
    overdue: false,
    description: "Family of 5 stranded on upper level with contaminated water supply. Urgent potable water needed.",
    affectedPeopleCount: 5,
    hasVulnerableMembers: false,
    isLifeThreatening: false,
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
  },
};
