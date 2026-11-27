import { request } from "./api";
import type {
  AiRecommendationDetail,
  AiRecommendationMetrics,
  AiRecommendationSummary,
  ApproveRecommendationPayload,
  DeferRecommendationPayload,
  GenerateCrisisAnalysisPayload,
  GenerateResourcePlanPayload,
  GenerateResponsePlanPayload,
  GenerateShelterPlanPayload,
  GenerateVolunteerPlanPayload,
  RecordDecisionPayload,
  RejectRecommendationPayload,
} from "../types/aiRecommendation";

export const FALLBACK_METRICS: AiRecommendationMetrics = {
  totalRecommendations: 8,
  totalCases: 8,
  awaitingReviewCount: 8,
  approvedCount: 0,
  modifiedCount: 0,
  deferredCount: 0,
  rejectedCount: 0,
  averageConfidence: 91,
};

export const FALLBACK_SUMMARIES: AiRecommendationSummary[] = [
  {
    id: "AI-9041",
    crisisId: "CR-2025-018",
    crisisName: "Monsoon Floods 2025",
    requestId: "REQ-2841",
    category: "AssistanceTriage",
    title: "Emergency Evacuation & Accessible Shelter Triage",
    recommendedPriority: "Critical",
    confidence: 94,
    action: "Evacuation + accessible shelter",
    timestamp: "12 min ago",
    reviewState: "Awaiting Review",
    explanation: "Immediate risk to life is indicated by active inundation combined with vulnerable household members.",
    alternative: "Deploy rubber boat crew for extraction",
    location: "Riverside, North Ward",
  },
  {
    id: "AI-9038",
    crisisId: "CR-2025-018",
    crisisName: "Monsoon Floods 2025",
    requestId: "REQ-2839",
    category: "ResourceAllocation",
    title: "Critical Diabetic Insulin Cold-Chain Dispatch",
    recommendedPriority: "High",
    confidence: 91,
    action: "Dispatch Cold-Storage Insulin Pack + IV Hydration",
    timestamp: "26 min ago",
    reviewState: "Awaiting Review",
    explanation: "Community clinic refrigeration failed due to localized sub-station outage.",
    alternative: "Transfer critical patients to Colombo General",
    location: "Old Town, Sector 4",
  },
  {
    id: "AI-9032",
    crisisId: "CR-2025-018",
    crisisName: "Monsoon Floods 2025",
    requestId: "REQ-2836",
    category: "ResourceAllocation",
    title: "Potable Water & Water Purification Distribution",
    recommendedPriority: "High",
    confidence: 87,
    action: "Deploy 500L Mobile Water Bowsers + 120 Purification Kits",
    timestamp: "41 min ago",
    reviewState: "Awaiting Review",
    explanation: "Municipal pipeline rupture reported alongside sewage infiltration.",
    alternative: "Truck bottled water pallets from Central Depot",
    location: "Eastbank, Sector 2",
  },
  {
    id: "AI-9024",
    crisisId: "CR-2025-018",
    crisisName: "Monsoon Floods 2025",
    requestId: "REQ-2821",
    category: "VolunteerAssignment",
    title: "High-Water Swift Rescue Deployment",
    recommendedPriority: "Critical",
    confidence: 96,
    action: "Dispatch Swift-Water Rescue Team + Zodiac Dinghy",
    timestamp: "1h 30m ago",
    reviewState: "Awaiting Review",
    explanation: "5 occupants trapped on single-story roof near canal breach.",
    alternative: "Helicopter winch extraction via Air Force Unit 4",
    location: "North Ward, Canal Reach",
  },
  {
    id: "AI-9019",
    crisisId: "CR-2025-018",
    crisisName: "Monsoon Floods 2025",
    requestId: "REQ-2814",
    category: "AssistanceTriage",
    title: "Chronic Medication Support Verification",
    recommendedPriority: "High",
    confidence: 74,
    action: "Review Prescriptions & Coordinate Mobile Dispensary",
    timestamp: "2h 05m ago",
    reviewState: "Awaiting Review",
    explanation: "Applicant unable to leave isolation zone for routine hypertension refills.",
    alternative: "Volunteer dispatch via motorcycle courier",
    location: "West District, Hillside",
  },
  {
    id: "AI-9015",
    crisisId: "CR-2025-018",
    crisisName: "Monsoon Floods 2025",
    requestId: "REQ-2802",
    category: "ResourceAllocation",
    title: "Community Hall Food & Dry Ration Rations",
    recommendedPriority: "Critical",
    confidence: 93,
    action: "Dispatch 60 Emergency Dry Food Rations + Infant Formula",
    timestamp: "45 min ago",
    reviewState: "Awaiting Review",
    explanation: "60 evacuees assembled at community hall with depleted cooking resources.",
    alternative: "Coordinate hot-meals catering with local NGO partners",
    location: "South Ward, Sector 3",
  },
  {
    id: "AI-9012",
    crisisId: "CR-2025-018",
    crisisName: "Monsoon Floods 2025",
    requestId: "REQ-2795",
    category: "ShelterMatching",
    title: "Family Emergency Shelter Bed Allocation",
    recommendedPriority: "High",
    confidence: 89,
    action: "Allocate 4 Shelter Beds at North Community Hall",
    timestamp: "52 min ago",
    reviewState: "Awaiting Review",
    explanation: "Family residence roof partially damaged by fallen branches.",
    alternative: "Allocate temporary tent accommodation at St. Mary Hall",
    location: "Lowland Ward, River Road",
  },
  {
    id: "AI-9008",
    crisisId: "CR-2025-018",
    crisisName: "Monsoon Floods 2025",
    requestId: "REQ-2804",
    category: "AssistanceTriage",
    title: "Tarpaulins & temporary roofing",
    recommendedPriority: "Medium",
    confidence: 78,
    action: "Deliver 2 Heavy-Duty Tarpaulins + tie-down kit",
    timestamp: "4 hr ago",
    reviewState: "Awaiting Review",
    explanation: "Property preservation and moisture mitigation for elderly resident.",
    alternative: "Deploy volunteer repair team when wind subsides",
    location: "East Hillside",
  },
];

export const FALLBACK_DETAILS: AiRecommendationDetail[] = [
  {
    id: "AI-9041",
    crisisId: "CR-2025-018",
    crisisName: "Monsoon Floods 2025",
    requestId: "REQ-2841",
    category: "AssistanceTriage",
    title: "Emergency Evacuation & Accessible Shelter Triage",
    summary: "Household of 6 with vulnerable occupants facing active residential inundation in North Ward.",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    requestCategory: "Emergency shelter",
    reportedUrgency: "Reported urgent",
    description: "Household of six requires evacuation as flood water enters their residence.",
    location: "Riverside, North Ward",
    vulnerabilityFactors: "Children, limited mobility",
    affectedPeople: 6,
    submittedTime: "12 minutes ago",
    verificationStatus: "Contact verified",
    evidenceNote: "Citizen description and location boundary are verified. Water level confirmed exceeding 0.5m.",
    relevantInformation: [
      "Flood water reported inside residence",
      "6 affected people, including 2 children",
      "1 household member needs mobility support",
      "1.4 km from active evacuation zone",
    ],
    modelName: "Google Gemini 1.5 Flash (Grounded)",
    modelTimestamp: "13:01 UTC",
    recommendedPriority: "Critical",
    confidence: 94,
    explanation:
      "Immediate risk to life is indicated by active inundation combined with vulnerable household members and limited self-evacuation capability.",
    alternatives: [
      { priority: "High", likelihoodPercentage: 6 },
    ],
    recommendedAction: "Evacuation + accessible shelter",
    warningMessage: "Rising river tributary may cut off Riverside road within 45 minutes",
    isDecisionRecorded: false,
    risks: [
      "River level expected to peak within 45 minutes",
      "Road blockage on Market Street access point",
    ],
    assumptions: [
      "Household remains at reported address",
      "Mobile cellular connection is operational",
    ],
    missingInformation: [
      "Exact wheelchair width specifications",
    ],
    resourceRecommendations: [
      {
        resourceName: "Water - 10L",
        category: "Food & Water",
        recommendedQuantity: 6,
        availableQuantity: 8420,
        isShortage: false,
        shortageQuantity: 0,
        targetCrisisLocation: "North Community Hall",
        priority: "Critical",
        rationale: "Mandatory 72-hour clean water ration for 6 evacuees",
        alternativeResource: "Water Purification Tablets",
      },
    ],
    shelterRecommendations: [
      {
        shelterName: "North Community Hall",
        location: "North Ward",
        capacity: 400,
        currentOccupancy: 184,
        remainingCapacity: 216,
        recommendedEvacueeCount: 6,
        suitabilityReason: "Located within 2.2 km, wheelchair ramp access verified",
        safetyAndAccessibilityNotes: "Operational food station and medical triage on site",
      },
    ],
    volunteerRecommendations: [
      {
        skillGroup: "First Aid & Mobility Support",
        recommendedCount: 2,
        suggestedTask: "Assist evacuees with transfer and intake reception",
        priority: "Critical",
        rationale: "Specialized care required for limited mobility resident",
      },
    ],
    reviewState: "Awaiting Review",
  },
  {
    id: "AI-9008",
    crisisId: "CR-2025-018",
    crisisName: "Monsoon Floods 2025",
    requestId: "REQ-2804",
    category: "AssistanceTriage",
    title: "Tarpaulins & temporary roofing",
    summary: "Roof tiles displaced by gale-force winds causing rainwater leakage.",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    requestCategory: "Shelter & Logistics",
    reportedUrgency: "Standard report",
    description: "Roof tiles displaced by gale-force winds causing rainwater leakage.",
    location: "East Hillside",
    vulnerabilityFactors: "Elderly resident",
    affectedPeople: 1,
    submittedTime: "4 hr ago",
    verificationStatus: "Contact verified",
    evidenceNote: "Single occupant, house structurally sound. Rain entering master bedroom.",
    relevantInformation: [
      "Single occupant, house structurally sound",
      "Rain entering master bedroom",
      "Ground floor intact",
    ],
    modelName: "Google Gemini 1.5 Flash (Grounded)",
    modelTimestamp: "08:30 UTC",
    recommendedPriority: "Medium",
    confidence: 78,
    explanation:
      "Property preservation and moisture mitigation. Structure is stable, and interior water damage is localized.",
    alternatives: [
      { priority: "Low", likelihoodPercentage: 22 },
    ],
    recommendedAction: "Deliver 2 Heavy-Duty Tarpaulins + tie-down kit",
    warningMessage: "Slippery roof surface during persistent rain",
    isDecisionRecorded: false,
    risks: [
      "Slippery roof surface during persistent rain",
    ],
    assumptions: [
      "Structure has no major foundation compromise",
    ],
    missingInformation: [],
    resourceRecommendations: [
      {
        resourceName: "Heavy-Duty Tarpaulins (12x18ft)",
        category: "Shelter & Logistics",
        recommendedQuantity: 2,
        availableQuantity: 240,
        isShortage: false,
        shortageQuantity: 0,
        targetCrisisLocation: "East Hillside",
        priority: "Medium",
        rationale: "Roof leak mitigation for isolated home",
        alternativeResource: "Plastic Waterproof Sheeting Roll",
      },
    ],
    shelterRecommendations: [],
    volunteerRecommendations: [],
    reviewState: "Awaiting Review",
  },
];

export const aiRecommendationService = {
  async getRecommendations(params?: {
    status?: string;
    priority?: string;
    category?: string;
    crisisId?: string;
    search?: string;
  }): Promise<AiRecommendationSummary[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "All") query.append("status", params.status);
    if (params?.priority && params.priority !== "All") query.append("priority", params.priority);
    if (params?.category && params.category !== "All") query.append("category", params.category);
    if (params?.crisisId && params.crisisId !== "All") query.append("crisisId", params.crisisId);
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    try {
      const res = await request<AiRecommendationSummary[]>(`/ai-recommendations${queryString}`, {
        method: "GET",
      });
      if (res && res.data && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Backend unavailable; fallback
    }

    let list = [...FALLBACK_SUMMARIES];
    if (params?.status && params.status !== "All") {
      list = list.filter((r) => r.reviewState.toLowerCase() === params.status?.toLowerCase());
    }
    if (params?.priority && params.priority !== "All") {
      list = list.filter((r) => r.recommendedPriority.toLowerCase() === params.priority?.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((r) => r.id.toLowerCase().includes(q) || r.requestId.toLowerCase().includes(q) || r.location.toLowerCase().includes(q));
    }
    return list;
  },

  async getMetrics(): Promise<AiRecommendationMetrics> {
    try {
      const res = await request<AiRecommendationMetrics>("/ai-recommendations/metrics", {
        method: "GET",
      });
      if (res && res.data) return res.data;
    } catch {
      // Backend unavailable; fallback
    }
    return FALLBACK_METRICS;
  },

  async getRecommendationById(id: string): Promise<AiRecommendationDetail> {
    const cleanId = id && id !== "undefined" && id !== "null" ? id.trim() : "AI-9041";
    try {
      const res = await request<AiRecommendationDetail>(`/ai-recommendations/${encodeURIComponent(cleanId)}`, {
        method: "GET",
      });
      if (res && res.data) return res.data;
    } catch {
      // Backend unavailable; fallback
    }
    const found = FALLBACK_DETAILS.find((d) => d.id === cleanId);
    if (found) return found;

    const summary = FALLBACK_SUMMARIES.find((s) => s.id === cleanId) || FALLBACK_SUMMARIES[0];
    return {
      ...FALLBACK_DETAILS[0],
      id: summary.id,
      requestId: summary.requestId,
      category: summary.category,
      title: summary.title || summary.action,
      location: summary.location,
      recommendedPriority: summary.recommendedPriority,
      confidence: summary.confidence,
      recommendedAction: summary.action,
      explanation: summary.explanation,
      reviewState: summary.reviewState,
    };
  },

  async getRecommendationByRequestId(requestId: string): Promise<AiRecommendationDetail> {
    const cleanReqId = requestId && requestId !== "undefined" && requestId !== "null" ? requestId.trim() : "REQ-2841";
    try {
      const res = await request<AiRecommendationDetail>(`/ai-recommendations/by-request/${encodeURIComponent(cleanReqId)}`, {
        method: "GET",
      });
      if (res && res.data) return res.data;
    } catch {
      // Backend unavailable; fallback
    }
    const found = FALLBACK_DETAILS.find((d) => d.requestId === cleanReqId);
    if (found) return found;

    const summary = FALLBACK_SUMMARIES.find((s) => s.requestId === cleanReqId) || FALLBACK_SUMMARIES[0];
    return {
      ...FALLBACK_DETAILS[0],
      id: summary.id,
      requestId: summary.requestId,
      category: summary.category,
      title: summary.title || summary.action,
      location: summary.location,
      recommendedPriority: summary.recommendedPriority,
      confidence: summary.confidence,
      recommendedAction: summary.action,
      explanation: summary.explanation,
      reviewState: summary.reviewState,
    };
  },

  async recordDecision(
    id: string,
    payload: RecordDecisionPayload
  ): Promise<AiRecommendationDetail> {
    try {
      const res = await request<AiRecommendationDetail>(`/ai-recommendations/${id}/decision`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res && res.data) return res.data;
    } catch {
      // Demo fallback
    }
    const detail = await this.getRecommendationById(id);
    detail.reviewState = detail.recommendedPriority === payload.priority ? "Approved" : "Modified";
    detail.decidedPriority = payload.priority;
    detail.decisionRationale = payload.rationale;
    detail.isDecisionRecorded = true;
    return detail;
  },

  async approveRecommendation(
    id: string,
    payload?: ApproveRecommendationPayload
  ): Promise<AiRecommendationDetail> {
    try {
      const res = await request<AiRecommendationDetail>(`/ai-recommendations/${id}/approve`, {
        method: "POST",
        body: JSON.stringify(payload || {}),
      });
      if (res && res.data) return res.data;
    } catch {
      // Demo fallback
    }
    const detail = await this.getRecommendationById(id);
    detail.reviewState = "Approved";
    detail.decidedPriority = payload?.decidedPriority || detail.recommendedPriority;
    detail.decisionRationale = payload?.notes || "AI recommendation approved as evaluated.";
    detail.isDecisionRecorded = true;
    return detail;
  },

  async rejectRecommendation(
    id: string,
    payload: RejectRecommendationPayload
  ): Promise<AiRecommendationDetail> {
    try {
      const res = await request<AiRecommendationDetail>(`/ai-recommendations/${id}/reject`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res && res.data) return res.data;
    } catch {
      // Demo fallback
    }
    const detail = await this.getRecommendationById(id);
    detail.reviewState = "Rejected";
    detail.rejectionReason = payload.rejectionReason;
    detail.decisionRationale = `Rejected: ${payload.rejectionReason}. Notes: ${payload.notes || "None"}`;
    detail.isDecisionRecorded = true;
    return detail;
  },

  async deferRecommendation(
    id: string,
    payload?: DeferRecommendationPayload
  ): Promise<AiRecommendationDetail> {
    try {
      const res = await request<AiRecommendationDetail>(`/ai-recommendations/${id}/defer`, {
        method: "POST",
        body: JSON.stringify(payload || {}),
      });
      if (res && res.data) return res.data;
    } catch {
      // Demo fallback
    }
    const detail = await this.getRecommendationById(id);
    detail.reviewState = "Deferred";
    detail.decisionRationale = payload?.reason || "Deferred for secondary evaluation.";
    detail.isDecisionRecorded = true;
    return detail;
  },

  async resetRecommendation(id: string): Promise<AiRecommendationDetail> {
    try {
      const res = await request<AiRecommendationDetail>(`/ai-recommendations/${id}/reset`, {
        method: "POST",
      });
      if (res && res.data) return res.data;
    } catch {
      // Demo fallback
    }
    const detail = await this.getRecommendationById(id);
    detail.reviewState = "Awaiting Review";
    detail.decidedPriority = undefined;
    detail.decisionRationale = undefined;
    detail.isDecisionRecorded = false;
    return detail;
  },

  async generateCrisisAnalysis(
    crisisId: string,
    payload?: GenerateCrisisAnalysisPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai/crises/${encodeURIComponent(crisisId)}/analysis`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },

  async generateResourceRecommendations(
    crisisId: string,
    payload?: GenerateResourcePlanPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai/crises/${encodeURIComponent(crisisId)}/resources`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },

  async generateShelterRecommendations(
    crisisId: string,
    payload?: GenerateShelterPlanPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai/crises/${encodeURIComponent(crisisId)}/shelters`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },

  async generateVolunteerRecommendations(
    crisisId: string,
    payload?: GenerateVolunteerPlanPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai/crises/${encodeURIComponent(crisisId)}/volunteers`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },

  async generateResponsePlan(
    crisisId: string,
    payload?: GenerateResponsePlanPayload
  ): Promise<AiRecommendationDetail> {
    const res = await request<AiRecommendationDetail>(`/ai/crises/${encodeURIComponent(crisisId)}/response-plan`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    return res.data;
  },
};
