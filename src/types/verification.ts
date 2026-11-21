export type VerificationStatus =
  | "Pending Review"
  | "Additional Info"
  | "Approved"
  | "Rejected";

export interface VerificationRequestItem {
  id: string;
  applicant: string;
  applicantEmail?: string;
  type: string;
  evidence: string;
  priority: "High" | "Standard";
  submitted: string;
  createdAt?: string;
  status: VerificationStatus;
  documents: string[];
  decisionNote?: string;
  decidedBy?: string;
  decidedAt?: string;
}

export interface VerificationStats {
  totalPending: number;
  highPriority: number;
  approvedToday: number;
  additionalInfo: number;
  oldestPendingHours: number;
  oldestPendingText: string;
  slaTarget: string;
  slaStatus: string;
  totalRequests: number;
}

export interface VerificationQuery {
  search?: string;
  type?: string;
  priority?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface VerificationDecisionPayload {
  decision: "Approve" | "Reject" | "RequestInfo";
  decisionNote?: string;
}
