export interface ChatMessage {
  id: string;
  role: "user" | "model" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatbotConversationSummary {
  id: string;
  title: string;
  userRole: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string;
}

export interface ChatbotConversationDetail {
  id: string;
  title: string;
  userRole: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatbotMessageResponse {
  conversationId: string;
  response: string;
  timestamp: string;
  role: string;
  suggestedActions: string[];
}
