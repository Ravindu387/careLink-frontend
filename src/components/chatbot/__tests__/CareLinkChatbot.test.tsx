import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CareLinkChatbot from "../CareLinkChatbot";
import { chatbotService } from "../../../services/chatbotService";

// Mock AuthContext
vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "usr-citizen-123",
      fullName: "Kamal Perera",
      email: "kamal@carelink.org",
      roles: ["Citizen"],
    },
    isAuthenticated: true,
  }),
}));

// Mock chatbotService
vi.mock("../../../services/chatbotService", () => ({
  chatbotService: {
    sendMessage: vi.fn(),
    getConversations: vi.fn(),
    getConversation: vi.fn(),
    deleteConversation: vi.fn(),
  },
}));

describe("CareLinkChatbot Frontend Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the floating button initially collapsed with online indicator", () => {
    render(<CareLinkChatbot forcedRole="Citizen" />);

    const openBtn = screen.getByRole("button", { name: /Open CareLink AI Assistant/i });
    expect(openBtn).toBeDefined();
    expect(screen.queryByText("CareLink AI Assistant")).toBeDefined();
  });

  it("opens chat window and renders Citizen-specific greeting and suggestions", () => {
    render(<CareLinkChatbot forcedRole="Citizen" />);

    const openBtn = screen.getByRole("button", { name: /Open CareLink AI Assistant/i });
    fireEvent.click(openBtn);

    expect(screen.getByText("Citizen Relief Assistant")).toBeDefined();
    expect(screen.getByText("Life Emergency:")).toBeDefined();
    expect(screen.getByText(/DMC/)).toBeDefined();

    // Check citizen suggestions
    expect(
      screen.getByText("How can I request emergency assistance?")
    ).toBeDefined();
    expect(
      screen.getByText("How do I find an available shelter?")
    ).toBeDefined();
  });

  it("renders Volunteer-specific suggestions and guidance when in Volunteer mode", () => {
    render(<CareLinkChatbot forcedRole="Volunteer" />);

    const openBtn = screen.getByRole("button", { name: /Open CareLink AI Assistant/i });
    fireEvent.click(openBtn);

    expect(screen.getByText("Volunteer Field Guide")).toBeDefined();
    expect(screen.getByText("How do I update my availability?")).toBeDefined();
    expect(screen.getByText("How can I view my assignments?")).toBeDefined();
    expect(screen.getByText("How do I update my volunteer skills?")).toBeDefined();
  });

  it("submits message and renders AI response bubble with suggested actions", async () => {
    vi.mocked(chatbotService.sendMessage).mockResolvedValueOnce({
      conversationId: "conv-101",
      response: "To request flood relief, navigate to the **Request Help** section.",
      timestamp: new Date().toISOString(),
      role: "Citizen",
      suggestedActions: ["How can I track my assistance request?"],
    });

    render(<CareLinkChatbot forcedRole="Citizen" />);

    const openBtn = screen.getByRole("button", { name: /Open CareLink AI Assistant/i });
    fireEvent.click(openBtn);

    const input = screen.getByPlaceholderText(/Ask in English, සිංහල, or தமிழ்.../i);
    fireEvent.change(input, { target: { value: "I need food and water" } });

    const sendBtn = screen.getByRole("button", { name: /Send message/i });
    fireEvent.click(sendBtn);

    expect(screen.getByText("I need food and water")).toBeDefined();

    await waitFor(() => {
      expect(chatbotService.sendMessage).toHaveBeenCalledWith(
        "I need food and water",
        undefined
      );
      expect(
        screen.getByText(/To request flood relief/i)
      ).toBeDefined();
    });
  });

  it("allows sending suggested question chip with a single click", async () => {
    vi.mocked(chatbotService.sendMessage).mockResolvedValueOnce({
      conversationId: "conv-102",
      response: "Emergency shelter locations are available under Shelters & Safe Locations.",
      timestamp: new Date().toISOString(),
      role: "Citizen",
      suggestedActions: [],
    });

    render(<CareLinkChatbot forcedRole="Citizen" />);

    const openBtn = screen.getByRole("button", { name: /Open CareLink AI Assistant/i });
    fireEvent.click(openBtn);

    const shelterChip = screen.getByText("How do I find an available shelter?");
    fireEvent.click(shelterChip);

    await waitFor(() => {
      expect(chatbotService.sendMessage).toHaveBeenCalledWith(
        "How do I find an available shelter?",
        undefined
      );
      expect(
        screen.getByText(/Emergency shelter locations are available/i)
      ).toBeDefined();
    });
  });

  it("toggles multilingual Sinhala, Tamil and English guidance banner", () => {
    render(<CareLinkChatbot forcedRole="Citizen" />);

    const openBtn = screen.getByRole("button", { name: /Open CareLink AI Assistant/i });
    fireEvent.click(openBtn);

    const langBtn = screen.getByTitle("Supported languages");
    fireEvent.click(langBtn);

    expect(
      screen.getByText(/CareLink AI is fully trilingual:/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Type your questions in/i)
    ).toBeDefined();
  });

  it("clears the conversation when refresh button is clicked", async () => {
    render(<CareLinkChatbot forcedRole="Citizen" />);

    const openBtn = screen.getByRole("button", { name: /Open CareLink AI Assistant/i });
    fireEvent.click(openBtn);

    const resetBtn = screen.getByRole("button", { name: /Start new conversation/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Your Humanitarian Support Assistant/i)).toBeDefined();
  });
});
