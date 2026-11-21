import { request } from "./api";
import type {
  UnassignedCase,
  UnassignedCasesStatsDto,
  UnassignedCasesQueryDto,
  ClaimUnassignedCasesRequest,
  AssignUnassignedCaseRequest,
  UpdateUnassignedCaseRequest,
  PaginatedResult,
} from "../types/unassignedCases";

const initialCases: UnassignedCase[] = [
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
    contactNumber: "+94 77 412 8041",
    householdSize: 3,
    description: "Clean drinking water and emergency rations requested for family stranded on upper level.",
    createdAt: new Date(Date.now() - 49 * 60000).toISOString(),
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
    contactNumber: "+94 71 890 2311",
    householdSize: 1,
    description: "Urgent insulin refill needed; pharmacy prescription slip image blurry and requires re-verification.",
    createdAt: new Date(Date.now() - 128 * 60000).toISOString(),
  },
  {
    id: "REQ-2848",
    category: "Emergency shelter",
    applicant: "K. Gunaratne - 5 people",
    location: "Lower Riverside",
    priority: "Critical",
    aiPriority: "Critical",
    confidence: "95% confidence",
    verification: "Pending document",
    assigned: "Unassigned",
    age: "25 min",
    status: "Submitted",
    event: "Flood Response",
    minutes: 25,
    contactNumber: "+94 70 334 5678",
    householdSize: 5,
    description: "Roof collapsed due to torrential flash rain. 2 elderly persons and 1 infant require shelter kit immediately.",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: "REQ-2852",
    category: "Rescue assistance",
    applicant: "S. Fernando - 4 people",
    location: "Old Canal Zone",
    priority: "Critical",
    aiPriority: "Critical",
    confidence: "98% confidence",
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "12 min",
    status: "Submitted",
    event: "Flood Response",
    minutes: 12,
    contactNumber: "+94 77 912 3450",
    householdSize: 4,
    description: "Surging water reaching first floor balcony. Boat extraction required for 4 individuals.",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: "REQ-2860",
    category: "Medicine",
    applicant: "A. De Silva - 2 people",
    location: "Highland Sector 4",
    priority: "Medium",
    aiPriority: "Medium",
    confidence: "82% confidence",
    verification: "Verified",
    assigned: "Unassigned",
    age: "1h 45m",
    status: "Under Review",
    event: "Storm Response",
    minutes: 105,
    contactNumber: "+94 72 455 6789",
    householdSize: 2,
    description: "Chronic asthma inhalers and pediatric fever medication requested following power outages.",
    createdAt: new Date(Date.now() - 105 * 60000).toISOString(),
  },
  {
    id: "REQ-2865",
    category: "Food & water",
    applicant: "P. Wijesinghe - 6 people",
    location: "Central Valley",
    priority: "Medium",
    aiPriority: "Low",
    confidence: "79% confidence",
    verification: "Needs information",
    assigned: "Unassigned",
    age: "3h 10m",
    status: "Pending Info",
    event: "Storm Response",
    minutes: 190,
    contactNumber: "+94 75 889 0123",
    householdSize: 6,
    description: "Dry rations pack requested; secondary contact person missing from submission form.",
    createdAt: new Date(Date.now() - 190 * 60000).toISOString(),
  },
  {
    id: "REQ-2871",
    category: "Financial Aid",
    applicant: "T. Jayasuriya - 2 people",
    location: "North Outskirts",
    priority: "Low",
    aiPriority: "Low",
    confidence: "89% confidence",
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "4h 30m",
    status: "Submitted",
    event: "Drought Relief",
    minutes: 270,
    contactNumber: "+94 78 223 9012",
    householdSize: 2,
    description: "Emergency subsistence voucher request due to seasonal agricultural water shortages.",
    createdAt: new Date(Date.now() - 270 * 60000).toISOString(),
  },
  {
    id: "REQ-2880",
    category: "Emergency shelter",
    applicant: "N. Bandara - 7 people",
    location: "Eastbank, Sector 5",
    priority: "Critical",
    aiPriority: "Critical",
    confidence: "93% confidence",
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "35 min",
    status: "Submitted",
    event: "Urban Fire Response",
    minutes: 35,
    contactNumber: "+94 71 556 7812",
    householdSize: 7,
    description: "Displaced by perimeter residential fire. Direct relocation and emergency bedding required.",
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
];

let fallbackCases: UnassignedCase[] = [...initialCases];

export const unassignedCasesService = {
  async getStats(): Promise<{ data: UnassignedCasesStatsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<UnassignedCasesStatsDto>("/unassigned-cases/stats");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    const unassigned = fallbackCases.filter((c) => c.assigned === "Unassigned");
    const total = unassigned.length;
    const critical = unassigned.filter((c) => c.priority === "Critical").length;
    const dueSoon = unassigned.filter((c) => c.priority === "Critical" || c.priority === "High" || c.minutes <= 60).length;
    const pendingInfo = unassigned.filter((c) => c.verification === "Needs information" || c.status === "Pending Info").length;
    const recentlyUpdated = unassigned.filter((c) => c.status === "Submitted").length;

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
    query: UnassignedCasesQueryDto
  ): Promise<{ data: PaginatedResult<UnassignedCase>; isLiveBackend: boolean }> {
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

      const url = `/unassigned-cases${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<PaginatedResult<UnassignedCase>>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    let items = fallbackCases.filter((c) => c.assigned === "Unassigned");

    if (query.tab && query.tab !== "All") {
      const tab = query.tab.toLowerCase();
      if (tab === "critical") {
        items = items.filter((c) => c.priority.toLowerCase() === "critical");
      } else if (tab === "due soon") {
        items = items.filter((c) => ["critical", "high"].includes(c.priority.toLowerCase()) || c.minutes <= 60);
      } else if (tab === "pending information") {
        items = items.filter((c) => c.verification.toLowerCase().includes("needs information") || c.status === "Pending Info");
      } else if (tab === "recently updated") {
        items = items.filter((c) => c.status === "Submitted");
      }
    }

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (c) =>
          c.id.toLowerCase().includes(s) ||
          c.applicant.toLowerCase().includes(s) ||
          c.location.toLowerCase().includes(s) ||
          c.category.toLowerCase().includes(s) ||
          c.event.toLowerCase().includes(s)
      );
    }

    if (query.priority && query.priority !== "All priorities") {
      items = items.filter((c) => c.priority.toLowerCase() === query.priority?.toLowerCase());
    }

    if (query.category && query.category !== "All categories") {
      items = items.filter((c) => c.category.toLowerCase() === query.category?.toLowerCase());
    }

    if (query.status && query.status !== "All statuses") {
      items = items.filter((c) => c.status.toLowerCase() === query.status?.toLowerCase());
    }

    if (query.event && query.event !== "All crisis events") {
      items = items.filter((c) => c.event.toLowerCase() === query.event?.toLowerCase());
    }

    const page = query.pageNumber || 1;
    const size = query.pageSize || 10;
    const totalCount = items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    const paged = items.slice((page - 1) * size, page * size);

    return {
      data: {
        items: paged,
        totalCount,
        pageNumber: page,
        pageSize: size,
        totalPages,
      },
      isLiveBackend: false,
    };
  },

  async getById(id: string): Promise<UnassignedCase | null> {
    try {
      const response = await request<UnassignedCase>(`/unassigned-cases/${encodeURIComponent(id)}`);
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    return fallbackCases.find((c) => c.id.toLowerCase() === id.toLowerCase()) || null;
  },

  async claimCases(requestData: ClaimUnassignedCasesRequest): Promise<number> {
    try {
      const response = await request<number>("/unassigned-cases/claim", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
      if (response && response.success && response.data !== undefined) {
        // Also update local fallback
        const assignTo = requestData.assignTo || "You";
        fallbackCases = fallbackCases.map((c) =>
          requestData.caseIds.includes(c.id) ? { ...c, assigned: assignTo, status: "Assigned" } : c
        );
        return response.data;
      }
    } catch {
      // Fallback
    }

    const assignTo = requestData.assignTo || "You";
    let claimedCount = 0;
    fallbackCases = fallbackCases.map((c) => {
      if (requestData.caseIds.includes(c.id)) {
        claimedCount++;
        return { ...c, assigned: assignTo, status: "Assigned" };
      }
      return c;
    });

    return claimedCount;
  },

  async assignCase(requestData: AssignUnassignedCaseRequest): Promise<UnassignedCase | null> {
    try {
      const response = await request<UnassignedCase>("/unassigned-cases/assign", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
      if (response && response.success && response.data) {
        const updated = response.data;
        fallbackCases = fallbackCases.map((c) => (c.id === updated.id ? updated : c));
        return updated;
      }
    } catch {
      // Fallback
    }

    const idx = fallbackCases.findIndex((c) => c.id.toLowerCase() === requestData.caseId.toLowerCase());
    if (idx !== -1) {
      fallbackCases[idx] = {
        ...fallbackCases[idx],
        assigned: requestData.assignedTo || "You",
        status: "Assigned",
        notes: requestData.notes || fallbackCases[idx].notes,
      };
      return fallbackCases[idx];
    }
    return null;
  },

  async updateCase(id: string, requestData: UpdateUnassignedCaseRequest): Promise<UnassignedCase | null> {
    try {
      const response = await request<UnassignedCase>(`/unassigned-cases/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(requestData),
      });
      if (response && response.success && response.data) {
        const updated = response.data;
        fallbackCases = fallbackCases.map((c) => (c.id === updated.id ? updated : c));
        return updated;
      }
    } catch {
      // Fallback
    }

    const idx = fallbackCases.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (idx !== -1) {
      fallbackCases[idx] = {
        ...fallbackCases[idx],
        ...requestData,
      };
      return fallbackCases[idx];
    }
    return null;
  },

  async exportCsv(query: UnassignedCasesQueryDto): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query.tab) params.append("tab", query.tab);
      if (query.search) params.append("search", query.search);
      if (query.event) params.append("event", query.event);
      if (query.priority) params.append("priority", query.priority);
      if (query.category) params.append("category", query.category);
      if (query.status) params.append("status", query.status);

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";
      const res = await fetch(`${API_BASE_URL}/unassigned-cases/export?${params.toString()}`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const res = await this.getCases({ ...query, pageNumber: 1, pageSize: 1000 });
    const headers = [
      "Case ID",
      "Category",
      "Applicant",
      "Location",
      "Priority",
      "AI Priority",
      "Verification",
      "Assigned",
      "Age",
      "Status",
      "Event",
      "Contact Number",
      "Household Size",
    ];

    const rows = res.data.items.map((item) => [
      item.id,
      item.category,
      item.applicant,
      item.location,
      item.priority,
      item.aiPriority,
      item.verification,
      item.assigned,
      item.age,
      item.status,
      item.event,
      item.contactNumber || "",
      String(item.householdSize || ""),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  },
};
