import { request, authFetch } from "./api";
import type {
  VolunteerApplication,
  VolunteerVerificationStatsDto,
  VolunteerVerificationQueryDto,
  ReviewVerificationRequest,
  CreateVerificationApplicationRequest,
  PaginatedResult,
} from "../types/pendingVerification";

const initialApplications: VolunteerApplication[] = [
  {
    id: "VER-218",
    applicant: "Sara Khan",
    skills: ["Shelter Support", "Childcare"],
    location: "Central Ward",
    documents: ["ID", "First Aid Certificate"],
    submitted: "2 hours ago",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    priority: "Standard",
    documentState: "Complete",
    status: "Pending",
    email: "sara@example.com",
    phone: "+94 71 234 5678",
  },
  {
    id: "VER-215",
    applicant: "Abdul Rahman",
    skills: ["Heavy Vehicle", "Logistics"],
    location: "North Ward",
    documents: ["ID", "Driving Licence"],
    submitted: "5 hours ago",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    priority: "High",
    documentState: "Complete",
    status: "Pending",
    email: "abdul@example.com",
    phone: "+94 72 345 6789",
  },
  {
    id: "VER-209",
    applicant: "Maya Fernando",
    skills: ["Nursing", "First Aid"],
    location: "Central Ward",
    documents: ["ID", "Nursing Registration"],
    submitted: "Yesterday",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    priority: "High",
    documentState: "Complete",
    status: "Pending",
    email: "maya@example.com",
    phone: "+94 76 456 7890",
  },
  {
    id: "VER-204",
    applicant: "Theo Martin",
    skills: ["Search & Rescue"],
    location: "West District",
    documents: ["ID", "Rescue Certificate"],
    submitted: "Yesterday",
    createdAt: new Date(Date.now() - 27 * 3600000).toISOString(),
    priority: "Standard",
    documentState: "Complete",
    status: "Pending",
    email: "theo@example.com",
    phone: "+94 77 567 8901",
  },
  {
    id: "VER-198",
    applicant: "Daniel Okafor",
    skills: ["Logistics", "Warehousing"],
    location: "Eastbank",
    documents: ["ID"],
    submitted: "2 days ago",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    priority: "Urgent",
    documentState: "Incomplete",
    status: "Pending",
    email: "daniel@example.com",
    phone: "+94 75 678 9012",
  },
  {
    id: "VER-192",
    applicant: "Amara Silva",
    skills: ["Medical", "First Aid"],
    location: "South Ward",
    documents: ["ID", "Medical Certificate"],
    submitted: "3 days ago",
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    priority: "Standard",
    documentState: "Complete",
    status: "Pending",
    email: "amara@example.com",
    phone: "+94 70 789 0123",
  },
  {
    id: "VER-185",
    applicant: "James Carter",
    skills: ["Driving", "Rescue"],
    location: "North Ward",
    documents: ["ID", "Driving Licence"],
    submitted: "3 days ago",
    createdAt: new Date(Date.now() - 76 * 3600000).toISOString(),
    priority: "High",
    documentState: "Complete",
    status: "Pending",
    email: "james@example.com",
    phone: "+94 78 890 1234",
  },
  {
    id: "VER-178",
    applicant: "Priya Perera",
    skills: ["Childcare", "Shelter Support"],
    location: "Central Ward",
    documents: ["ID"],
    submitted: "4 days ago",
    createdAt: new Date(Date.now() - 96 * 3600000).toISOString(),
    priority: "Standard",
    documentState: "Incomplete",
    status: "Pending",
    email: "priya@example.com",
    phone: "+94 74 901 2345",
  },
  {
    id: "VER-174",
    applicant: "Lucas Vance",
    skills: ["Search & Rescue", "Medical"],
    location: "West District",
    documents: ["ID", "Rescue Certification", "CPR Badge"],
    submitted: "5 hours ago",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    priority: "Urgent",
    documentState: "Complete",
    status: "Pending",
    email: "lucas.vance@example.com",
    phone: "+94 71 888 1234",
  },
  {
    id: "VER-169",
    applicant: "Fatima Al-Mansoor",
    skills: ["First Aid", "Translation"],
    location: "North Ward",
    documents: ["ID", "Red Cross Certificate"],
    submitted: "1 day ago",
    createdAt: new Date(Date.now() - 25 * 3600000).toISOString(),
    priority: "High",
    documentState: "Complete",
    status: "Pending",
    email: "fatima@example.com",
    phone: "+94 77 999 4321",
  },
  {
    id: "VER-163",
    applicant: "Chen Wei",
    skills: ["Electrical Repair", "Logistics"],
    location: "Eastbank",
    documents: ["ID", "Electrician License"],
    submitted: "2 days ago",
    createdAt: new Date(Date.now() - 49 * 3600000).toISOString(),
    priority: "Standard",
    documentState: "Complete",
    status: "Pending",
    email: "chen.wei@example.com",
    phone: "+94 76 111 2233",
  },
  {
    id: "VER-158",
    applicant: "Marcus Brody",
    skills: ["Heavy Vehicle", "Driving"],
    location: "North Ward",
    documents: ["ID", "Commercial Driver License"],
    submitted: "6 hours ago",
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    priority: "Urgent",
    documentState: "Complete",
    status: "Pending",
    email: "marcus@example.com",
    phone: "+94 75 333 4455",
  },
  {
    id: "VER-152",
    applicant: "Ananya Patel",
    skills: ["Medical", "Nursing"],
    location: "Central Clinic",
    documents: ["ID", "Nursing Degree", "Hospital ID"],
    submitted: "1 day ago",
    createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    priority: "High",
    documentState: "Complete",
    status: "Pending",
    email: "ananya.patel@example.com",
    phone: "+94 72 555 6677",
  },
  {
    id: "VER-147",
    applicant: "David Kim",
    skills: ["Telecommunications", "IT Support"],
    location: "South Ward",
    documents: ["ID", "Radio Operator Certificate"],
    submitted: "2 days ago",
    createdAt: new Date(Date.now() - 50 * 3600000).toISOString(),
    priority: "Standard",
    documentState: "Complete",
    status: "Pending",
    email: "david.kim@example.com",
    phone: "+94 70 888 9900",
  },
  {
    id: "VER-141",
    applicant: "Tariq Aziz",
    skills: ["Warehousing", "Logistics"],
    location: "Eastbank",
    documents: ["ID"],
    submitted: "3 days ago",
    createdAt: new Date(Date.now() - 74 * 3600000).toISOString(),
    priority: "Standard",
    documentState: "Incomplete",
    status: "Pending",
    email: "tariq.aziz@example.com",
    phone: "+94 78 444 7788",
  },
  {
    id: "VER-135",
    applicant: "Elena Rostova",
    skills: ["Shelter Support", "Childcare"],
    location: "Central Ward",
    documents: ["ID", "Food Handler Card"],
    submitted: "2 days ago",
    createdAt: new Date(Date.now() - 51 * 3600000).toISOString(),
    priority: "Standard",
    documentState: "Complete",
    status: "Pending",
    email: "elena.r@example.com",
    phone: "+94 73 222 8899",
  },
  {
    id: "VER-129",
    applicant: "Gabriel Santos",
    skills: ["Water Purification", "Rescue"],
    location: "West District",
    documents: ["ID"],
    submitted: "2 days ago",
    createdAt: new Date(Date.now() - 52 * 3600000).toISOString(),
    priority: "Urgent",
    documentState: "Incomplete",
    status: "Pending",
    email: "gabriel.s@example.com",
    phone: "+94 79 123 9988",
  },
  {
    id: "VER-122",
    applicant: "Samantha Hayes",
    skills: ["Childcare", "First Aid"],
    location: "South Ward",
    documents: ["ID", "Child Safeguarding Clearance"],
    submitted: "3 days ago",
    createdAt: new Date(Date.now() - 75 * 3600000).toISOString(),
    priority: "Standard",
    documentState: "Complete",
    status: "Pending",
    email: "samantha.h@example.com",
    phone: "+94 74 666 3322",
  },
];

let fallbackApplications = [...initialApplications];

export const pendingVerificationService = {
  async getStats(): Promise<{ data: VolunteerVerificationStatsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerVerificationStatsDto>("/volunteer-verifications/stats");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    const pending = fallbackApplications.filter((a) => a.status === "Pending");
    return {
      data: {
        totalApplications: fallbackApplications.length,
        pendingCount: pending.length,
        urgentCount: pending.filter((a) => a.priority === "Urgent").length,
        highPriorityCount: pending.filter((a) => a.priority === "High").length,
        standardPriorityCount: pending.filter((a) => a.priority === "Standard").length,
        completeDocumentsCount: pending.filter((a) => a.documentState === "Complete").length,
        incompleteDocumentsCount: pending.filter((a) => a.documentState === "Incomplete").length,
        approvedCount: fallbackApplications.filter((a) => a.status === "Approved").length,
        rejectedCount: fallbackApplications.filter((a) => a.status === "Rejected").length,
        oldestPendingSubmission: "2 days",
      },
      isLiveBackend: false,
    };
  },

  async getPendingApplications(): Promise<{ data: VolunteerApplication[]; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerApplication[]>("/volunteer-verifications/pending");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    return {
      data: fallbackApplications.filter((a) => a.status === "Pending"),
      isLiveBackend: false,
    };
  },

  async getApplications(
    query: VolunteerVerificationQueryDto = {}
  ): Promise<{ data: PaginatedResult<VolunteerApplication>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.priority) params.append("priority", query.priority);
      if (query.skill) params.append("skill", query.skill);
      if (query.documentState) params.append("documentState", query.documentState);
      if (query.dateFilter) params.append("dateFilter", query.dateFilter);
      if (query.status) params.append("status", query.status);
      if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));

      const url = `/volunteer-verifications${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<PaginatedResult<VolunteerApplication>>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    let items = [...fallbackApplications];

    if (query.status && query.status !== "All") {
      items = items.filter((a) => a.status.toLowerCase() === query.status?.toLowerCase());
    }

    if (query.priority && query.priority !== "All priorities") {
      items = items.filter((a) => a.priority.toLowerCase() === query.priority?.toLowerCase());
    }

    if (query.skill && query.skill !== "All skill groups") {
      items = items.filter((a) =>
        a.skills.some((s) => s.toLowerCase() === query.skill?.toLowerCase())
      );
    }

    if (query.documentState && query.documentState !== "All document states") {
      items = items.filter((a) => a.documentState.toLowerCase() === query.documentState?.toLowerCase());
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      items = items.filter(
        (a) =>
          a.id.toLowerCase().includes(s) ||
          a.applicant.toLowerCase().includes(s) ||
          a.location.toLowerCase().includes(s) ||
          a.skills.some((sk) => sk.toLowerCase().includes(s))
      );
    }

    const pageNumber = query.pageNumber || 1;
    const pageSize = query.pageSize || 4;
    const totalCount = items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const paged = items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    return {
      data: {
        items: paged,
        totalCount,
        pageNumber,
        pageSize,
        totalPages,
      },
      isLiveBackend: false,
    };
  },

  async getById(id: string): Promise<VolunteerApplication | null> {
    try {
      const response = await request<VolunteerApplication>(`/volunteer-verifications/${encodeURIComponent(id)}`);
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    return fallbackApplications.find((a) => a.id.toLowerCase() === id.toLowerCase()) || null;
  },

  async approve(id: string, req?: ReviewVerificationRequest): Promise<VolunteerApplication | null> {
    try {
      const response = await request<VolunteerApplication>(`/volunteer-verifications/${encodeURIComponent(id)}/approve`, {
        method: "PUT",
        body: JSON.stringify(req || { notes: "Approved by coordinator", reviewedBy: "Nadia Okafor (Coordinator)" }),
      });
      if (response && response.success && response.data) {
        fallbackApplications = fallbackApplications.map((a) =>
          a.id.toLowerCase() === id.toLowerCase() ? response.data! : a
        );
        return response.data;
      }
    } catch {
      // Fallback
    }

    const index = fallbackApplications.findIndex((a) => a.id.toLowerCase() === id.toLowerCase());
    if (index !== -1) {
      fallbackApplications[index] = {
        ...fallbackApplications[index],
        status: "Approved",
        reviewedAt: new Date().toISOString(),
        reviewedBy: req?.reviewedBy || "Nadia Okafor (Coordinator)",
        reviewNotes: req?.notes || "Approved by coordinator",
      };
      return fallbackApplications[index];
    }
    return null;
  },

  async reject(id: string, req?: ReviewVerificationRequest): Promise<VolunteerApplication | null> {
    try {
      const response = await request<VolunteerApplication>(`/volunteer-verifications/${encodeURIComponent(id)}/reject`, {
        method: "PUT",
        body: JSON.stringify(req || { notes: "Rejected by coordinator", reviewedBy: "Nadia Okafor (Coordinator)" }),
      });
      if (response && response.success && response.data) {
        fallbackApplications = fallbackApplications.map((a) =>
          a.id.toLowerCase() === id.toLowerCase() ? response.data! : a
        );
        return response.data;
      }
    } catch {
      // Fallback
    }

    const index = fallbackApplications.findIndex((a) => a.id.toLowerCase() === id.toLowerCase());
    if (index !== -1) {
      fallbackApplications[index] = {
        ...fallbackApplications[index],
        status: "Rejected",
        reviewedAt: new Date().toISOString(),
        reviewedBy: req?.reviewedBy || "Nadia Okafor (Coordinator)",
        reviewNotes: req?.notes || "Rejected by coordinator",
      };
      return fallbackApplications[index];
    }
    return null;
  },

  async createApplication(
    req: CreateVerificationApplicationRequest
  ): Promise<VolunteerApplication> {
    try {
      const response = await request<VolunteerApplication>("/volunteer-verifications", {
        method: "POST",
        body: JSON.stringify(req),
      });
      if (response && response.success && response.data) {
        fallbackApplications = [response.data, ...fallbackApplications];
        return response.data;
      }
    } catch {
      // Fallback
    }

    const newId = `VER-${Math.floor(Math.random() * 200) + 220}`;
    const newRecord: VolunteerApplication = {
      id: newId,
      applicant: req.applicant,
      skills: req.skills,
      location: req.location,
      documents: req.documents,
      submitted: "Just now",
      createdAt: new Date().toISOString(),
      priority: req.priority || "Standard",
      documentState: req.documentState || "Complete",
      status: "Pending",
      email: req.email,
      phone: req.phone,
    };

    fallbackApplications = [newRecord, ...fallbackApplications];
    return newRecord;
  },

  async deleteApplication(id: string): Promise<boolean> {
    try {
      const response = await request<boolean>(`/volunteer-verifications/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (response && response.success) {
        fallbackApplications = fallbackApplications.filter((a) => a.id.toLowerCase() !== id.toLowerCase());
        return true;
      }
    } catch {
      // Fallback
    }

    fallbackApplications = fallbackApplications.filter((a) => a.id.toLowerCase() !== id.toLowerCase());
    return true;
  },

  async exportCsv(query: VolunteerVerificationQueryDto = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.priority) params.append("priority", query.priority);
      if (query.skill) params.append("skill", query.skill);
      if (query.documentState) params.append("documentState", query.documentState);
      if (query.status) params.append("status", query.status);

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";
      const res = await authFetch(`${API_BASE_URL}/volunteer-verifications/export?${params.toString()}`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const res = await this.getApplications({ ...query, pageNumber: 1, pageSize: 1000 });
    const headers = [
      "Verification ID",
      "Applicant",
      "Status",
      "Priority",
      "Document State",
      "Location",
      "Email",
      "Phone",
      "Declared Skills",
      "Submitted Documents",
    ];

    const rows = res.data.items.map((item) => [
      item.id,
      item.applicant,
      item.status,
      item.priority,
      item.documentState,
      item.location,
      item.email,
      item.phone,
      item.skills.join("; "),
      item.documents.join("; "),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  },
};
