export type SupplierStatus = "Active" | "Inactive" | "Suspended";
export type Verification = "Verified" | "Pending" | "Rejected";

export interface Supplier {
  id: string;
  name: string;
  category: string;
  coverage: string;
  onTimeRate: string;
  leadTime: string;
  verification: Verification;
  status: SupplierStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupplierPayload {
  name: string;
  category: string;
  coverage: string;
  onTimeRate: string;
  leadTime: string;
  verification?: Verification;
  status?: SupplierStatus;
}

export interface UpdateSupplierStatusPayload {
  status?: SupplierStatus;
  verification?: Verification;
}

export interface SupplierSummary {
  activeCount: number;
  pendingCount: number;
  verifiedCount: number;
  exceptionCount: number;
  totalCount: number;
}
