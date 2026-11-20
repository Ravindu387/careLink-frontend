export interface ChatMessage {
  id: string;
  conversationId: string;
  text: string;
  sender: "user" | "support";
  senderName?: string;
  time: string;
  isRead?: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  name: string;
  subject: string;
  preview: string;
  time: string;
  unread: number;
  category?: string;
  citizenName?: string;
  requestId?: string;
  status?: string;
  createdAt?: string;
  lastMessageAt?: string;
  messages: ChatMessage[];
}

export interface SendMessagePayload {
  text: string;
  sender?: "user" | "support";
  senderName?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  autoReply?: boolean;
}

export interface CreateConversationPayload {
  name: string;
  subject: string;
  category?: string;
  citizenName?: string;
  requestId?: string;
  initialMessage?: string;
}

export interface ConversationSummary {
  totalConversations: number;
  totalUnread: number;
  activeConversations: number;
}
