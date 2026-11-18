export type ShelterStatus = "Near Capacity" | "Active" | "Full" | "Maintenance";

export interface ShelterItem {
  id: string;
  name: string;
  location?: string;
  district: string;
  type: string;
  capacity: number;
  currentOccupancy?: number;
  occupied: number;
  reserved?: number;
  available?: number;
  rate?: number;
  manager: string;
  status: ShelterStatus;
}

export interface ShelterSummary {
  registered: number;
  operational: number;
  nearCapacity: number;
  maintenance: number;
}

export interface ShelterQueryParams {
  search?: string;
  district?: string;
  type?: string;
  status?: string;
  occupancy?: string;
  minCapacity?: number;
  maxCapacity?: number;
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

export interface CreateShelterInput {
  name: string;
  district: string;
  type: string;
  capacity: number;
  manager?: string;
  location?: string;
  status?: string;
}
