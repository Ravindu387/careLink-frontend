import { request, authFetch } from "./api";
import type {
  VerificationCase,
  VerificationAnalyticsResponse,
  VerificationDecisionRequest,
  VerificationQueryDto,
  PaginatedResult,
} from "../types/caseVerification";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const fallbackCases: VerificationCase[] = [
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
    submissionAge: "18 min",
    evidenceNotes: "Flood waters entered primary dwelling; photo evidence uploaded.",
    documents: ["flood_water_damage.jpg", "grama_niladhari_cert.pdf"],
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
    submissionAge: "49 min",
    evidenceNotes: "Telephone contact verified with community elder.",
    documents: ["id_card_scan.pdf"],
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
    submissionAge: "2h 08m",
    evidenceNotes: "Prescription image is blurry. Requested clearer photograph.",
    documents: ["prescription_blurry.jpg"],
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
    status: "Under Review",
    submissionAge: "1h 34m",
    evidenceNotes: "Verified through disaster hotline coordinates.",
    documents: ["gps_location_pin.png", "hotline_call_log.pdf"],
  },
  {
    id: "REQ-2809",
    category: "Emergency shelter",
    applicant: "K. Alwis - 4 people",
    location: "South Ward, Sector 3",
    priority: "High",
    aiPriority: "High",
    confidence: "89% confidence",
    verification: "Evidence pending",
    assigned: "Unassigned",
    age: "35 min",
    status: "Submitted",
    submissionAge: "35 min",
    evidenceNotes: "Evacuation order issued for sub-district.",
    documents: ["residence_proof.pdf"],
  },
  {
    id: "REQ-2804",
    category: "Food & water",
    applicant: "S. Gunaratne - 2 people",
    location: "Riverview, North Ward",
    priority: "Medium",
    aiPriority: "Medium",
    confidence: "81% confidence",
    verification: "Contact verified",
    assigned: "You",
    age: "52 min",
    status: "Under Review",
    submissionAge: "52 min",
    evidenceNotes: "Identity verified via national ID registry.",
    documents: ["national_identity_card.pdf"],
  },
];

const fallbackAnalytics: VerificationAnalyticsResponse = {
  statistics: {
    awaitingReview: 14,
    awaitingReviewDesc: "3 critical priority",
    verifiedToday: 92,
    verifiedTodayDesc: "96% passed",
    informationRequested: 18,
    informationRequestedDesc: "Awaiting response",
    rejectedToday: 4,
    rejectedTodayDesc: "All with rationale",
    oldestPendingAge: "42 min",
  },
  totalCases: fallbackCases.length,
  cases: fallbackCases,
  lastUpdated: new Date().toISOString(),
};

export const caseVerificationService = {
  /**
   * Fetches verification analytics and statistics
   */
  async getAnalytics(): Promise<{ data: VerificationAnalyticsResponse; isLiveBackend: boolean }> {
    try {
      const response = await request<VerificationAnalyticsResponse>("/caseverification/analytics", {
        method: "GET",
      });
      if (response && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
      return { data: fallbackAnalytics, isLiveBackend: false };
    } catch (err) {
      console.warn("Backend unavailable, using local verification fallback:", err);
      return { data: fallbackAnalytics, isLiveBackend: false };
    }
  },

  /**
   * Fetches paginated and filtered verification cases
   */
  async getCases(query: VerificationQueryDto): Promise<{ data: PaginatedResult<VerificationCase>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.evidenceState) params.append("evidenceState", query.evidenceState);
      if (query.priority) params.append("priority", query.priority);
      if (query.category) params.append("category", query.category);
      if (query.ageFilter) params.append("ageFilter", query.ageFilter);
      if (query.pageNumber) params.append("pageNumber", query.pageNumber.toString());
      if (query.pageSize) params.append("pageSize", query.pageSize.toString());

      const response = await request<PaginatedResult<VerificationCase>>(`/caseverification/cases?${params.toString()}`, {
        method: "GET",
      });

      if (response && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch (err) {
      console.warn("Using local filter fallback for verification cases:", err);
    }

    // Local filter fallback
    let filtered = [...fallbackCases];
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
    if (query.evidenceState && query.evidenceState !== "All evidence states") {
      filtered = filtered.filter((c) => c.verification === query.evidenceState);
    }
    if (query.priority && query.priority !== "All priorities") {
      filtered = filtered.filter((c) => c.priority === query.priority);
    }
    if (query.category && query.category !== "All categories") {
      filtered = filtered.filter((c) => c.category === query.category);
    }
    if (query.ageFilter && query.ageFilter !== "Submission age") {
      if (query.ageFilter.includes("1 hour")) {
        filtered = filtered.filter((c) => !c.age.includes("h"));
      }
    }

    const page = Math.max(1, query.pageNumber || 1);
    const pageSize = Math.max(1, query.pageSize || 10);
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
   * Records a verification decision (Verify, RequestInfo, Reject)
   */
  async recordDecision(caseId: string, decision: VerificationDecisionRequest): Promise<VerificationCase> {
    try {
      const response = await request<VerificationCase>(`/caseverification/cases/${caseId}/decision`, {
        method: "POST",
        body: JSON.stringify(decision),
      });
      return response.data;
    } catch {
      // Local fallback state mutation
      const found = fallbackCases.find((c) => c.id === caseId);
      const dec = decision.decision.toLowerCase();
      if (found) {
        if (dec === "verify" || dec === "approve") {
          found.verification = "Verified";
          found.status = "Verified";
          fallbackAnalytics.statistics.verifiedToday++;
          fallbackAnalytics.statistics.awaitingReview = Math.max(0, fallbackAnalytics.statistics.awaitingReview - 1);
        } else if (dec === "requestinfo" || dec === "needs info") {
          found.verification = "Needs information";
          found.status = "Pending Info";
          fallbackAnalytics.statistics.informationRequested++;
        } else if (dec === "reject") {
          found.verification = "Rejected";
          found.status = "Rejected";
          fallbackAnalytics.statistics.rejectedToday++;
          fallbackAnalytics.statistics.awaitingReview = Math.max(0, fallbackAnalytics.statistics.awaitingReview - 1);
        }
        if (decision.rationale) {
          found.evidenceNotes = decision.rationale;
        }
        return found;
      }
      return {
        id: caseId,
        category: "General",
        applicant: "Verified citizen",
        location: "Riverton",
        priority: "High",
        aiPriority: "High",
        confidence: "90%",
        verification: decision.decision === "Verify" ? "Verified" : "Rejected",
        assigned: "You",
        age: "Just now",
        status: decision.decision === "Verify" ? "Verified" : "Rejected",
        submissionAge: "Just now",
      };
    }
  },

  /**
   * Downloads verification CSV export from backend API or client-side fallback
   */
  async downloadExportCsv(cases: VerificationCase[]): Promise<void> {
    try {
      const token = localStorage.getItem("carelink_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await authFetch(`${API_BASE_URL}/caseverification/export`, { headers });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `carelink-verification-cases-${new Date().toISOString().slice(0, 10)}.csv`;
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
      "Priority",
      "AI Priority",
      "Verification",
      "Assigned",
      "Age",
      "Status",
    ];

    const rows = cases.map((item) => [
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
    ]);

    const csv = [headers, ...rows].map((row) => row.map((val) => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carelink-verification-cases-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
