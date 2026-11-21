import { request } from "./api";
import type {
  Conversation,
  ChatMessage,
  SendMessagePayload,
  CreateConversationPayload,
  ConversationSummary,
} from "../types/message";

export const messageService = {
  async getConversations(params?: {
    citizenName?: string;
    search?: string;
  }): Promise<Conversation[]> {
    const query = new URLSearchParams();
    if (params?.citizenName) {
      query.append("citizenName", params.citizenName);
    }
    if (params?.search) {
      query.append("search", params.search);
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<Conversation[]>(`/messages${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getConversationById(id: string): Promise<Conversation> {
    const response = await request<Conversation>(`/messages/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async sendMessage(
    conversationId: string,
    payload: SendMessagePayload
  ): Promise<ChatMessage> {
    const response = await request<ChatMessage>(
      `/messages/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async markAsRead(conversationId: string): Promise<boolean> {
    const response = await request<boolean>(`/messages/${conversationId}/read`, {
      method: "POST",
    });
    return response.data ?? true;
  },

  async createConversation(
    payload: CreateConversationPayload
  ): Promise<Conversation> {
    const response = await request<Conversation>("/messages", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async getSummary(citizenName?: string): Promise<ConversationSummary> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<ConversationSummary>(`/messages/summary${query}`, {
      method: "GET",
    });
    return response.data;
  },

  async deleteConversation(id: string): Promise<boolean> {
    const response = await request<boolean>(`/messages/${id}`, {
      method: "DELETE",
    });
    return response.data ?? true;
  },
};
