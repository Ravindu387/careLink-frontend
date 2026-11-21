import { request } from "./api";
import type {
  CaseDashboardResponse,
  CaseItem,
  CreateCaseRequest,
  UpdateCaseStatusRequest,
} from "../types/caseManagement";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

// Fallback demo data if backend server is not running
const fallbackDashboardData: CaseDashboardResponse = {
  statistics: [
    {
      title: "My active cases",
      value: "28",
      description: "4 new within 1 hour",
      iconKey: "BriefcaseBusiness",
      color: "blue",
    },
    {
      title: "Unassigned cases",
      value: "63",
      description: "6 flagged overdue",
      iconKey: "FileText",
      color: "orange",
    },
    {
      title: "Awaiting verification",
      value: "14",
      description: "Evidence to review",
      iconKey: "ShieldCheck",
      color: "blue",
    },
    {
      title: "Critical queue",
      value: "12",
      description: "3 over 1 hour",
      iconKey: "AlertTriangle",
      color: "red",
    },
    {
      title: "Potential duplicates",
      value: "9",
      description: "Human review required",
      iconKey: "Copy",
      color: "purple",
    },
    {
      title: "Escalated cases",
      value: "7",
      description: "2 awaiting coordinator",
      iconKey: "ArrowUpToLine",
      color: "red",
    },
    {
      title: "Resolved today",
      value: "84",
      description: "Median 2.1 hours",
      iconKey: "CheckCircle2",
      color: "green",
    },
    {
      title: "SLA performance",
      value: "91.4%",
      description: "+2.7% this week",
      iconKey: "TrendingUp",
      color: "green",
    },
  ],
  statusOverview: [
    { name: "Submitted", value: 284 },
    { name: "Under Review", value: 218 },
    { name: "Verified", value: 194 },
    { name: "Assigned", value: 246 },
    { name: "In Progress", value: 182 },
    { name: "Pending Info", value: 96 },
    { name: "Escalated", value: 64 },
  ],
  totalOpenCases: 1284,
  chartData: [
    { day: "Mon", received: 85, resolved: 65 },
    { day: "Tue", received: 105, resolved: 80 },
    { day: "Wed", received: 95, resolved: 92 },
    { day: "Thu", received: 125, resolved: 100 },
    { day: "Fri", received: 115, resolved: 108 },
    { day: "Sat", received: 145, resolved: 130 },
    { day: "Today", received: 100, resolved: 85 },
  ],
  resolutionRate: "+84.7%",
  priorityCases: [
    {
      id: "ECO-2841",
      category: "Emergency shelter",
      applicant: "M. Fernando - 3 people",
      location: "Riverview, North Ward",
      priority: "Critical",
      aiPriority: "Critical",
      confidence: "94% confidence",
      verification: "Evidence pending",
      assigned: "You",
      age: "18 min",
      status: "Under Review",
    },
    {
      id: "ECO-2829",
      category: "Medical supplies",
      applicant: "D. Silva - 2 people",
      location: "Old Town, Sector 4",
      priority: "High",
      aiPriority: "High",
      confidence: "87% confidence",
      verification: "Verified",
      assigned: "You",
      age: "34 min",
      status: "Assigned",
    },
    {
      id: "ECO-2836",
      category: "Food & water",
      applicant: "K. Mendis - 5 people",
      location: "Eastbank, Sector 2",
      priority: "High",
      aiPriority: "High",
      confidence: "82% confidence",
      verification: "Contact verified",
      assigned: "Unassigned",
      age: "49 min",
      status: "Submitted",
    },
  ],
  recentActivities: [
    {
      id: "1",
      title: "Case escalated",
      description: "ECO-2841 - Needs urgent assistance",
      time: "4 min",
      iconKey: "ArrowUpToLine",
      color: "blue",
    },
    {
      id: "2",
      title: "AI review completed",
      description: "ECO-2836 - Critical approved",
      time: "12 min",
      iconKey: "Activity",
      color: "green",
    },
    {
      id: "3",
      title: "Citizen information received",
      description: "ECO-2829 - Additional details",
      time: "19 min",
      iconKey: "MessageSquare",
      color: "blue",
    },
    {
      id: "4",
      title: "Duplicate pair detected",
      description: "ECO-2818 - Similarity match",
      time: "28 min",
      iconKey: "Copy",
      color: "purple",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export const caseManagementService = {
  /**
   * Retrieves dashboard metrics from backend API. Falls back to demo data if offline.
   */
  async getDashboard(): Promise<{ data: CaseDashboardResponse; isLiveBackend: boolean }> {
    try {
      const response = await request<CaseDashboardResponse>("/casemanagement/dashboard", {
        method: "GET",
      });
      if (response && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
      return { data: fallbackDashboardData, isLiveBackend: false };
    } catch (err) {
      console.warn("Backend not available, using local demonstration data:", err);
      return { data: fallbackDashboardData, isLiveBackend: false };
    }
  },

  /**
   * Retrieves cases matching criteria
   */
  async getCases(params?: { search?: string; status?: string; priority?: string; assigned?: string }): Promise<CaseItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append("search", params.search);
      if (params?.status) query.append("status", params.status);
      if (params?.priority) query.append("priority", params.priority);
      if (params?.assigned) query.append("assigned", params.assigned);

      const qs = query.toString() ? `?${query.toString()}` : "";
      const response = await request<CaseItem[]>(`/casemanagement/cases${qs}`, {
        method: "GET",
      });
      return response.data || [];
    } catch {
      return fallbackDashboardData.priorityCases;
    }
  },

  /**
   * Creates a new case in the backend
   */
  async createCase(payload: CreateCaseRequest): Promise<CaseItem> {
    try {
      const response = await request<CaseItem>("/casemanagement/cases", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data;
    } catch {
      // Local fallback creation
      const localId = `ECO-${Math.floor(2850 + Math.random() * 50)}`;
      return {
        id: localId,
        category: payload.category,
        applicant: `${payload.applicantName} - ${payload.peopleCount} people`,
        location: payload.location,
        priority: payload.priority,
        aiPriority: payload.priority,
        confidence: "88% confidence",
        verification: "Evidence pending",
        assigned: "Unassigned",
        age: "Just now",
        status: "Submitted",
        description: payload.description,
      };
    }
  },

  /**
   * Claims a case for the current user
   */
  async claimCase(caseId: string, assignedTo: string = "You"): Promise<CaseItem> {
    try {
      const response = await request<CaseItem>(`/casemanagement/cases/${caseId}/claim`, {
        method: "POST",
        body: JSON.stringify({ assignedTo }),
      });
      return response.data;
    } catch {
      return {
        id: caseId,
        category: "Assigned case",
        applicant: "Claimed applicant",
        location: "Local area",
        priority: "High",
        aiPriority: "High",
        confidence: "90% confidence",
        verification: "Verified",
        assigned: assignedTo,
        age: "Just now",
        status: "Assigned",
      };
    }
  },

  /**
   * Updates status of a case
   */
  async updateStatus(caseId: string, status: string, notes?: string): Promise<CaseItem> {
    const response = await request<CaseItem>(`/casemanagement/cases/${caseId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes } as UpdateCaseStatusRequest),
    });
    return response.data;
  },

  /**
   * Downloads case summary CSV report from backend or generates fallback CSV
   */
  async downloadExportSummary(priorityCases: CaseItem[]): Promise<void> {
    try {
      const token = localStorage.getItem("carelink_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/casemanagement/export`, { headers });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `carelink-cases-summary-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // ignore and use fallback
    }

    // Client-side fallback export
    const rows = [
      ["Case ID", "Category", "Applicant", "Location", "Priority", "AI Priority", "Verification", "Assigned", "Status"],
      ...priorityCases.map((c) => [
        c.id,
        c.category,
        c.applicant,
        c.location,
        c.priority,
        c.aiPriority,
        c.verification,
        c.assigned,
        c.status,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carelink-cases-summary-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
