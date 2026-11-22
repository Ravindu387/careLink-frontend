export interface SupportLocation {
  id: string | number;
  name: string;
  category: "Support centre" | "Emergency shelter" | "Medical support" | string;
  distance: string;
  distanceKm?: number;
  status: "Open" | "Space available" | "Full" | string;
  address: string;
  services: string[];
  hours: string;
  iconKey?: string;
  color: "green" | "red" | "blue" | string;
  x: number;
  y: number;
  description: string;
  phone: string;
}

export interface NearbySupportSummary {
  totalLocations: number;
  openCount: number;
  sheltersCount: number;
  medicalCount: number;
  supportCentresCount: number;
}

export interface NearbySupportFilterParams {
  search?: string;
  category?: string;
  availability?: string;
  distance?: string;
}
