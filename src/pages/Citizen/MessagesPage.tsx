
import { useState } from "react";
import {
  Heart, Search, Globe, Bell, Accessibility,
  Home, Plus, ClipboardList, Map, House,
  TriangleAlert, Users, FileText, MessageSquare,
  Phone, ChevronRight, Menu, X, Send,
  Paperclip, MessageCircle
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "support";
  time: string;
}

interface Conversation {
  id: number;
  name: string;
  subject: string;
  preview: string;
  time: string;
  unread: number;
  messages: Message[];
}

const navigation = [
  { name: "Home", icon: Home },
  { name: "Request Help", icon: Plus },
  { name: "My Requests", icon: ClipboardList, count: 2 },
  { name: "Nearby Support", icon: Map },
  { name: "Shelters", icon: House },
  { name: "Safety Updates", icon: TriangleAlert, count: 3 },
  { name: "My Household", icon: Users },
  { name: "My Documents", icon: FileText },
  { name: "Messages", icon: MessageSquare, count: 2 },
  { name: "Notifications", icon: Bell, count: 4 },
  { name: "Feedback", icon: Heart },
  { name: "Profile & Settings", icon: Accessibility },
];

const initialConversations: Conversation[] = [
  {
    id: 1,
    name: "Case Support Team",
    subject: "Emergency shelter",
    preview: "We are checking the available shelter space.",
    time: "8 min",
    unread: 0,
    messages: [
      {
        id: 1,
        text: "Hello Samira. We reviewed your request and are checking an accessible shelter near your location.",
        sender: "support",
        time: "10:02",
      },
      {
        id: 2,
        text: "Thank you. One member of our household has limited mobility. We need step-free access.",
        sender: "user",
        time: "10:05",
      },
      {
        id: 3,
        text: "Understood. We have added that requirement. Riverton High School currently has accessible space, and we are confirming transport.",
        sender: "support",
        time: "10:08",
      },
    ],
  },
  {
    id: 2,
    name: "North Ward Delivery",
    subject: "Food and drinking water",
    preview: "Your delivery is expected by 14:20.",
    time: "42 min",
    unread: 1,
    messages: [
      {
        id: 1,
        text: "Your food and drinking water request has been received.",
        sender: "support",
        time: "09:15",
      },
      {
        id: 2,
        text: "Your delivery is expected by 14:20 today.",
        sender: "support",
        time: "09:20",
      },
    ],
  },
  {
    id: 3,
    name: "Medical Response Team",
    subject: "Medical support",
    preview: "Thank you for confirming.",
    time: "11 Jun",
    unread: 0,
    messages: [
      {
        id: 1,
        text: "We received your medical support request. Please confirm the required medication details.",
        sender: "support",
        time: "11:10",
      },
      {
        id: 2,
        text: "Thank you for the confirmation.",
        sender: "support",
        time: "11:30",
      },
    ],
  },
];

export default function MessagesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);

  const [activeId, setActiveId] = useState(1);

  const [search, setSearch] = useState("");

  const [messageText, setMessageText] = useState("");

  const [showDetails, setShowDetails] = useState(false);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId
  );

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.name.toLowerCase().includes(search.toLowerCase()) ||
      conversation.subject.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    if (!messageText.trim() || !activeConversation) return;

    const newMessage: Message = {
      id: Date.now(),
      text: messageText.trim(),
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === activeId
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
              preview: newMessage.text,
              time: "Now",
            }
          : conversation
      )
    );

    setMessageText("");
  };

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[295px] flex-col bg-[#153e5e] text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-[74px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#65b9aa] text-[#153e5e]">
              <Heart size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold">ReliefOS</h1>
              <p className="text-[10px] text-sky-200">
                Citizen Support
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* ACTIVE RESPONSE */}
        <div className="mx-3 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Local Response
          </p>

          <p className="mt-2 text-xs font-bold">
            Greater Riverton Floods
          </p>

          <p className="mt-1 text-[10px] text-sky-200">
            Help centres and shelters are open
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="px-5 pb-2 pt-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Your Support
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.name === "Messages";

            return (
              <button
                key={item.name}
                onClick={() => setSidebarOpen(false)}
                className={`flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-left text-xs ${
                  active
                    ? "border-[#65b9aa] bg-[#287da6] font-semibold text-white"
                    : "border-transparent text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />

                <span className="flex-1">{item.name}</span>

                {item.count && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* EMERGENCY */}
        <div className="mx-3 mb-3 rounded-xl bg-white p-3 text-[#173d5b]">
          <div className="flex items-center gap-3">
            <Phone size={20} />

            <div>
              <p className="text-[10px] font-semibold">
                Emergency help line
              </p>

              <a
                href="tel:112"
                className="text-sm font-bold text-red-600"
              >
                Call 112
              </a>
            </div>
          </div>
        </div>

        {/* PROFILE */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold">
            SK
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold">Samira Khan</p>
            <p className="text-[10px] text-sky-200">
              Citizen account
            </p>
          </div>

          <ChevronRight size={17} />
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[295px]">

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">

          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="flex max-w-[520px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
              <Search size={17} className="text-slate-400" />

              <input
                placeholder="Search help, shelters, services..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:flex">
              <Globe size={15} />
              English
            </button>

            <button className="hidden rounded-lg border border-slate-200 p-2 sm:block">
              <Accessibility size={18} />
            </button>

            <button className="relative rounded-lg border border-slate-200 p-2">
              <Bell size={18} />

              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">
                4
              </span>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold text-white">
              SK
            </div>

            <div className="hidden sm:block">
              <p className="text-[10px] font-bold">Samira</p>
              <p className="text-[9px] text-slate-400">
                North Ward
              </p>
            </div>

            <ChevronRight size={17} />
          </div>
        </header>

        {/* PAGE BODY */}
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6">

          {/* TITLE */}
          <section className="mb-5">
            <h2 className="text-xl font-semibold">
              Messages
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Talk securely with the teams supporting your requests.
            </p>
          </section>

          {/* CHAT CONTAINER */}
          <section className="grid min-h-[570px] grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]">

            {/* CONVERSATION LIST */}
            <div className="flex flex-col border-b border-slate-200 md:border-b-0 md:border-r">

              {/* SEARCH */}
              <div className="border-b border-slate-200 p-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                  <Search size={14} className="text-slate-400" />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full bg-transparent text-[10px] outline-none"
                  />
                </div>
              </div>

              {/* CONVERSATIONS */}
              <div className="max-h-[250px] flex-1 overflow-y-auto md:max-h-none">

                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setActiveId(conversation.id)}
                    className={`flex w-full items-start gap-3 border-b border-slate-100 p-3 text-left transition hover:bg-slate-50 ${
                      activeId === conversation.id
                        ? "border-l-[3px] border-l-[#287da6] bg-[#edf6f8]"
                        : "border-l-[3px] border-l-transparent"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e9f3f8] text-[#287da6]">
                      <MessageCircle size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="truncate text-[10px] font-bold">
                          {conversation.name}
                        </p>

                        <span className="shrink-0 text-[8px] text-slate-400">
                          {conversation.time}
                        </span>
                      </div>

                      <p className="mt-1 text-[9px] font-medium text-slate-600">
                        {conversation.subject}
                      </p>

                      <p className="mt-1 truncate text-[9px] text-slate-400">
                        {conversation.preview}
                      </p>

                      {conversation.unread > 0 && (
                        <span className="mt-2 inline-flex rounded-full bg-[#287da6] px-2 py-0.5 text-[8px] text-white">
                          {conversation.unread} new
                        </span>
                      )}
                    </div>
                  </button>
                ))}

                {filteredConversations.length === 0 && (
                  <p className="p-5 text-center text-xs text-slate-400">
                    No conversations found.
                  </p>
                )}
              </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex min-h-[450px] flex-col">

              {activeConversation ? (
                <>
                  {/* CHAT HEADER */}
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">

                    <div>
                      <h3 className="text-xs font-bold">
                        {activeConversation.name}
                      </h3>

                      <p className="mt-1 text-[9px] text-slate-400">
                        {activeConversation.subject}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="rounded-md bg-emerald-50 px-3 py-2 text-[9px] font-semibold text-emerald-700"
                    >
                      Secure conversation
                    </button>
                  </div>

                  {/* SECURITY DETAILS */}
                  {showDetails && (
                    <div className="border-b border-emerald-100 bg-emerald-50 p-3 text-[10px] text-emerald-800">
                      This conversation is intended for communication with the support team. Do not share passwords or PINs.
                    </div>
                  )}

                  {/* MESSAGES */}
                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#f8fafb] p-4 sm:p-5">

                    <p className="text-center text-[9px] text-slate-400">
                      Today
                    </p>

                    {activeConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg border px-3 py-3 sm:max-w-[75%] ${
                            message.sender === "user"
                              ? "border-sky-200 bg-[#e5f2f7]"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <p className="text-[10px] leading-5 text-slate-700">
                            {message.text}
                          </p>

                          <p className="mt-1 text-right text-[8px] text-slate-400">
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* MESSAGE INPUT */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
                  >
                    <button
                      type="button"
                      className="p-2 text-[#287da6]"
                      aria-label="Attachment"
                      onClick={() => alert("File attachment can be connected to your backend.")}
                    >
                      <Paperclip size={16} />
                    </button>

                    <input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Write a message..."
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-[10px] outline-none focus:border-[#287da6]"
                    />

                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="flex items-center gap-2 rounded-lg bg-[#287da6] px-3 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1e668e] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send size={13} />
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <MessageCircle
                    size={35}
                    className="text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold">
                    Select a conversation
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Choose a support team to view your messages.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-5 flex flex-wrap justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support</p>
            <p>Stay safe. Stay informed.</p>
          </footer>

        </div>
      </main>
    </div>
  );
}
