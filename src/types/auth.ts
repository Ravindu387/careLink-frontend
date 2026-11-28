export type AccountStatus =
  | "Active"
  | "PendingApproval"
  | "AdditionalInfoRequested"
  | "PendingPasswordSetup"
  | "Rejected"
  | "Disabled";

export interface User {
  id: string;
  userName?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  alternativePhoneNumber?: string;
  designation?: string;
  nic?: string;
  address?: string;
  roles: string[];
  permissions: string[];
  organizationId?: string;
  organizationName?: string;
  organizationApprovalStatus?: string;
  additionalInfoRequest?: string | null;
  isActive: boolean;
  accountStatus?: AccountStatus | string;
  rejectionReason?: string | null;
  skills?: string | null;
  availability?: string | null;
  preferredLocation?: string | null;
  requiresPasswordSetup?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
  accountStatus: AccountStatus | string;
  isActive: boolean;
  emailConfirmed: boolean;
  requiresEmailVerification: boolean;
  requiresAdminApproval: boolean;
  organizationId?: string;
  organizationName?: string;
  verificationRequestId?: string;
  emailSent?: boolean;
  adminNotificationSent?: boolean;
  uploadedDocumentsCount?: number;
  token?: string | null;
  expiresAt?: string | null;
  message: string;
  user?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterDocumentUpload {
  category:
    | "RegistrationCertificate"
    | "OrganisationProfile"
    | "AuthorisationLetter"
    | "SupportingDocument";
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  base64Content: string;
}

export interface PartnerAdditionalInfoSubmission {
  email: string;
  password: string;
  responseText: string;
  additionalDocuments?: RegisterDocumentUpload[];
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phoneNumber: string;
  nic?: string;
  address?: string;
  role?: string;
  organizationId?: string;

  // A. Partner Organisation Basic Information
  organizationName?: string;
  organizationType?: string;
  otherOrganizationType?: string;
  registrationCountry?: string;
  registrationNumber?: string;
  yearEstablished?: number;
  website?: string;
  organizationEmail?: string;
  organizationPhone?: string;
  secondaryContactPhone?: string;
  organizationAddress?: string;
  district?: string;
  province?: string;
  organizationDescription?: string;

  // B. Humanitarian Operational Information
  areasOfOperation?: string[];
  areasOfAssistance?: string[];
  otherAreaOfAssistance?: string;
  operationalCapacity?: string;
  emergencyResponseAvailability?: string;
  additionalResources?: string;

  // C. Authorised Representative Information
  representativeFirstName?: string;
  representativeLastName?: string;
  representativeDesignation?: string;
  representativeEmail?: string;
  representativePhone?: string;
  representativeAlternativePhone?: string;

  // D. Verification Documents & Confirmations
  documents?: RegisterDocumentUpload[];
  confirmAuthorisedRepresentative?: boolean;
  confirmAccurateInformation?: boolean;
  agreeTermsAndPrivacy?: boolean;

  // Volunteer Profile Fields
  skills?: string;
  availability?: string;
  preferredLocation?: string;
}

export interface SetupPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword?: string;
}
