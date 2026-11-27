import { request, authFetch } from "./api";
import type {
  DuplicateCase,
  DuplicatesStatsDto,
  DuplicateQueryDto,
  UpdateDuplicateStatusRequest,
  MergeCasesRequest,
  PaginatedResult,
} from "../types/potentialDuplicates";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const initialDuplicates: DuplicateCase[] = [
  {
    id: "DUP-118",
    primaryCase: "REQ-2841",
    duplicateCase: "REQ-2798",
    factors: "Same phone · 120m proximity · Similar household",
    score: 92,
    confidence: "High",
    status: "Awaiting Review",
    category: "Emergency shelter",
    detected: "10 min ago",
    description:
      "Both requests contain similar applicant contact information and household details.",
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: "DUP-114",
    primaryCase: "REQ-2836",
    duplicateCase: "REQ-2811",
    factors: "Same address · Matching category",
    score: 88,
    confidence: "High",
    status: "Awaiting Review",
    category: "Food & water",
    detected: "25 min ago",
    description:
      "Both requests have the same reported address and assistance category.",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: "DUP-107",
    primaryCase: "REQ-2789",
    duplicateCase: "REQ-2774",
    factors: "Shared contact · Similar description",
    score: 76,
    confidence: "Medium",
    status: "Deferred",
    category: "Medical supplies",
    detected: "1 hour ago",
    description:
      "Requests share contact information and have similar descriptions.",
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: "DUP-102",
    primaryCase: "REQ-2761",
    duplicateCase: "REQ-2742",
    factors: "80m proximity · Same family size",
    score: 69,
    confidence: "Low",
    status: "Awaiting Review",
    category: "Emergency shelter",
    detected: "2 hours ago",
    description:
      "Both requests were submitted from nearby locations with matching household sizes.",
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: "DUP-099",
    primaryCase: "REQ-2735",
    duplicateCase: "REQ-2721",
    factors: "Same phone · Matching location",
    score: 95,
    confidence: "High",
    status: "Awaiting Review",
    category: "Rescue assistance",
    detected: "3 hours ago",
    description: "The applicant phone number and reported location match.",
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
  },
  {
    id: "DUP-095",
    primaryCase: "REQ-2701",
    duplicateCase: "REQ-2689",
    factors: "Similar description · Same category",
    score: 81,
    confidence: "Medium",
    status: "Deferred",
    category: "Food & water",
    detected: "4 hours ago",
    description: "The descriptions and assistance categories are similar.",
    createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
  },
  {
    id: "DUP-091",
    primaryCase: "REQ-2650",
    duplicateCase: "REQ-2632",
    factors: "Same address · Shared contact",
    score: 97,
    confidence: "High",
    status: "Confirmed",
    category: "Medical supplies",
    detected: "5 hours ago",
    description:
      "The requests have matching contact details and address information.",
    createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
  },
  {
    id: "DUP-087",
    primaryCase: "REQ-2605",
    duplicateCase: "REQ-2588",
    factors: "Nearby location · Similar household",
    score: 72,
    confidence: "Medium",
    status: "Awaiting Review",
    category: "Emergency shelter",
    detected: "Yesterday",
    description:
      "The requests have similar household information and nearby locations.",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "DUP-081",
    primaryCase: "REQ-2540",
    duplicateCase: "REQ-2519",
    factors: "Similar description · Matching category",
    score: 64,
    confidence: "Low",
    status: "Not Duplicate",
    category: "Food & water",
    detected: "Yesterday",
    description:
      "Review determined that these are separate valid assistance requests.",
    createdAt: new Date(Date.now() - 28 * 3600000).toISOString(),
  },
];

let fallbackDuplicates = [...initialDuplicates];

export const potentialDuplicatesService = {
  async getStats(): Promise<{ data: DuplicatesStatsDto; isLiveBackend: boolean }> {
    try {
      const response = await request<DuplicatesStatsDto>("/duplicates/stats");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback
    }

    const awaiting = fallbackDuplicates.filter((d) => d.status === "Awaiting Review").length;
    const high = fallbackDuplicates.filter((d) => d.confidence === "High").length;
    const confirmed = fallbackDuplicates.filter((d) => d.status === "Confirmed").length;
    const deferred = fallbackDuplicates.filter((d) => d.status === "Deferred").length;
    const notDup = fallbackDuplicates.filter((d) => d.status === "Not Duplicate").length;

    return {
      data: {
        totalMatches: fallbackDuplicates.length,
        awaitingReviewCount: awaiting,
        highConfidenceCount: high,
        confirmedCount: confirmed,
        deferredCount: deferred,
        notDuplicateCount: notDup,
      },
      isLiveBackend: false,
    };
  },

  async getDuplicates(
    query: DuplicateQueryDto
  ): Promise<{ data: PaginatedResult<DuplicateCase>; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.similarity) params.append("similarity", query.similarity);
      if (query.status) params.append("status", query.status);
      if (query.category) params.append("category", query.category);
      if (query.dateRange) params.append("dateRange", query.dateRange);
      if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));

      const url = `/duplicates${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<PaginatedResult<DuplicateCase>>(url);
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend unavailable; fallback
    }

    let list = [...fallbackDuplicates];

    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.id.toLowerCase().includes(s) ||
          d.primaryCase.toLowerCase().includes(s) ||
          d.duplicateCase.toLowerCase().includes(s) ||
          d.factors.toLowerCase().includes(s) ||
          d.category.toLowerCase().includes(s)
      );
    }

    if (query.similarity && query.similarity !== "All similarity levels") {
      if (query.similarity === "High") list = list.filter((d) => d.score >= 85);
      else if (query.similarity === "Medium")
        list = list.filter((d) => d.score >= 70 && d.score < 85);
      else if (query.similarity === "Low") list = list.filter((d) => d.score < 70);
    }

    if (query.status && query.status !== "All review states") {
      list = list.filter((d) => d.status.toLowerCase() === query.status?.toLowerCase());
    }

    if (query.category && query.category !== "All categories") {
      list = list.filter((d) => d.category.toLowerCase() === query.category?.toLowerCase());
    }

    if (query.dateRange && query.dateRange !== "Date detected") {
      if (query.dateRange === "Today") {
        list = list.filter((d) => d.detected !== "Yesterday");
      }
    }

    const pageNumber = query.pageNumber || 1;
    const pageSize = query.pageSize || 4;
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

  async updateStatus(
    id: string,
    req: UpdateDuplicateStatusRequest
  ): Promise<{ data: DuplicateCase; isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<DuplicateCase>(`/duplicates/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(req),
      });
      if (response && response.success && response.data) {
        return {
          data: response.data,
          isLiveBackend: true,
          message: response.message || `Match ${id} status updated to ${req.status}.`,
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    const idx = fallbackDuplicates.findIndex((d) => d.id === id);
    if (idx !== -1) {
      fallbackDuplicates[idx] = {
        ...fallbackDuplicates[idx],
        status: req.status,
        reviewNotes: req.notes || fallbackDuplicates[idx].reviewNotes,
      };
      return {
        data: fallbackDuplicates[idx],
        isLiveBackend: false,
        message: `Match ${id} status updated to ${req.status} (Demo Mode).`,
      };
    }

    throw new Error(`Match ${id} not found.`);
  },

  async mergeCases(
    req: MergeCasesRequest
  ): Promise<{ isLiveBackend: boolean; message: string }> {
    try {
      const response = await request<boolean>("/duplicates/merge", {
        method: "POST",
        body: JSON.stringify(req),
      });
      if (response && response.success) {
        return {
          isLiveBackend: true,
          message:
            response.message ||
            `Successfully merged ${req.duplicateCaseId} into ${req.primaryCaseId}.`,
        };
      }
    } catch {
      // Backend unavailable; fallback
    }

    const idx = fallbackDuplicates.findIndex((d) => d.id === req.matchId);
    if (idx !== -1) {
      fallbackDuplicates[idx].status = "Confirmed";
      fallbackDuplicates[idx].reviewNotes =
        req.resolutionNotes ||
        `Merged case ${req.duplicateCaseId} into primary ${req.primaryCaseId}.`;
    }

    return {
      isLiveBackend: false,
      message: `Merged case ${req.duplicateCaseId} into ${req.primaryCaseId} (Demo Mode).`,
    };
  },

  async downloadExportCsv(query: DuplicateQueryDto): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.similarity) params.append("similarity", query.similarity);
      if (query.status) params.append("status", query.status);
      if (query.category) params.append("category", query.category);
      if (query.dateRange) params.append("dateRange", query.dateRange);

      const url = `${API_BASE_URL}/duplicates/export?${params.toString()}`;
      const res = await authFetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `carelink-potential-duplicates-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return;
      }
    } catch {
      // Backend export failed, fallback to client generation
    }

    // Client-side fallback
    const headers = [
      "Match ID",
      "Primary Case",
      "Possible Duplicate",
      "Similarity Factors",
      "Score",
      "Confidence",
      "Status",
      "Category",
      "Detected",
    ];

    const rows = fallbackDuplicates.map((item) => [
      item.id,
      item.primaryCase,
      item.duplicateCase,
      item.factors,
      `${item.score}%`,
      item.confidence,
      item.status,
      item.category,
      item.detected,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "potential-duplicates.csv";
    link.click();
    URL.revokeObjectURL(url);
  },
};
