export type VerificationStatus = "Verified" | "Pending" | "Rejected";

export interface VolunteerItem {
  id: string;
  name: string;
  skills: string[];
  location: string;
  availability: string;
  verification: VerificationStatus;
  assignment: string;
  rating: string;
  phone?: string;
  email?: string;
  joinedDate?: string;
  hoursContributed?: number;
  createdAt?: string;
}

export interface VolunteerDirectoryStats {
  totalRegistered: string;
  verified: string;
  availableNow: string;
  assigned: string;
}

export interface VolunteerDirectoryQuery {
  search?: string;
  skill?: string;
  location?: string;
  availability?: string;
  verification?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface VolunteerDirectoryOverviewResponse {
  volunteers: VolunteerItem[];
  stats: VolunteerDirectoryStats;
  locations: string[];
  skills: string[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateVolunteerPayload {
  name: string;
  location: string;
  skills: string[];
  phone?: string;
  email?: string;
  availability?: string;
  assignment?: string;
}

export interface UpdateVolunteerPayload {
  name?: string;
  location?: string;
  skills?: string[];
  availability?: string;
  verification?: VerificationStatus;
  assignment?: string;
  rating?: string;
  phone?: string;
  email?: string;
}
