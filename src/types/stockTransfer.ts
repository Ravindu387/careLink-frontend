export type TransferStatus =
  | "Approved"
  | "In Transit"
  | "Completed"
  | "Rejected"
  | "Pending";

export interface Transfer {
  id: string;
  source: string;
  destination: string;
  resource: string;
  quantity: string;
  requestedBy: string;
  scheduled: string;
  status: TransferStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransferPayload {
  source: string;
  destination: string;
  resource: string;
  quantity: string;
  requestedBy: string;
  scheduled: string;
}

export interface UpdateTransferStatusPayload {
  status: TransferStatus;
}

export interface TransferSummary {
  activeCount: number;
  awaitingCount: number;
  completedCount: number;
  exceptionCount: number;
  totalCount: number;
}
