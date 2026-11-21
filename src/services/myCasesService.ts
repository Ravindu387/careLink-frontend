import { request } from "./api";
import type {
  MyCase,
  MyCasesStatsDto,
  MyCasesQueryDto,
  CreateMyCaseRequest,
  UpdateMyCaseStatusRequest,
  BulkMyCasesActionRequest,
  PaginatedResult,
} from "../types/myCases";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const initialCases: MyCase[] = [
  {
    id: "REQ-2841",
    category: "Emergency shelter",
    applicant: "D. Jayawardena - 6 people",
    location: "Riverside, North Ward",
    priority: "Critical",
    confidence: "94% confidence",
    verification: "Evidence pending",
    assigned: "You",
    age: "18 min",
    status: "Under Review",
    event: "Flood Response",
    description: "Flood water reached lower floor. Need emergency shelter for family of 6 including infant.",
    notes: "Awaiting flood report validation from field officer.",
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: "REQ-2839",
    category: "Medical supplies",
    applicant: "Community Clinic - 48 people",
    location: "Old Town, Sector 4",
    priority: "High",
    confidence: "91% confidence",
    verification: "Verified",
    assigned: "You",
    age: "34 min",
    status: "Assigned",
    event: "Flood Response",
    description: "Urgent need for first-aid kits, insulin cooling pack, and water purification tablets.",
    notes: "Assigned to regional medical response convoy.",
    createdAt: new Date(Date.now() - 34 * 60000).toISOString(),
  },
  {
    id: "REQ-2821",
    category: "Rescue assistance",
    applicant: "P. Nadarajah - 5 people",
    location: "North Ward",
    priority: "Critical",
    confidence: "96% confidence",
    verification: "Verified",
    assigned: "You",
    age: "1h 34m",
    status: "Escalated",
    event: "Flood Response",
    description: "Trapped in building due to high water surge. Electrical line down near gate.",
    notes: "Escalated to disaster management search & rescue naval wing.",
    createdAt: new Date(Date.now() - 94 * 60000).toISOString(),
  },
  {
    id: "REQ-2818",
    category: "Food & water",
    applicant: "S. Fernando - 4 people",
    location: "Eastbank, Sector 2",
    priority: "High",
    confidence: "88% confidence",
    verification: "Verified",
    assigned: "You",
    age: "2h 15m",
    status: "Assigned",
    event: "Storm Response",
    description: "Clean drinking water supply depleted. Packaged food rations needed.",
    notes: "Dispatched from relief hub center B.",
    createdAt: new Date(Date.now() - 135 * 60000).toISOString(),
  },
  {
    id: "REQ-2805",
    category: "Emergency shelter",
    applicant: "R. Silva - 3 people",
    location: "West Ward",
    priority: "Medium",
    confidence: "85% confidence",
    verification: "Evidence pending",
    assigned: "You",
    age: "3h 20m",
    status: "Submitted",
    event: "Flood Response",
    description: "Roof partially damaged during gale winds. Tarpaulins and temporary bedding needed.",
    notes: "Verification call placed to community lead.",
    createdAt: new Date(Date.now() - 200 * 60000).toISOString(),
  },
  {
    id: "REQ-2798",
    category: "Medical supplies",
    applicant: "K. Perera - 2 people",
    location: "South Ward",
    priority: "High",
    confidence: "90% confidence",
    verification: "Verified",
    assigned: "You",
    age: "4h 10m",
    status: "Under Review",
    event: "Flood Response",
    description: "Asthma inhaler and hypertension medications required urgently.",
    notes: "Checking with local mobile pharmacy unit.",
    createdAt: new Date(Date.now() - 250 * 60000).toISOString(),
  },
];

let fallbackCases = [...initialCases];

export const myCasesService = {
  async getStats(): Promise<{ data: MyCasesStatsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<MyCasesStatsDto>("/mycases/stats");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; use fallback
    }

    const total = fallbackCases.length;
    const critical = fallbackCases.filter((c) => c.priority === "Critical").length;
    const dueSoon = fallbackCases.filter((c) => ["Critical", "High"].includes(c.priority)).length;
    const pendingInfo = fallbackCases.filter((c) => c.verification === "Evidence pending").length;
    const recentlyUpdated = fallbackCases.filter((c) =>
      ["Under Review", "Assigned"].includes(c.status)
    ).length;

    return {
      data: {
        totalCases: total,
        criticalCount: critical,
        dueSoonCount: dueSoon,
        pendingInfoCount: pendingInfo,
        recentlyUpdatedCount: recentlyUpdated,
      },
      isLiveBackend: false,
    };
  },

  async getCases(
    query: MyCasesQueryDto
  ): Promise<{ data: PaginatedResult<MyCase>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.tab) params.append("tab", query.tab);
      if (query.search) params.append("search", query.search);
      if (query.priority) params.append("priority", query.priority);
      if (query.category) params.append("category", query.category);
      if (query.status) params.append("status", query.status);
      if (query.event) params.append("event", query.event);
      if (query.dateRange) params.append("dateRange", query.dateRange);
      if (query.pageNumber) params.append("pageNumber", query.pageNumber.toString());
      if (query.pageSize) params.append("pageSize", query.pageSize.toString());

      const url = `/mycases${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<PaginatedResult<MyCase>>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; use fallback
    }

    // Filter in-memory
    let list = [...fallbackCases];

    if (query.tab && query.tab !== "All") {
      if (query.tab === "Critical") {
        list = list.filter((c) => c.priority === "Critical");
      } else if (query.tab === "Due soon") {
        list = list.filter((c) => ["Critical", "High"].includes(c.priority));
      } else if (query.tab === "Pending information") {
        list = list.filter((c) => c.verification === "Evidence pending");
      } else if (query.tab === "Recently updated") {
        list = list.filter((c) => ["Under Review", "Assigned"].includes(c.status));
      }
    }

    if (query.search && query.search.trim()) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(s) ||
          c.applicant.toLowerCase().includes(s) ||
          c.location.toLowerCase().includes(s) ||
          c.category.toLowerCase().includes(s)
      );
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

    if (query.event && query.event !== "All crisis events") {
      list = list.filter((c) => c.event.toLowerCase() === query.event?.toLowerCase());
    }

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

  async getCaseById(id: string): Promise<{ data: MyCase; isLiveBackend: boolean }> {
    try {
      const response = await request<MyCase>(`/mycases/${id}`);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; use fallback
    }

    const found = fallbackCases.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (found) {
      return { data: found, isLiveBackend: false };
    }
    throw new Error(`Case ${id} not found.`);
  },

  async createCase(
    req: CreateMyCaseRequest
  ): Promise<{ data: MyCase; isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<MyCase>("/mycases", {
        method: "POST",
        body: JSON.stringify(req),
      });
      if (response && response.success && response.data) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || "Case created successfully.",
        };
      }
    } catch {
      // Backend unavailable; use fallback
    }

    const nextNum = Math.floor(2850 + Math.random() * 50);
    const newCase: MyCase = {
      id: `REQ-${nextNum}`,
      category: req.category,
      applicant: `${req.applicantName} - ${req.peopleCount} ${req.peopleCount === 1 ? "person" : "people"}`,
      location: req.location,
      priority: req.priority,
      confidence: "95% confidence",
      verification: "Verified",
      assigned: "You",
      age: "Just now",
      status: "Assigned",
      event: req.event || "Flood Response",
      description: req.description,
      notes: "Newly created and assigned to you.",
      createdAt: new Date().toISOString(),
    };

    fallbackCases.unshift(newCase);

    return {
      data: newCase,
      isLiveBackend: false,
      message: `Case ${newCase.id} created and assigned to you (Demo Mode).`,
    };
  },

  async updateStatus(
    id: string,
    req: UpdateMyCaseStatusRequest
  ): Promise<{ data: MyCase; isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<MyCase>(`/mycases/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(req),
      });
      if (response && response.success && response.data) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || `Case ${id} status updated.`,
        };
      }
    } catch {
      // Backend unavailable; use fallback
    }

    const idx = fallbackCases.findIndex((c) => c.id === id);
    if (idx !== -1) {
      fallbackCases[idx] = {
        ...fallbackCases[idx],
        status: req.status,
        notes: req.notes || fallbackCases[idx].notes,
        priority: req.priority || fallbackCases[idx].priority,
      };
      return {
        data: fallbackCases[idx],
        isLiveBackend: false,
        message: `Case ${id} status updated to ${req.status} (Demo Mode).`,
      };
    }

    throw new Error(`Case ${id} not found.`);
  },

  async bulkAction(
    req: BulkMyCasesActionRequest
  ): Promise<{ data: number; isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<number>("/mycases/bulk-action", {
        method: "POST",
        body: JSON.stringify(req),
      });
      if (response && response.success) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || `${response.data} case(s) updated.`,
        };
      }
    } catch {
      // Backend unavailable; use fallback
    }

    let updatedCount = 0;
    fallbackCases = fallbackCases.map((c) => {
      if (req.caseIds.includes(c.id)) {
        updatedCount++;
        let newStatus = c.status;
        if (req.action === "Resolve") newStatus = "Resolved";
        else if (req.action === "Escalate") newStatus = "Escalated";
        else if (req.action === "UnderReview") newStatus = "Under Review";
        else if (req.action === "Reassign") newStatus = "Assigned";

        return {
          ...c,
          status: newStatus,
          assigned: req.assignTo || c.assigned,
          notes: req.notes ? `${c.notes ? c.notes + " | " : ""}${req.notes}` : c.notes,
        };
      }
      return c;
    });

    return {
      data: updatedCount,
      isLiveBackend: false,
      message: `${updatedCount} case(s) updated with action '${req.action}' (Demo Mode).`,
    };
  },

  async downloadExportCsv(query: MyCasesQueryDto): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (query.tab) params.append("tab", query.tab);
      if (query.search) params.append("search", query.search);
      if (query.priority) params.append("priority", query.priority);
      if (query.category) params.append("category", query.category);
      if (query.status) params.append("status", query.status);
      if (query.event) params.append("event", query.event);
      if (query.dateRange) params.append("dateRange", query.dateRange);

      const url = `${API_BASE_URL}/mycases/export?${params.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `carelink-mycases-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return;
      }
    } catch {
      // Backend export failed, fallback to client generation
    }

    // Client-side fallback export
    const headers = [
      "Case ID",
      "Category",
      "Applicant",
      "Location",
      "Priority",
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
    link.download = `carelink-mycases-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
