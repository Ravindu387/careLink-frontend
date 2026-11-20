export type InventoryStatus = "Healthy" | "Low Stock" | "Critical";

export interface InventoryItem {
  id: string;
  resource: string;
  category: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  inTransit: number;
  available: number;
  status: InventoryStatus;
  unit?: string;
  expiryDate?: string;
  createdAt?: string;
}

export interface CreateInventoryPayload {
  resource: string;
  category: string;
  warehouse: string;
  onHand: number;
  reserved?: number;
  inTransit?: number;
  unit?: string;
  expiryDate?: string;
}

export interface UpdateInventoryPayload {
  resource?: string;
  category?: string;
  warehouse?: string;
  onHand?: number;
  reserved?: number;
  inTransit?: number;
  status?: string;
  unit?: string;
}

export interface AdjustStockPayload {
  quantityDelta: number;
  reason?: string;
}

export interface InventoryQueryParams {
  search?: string;
  category?: string;
  warehouse?: string;
  status?: string;
  tab?: string;
}

export interface InventorySummary {
  totalSkus: number;
  lowStock: number;
  outOfStock: number;
  expiringSoon: number;
  totalAvailable: number;
}
