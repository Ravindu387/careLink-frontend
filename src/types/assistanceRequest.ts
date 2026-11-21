export type Priority = "Critical" | "High" | "Medium" | "Low";

export type RequestStatus =
  | "Awaiting review"
  | "Verified"
  | "Assigned"
  | "In progress"
  | "Completed"
  | "Rejected";

export interface AssistanceRequest {
  id: string;
  timeAgo: string;
  createdAt: string;
  category: string;
  location: string;
  reportedPriority: Priority;
  recommendation: string;
  confidence: string;
  assignedTo: string;
  status: RequestStatus;
  affectedPeople: number;
  contact: string;
  description: string;
  rejectionReason?: string;
  fieldVerificationNote?: string;
  crisisName?: string;
}

export interface AssistanceRequestStats {
  totalRequests: number;
  awaitingReviewCount: number;
  verifiedCount: number;
  assignedCount: number;
  inProgressCount: number;
  completedCount: number;
  criticalCount: number;
}

export interface AssistanceRequestQuery {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  crisis?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateAssistanceRequestPayload {
  category: string;
  location: string;
  reportedPriority?: string;
  affectedPeople?: number;
  contact?: string;
  description: string;
  crisisName?: string;
}

export interface UpdateAssistanceRequestPayload {
  category: string;
  location: string;
  reportedPriority: string;
  affectedPeople: number;
  contact: string;
  description: string;
}
