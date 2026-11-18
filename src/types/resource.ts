export type StockStatus =
  | "Healthy"
  | "Low Stock"
  | "Critical"
  | "Out of Stock";

export interface Resource {
  id: string;
  name: string;
  category: string;
  available: number;
  minimum: number;
  unit: string;
  expiry: string;
  expiryDate?: string;
  lastUpdated: string;
  lastUpdatedUtc?: string;
  shelter: string;
  shelterId?: string;
  status?: StockStatus;
}

export interface ResourceSummary {
  healthyCount: number;
  lowStockCount: number;
  criticalCount: number;
  outOfStockCount: number;
  immediateActionCount: number;
  expiringSoonCount: number;
  incomingDonationsCount: number;
  totalItemsCount: number;
}

export interface ResourceQueryParams {
  search?: string;
  category?: string;
  status?: string;
  expiryFilter?: string;
  shelterId?: string;
  minQuantity?: number;
  maxQuantity?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateResourceInput {
  name: string;
  category: string;
  available: number;
  minimum: number;
  unit: string;
  expiryDate?: string;
  shelter: string;
}

export interface UpdateResourceInput {
  name?: string;
  category?: string;
  available?: number;
  minimum?: number;
  unit?: string;
  expiryDate?: string;
  shelter?: string;
}

export interface RecordDistributionInput {
  resourceId: string;
  quantity: number;
  shelter: string;
  recipient: string;
  notes?: string;
}

export interface ResourceDistribution {
  id: string;
  resourceId: string;
  resourceName: string;
  quantity: number;
  destinationShelter: string;
  destinationShelterId?: string;
  recipient: string;
  notes?: string;
  distributedAt: string;
  distributedAtUtc?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
