export interface OccupancyShelter {
  id: string;
  name: string;
  district: string;
  location?: string;
  capacity: number;
  occupied: number;
  reserved: number;
  available: number;
  occupancyRate: number;
  status: "Available" | "Warning" | "Critical";
}

export interface Admission {
  id: string;
  resident: string;
  shelterId: string;
  shelterName?: string;
  people: number;
  date: string;
  createdAtUtc?: string;
}

export interface RecordAdmissionInput {
  resident: string;
  shelterId: string;
  people: number;
  date?: string;
}

export interface OccupancyThreshold {
  warning: number;
  critical: number;
}

export interface OccupancySummary {
  totalCapacity: number;
  totalOccupied: number;
  totalReserved: number;
  totalAvailable: number;
  occupancyRate: number;
  totalAdmissionsToday: number;
  totalDeparturesToday: number;
  warningSheltersCount: number;
  criticalSheltersCount: number;
  shelterCount: number;
  warningThreshold: number;
  criticalThreshold: number;
}
