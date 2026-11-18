export type RequestStatus =
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Assigned";

export type Priority = "Critical" | "High" | "Medium" | "Low";

export interface AccommodationRequest {
  id: string;
  applicant: string;
  familyMembers: number;
  currentLocation: string;
  requestedShelter: string;
  shelterId: string;
  priority: Priority;
  requestDate: string;
  requestDateUtc?: string;
  status: RequestStatus;
}

export interface Shelter {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
  currentOccupancy?: number;
}

export interface RequestCounts {
  "All requests": number;
  Pending: number;
  "Under Review": number;
  Approved: number;
  Assigned: number;
}

export interface AccommodationRequestQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  shelterId?: string;
  dateRange?: string;
  minFamilyMembers?: number;
  maxFamilyMembers?: number;
  location?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateAccommodationRequestInput {
  applicant: string;
  familyMembers: number;
  currentLocation: string;
  requestedShelter: string;
  priority: Priority;
}
