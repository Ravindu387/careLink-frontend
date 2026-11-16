
import { useState } from "react";
import {
  Heart, Search, Globe, Bell, Accessibility,
  Home, Plus, ClipboardList, Map, House,
  TriangleAlert, Users, FileText, MessageSquare,
  Phone, ChevronRight, Menu, X, Check,
  Truck, CheckCircle, ShieldAlert
} from "lucide-react";

type NotificationType =
  | "alert"
  | "message"
  | "delivery"
  | "shelter"
  | "medical";

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  category: "Safety alerts" | "My requests";
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "alert",
    title: "Evacuation alert for Riverside",
    description:
      "Move to North Ward Community Hall using Market Road.",
    time: "12 min ago",
    unread: true,
    category: "Safety alerts",
  },
  {
    id: 2,
    type: "message",
    title: "New message from Case Support",
    description:
      "Accessible shelter space is being confirmed.",
    time: "1 hour ago",
    unread: true,
    category: "My requests",
  },
  {
    id: 3,
    type: "delivery",
    title: "Your delivery is on the way",
    description:
      "Food and water delivery expected by 14:20.",
    time: "42 min ago",
    unread: true,
    category: "My requests",
  },
  {
    id: 4,
    type: "shelter",
    title: "Shelter availability updated",
    description:
      "Riverton High School has 48 spaces available.",
    time: "1 hr ago",
    unread: true,
    category: "Safety alerts",
  },
  {
    id: 5,
    type: "medical",
    title: "Medical request completed",
    description:
      "Support delivery was confirmed.",
    time: "1 day ago",
    unread: false,
    category: "My requests",
  },
];

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

const iconStyles: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string }
> = {
  alert: {
    icon: TriangleAlert,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  message: {
    icon: MessageSquare,
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  delivery: {
    icon: Truck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  shelter: {
    icon: House,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  medical: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const [activeTab, setActiveTab] = useState("All");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const [search, setSearch] = useState("");

  const unreadCount = notifications.filter(
    (n) => n.unread
  ).length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Unread" && n.unread) ||
      n.category === activeTab;

    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((n) => ({ ...n, unread: false }))
    );
  };

  const openNotification = (notification: Notification) => {
    setNotifications((previous) =>
      previous.map((n) =>
        n.id === notification.id
          ? { ...n, unread: false }
          : n
      )
    );

    setSelectedNotification(notification);
  };

  const tabs = [
    { name: "All", count: notifications.length },
    { name: "Unread", count: unreadCount },
    { name: "My requests", count: null },
    { name: "Safety alerts", count: null },
  ];

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
            const active = item.name === "Notifications";

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
                    {item.name === "Notifications"
                      ? unreadCount
                      : item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* EMERGENCY CONTACT */}
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

        {/* TOP HEADER */}
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

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">
                  {unreadCount}
                </span>
              )}
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

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6">

          {/* PAGE TITLE */}
          <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                Notifications
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Important request updates, safety alerts, and service information.
              </p>
            </div>

            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[10px] font-semibold text-[#287da6] hover:bg-sky-50 disabled:opacity-50"
            >
              Mark all as read
            </button>
          </section>

          {/* TABS */}
          <div className="mb-0 flex flex-wrap gap-5 border-b border-slate-200">

            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setSelectedNotification(null);
                }}
                className={`relative flex items-center gap-2 pb-3 text-[10px] ${
                  activeTab === tab.name
                    ? "font-bold text-[#287da6]"
                    : "text-slate-500 hover:text-[#287da6]"
                }`}
              >
                {tab.name}

                {tab.count !== null && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px]">
                    {tab.count}
                  </span>
                )}

                {activeTab === tab.name && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#287da6]" />
                )}
              </button>
            ))}
          </div>

          {/* SEARCH */}
          <div className="mb-4 mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3">
            <Search size={15} className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>

          {/* NOTIFICATION LIST */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            {filteredNotifications.map((notification) => {
              const style = iconStyles[notification.type];
              const Icon = style.icon;

              return (
                <button
                  key={notification.id}
                  onClick={() => openNotification(notification)}
                  className={`flex w-full items-center gap-3 border-b border-slate-200 p-4 text-left transition hover:bg-slate-50 sm:gap-4 sm:px-5 ${
                    notification.unread ? "bg-[#f4faf9]" : "bg-white"
                  }`}
                >
                  {/* ICON */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                    <Icon size={18} className={style.color} />
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">

                    <h3 className="truncate text-[10px] font-bold text-[#173d5b] sm:text-xs">
                      {notification.title}
                    </h3>

                    <p className="mt-1 truncate text-[9px] text-slate-500 sm:text-[10px]">
                      {notification.description}
                    </p>

                    <p className="mt-1 text-[8px] text-slate-400">
                      {notification.time}
                    </p>
                  </div>

                  {/* UNREAD INDICATOR */}
                  <div className="flex shrink-0 items-center gap-2">
                    {notification.unread && (
                      <span className="h-2 w-2 rounded-full bg-[#287da6]" />
                    )}

                    <ChevronRight
                      size={16}
                      className="text-slate-500"
                    />
                  </div>
                </button>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bell size={32} className="text-slate-300" />

                <h3 className="mt-3 text-sm font-semibold">
                  No notifications found
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  There are no notifications in this category.
                </p>
              </div>
            )}
          </section>

          {/* NOTIFICATION DETAILS */}
          {selectedNotification && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">
                  Notification details
                </h3>

                <button
                  onClick={() => setSelectedNotification(null)}
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <div className={`rounded-lg p-3 ${iconStyles[selectedNotification.type].bg}`}>
                  {(() => {
                    const Icon = iconStyles[selectedNotification.type].icon;
                    return (
                      <Icon
                        size={20}
                        className={iconStyles[selectedNotification.type].color}
                      />
                    );
                  })()}
                </div>

                <div>
                  <h4 className="text-xs font-bold">
                    {selectedNotification.title}
                  </h4>

                  <p className="mt-2 text-xs leading-6 text-slate-600">
                    {selectedNotification.description}
                  </p>

                  <p className="mt-2 text-[10px] text-slate-400">
                    {selectedNotification.time}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-emerald-600">
                <Check size={15} />
                <span className="text-[10px] font-semibold">
                  Notification marked as read
                </span>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <footer className="mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support</p>
            <p>Stay safe. Stay informed.</p>
          </footer>

        </div>
      </main>
    </div>
  );
}
