import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  Send,
  Paperclip,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  Phone,
  Info,
  ChevronRight,
  FileText,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import { messageService } from "../../services/messageService";
import type {
  Conversation,
  ChatMessage,
  CreateConversationPayload,
} from "../../types/message";

const SUPPORT_TEAMS = [
  { name: "Case Support Team", category: "Shelter", defaultSubject: "Emergency shelter inquiry" },
  { name: "North Ward Delivery", category: "Food & Water", defaultSubject: "Food and drinking water delivery" },
  { name: "Medical Response Team", category: "Medical", defaultSubject: "Medical support & urgent supplies" },
  { name: "Shelter Coordinator", category: "Shelter", defaultSubject: "Bedding & facility check-in" },
  { name: "Crisis Logistics Unit", category: "Logistics", defaultSubject: "Relief goods dispatch update" },
];

const QUICK_PROMPTS = [
  "What is the estimated delivery time for our household supplies?",
  "One member has limited mobility and needs step-free access.",
  "Could you please confirm if medical supplies are dispatched?",
  "Thank you for the quick assistance and update!",
];

export default function MessagesPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Conversation & Chat State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // New Conversation Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState(SUPPORT_TEAMS[0].name);
  const [newCategory, setNewCategory] = useState(SUPPORT_TEAMS[0].category);
  const [newSubject, setNewSubject] = useState(SUPPORT_TEAMS[0].defaultSubject);
  const [newRequestId, setNewRequestId] = useState("");
  const [newInitialMsg, setNewInitialMsg] = useState("");
  const [isCreatingConv, setIsCreatingConv] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Attachment state simulation
  const [attachment, setAttachment] = useState<{ name: string; size: string } | null>(null);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations from backend
  const fetchConversations = useCallback(
    async (keepActive = true) => {
      try {
        setError(null);
        const data = await messageService.getConversations({
          citizenName: user?.fullName || undefined,
          search: search.trim() || undefined,
        });

        setConversations(data);

        // Set default active conversation if none or if current active is invalid
        if (data.length > 0) {
          if (!keepActive || !activeId || !data.some((c) => c.id === activeId)) {
            setActiveId(data[0].id);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch messages:", err);
        setError(err.message || "Failed to load conversations from the server.");
      } finally {
        setIsLoading(false);
      }
    },
    [user?.fullName, search, activeId]
  );

  // Initial load
  useEffect(() => {
    fetchConversations(false);
  }, []);

  // Periodic polling for new incoming messages / auto-replies
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSending) {
        fetchConversations(true);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchConversations, isSending]);

  // Find active conversation
  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Scroll to bottom when active conversation or messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages?.length, activeId]);

  // Handle selecting a conversation & mark as read
  const handleSelectConversation = async (id: string) => {
    setActiveId(id);
    const target = conversations.find((c) => c.id === id);
    if (target && target.unread > 0) {
      // Optimistically clear unread in state
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
      );
      try {
        await messageService.markAsRead(id);
      } catch (err) {
        console.warn("Could not mark conversation as read:", err);
      }
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!messageText.trim() && !attachment) || !activeConversation || isSending) return;

    const textToSend = messageText.trim() || (attachment ? `Attached file: ${attachment.name}` : "");
    const tempId = `TEMP-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const optimisticMessage: ChatMessage = {
      id: tempId,
      conversationId: activeId,
      text: textToSend,
      sender: "user",
      senderName: user?.fullName || "Samira Khan",
      time: nowTime,
      isRead: true,
      attachmentName: attachment?.name,
    };

    // Optimistic update
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeId) {
          return {
            ...conv,
            messages: [...conv.messages, optimisticMessage],
            preview: textToSend,
            time: "Just now",
          };
        }
        return conv;
      })
    );

    setMessageText("");
    const sentAttachment = attachment;
    setAttachment(null);
    setIsSending(true);

    try {
      await messageService.sendMessage(activeId, {
        text: textToSend,
        sender: "user",
        senderName: user?.fullName || "Samira Khan",
        attachmentName: sentAttachment?.name,
        autoReply: true,
      });

      // Fetch fresh messages after sending to sync IDs and handle backend reply
      setTimeout(() => {
        fetchConversations(true);
      }, 1500);
    } catch (err: any) {
      console.error("Error sending message:", err);
      alert(`Could not send message: ${err.message || "Server error"}`);
    } finally {
      setIsSending(false);
    }
  };

  // Handle starting a new conversation
  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMsg.trim()) {
      setModalError("Please provide both a subject and an initial message.");
      return;
    }

    setIsCreatingConv(true);
    setModalError(null);

    try {
      const payload: CreateConversationPayload = {
        name: newTeam,
        subject: newSubject.trim(),
        category: newCategory,
        citizenName: user?.fullName || "Samira Khan",
        requestId: newRequestId.trim() || undefined,
        initialMessage: newInitialMsg.trim(),
      };

      const created = await messageService.createConversation(payload);
      setConversations((prev) => [created, ...prev]);
      setActiveId(created.id);
      setIsNewModalOpen(false);
      setNewInitialMsg("");
      setNewRequestId("");
    } catch (err: any) {
      console.error("Failed to create conversation:", err);
      setModalError(err.message || "Failed to start conversation. Please try again.");
    } finally {
      setIsCreatingConv(false);
    }
  };

  // Mock file attachment handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setAttachment({
        name: file.name,
        size: `${sizeMb} MB`,
      });
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter((c) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      c.subject.toLowerCase().includes(s) ||
      (c.preview && c.preview.toLowerCase().includes(s)) ||
      (c.category && c.category.toLowerCase().includes(s)) ||
      (c.requestId && c.requestId.toLowerCase().includes(s))
    );
  });

  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="Messages"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTAINER */}
      <main className="min-h-screen lg:ml-[295px]">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* CONTENT */}
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6">
          {/* TITLE & STATS BAR */}
          <section className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#173d5b]">Messages & Support Desk</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected to Relief Support
                </span>
                {totalUnreadCount > 0 && (
                  <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    {totalUnreadCount} new
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Direct, secure communication with relief case workers, shelter teams, and dispatch drivers.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchConversations(true)}
                disabled={isLoading}
                title="Refresh messages"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#173d5b] disabled:opacity-50"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin text-[#287da6]" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => setIsNewModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e668e]"
              >
                <Plus size={15} />
                <span>New Inquiry</span>
              </button>
            </div>
          </section>

          {/* ERROR ALERT */}
          {error && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => fetchConversations(false)}
                className="rounded-md bg-red-100 px-3 py-1 font-semibold text-red-800 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* CHAT CONTAINER */}
          <section className="grid min-h-[620px] grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[330px_minmax(0,1fr)]">
            {/* CONVERSATION LIST */}
            <div className="flex flex-col border-b border-slate-200 bg-white md:border-b-0 md:border-r">
              {/* SEARCH & FILTERS */}
              <div className="border-b border-slate-200 p-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <Search size={14} className="text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by team, subject, or message..."
                    className="w-full bg-transparent text-xs text-[#173d5b] outline-none placeholder:text-slate-400"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* CONVERSATION THREADS */}
              <div className="max-h-[300px] flex-1 overflow-y-auto md:max-h-none">
                {isLoading && conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                    <Loader2 size={24} className="animate-spin text-[#287da6]" />
                    <p className="mt-2 text-xs">Loading conversations...</p>
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => {
                    const isSelected = activeId === conversation.id;
                    return (
                      <button
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`flex w-full items-start gap-3 border-b border-slate-100 p-3.5 text-left transition hover:bg-slate-50 ${
                          isSelected
                            ? "border-l-[4px] border-l-[#287da6] bg-[#edf6f8]"
                            : "border-l-[4px] border-l-transparent"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                            isSelected
                              ? "bg-[#287da6] text-white shadow-sm"
                              : "bg-[#e9f3f8] text-[#287da6]"
                          }`}
                        >
                          <MessageCircle size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-1">
                            <p className="truncate text-xs font-bold text-[#173d5b]">
                              {conversation.name}
                            </p>
                            <span className="shrink-0 text-[10px] text-slate-400">
                              {conversation.time}
                            </span>
                          </div>

                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="truncate text-[11px] font-semibold text-slate-700">
                              {conversation.subject}
                            </span>
                            {conversation.requestId && (
                              <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-mono text-slate-600">
                                {conversation.requestId}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                            {conversation.preview || "No message history"}
                          </p>

                          {conversation.unread > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex items-center rounded-full bg-[#287da6] px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                                {conversation.unread} new
                              </span>
                              <span className="text-[9px] text-[#287da6] font-medium">Unread response</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <MessageCircle size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No conversations found</p>
                    <p className="mt-1 text-[11px]">
                      {search ? "Try searching for a different keyword." : "Click 'New Inquiry' to start a chat."}
                    </p>
                  </div>
                )}
              </div>

              {/* QUICK STATUS FOOTER */}
              <div className="border-t border-slate-100 bg-slate-50/70 p-3 text-center text-[10px] text-slate-400">
                <span>CareLink Response Network · 24/7 Operations</span>
              </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex min-h-[500px] flex-col bg-white">
              {activeConversation ? (
                <>
                  {/* CHAT HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#287da6] text-white">
                        <MessageCircle size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#173d5b]">
                            {activeConversation.name}
                          </h3>
                          {activeConversation.category && (
                            <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[9px] font-semibold text-[#1e668e]">
                              {activeConversation.category}
                            </span>
                          )}
                          {activeConversation.requestId && (
                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700 border border-amber-200/60">
                              Ref: {activeConversation.requestId}
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {activeConversation.subject}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                          showDetails
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Security & Help Info</span>
                      </button>
                    </div>
                  </div>

                  {/* SECURITY & CONTEXT DRAWER */}
                  {showDetails && (
                    <div className="border-b border-emerald-100 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 transition">
                      <div className="flex items-start gap-2.5">
                        <Info size={16} className="mt-0.5 shrink-0 text-emerald-700" />
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold text-emerald-800">
                            Verified Official Support Channel
                          </p>
                          <p className="text-[11px] text-emerald-700 leading-relaxed">
                            Messages exchanged here are reviewed by licensed emergency coordinators and relief workers.
                            Do not disclose banking credentials or one-time passwords. For immediate medical emergencies or life hazard, contact emergency dispatch directly.
                          </p>
                          <div className="flex items-center gap-4 pt-1 text-[11px]">
                            <a href="tel:112" className="flex items-center gap-1 font-bold text-red-600 hover:underline">
                              <Phone size={12} /> Call 112 Hotline
                            </a>
                            <span className="text-emerald-600">ID: {activeConversation.id}</span>
                            {activeConversation.requestId && (
                              <span className="text-emerald-600">Linked Request: {activeConversation.requestId}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowDetails(false)}
                          className="text-emerald-600 hover:text-emerald-800"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MESSAGE HISTORY */}
                  <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto bg-[#f8fafb] p-4 sm:p-6">
                    <div className="flex items-center justify-center">
                      <span className="rounded-full bg-slate-200/70 px-3 py-1 text-[10px] font-medium text-slate-500">
                        Official Case Communication History
                      </span>
                    </div>

                    {activeConversation.messages.map((message) => {
                      const isUser = message.sender === "user";
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-4 shadow-2xs sm:max-w-[70%] ${
                              isUser
                                ? "rounded-br-xs border border-sky-200 bg-[#e5f2f7] text-[#173d5b]"
                                : "rounded-bl-xs border border-slate-200 bg-white text-slate-800"
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-between gap-3 text-[10px]">
                              <span
                                className={`font-bold ${
                                  isUser ? "text-[#1e668e]" : "text-slate-600"
                                }`}
                              >
                                {isUser ? "You (Citizen)" : message.senderName || activeConversation.name}
                              </span>
                              <span className="text-slate-400">{message.time}</span>
                            </div>

                            <p className="text-xs leading-relaxed whitespace-pre-wrap">
                              {message.text}
                            </p>

                            {message.attachmentName && (
                              <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white/70 px-2.5 py-1.5 text-[11px] text-slate-700">
                                <FileText size={13} className="text-[#287da6]" />
                                <span className="font-medium truncate">{message.attachmentName}</span>
                              </div>
                            )}

                            <div className="mt-1.5 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                              {isUser ? (
                                <span className="flex items-center gap-1 text-[#287da6]">
                                  <CheckCircle2 size={11} /> Sent to team
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                  <ShieldCheck size={11} /> Official Response
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* QUICK PROMPT SUGGESTIONS */}
                  <div className="border-t border-slate-100 bg-[#f8fafb] px-4 py-2 sm:px-6">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Quick Questions:
                      </span>
                      {QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setMessageText(prompt)}
                          className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 transition hover:border-[#287da6] hover:bg-sky-50 hover:text-[#173d5b]"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ATTACHMENT PREVIEW */}
                  {attachment && (
                    <div className="flex items-center justify-between border-t border-sky-100 bg-sky-50/80 px-4 py-2 sm:px-6">
                      <div className="flex items-center gap-2 text-xs text-sky-900">
                        <FileText size={15} className="text-[#287da6]" />
                        <span className="font-semibold">{attachment.name}</span>
                        <span className="text-[10px] text-sky-600">({attachment.size})</span>
                      </div>
                      <button
                        onClick={() => setAttachment(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}

                  {/* MESSAGE INPUT FORM */}
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 sm:px-6"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg p-2 text-[#287da6] transition hover:bg-slate-100"
                      title="Attach supporting document or image"
                      aria-label="Attach file"
                    >
                      <Paperclip size={18} />
                    </button>

                    <input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Write a message to the support team..."
                      disabled={isSending}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-[#173d5b] outline-none transition focus:border-[#287da6] focus:bg-white"
                    />

                    <button
                      type="submit"
                      disabled={(!messageText.trim() && !attachment) || isSending}
                      className="flex items-center gap-2 rounded-xl bg-[#287da6] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e668e] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-[#287da6]">
                    <MessageCircle size={32} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#173d5b]">
                    Select a conversation
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-400">
                    Choose one of your active relief support threads from the left, or initiate a new inquiry to get assistance.
                  </p>
                  <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="mt-4 flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1e668e]"
                  >
                    <Plus size={14} />
                    Start New Inquiry
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-5 flex flex-wrap justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support · CareLink Platform</p>
            <p>Direct line to relief authorities and emergency services</p>
          </footer>
        </div>
      </main>

      {/* NEW INQUIRY / CONVERSATION MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#287da6] text-white">
                  <Plus size={18} />
                </div>
                <h3 className="text-base font-bold text-[#173d5b]">
                  Start New Support Inquiry
                </h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateConversation} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#173d5b]">
                  Select Support Team
                </label>
                <select
                  value={newTeam}
                  onChange={(e) => {
                    const selected = SUPPORT_TEAMS.find((t) => t.name === e.target.value);
                    setNewTeam(e.target.value);
                    if (selected) {
                      setNewCategory(selected.category);
                      setNewSubject(selected.defaultSubject);
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-[#173d5b] outline-none focus:border-[#287da6] focus:bg-white"
                >
                  {SUPPORT_TEAMS.map((team) => (
                    <option key={team.name} value={team.name}>
                      {team.name} ({team.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173d5b]">
                  Subject
                </label>
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="E.g., Emergency shelter bed request"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-[#173d5b] outline-none focus:border-[#287da6] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173d5b]">
                  Linked Request ID (Optional)
                </label>
                <input
                  value={newRequestId}
                  onChange={(e) => setNewRequestId(e.target.value)}
                  placeholder="E.g., REQ-2841"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-[#173d5b] outline-none focus:border-[#287da6] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173d5b]">
                  Initial Message
                </label>
                <textarea
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  rows={4}
                  required
                  placeholder="Describe your situation, inquiry, or urgent relief requirements..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-[#173d5b] outline-none focus:border-[#287da6] focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingConv}
                  className="flex items-center gap-2 rounded-xl bg-[#287da6] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1e668e] disabled:opacity-50"
                >
                  {isCreatingConv ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Create Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
