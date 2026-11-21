export type AllocationStatus =
  | "Partially Allocated"
  | "Allocated"
  | "Released"
  | "Completed"
  | "Pending";

export interface Allocation {
  id: string;
  request: string;
  resource: string;
  quantity: string;
  source: string;
  destination: string;
  approvedBy: string;
  approvedAt: string;
  status: AllocationStatus;
  warehouse: string;
  createdAt?: string;
}

export interface CreateAllocationPayload {
  request: string;
  resource: string;
  quantity: string;
  source: string;
  destination: string;
  approvedBy?: string;
}

export interface UpdateAllocationStatusPayload {
  status: AllocationStatus;
  approvedBy?: string;
}

export interface AllocationSummary {
  activeCount: number;
  awaitingCount: number;
  completedCount: number;
  exceptionCount: number;
}

export interface AllocationQueryParams {
  tab?: string;
  search?: string;
  warehouse?: string;
  destination?: string;
  status?: string;
}
