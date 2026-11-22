export interface AiAlternative {
  priority: string;
  likelihoodPercentage: number;
}

export interface AiResourcePlanItem {
  resourceName: string;
  category: string;
  recommendedQuantity: number;
  availableQuantity: number;
  isShortage: boolean;
  shortageQuantity: number;
  targetCrisisLocation: string;
  priority: string;
  rationale: string;
  alternativeResource: string;
}

export interface AiShelterPlanItem {
  shelterName: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  remainingCapacity: number;
  recommendedEvacueeCount: number;
  suitabilityReason: string;
  safetyAndAccessibilityNotes: string;
}

export interface AiVolunteerPlanItem {
  skillGroup: string;
  recommendedCount: number;
  suggestedTask: string;
  priority: string;
  rationale: string;
}

export interface AiRecommendationSummary {
  id: string;
  crisisId?: string;
  crisisName?: string;
  requestId: string;
  category: string;
  title?: string;
  recommendedPriority: string;
  confidence: number;
  action: string;
  timestamp: string;
  reviewState: "Awaiting Review" | "Approved" | "Modified" | "Deferred" | "Rejected" | string;
  explanation: string;
  alternative: string;
  location: string;
  decidedPriority?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  isLiveAiGenerated?: boolean;
}

export interface AiRecommendationDetail {
  id: string;
  crisisId?: string;
  crisisName?: string;
  requestId: string;
  category?: string;
  title?: string;
  summary?: string;
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
  isLiveAiGenerated?: boolean;

  immediatePriorities?: string[];
  risks?: string[];
  assumptions?: string[];
  missingInformation?: string[];
  resourceRecommendations?: AiResourcePlanItem[];
  shelterRecommendations?: AiShelterPlanItem[];
  volunteerRecommendations?: AiVolunteerPlanItem[];

  reviewState: "Awaiting Review" | "Approved" | "Modified" | "Deferred" | "Rejected" | string;
  decidedPriority?: string | null;
  decisionRationale?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  isDecisionRecorded: boolean;
}

export interface RecordDecisionPayload {
  priority: string;
  rationale: string;
}

export interface ApproveRecommendationPayload {
  decidedPriority?: string;
  notes?: string;
}

export interface RejectRecommendationPayload {
  rejectionReason: string;
  notes?: string;
}

export interface DeferRecommendationPayload {
  reason?: string;
}

export interface GenerateCrisisAnalysisPayload {
  crisisId?: string;
  crisisName?: string;
  focusArea?: string;
  additionalContext?: string;
}

export interface GenerateResourcePlanPayload {
  crisisId?: string;
  crisisName?: string;
  targetLocation?: string;
  urgency?: string;
  additionalContext?: string;
}

export interface GenerateShelterPlanPayload {
  crisisId?: string;
  crisisName?: string;
  evacueesCount?: number;
  needsAccessible?: boolean;
  additionalContext?: string;
}

export interface GenerateVolunteerPlanPayload {
  crisisId?: string;
  crisisName?: string;
  skillFilter?: string;
  targetVolunteerCount?: number;
  additionalContext?: string;
}

export interface GenerateResponsePlanPayload {
  crisisId?: string;
  crisisName?: string;
  operationalContext?: string;
}

export interface AiRecommendationMetrics {
  totalRecommendations: number;
  totalCases?: number;
  awaitingReviewCount: number;
  approvedCount: number;
  modifiedCount: number;
  deferredCount: number;
  rejectedCount?: number;
  averageConfidence: number;
  averageConfidencePercentage?: number;
  lastUpdated?: string;
}
