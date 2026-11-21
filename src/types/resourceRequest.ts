export type RequestPriority = "Critical" | "High" | "Medium" | "Low";

export type RequestStatus =
  | "Awaiting Approval"
  | "Partially Available"
  | "Allocated"
  | "Processing"
  | "Fulfilled";

export interface ResourceRequest {
  id: string;
  unit: string;
  resource: string;
  quantity: string;
  priority: RequestPriority;
  category: string;
  source: string;
  age: string;
  status: RequestStatus;
  createdAt?: string;
}

export interface ResourceRequestSummary {
  totalCount: number;
  openCount: number;
  awaitingApprovalCount: number;
  partiallyAvailableCount: number;
  fulfilledTodayCount: number;
  needsActionCount: number;
}

export interface CreateResourceRequestPayload {
  unit: string;
  resource: string;
  quantity: string;
  priority: RequestPriority;
  category: string;
  source?: string;
}

export interface UpdateResourceRequestStatusPayload {
  status: RequestStatus;
  source?: string;
}

export interface ResourceRequestQueryParams {
  tab?: string;
  search?: string;
  priority?: string;
  category?: string;
  requester?: string;
  status?: string;
}
