export type BedStatus =
  | "Available"
  | "Occupied"
  | "Reserved"
  | "Unavailable";

export interface Bed {
  id: string;
  status: BedStatus;
  resident?: string;
}

export interface Room {
  id: string;
  name: string;
  shelter: string;
  shelterId?: string;
  floor: string;
  type: string;
  beds: Bed[];
}

export interface RoomBedSummary {
  totalRooms: number;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  reservedBeds: number;
  unavailableBeds: number;
}

export interface RoomQueryParams {
  shelter?: string;
  floor?: string;
  type?: string;
  search?: string;
}

export interface CreateRoomInput {
  name: string;
  shelter: string;
  floor: string;
  type: string;
  bedCount: number;
}

export interface AddBedsInput {
  roomId: string;
  count: number;
}

export interface UpdateBedStatusInput {
  status: BedStatus;
  resident?: string;
}
