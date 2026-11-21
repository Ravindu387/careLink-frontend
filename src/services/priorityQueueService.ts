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
    applicant: "M. Rasheed - 3 people",
    location: "Eastbank, Sector 2",
    priority: "High",
    aiPriority: "High",
    confidence: "87% confidence",
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "49 min",
    status: "Submitted",
    event: "Flood Response",
    minutes: 49,
    createdAt: new Date(Date.now() - 49 * 60000).toISOString(),
  },
  {
    id: "REQ-2821",
    category: "Rescue assistance",
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
