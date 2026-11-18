import { apiClient } from "./api";
import type {
  Room,
  RoomBedSummary,
  RoomQueryParams,
  CreateRoomInput,
  AddBedsInput,
  UpdateBedStatusInput,
} from "../types/roomBed";
import type { Shelter } from "../types/accommodation";

export const roomBedService = {
  /**
   * Retrieves all rooms with optional filters.
   */
  async getRooms(params?: RoomQueryParams): Promise<Room[]> {
    return apiClient.get<Room[]>("/rooms", params as Record<string, any>);
  },

  /**
   * Retrieves overall room and bed summary KPI metrics.
   */
  async getRoomSummary(): Promise<RoomBedSummary> {
    return apiClient.get<RoomBedSummary>("/rooms/summary");
  },

  /**
   * Retrieves a single room by ID.
   */
  async getRoomById(id: string): Promise<Room> {
    return apiClient.get<Room>(`/rooms/${id}`);
  },

  /**
   * Creates a new room with an initial bed count.
   */
  async createRoom(data: CreateRoomInput): Promise<Room> {
    return apiClient.post<Room>("/rooms", data);
  },

  /**
   * Adds additional beds to an existing room.
   */
  async addBeds(data: AddBedsInput): Promise<Room> {
    return apiClient.post<Room>("/rooms/beds", data);
  },

  /**
   * Updates status and optional resident for a bed.
   */
  async updateBedStatus(
    roomId: string,
    bedId: string,
    data: UpdateBedStatusInput
  ): Promise<Room> {
    return apiClient.patch<Room>(`/rooms/${roomId}/beds/${bedId}/status`, data);
  },

  /**
   * Deletes a room if it contains no occupied or reserved beds.
   */
  async deleteRoom(id: string): Promise<void> {
    return apiClient.delete<void>(`/rooms/${id}`);
  },

  /**
   * Retrieves shelters for selection dropdowns.
   */
  async getShelters(): Promise<Shelter[]> {
    return apiClient.get<Shelter[]>("/shelters");
  },
};
