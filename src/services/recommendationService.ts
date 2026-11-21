export interface Recommendation {
  id: string;
  request: string;
  category: string;
  priority: string;
  confidence: number;
  action: string;
  timestamp: string;
  reviewState: string;
  explanation: string;
  alternative: string;
  decision?: string | null;
  rationale?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
}

export interface RecommendationMetrics {
  awaitingReview: number;
  highUrgency: number;
  acceptanceRate: number;
  overrideRate: number;
  totalReviewed: number;
  totalRecommendations: number;
}

export interface RecordDecisionRequest {
  decision: "Approved" | "Modified" | "Rejected" | "Deferred" | string;
  rationale: string;
  reviewedBy?: string;
}

export interface GenerateRecommendationRequest {
  requestId?: string;
  category: string;
  location?: string;
  description?: string;
  affectedPeopleCount?: number;
  hasVulnerableMembers?: boolean;
  isLifeThreatening?: boolean;
  hasRoadBlockage?: boolean;
  priorityHint?: string;
}

export interface RecommendationFilters {
  search?: string;
  category?: string;
  priority?: string;
  confidence?: string;
  reviewState?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5277";

export const recommendationService = {
  async getRecommendations(filters?: RecommendationFilters): Promise<Recommendation[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category && filters.category !== "All recommendation types") {
      params.append("category", filters.category);
    }
    if (filters?.priority && filters.priority !== "All priorities") {
      params.append("priority", filters.priority);
    }
    if (filters?.confidence && filters.confidence !== "Confidence range") {
      params.append("confidence", filters.confidence);
    }
    if (filters?.reviewState && filters.reviewState !== "Review state") {
      params.append("reviewState", filters.reviewState);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE}/api/recommendations${queryString}`);
    if (!response.ok) {
      throw new Error(`Failed to load recommendations: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getMetrics(): Promise<RecommendationMetrics> {
    const response = await fetch(`${API_BASE}/api/recommendations/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getById(id: string): Promise<Recommendation> {
    const response = await fetch(`${API_BASE}/api/recommendations/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch recommendation ${id}: ${response.status}`);
    }
    return response.json();
  },

  async recordDecision(id: string, data: RecordDecisionRequest): Promise<Recommendation> {
    const response = await fetch(`${API_BASE}/api/recommendations/${encodeURIComponent(id)}/decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to record decision: ${response.status}`);
    }
    return response.json();
  },

  async generateRecommendation(data: GenerateRecommendationRequest): Promise<Recommendation> {
    const response = await fetch(`${API_BASE}/api/recommendations/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to generate recommendation: ${response.status}`);
    }
    return response.json();
  },

  async resetData(): Promise<{ message: string; metrics: RecommendationMetrics }> {
    const response = await fetch(`${API_BASE}/api/recommendations/reset`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Failed to reset data: ${response.status}`);
    }
    return response.json();
  },
};
