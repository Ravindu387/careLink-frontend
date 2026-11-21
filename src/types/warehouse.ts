export type WarehouseStatus =
  | "Operational"
  | "Near Capacity"
  | "Under Maintenance";

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  utilisation: number;
  stockLines: number;
  staff: number;
  status: WarehouseStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWarehousePayload {
  name: string;
  location: string;
  capacity: number;
  staff: number;
  utilisation?: number;
  stockLines?: number;
  status?: WarehouseStatus;
}

export interface UpdateWarehousePayload {
  status?: WarehouseStatus;
  utilisation?: number;
  staff?: number;
  stockLines?: number;
}

export interface WarehouseSummary {
  operationalSites: number;
  averageUtilisation: number;
  receivingToday: number;
  capacityAlerts: number;
  totalCount: number;
}
