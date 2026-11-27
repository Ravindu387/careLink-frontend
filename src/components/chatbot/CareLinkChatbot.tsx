import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  PhoneCall,
  AlertTriangle,
  ChevronDown,
  Globe,
  Bot,
  User as UserIcon,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { chatbotService } from "../../services/chatbotService";
import type { ChatMessage } from "../../types/chatbot";
import CareLinkLogo from "../common/CareLinkLogo";

interface CareLinkChatbotProps {
  forcedRole?: "Citizen" | "Volunteer";
}

const CITIZEN_SUGGESTIONS = [
  "How can I request emergency assistance?",
  "How can I track my assistance request?",
  "How do I find an available shelter?",
  "What should I do during a flood?",
  "How do I contact the support team?",
];

const VOLUNTEER_SUGGESTIONS = [
  "How do I update my availability?",
  "How can I view my assignments?",
  "How do I update my volunteer skills?",
  "What does my deployment status mean?",
  "How can I contact my coordinator?",
];

export default function CareLinkChatbot({ forcedRole }: CareLinkChatbotProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLanguageHelp, setShowLanguageHelp] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine effective role: Citizen vs Volunteer
  const userRole = useMemo<"Citizen" | "Volunteer">(() => {
    if (forcedRole) return forcedRole;
    const roles = user?.roles || [];
    const isVolunteer = roles.some((r) =>
      r.toLowerCase().includes("volunteer")
    );
    return isVolunteer ? "Volunteer" : "Citizen";
  }, [user, forcedRole]);

  const suggestions = useMemo(() => {
    return userRole === "Volunteer"
      ? VOLUNTEER_SUGGESTIONS
      : CITIZEN_SUGGESTIONS;
  }, [userRole]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const greetingName = user?.fullName ? ` ${user.fullName}` : "";
      const initialGreeting =
        userRole === "Volunteer"
          ? `Hello${greetingName}! 👋 I am your **CareLink AI Assistant** (*Your Humanitarian Support Assistant*).\n\nI can help you update your availability, register field skills, check duty instructions, and follow operational safety guidelines.\n\n*You can ask in English, සිංහල, or தமிழ்.*`
          : `Hello${greetingName}! 👋 I am your **CareLink AI Assistant** (*Your Humanitarian Support Assistant*).\n\nI am here to guide you with emergency requests, safe shelters, flood preparedness, and tracking your relief aid.\n\n*You can ask in English, සිංහල, or தமிழ்.*`;

      setMessages([
        {
          id: "welcome-msg",
          role: "model",
          content: initialGreeting,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [user, userRole, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? message).trim();
    if (!text || isLoading) return;

    setMessage("");
    setError(null);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(
        text,
        conversationId || undefined
      );

      if (response && response.conversationId) {
        setConversationId(response.conversationId);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "model",
        content: response?.response || "I am currently unable to generate a response. Please try again.",
        timestamp: response?.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to connect to CareLink AI Assistant. Please check your connection or contact emergency services."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConversation = () => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  };

  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Parse both **bold** and *italic* inline tokens cleanly
    const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return tokens.map((token, idx) => {
      if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
        return (
          <strong key={idx} className="font-semibold text-[#123B5C]">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
        return (
          <em key={idx} className="italic text-slate-600">
            {token.slice(1, -1)}
          </em>
        );
      }
      return token;
    });
  };

  const formatMessageText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Headings
      if (trimmed.startsWith("### ")) {
        return (
          <h4
            key={idx}
            className="mt-2.5 mb-1 text-sm font-bold text-[#123B5C] uppercase tracking-wide"
          >
            {renderInlineFormatting(trimmed.replace(/^###\s+/, ""))}
          </h4>
        );
      }

      // Bullet lists (- item or * item, excluding *italic* lines)
      if (trimmed.startsWith("- ") || (trimmed.startsWith("* ") && !trimmed.endsWith("*"))) {
        const bulletContent = trimmed.replace(/^[-*]\s+/, "");
        return (
          <li key={idx} className="ml-4 list-disc text-sm leading-relaxed my-0.5">
            {renderInlineFormatting(bulletContent)}
          </li>
        );
      }

      // Numbered lists (1. item)
      if (/^\d+\.\s+/.test(trimmed)) {
        const numberedContent = trimmed.replace(/^\d+\.\s+/, "");
        return (
          <li key={idx} className="ml-4 list-decimal text-sm leading-relaxed my-0.5">
            {renderInlineFormatting(numberedContent)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-sm leading-relaxed my-0.5 min-h-[16px]">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  return (
    <aside
      aria-label="CareLink AI Support Assistant"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end"
    >
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open CareLink AI Assistant"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#123B5C] to-[#2785B2] text-white shadow-xl shadow-sky-950/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-sky-200 cursor-pointer"
        >
          {/* CareLink Official Logo Inside Floating Button */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 p-1 backdrop-blur-xs">
            <Sparkles size={22} className="text-sky-200 transition-transform group-hover:rotate-12" />
          </div>

          {/* Active Status Pulse Dot */}
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>

          {/* Hover Tooltip */}
          <span className="absolute right-16 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-md group-hover:block">
            CareLink AI Assistant
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatbot-title"
          className="flex h-[580px] max-h-[85vh] w-[380px] sm:w-[420px] max-w-[94vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-sky-900/10 bg-gradient-to-r from-[#123B5C] via-[#1b5177] to-[#2785B2] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 p-1 shadow-inner backdrop-blur-xs">
                <CareLinkLogo size="sm" showText={false} imgClassName="w-7 h-7 object-contain" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3
                    id="chatbot-title"
                    className="text-[15px] font-bold tracking-tight text-white sm:text-base"
                  >
                    CareLink AI Assistant
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-sm text-sky-200">
                  {userRole === "Volunteer" ? "Volunteer Field Guide" : "Citizen Relief Assistant"}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetConversation}
                title="Start new conversation"
                aria-label="Start new conversation"
                className="rounded-lg p-1.5 text-sky-200 transition hover:bg-white/10 hover:text-white"
              >
                <RefreshCw size={15} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close AI Assistant"
                aria-label="Close AI Assistant"
                className="rounded-lg p-1.5 text-sky-200 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Emergency Alert Hotline Banner */}
          <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-3.5 py-2 text-xs text-amber-900">
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <span className="font-semibold">Life Emergency:</span>
              <span>DMC <strong>117</strong> · Ambulance <strong>1990</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setShowLanguageHelp(!showLanguageHelp)}
              title="Supported languages"
              className="flex items-center gap-1 text-sm font-semibold text-sky-700 hover:underline"
            >
              <Globe size={12} />
              <span>සිං / த / EN</span>
            </button>
          </div>

          {/* Multilingual Info Dropdown */}
          {showLanguageHelp && (
            <div className="border-b border-sky-100 bg-sky-50/80 px-3.5 py-2.5 text-[13px] text-sky-900">
              <p className="font-semibold text-[#123B5C]">CareLink AI is fully trilingual:</p>
              <p className="mt-0.5 text-slate-600">
                Type your questions in <strong>English</strong>, <strong>සිංහල</strong>, or <strong>தமிழ்</strong>. The AI detects your language automatically.
              </p>
            </div>
          )}

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                      isUser
                        ? "bg-[#123B5C] text-white"
                        : "bg-sky-100 text-[#2785B2] border border-sky-200"
                    }`}
                  >
                    {isUser ? <UserIcon size={15} /> : <Bot size={16} />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                      isUser
                        ? "bg-[#153e5b] text-white rounded-tr-xs"
                        : "border border-slate-200 bg-white text-slate-800 rounded-tl-xs"
                    }`}
                  >
                    <div className="space-y-1">{formatMessageText(msg.content)}</div>
                    <div
                      className={`mt-1.5 text-xs text-right ${
                        isUser ? "text-sky-200/80" : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#2785B2] border border-sky-200">
                  <Bot size={16} />
                </div>
                <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-500 shadow-xs flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[#2785B2]" />
                  <span>CareLink AI is analyzing...</span>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">
                  <p className="font-semibold">Service Notice</p>
                  <p className="mt-0.5 text-[13px] text-red-600">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Pills */}
          <div className="border-t border-slate-100 bg-white px-3.5 py-2.5">
            <p className="mb-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Suggested Questions:
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(suggestion)}
                  className="whitespace-nowrap rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-[#1b5177] transition hover:border-sky-300 hover:bg-sky-100 disabled:opacity-50 cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask in English, සිංහල, or தமிழ்..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#2785B2] focus:bg-white focus:ring-1 focus:ring-sky-100 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2785B2] text-white shadow-xs transition hover:bg-[#1f6b8f] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
