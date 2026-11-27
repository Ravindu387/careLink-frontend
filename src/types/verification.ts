export type VerificationStatus =
  | "Pending Review"
  | "Additional Info"
  | "Approved"
  | "Rejected";

export interface VerificationDocumentItem {
  id: string;
  documentId?: string;
  organizationId?: string;
  category?: string;
  name: string;
  originalFileName?: string;
  type: string;
  contentType?: string;
  size: string;
  fileSizeBytes?: number;
  status?: string;
  canDownload?: boolean;
  uploadedAt?: string;
}

export interface VerificationRequestItem {
  id: string;
  organizationId?: string;
  userId?: string;
  applicant: string;
  applicantEmail?: string;
  applicantPhone?: string;
  type: string;
  evidence: string;
  priority: "High" | "Standard";
  submitted: string;
  submittedAt?: string;
  createdAt?: string;
  status: VerificationStatus;
  documents: (string | VerificationDocumentItem)[];

  organizationName?: string;
  organizationType?: string;
  otherOrganizationType?: string;
  registrationCountry?: string;
  registrationNumber?: string;
  yearEstablished?: number;
  website?: string;
  secondaryContactPhone?: string;
  address?: string;
  district?: string;
  province?: string;
  description?: string;

  areasOfOperation?: string[];
  areasOfAssistance?: string[];
  otherAreaOfAssistance?: string;
  operationalCapacity?: string;
  emergencyResponseAvailability?: string;
  additionalResources?: string;

  representativeFullName?: string;
  representativeDesignation?: string;
  representativeEmail?: string;
  representativePhone?: string;
  representativeAlternativePhone?: string;
  loginEmail?: string;

  approvalStatus?: string;
  additionalInfoRequest?: string;
  additionalInfoResponse?: string;
  decisionNote?: string;
  decisionRationale?: string;
  decidedBy?: string;
  reviewedBy?: string;
  decidedAt?: string;
  reviewedAt?: string;
  emailSent?: boolean;
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
  decision?: "Approve" | "Reject" | "RequestInfo";
  status?: string;
  decisionNote?: string;
  rationale?: string;
}
