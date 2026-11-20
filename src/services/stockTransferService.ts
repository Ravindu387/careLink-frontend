import { request } from "./api";
import type {
  Transfer,
  CreateTransferPayload,
  TransferSummary,
  TransferStatus,
} from "../types/stockTransfer";

export const stockTransferService = {
  async getTransfers(params?: {
    tab?: string;
    search?: string;
    source?: string;
    destination?: string;
    status?: string;
  }): Promise<Transfer[]> {
    const query = new URLSearchParams();
    if (params?.tab) query.append("tab", params.tab);
    if (params?.search) query.append("search", params.search);
    if (params?.source && params.source !== "All source hubs") {
      query.append("source", params.source);
    }
    if (params?.destination && params.destination !== "All destinations") {
      query.append("destination", params.destination);
    }
    if (params?.status && params.status !== "All statuses") {
      query.append("status", params.status);
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<Transfer[]>(`/transfers${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getTransferById(id: string): Promise<Transfer> {
    const response = await request<Transfer>(`/transfers/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getSummary(): Promise<TransferSummary> {
    const response = await request<TransferSummary>("/transfers/summary", {
      method: "GET",
    });
    return response.data;
  },

  async createTransfer(payload: CreateTransferPayload): Promise<Transfer> {
    const response = await request<Transfer>("/transfers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateStatus(id: string, status: TransferStatus): Promise<Transfer> {
    const response = await request<Transfer>(`/transfers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  async deleteTransfer(id: string): Promise<boolean> {
    const response = await request<boolean>(`/transfers/${id}`, {
      method: "DELETE",
    });
    return response.data ?? true;
  },
};
