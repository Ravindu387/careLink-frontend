export interface OrganizationDocumentItem {
  id: string;
  organizationId: string;
  category: string;
  label: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  fileSizeDisplay: string;
  uploadedAt: string;
}

export interface Organization {
  id: string;
  code: string;
  name: string;
  type: string;
  otherOrganizationType?: string;
  scope: string;
  registrationCountry?: string;
  registrationNumber?: string;
  yearEstablished?: number;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
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

  representativeUserId?: string;
  representativeFirstName?: string;
  representativeLastName?: string;
  representativeFullName?: string;
  representativeDesignation?: string;
  representativeEmail?: string;
  representativePhone?: string;
  representativeAlternativePhone?: string;

  membersCount: number;
  verificationStatus: "Verified" | "Pending Review" | "Additional Info" | "Rejected";
  status: "Active" | "Pending" | "Suspended";
  approvalStatus?: string;
  isActive: boolean;
  rejectionReason?: string;
  additionalInfoRequest?: string;
  additionalInfoResponse?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  emailSent?: boolean;
  documents?: OrganizationDocumentItem[];
}

export interface OrganizationStats {
  totalOrganizations: number;
  activeOrganizations: number;
  pendingOrganizations: number;
  suspendedOrganizations: number;
  verifiedOrganizations: number;
  additionalInfoOrganizations?: number;
  rejectedOrganizations?: number;
}

export interface OrganizationQuery {
  search?: string;
  status?: string;
  type?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateOrganizationPayload {
  name: string;
  type: string;
  scope?: string;
  registrationNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  district?: string;
  province?: string;
  description?: string;
}

export interface UpdateOrganizationPayload {
  name: string;
  type: string;
  scope?: string;
  registrationNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  district?: string;
  province?: string;
  description?: string;
}

export interface OrganizationReviewDecisionPayload {
  decision: "Approve" | "Reject" | "RequestInfo";
  rationale: string;
}
