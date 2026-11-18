export type ResidentStatus = "Active" | "Assistance" | "Checked Out";

export interface Resident {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  familyGroup: string;
  shelter: string;
  shelterId: string;
  room: string;
  bed: string;
  checkIn: string;
  checkInDate?: string;
  status: ResidentStatus;
  assistanceNeeds: string;
  checkedOutAt?: string;
}

export interface ResidentSummary {
  totalRegistered: number;
  totalShelters: number;
  familyGroupsCount: number;
  singleResidentsCount: number;
  assistanceNeedsCount: number;
  checkedOutTodayCount: number;
  checkedInTodayCount: number;
}

export interface ResidentQueryParams {
  search?: string;
  shelterId?: string;
  status?: string;
  assistanceFilter?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateResidentInput {
  name: string;
  age: number;
  gender: string;
  contact: string;
  familyGroup?: string;
  shelterId: string;
  room: string;
  bed: string;
  assistanceNeeds?: string;
}

export interface UpdateResidentInput {
  name?: string;
  age?: number;
  gender?: string;
  contact?: string;
  familyGroup?: string;
  shelterId?: string;
  room?: string;
  bed?: string;
  status?: ResidentStatus;
  assistanceNeeds?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
