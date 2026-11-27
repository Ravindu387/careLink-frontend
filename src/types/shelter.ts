export type ShelterStatus = "Space available" | "Limited space" | "Full" | string;

export interface Shelter {
  id: string | number;
  name: string;
  area: string;
  address: string;
  distance: number;
  capacity: number;
  availability: number;
  occupied: number;
  services: string[];
  status: ShelterStatus;
  accessible: boolean;
  contactPhone?: string;
  managerName?: string;
  operatingHours?: string;
  isEvacuationHub?: boolean;
  occupancyPercentage?: number;
  location?: string;
  notes?: string;
  remaining?: number;
  contactPerson?: string;
}

export interface ShelterSummary {
  totalShelters: number;
  availableSheltersCount: number;
  fullSheltersCount: number;
  totalCapacity: number;
  totalAvailableSpaces: number;
  totalOccupiedSpaces: number;
  accessibleCount: number;
  nearestAvailableShelter?: Shelter | null;
}

export interface ShelterFilterParams {
  search?: string;
  area?: string;
  maxDistance?: number;
  availability?: string;
  accessibleOnly?: boolean;
  service?: string;
}

export interface RequestShelterSpacePayload {
  shelterId: string | number;
  citizenName?: string;
  contactPhone?: string;
  numberOfPeople: number;
  specialNeeds?: string;
}

export interface ShelterBooking {
  bookingReference: string;
  shelterId: string | number;
  shelterName: string;
  citizenName: string;
  contactPhone: string;
  numberOfPeople: number;
  specialNeeds?: string;
  status: string;
  bookedAt: string;
  confirmationMessage: string;
}
