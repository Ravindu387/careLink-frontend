export interface Organization {
  id: string;
  code: string;
  name: string;
  type: string;
  scope: string;
  registrationNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  membersCount: number;
  verificationStatus: "Verified" | "Pending Review";
  status: "Active" | "Pending" | "Suspended";
  isActive: boolean;
  createdAt: string;
  description?: string;
}

export interface OrganizationStats {
  totalOrganizations: number;
  activeOrganizations: number;
  pendingOrganizations: number;
  suspendedOrganizations: number;
  verifiedOrganizations: number;
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
  description?: string;
}

export interface UpdateOrganizationPayload {
  name: string;
  type: string;
  scope?: string;
  registrationNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
}
