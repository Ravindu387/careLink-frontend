export type OrderStatus =
  | "Approved"
  | "In Transit"
  | "Awaiting Approval"
  | "Delivered"
  | "Rejected";

export type ProcurementType = "Emergency" | "Standard";

export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: string;
  quantity: string;
  value: string;
  type: ProcurementType;
  deliveryDue: string;
  status: OrderStatus;
  notes?: string;
  createdAt?: string;
}

export interface CreatePurchaseOrderPayload {
  supplier: string;
  items: string;
  quantity: string;
  value: string;
  type: ProcurementType;
  deliveryDue: string;
  status?: OrderStatus;
  notes?: string;
}

export interface UpdatePurchaseOrderStatusPayload {
  status: OrderStatus;
  notes?: string;
}

export interface ProcurementQueryParams {
  search?: string;
  supplier?: string;
  type?: string;
  status?: string;
  tab?: string;
}

export interface ProcurementSummary {
  openOrders: number;
  emergencyOrders: number;
  dueThisWeek: number;
  supplierFulfilment: string;
  totalCommittedValue: string;
  awaitingApprovalCount: number;
}
