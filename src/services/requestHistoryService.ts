import { request } from "./api";
import type {
  HistoryEvent,
  RequestHistoryStatsDto,
  RequestHistoryQueryDto,
  LogHistoryEventRequest,
  PaginatedResult,
} from "../types/requestHistory";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const initialEvents: HistoryEvent[] = [
  {
    id: "EVT-4821",
    caseId: "REQ-2841",
    action: "Priority recommendation reviewed",
    actor: "Amina Mensah",
    change: "Critical → Critical",
    rationale: "AI rationale approved",
    timestamp: "22 Jun · 13:42",
    eventType: "Decision",
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: "EVT-4818",
    caseId: "REQ-2839",
    action: "Case assigned",
    actor: "System Queue",
    change: "Unassigned → Medical Team 3",
    rationale: "Skills and proximity",
    timestamp: "22 Jun · 13:28",
    eventType: "Assignment",
    createdAt: new Date(Date.now() - 34 * 60000).toISOString(),
  },
  {
    id: "EVT-4811",
    caseId: "REQ-2828",
    action: "Additional information received",
    actor: "Citizen Portal",
    change: "Pending → Verified",
    rationale: "Contact confirmed",
    timestamp: "22 Jun · 12:55",
    eventType: "Verification",
    createdAt: new Date(Date.now() - 65 * 60000).toISOString(),
  },
  {
    id: "EVT-4804",
    caseId: "REQ-2821",
    action: "Case escalated",
    actor: "Nadia Okafor",
    change: "High → Critical",
    rationale: "Immediate life risk",
    timestamp: "22 Jun · 12:31",
    eventType: "Escalation",
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: "EVT-4798",
    caseId: "REQ-2814",
    action: "Information requested",
    actor: "You",
    change: "Under Review → Pending Info",
    rationale: "Prescription required",
    timestamp: "22 Jun · 11:58",
    eventType: "Information",
    createdAt: new Date(Date.now() - 122 * 60000).toISOString(),
  },
  {
    id: "EVT-4792",
    caseId: "REQ-2809",
    action: "Evidence verified",
    actor: "Amina Mensah",
    change: "Pending → Verified",
    rationale: "Documents approved",
    timestamp: "22 Jun · 11:30",
    eventType: "Verification",
    createdAt: new Date(Date.now() - 150 * 60000).toISOString(),
  },
  {
    id: "EVT-4786",
    caseId: "REQ-2798",
    action: "Case created",
    actor: "Citizen Portal",
    change: "New → Submitted",
    rationale: "Citizen assistance request",
    timestamp: "22 Jun · 10:45",
    eventType: "Creation",
    createdAt: new Date(Date.now() - 195 * 60000).toISOString(),
  },
  {
    id: "EVT-4779",
    caseId: "REQ-2789",
    action: "Case status updated",
    actor: "Case Manager",
    change: "Submitted → Under Review",
    rationale: "Initial assessment completed",
    timestamp: "22 Jun · 10:12",
    eventType: "Status Change",
    createdAt: new Date(Date.now() - 230 * 60000).toISOString(),
  },
];

let fallbackEvents = [...initialEvents];

export const requestHistoryService = {
  async getStats(): Promise<{ data: RequestHistoryStatsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<RequestHistoryStatsDto>("/request-history/stats");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback
    }

    const decisions = fallbackEvents.filter((e) => e.eventType === "Decision").length;
    const assignments = fallbackEvents.filter((e) => e.eventType === "Assignment").length;
    const verifications = fallbackEvents.filter((e) => e.eventType === "Verification").length;
    const escalations = fallbackEvents.filter((e) => e.eventType === "Escalation").length;

    return {
      data: {
        totalEvents: 48214,
        decisionsCount: decisions,
        assignmentsCount: assignments,
        verificationsCount: verifications,
        escalationsCount: escalations,
      },
      isLiveBackend: false,
    };
  },

  async getEvents(
    query: RequestHistoryQueryDto
  ): Promise<{ data: PaginatedResult<HistoryEvent>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.eventType) params.append("eventType", query.eventType);
      if (query.actor) params.append("actor", query.actor);
      if (query.caseId) params.append("caseId", query.caseId);
      if (query.dateRange) params.append("dateRange", query.dateRange);
      if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));

      const url = `/request-history${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<PaginatedResult<HistoryEvent>>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback
    }

    let list = [...fallbackEvents];

    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.id.toLowerCase().includes(s) ||
          e.caseId.toLowerCase().includes(s) ||
          e.action.toLowerCase().includes(s) ||
          e.actor.toLowerCase().includes(s) ||
          e.rationale.toLowerCase().includes(s) ||
          e.change.toLowerCase().includes(s)
      );
    }

    if (query.eventType && query.eventType !== "All event types") {
      list = list.filter((e) => e.eventType.toLowerCase() === query.eventType?.toLowerCase());
    }

    if (query.actor && query.actor !== "All actors") {
      list = list.filter((e) => e.actor.toLowerCase() === query.actor?.toLowerCase());
    }

    if (query.caseId && query.caseId !== "All cases") {
      list = list.filter((e) => e.caseId.toLowerCase() === query.caseId?.toLowerCase());
    }

    if (query.dateRange && query.dateRange !== "Date range" && query.dateRange !== "All time") {
      if (query.dateRange === "Today") {
        list = list.filter((e) => e.timestamp.includes("22 Jun"));
      }
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

  async getById(id: string): Promise<{ data: HistoryEvent; isLiveBackend: boolean }> {
    try {
      const response = await request<HistoryEvent>(`/request-history/${id}`);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback
    }

    const found = fallbackEvents.find((e) => e.id.toLowerCase() === id.toLowerCase());
    if (found) {
      return { data: found, isLiveBackend: false };
    }
    throw new Error(`History event ${id} not found.`);
  },

  async logEvent(
    req: LogHistoryEventRequest
  ): Promise<{ data: HistoryEvent; isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<HistoryEvent>("/request-history", {
        method: "POST",
        body: JSON.stringify(req),
      });
      if (response && response.success && response.data) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || "Event logged successfully.",
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    const nextId = `EVT-${4822 + fallbackEvents.length}`;
    const newEvt: HistoryEvent = {
      id: nextId,
      caseId: req.caseId,
      action: req.action,
      actor: req.actor,
      change: req.change,
      rationale: req.rationale,
      eventType: req.eventType,
      details: req.details,
      timestamp: "Just now",
      createdAt: new Date().toISOString(),
    };

    fallbackEvents.unshift(newEvt);

    return {
      data: newEvt,
      isLiveBackend: false,
      message: "Event logged in demo mode.",
    };
  },

  async getUniqueActors(): Promise<string[]> {
    try {
      const res = await request<string[]>("/request-history/actors");
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch {
      // fallback
    }
    return Array.from(new Set(fallbackEvents.map((e) => e.actor))).sort();
  },

  async getUniqueCaseIds(): Promise<string[]> {
    try {
      const res = await request<string[]>("/request-history/cases");
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch {
      // fallback
    }
    return Array.from(new Set(fallbackEvents.map((e) => e.caseId))).sort();
  },

  async downloadExportCsv(query: RequestHistoryQueryDto): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.eventType) params.append("eventType", query.eventType);
      if (query.actor) params.append("actor", query.actor);
      if (query.caseId) params.append("caseId", query.caseId);
      if (query.dateRange) params.append("dateRange", query.dateRange);

      const url = `${API_BASE_URL}/request-history/export?${params.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `carelink-request-history-${new Date().toISOString().slice(0, 10)}.csv`;
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
      "Event ID",
      "Case ID",
      "Action",
      "Actor",
      "Change",
      "Rationale",
      "Timestamp",
      "Event Type",
    ];

    const rows = fallbackEvents.map((event) => [
      event.id,
      event.caseId,
      event.action,
      event.actor,
      event.change,
      event.rationale,
      event.timestamp,
      event.eventType,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carelink-request-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
