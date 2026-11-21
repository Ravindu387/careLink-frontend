export type DispatchStatus = "In Transit" | "Delayed" | "Delivered" | "Pending";

export interface Dispatch {
  id: string;
  route: string;
  resource: string;
  quantity: string;
  vehicle: string;
  driver: string;
  departed: string;
  eta: string;
  status: DispatchStatus;
  currentLocation?: string;
  notes?: string;
  createdAt?: string;
}

export interface CreateDispatchPayload {
  from?: string;
  to?: string;
  route?: string;
  resource: string;
  quantity: string;
  vehicle: string;
  driver: string;
  departed?: string;
  eta: string;
  status?: DispatchStatus;
  notes?: string;
}

export interface UpdateDispatchStatusPayload {
  status: DispatchStatus;
  currentLocation?: string;
  notes?: string;
}

export interface DispatchQueryParams {
  search?: string;
  status?: string;
  route?: string;
  vehicle?: string;
  tab?: string;
}

export interface DispatchSummary {
  active: number;
  onSchedule: number;
  delayed: number;
  delivered: number;
  total: number;
  needsAction: number;
}
