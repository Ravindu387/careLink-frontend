import { request, authFetch } from "./api";
import type {
  EscalatedCase,
  EscalationStatsDto,
  EscalatedQueryDto,
  BulkEscalationActionRequest,
  EscalationDecisionRequest,
  PaginatedResult,
} from "../types/escalatedCases";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const fallbackCases: EscalatedCase[] = [
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
    escalationReason: "River embankment breach; rapid water level surge.",
    targetOrg: "District Disaster Management Center",
    coordinatorNotes: "Requires immediate multi-family temporary shelter placement.",
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
    escalationReason: "High-voltage line fallen near flooded dwelling; naval boat access requested.",
    targetOrg: "Navy Search & Rescue Unit",
    coordinatorNotes: "Safety hazard verified by local field observer.",
  },
  {
    id: "REQ-2835",
    category: "Medical supplies",
    applicant: "H. Silva - 4 people",
    location: "Old Town, Sector 4",
    priority: "Critical",
    aiPriority: "Critical",
    confidence: "91% confidence",
    verification: "Verified",
    assigned: "Coordinator Team",
    age: "32 min",
    status: "Escalated",
    event: "Flood Response",
    minutes: 32,
    escalationReason: "Power outage affecting clinic oxygen and refrigeration supplies.",
    targetOrg: "Red Cross Logistics",
    coordinatorNotes: "Generator backup requested urgently.",
  },
  {
    id: "REQ-2819",
    category: "Emergency shelter",
    applicant: "N. Fernando - 8 people",
    location: "Eastbank, Sector 3",
    priority: "High",
    aiPriority: "High",
    confidence: "88% confidence",
    verification: "Contact verified",
    assigned: "You",
    age: "55 min",
    status: "Escalated",
    event: "Flood Response",
    minutes: 55,
    escalationReason: "Two wheelchair-bound elderly family members; requires disability-equipped shelter.",
    targetOrg: "Social Services Relief Wing",
    coordinatorNotes: "Accessible van transport mobilized.",
  },
  {
    id: "REQ-2807",
    category: "Rescue assistance",
    applicant: "B. Weerasinghe - 3 people",
    location: "Marshland, Sector 1",
    priority: "Critical",
    aiPriority: "Critical",
    confidence: "95% confidence",
    verification: "Verified",
    assigned: "Coordinator Team",
    age: "1h 12m",
    status: "Escalated",
    event: "Storm Response",
    minutes: 72,
    escalationReason: "Road access submerged by 4 feet of floodwater; trapped on upper floor.",
    targetOrg: "Armed Forces Disaster Relief",
    coordinatorNotes: "Informed rescue command center.",
  },
];

const fallbackStats: EscalationStatsDto = {
  totalEscalated: fallbackCases.length,
  criticalCount: fallbackCases.filter((c) => c.priority === "Critical").length,
  dueSoonCount: fallbackCases.filter((c) => c.minutes <= 60).length,
  pendingInfoCount: fallbackCases.filter((c) => c.verification === "Needs information" || c.status === "Pending Info").length,
  recentlyUpdatedCount: fallbackCases.filter((c) => c.status === "Under Review").length,
};

export const escalatedCasesService = {
  /**
   * Fetches escalation stats & tab counts
   */
  async getStats(): Promise<{ data: EscalationStatsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<EscalationStatsDto>("/escalatedcases/stats", {
        method: "GET",
      });
      if (response && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
      return { data: fallbackStats, isLiveBackend: false };
    } catch (err) {
      console.warn("Backend unavailable, using fallback stats:", err);
      return { data: fallbackStats, isLiveBackend: false };
    }
  },

  /**
   * Fetches paginated & filtered escalated cases
   */
  async getCases(query: EscalatedQueryDto): Promise<{ data: PaginatedResult<EscalatedCase>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.tab) params.append("tab", query.tab);
      if (query.search) params.append("search", query.search);
      if (query.event) params.append("event", query.event);
      if (query.priority) params.append("priority", query.priority);
      if (query.category) params.append("category", query.category);
      if (query.status) params.append("status", query.status);
      if (query.dateRange) params.append("dateRange", query.dateRange);
      if (query.pageNumber) params.append("pageNumber", query.pageNumber.toString());
      if (query.pageSize) params.append("pageSize", query.pageSize.toString());

      const response = await request<PaginatedResult<EscalatedCase>>(`/escalatedcases?${params.toString()}`, {
        method: "GET",
      });

      if (response && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch (err) {
      console.warn("Using local filter fallback for escalated cases:", err);
    }

    // Local filter fallback
    let filtered = [...fallbackCases];
    const tab = query.tab || "All";
    if (tab === "Critical") {
      filtered = filtered.filter((c) => c.priority === "Critical");
    } else if (tab === "Due soon") {
      filtered = filtered.filter((c) => c.minutes <= 60);
    } else if (tab === "Pending information") {
      filtered = filtered.filter((c) => c.verification === "Needs information" || c.status === "Pending Info");
    } else if (tab === "Recently updated") {
      filtered = filtered.filter((c) => c.status === "Under Review");
    }

    if (query.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.id.toLowerCase().includes(s) ||
          c.applicant.toLowerCase().includes(s) ||
          c.location.toLowerCase().includes(s) ||
          c.category.toLowerCase().includes(s)
      );
    }

    if (query.event && query.event !== "All crisis events") {
      filtered = filtered.filter((c) => c.event === query.event);
    }
    if (query.priority && query.priority !== "All priorities") {
      filtered = filtered.filter((c) => c.priority === query.priority);
    }
    if (query.category && query.category !== "All categories") {
      filtered = filtered.filter((c) => c.category === query.category);
    }
    if (query.status && query.status !== "All statuses") {
      filtered = filtered.filter((c) => c.status === query.status);
    }
    if (query.dateRange && query.dateRange !== "Date range" && query.dateRange !== "All time") {
      if (query.dateRange.includes("1 hour")) {
        filtered = filtered.filter((c) => c.minutes <= 60);
      } else if (query.dateRange.includes("24 hours")) {
        filtered = filtered.filter((c) => c.minutes <= 1440);
      }
    }

    const page = Math.max(1, query.pageNumber || 1);
    const pageSize = Math.max(1, query.pageSize || 5);
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: {
        items,
        totalCount: filtered.length,
        pageNumber: page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
      },
      isLiveBackend: false,
    };
  },

  /**
   * Performs bulk action across multiple selected cases
   */
  async bulkAction(actionReq: BulkEscalationActionRequest): Promise<number> {
    try {
      const response = await request<number>("/escalatedcases/bulk-action", {
        method: "POST",
        body: JSON.stringify(actionReq),
      });
      return response.data;
    } catch {
      // Local fallback
      fallbackCases.forEach((c) => {
        if (actionReq.caseIds.includes(c.id)) {
          if (actionReq.action === "Escalate") {
            c.status = "Escalated";
            c.priority = "Critical";
          } else if (actionReq.action === "De-escalate") {
            c.status = "Under Review";
          } else if (actionReq.action === "Resolve") {
            c.status = "Resolved";
          } else if (actionReq.action === "AssignCoordinator") {
            c.assigned = actionReq.assignTo || "Senior Coordinator";
          }
        }
      });
      return actionReq.caseIds.length;
    }
  },

  /**
   * Records coordinator decision on a case
   */
  async recordDecision(id: string, decision: EscalationDecisionRequest): Promise<EscalatedCase> {
    try {
      const response = await request<EscalatedCase>(`/escalatedcases/${id}/decision`, {
        method: "POST",
        body: JSON.stringify(decision),
      });
      return response.data;
    } catch {
      const found = fallbackCases.find((c) => c.id === id);
      if (found) {
        if (decision.action === "Resolve") found.status = "Resolved";
        if (decision.action === "Reassign") found.assigned = decision.assignTo || "You";
        if (decision.action === "RequestCrossOrg" && decision.targetOrg) found.targetOrg = decision.targetOrg;
        if (decision.notes) found.coordinatorNotes = decision.notes;
        return found;
      }
      return {
        id,
        category: "Emergency shelter",
        applicant: "Updated citizen",
        location: "Riverview",
        priority: "Critical",
        aiPriority: "Critical",
        confidence: "95%",
        verification: "Verified",
        assigned: "You",
        age: "Just now",
        status: "Resolved",
        event: "Flood Response",
        minutes: 10,
      };
    }
  },

  /**
   * Downloads CSV export
   */
  async downloadExportCsv(cases: EscalatedCase[]): Promise<void> {
    try {
      const token = localStorage.getItem("carelink_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await authFetch(`${API_BASE_URL}/escalatedcases/export`, { headers });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `carelink-escalated-cases-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // fallback
    }

    const headers = [
      "Case ID",
      "Category",
      "Applicant",
      "Location",
      "Reported Priority",
      "AI Priority",
      "Confidence",
      "Verification",
      "Assigned",
      "Age",
      "Status",
      "Crisis Event",
      "Escalation Reason",
      "Target Org",
    ];

    const rows = cases.map((item) => [
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
      item.escalationReason || "",
      item.targetOrg || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((val) => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carelink-escalated-cases-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
