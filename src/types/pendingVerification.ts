export type Priority = "Standard" | "High" | "Urgent";
export type VerificationStatus = "Pending" | "Approved" | "Rejected";

export interface VolunteerApplication {
  id: string;
  applicant: string;
  skills: string[];
  location: string;
  documents: string[];
  submitted: string;
  createdAt?: string;
  priority: Priority;
  documentState: string;
  status: VerificationStatus;
  email: string;
  phone: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface VolunteerVerificationStatsDto {
  totalApplications: number;
  pendingCount: number;
  urgentCount: number;
  highPriorityCount: number;
  standardPriorityCount: number;
  completeDocumentsCount: number;
  incompleteDocumentsCount: number;
  approvedCount: number;
  rejectedCount: number;
  oldestPendingSubmission: string;
}

export interface VolunteerVerificationQueryDto {
  search?: string;
  priority?: string;
  skill?: string;
  documentState?: string;
  dateFilter?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ReviewVerificationRequest {
  notes?: string;
  reviewedBy?: string;
}

export interface CreateVerificationApplicationRequest {
  applicant: string;
  skills: string[];
  location: string;
  documents: string[];
  priority?: Priority;
  documentState?: string;
  email: string;
  phone: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
