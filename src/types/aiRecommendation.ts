export interface AiAlternative {
  priority: string;
  likelihoodPercentage: number;
}

export interface AiRecommendationSummary {
  id: string;
  requestId: string;
  category: string;
  recommendedPriority: string;
  confidence: number;
  action: string;
  timestamp: string;
  reviewState: "Awaiting Review" | "Approved" | "Modified" | "Deferred" | string;
  explanation: string;
  alternative: string;
  location: string;
  decidedPriority?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

export interface AiRecommendationDetail {
  id: string;
  requestId: string;
  createdAt: string;
  requestCategory: string;
  reportedUrgency: string;
  description: string;
  location: string;
  vulnerabilityFactors: string;
  affectedPeople: number;
  submittedTime: string;
  verificationStatus: string;
  evidenceNote: string;
  relevantInformation: string[];

  modelName: string;
  modelTimestamp: string;
  recommendedPriority: "Critical" | "High" | "Medium" | "Low" | string;
  confidence: number;
  explanation: string;
  recommendedAction: string;
  alternatives: AiAlternative[];
  warningMessage: string;

  reviewState: "Awaiting Review" | "Approved" | "Modified" | "Deferred" | string;
  decidedPriority?: string | null;
  decisionRationale?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  isDecisionRecorded: boolean;
}

export interface RecordDecisionPayload {
  priority: string;
  rationale: string;
}

export interface DeferRecommendationPayload {
  reason?: string;
}

export interface AiRecommendationMetrics {
  totalRecommendations: number;
  awaitingReviewCount: number;
  approvedCount: number;
  modifiedCount: number;
  deferredCount: number;
  averageConfidence: number;
  lastUpdated: string;
}
