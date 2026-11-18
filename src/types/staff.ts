export type StaffStatus = "Active" | "Inactive";

export type Availability =
  | "Available"
  | "On duty"
  | "Leave"
  | "Absent";

export interface Staff {
  id: string;
  name: string;
  designation: string;
  contact: string;
  email: string;
  shelter: string;
  shift: string;
  availability: Availability;
  status: StaffStatus;
}

export interface ShiftDay {
  id?: number;
  day: string;
  date: number;
  assigned: number;
  capacity: number;
  shelter?: string;
}

export interface StaffSummary {
  totalStaff: number;
  onDuty: number;
  nextShift: number;
  unavailable: number;
}

export interface StaffQueryParams {
  search?: string;
  shelter?: string;
  designation?: string;
  shift?: string;
  availability?: string;
  status?: string;
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

export interface CreateStaffInput {
  name: string;
  designation: string;
  contact: string;
  email: string;
  shelter: string;
  shift?: string;
  availability?: Availability;
  status?: StaffStatus;
}

export interface UpdateStaffInput {
  name?: string;
  designation?: string;
  contact?: string;
  email?: string;
  shelter?: string;
  shift?: string;
  availability?: Availability;
  status?: StaffStatus;
}
