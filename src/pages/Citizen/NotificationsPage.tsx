import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Search,
  Bell,
  Plus,
  ClipboardList,
  House,
  TriangleAlert,
  Users,
  FileText,
  MessageSquare,
  ChevronRight,
  X,
  Check,
  CheckCircle,
  Truck,
  ShieldAlert,
  Trash2,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import {
  notificationService,
  MOCK_NOTIFICATIONS,
} from "../../services/notificationService";
import type {
  CitizenNotification,
  NotificationType,
  NotificationSummary,
} from "../../types/notification";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<CitizenNotification[]>(MOCK_NOTIFICATIONS);
  const [summary, setSummary] = useState<NotificationSummary>({
    totalCount: MOCK_NOTIFICATIONS.length,
    unreadCount: MOCK_NOTIFICATIONS.filter((n) => n.unread).length,
    safetyAlertsCount: MOCK_NOTIFICATIONS.filter((n) => n.category === "Safety alerts").length,
    myRequestsCount: MOCK_NOTIFICATIONS.filter((n) => n.category === "My requests").length,
  });

  // UI & Filter State
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<CitizenNotification | null>(null);

  // Loading & Connectivity State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => setFeedbackToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  // Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const citizen = user?.fullName || "Samira Khan";
      const data = await notificationService.getNotifications({
        citizenName: citizen,
        search: search.trim() || undefined,
      });

      setNotifications(data);
      setIsBackendConnected(true);

      // Summary
      try {
        const sum = await notificationService.getSummary(citizen);
        setSummary(sum);
      } catch {
        setSummary({
          totalCount: data.length,
          unreadCount: data.filter((n) => n.unread).length,
          safetyAlertsCount: data.filter((n) => n.category === "Safety alerts").length,
          myRequestsCount: data.filter((n) => n.category === "My requests").length,
        });
      }
    } catch (err) {
      console.warn("Backend API offline, using local mock notifications:", err);
      setIsBackendConnected(false);

      let fallbackList = [...MOCK_NOTIFICATIONS];
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        fallbackList = fallbackList.filter(
          (n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
        );
      }
      setNotifications(fallbackList);
      setSummary({
        totalCount: MOCK_NOTIFICATIONS.length,
        unreadCount: MOCK_NOTIFICATIONS.filter((n) => n.unread).length,
        safetyAlertsCount: MOCK_NOTIFICATIONS.filter((n) => n.category === "Safety alerts").length,
        myRequestsCount: MOCK_NOTIFICATIONS.filter((n) => n.category === "My requests").length,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.fullName, search]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Unread count
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Filtered Notifications
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

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      if (isBackendConnected) {
        await notificationService.markAllAsRead(user?.fullName || "Samira Khan");
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      setSummary((prev) => ({ ...prev, unreadCount: 0 }));

      setFeedbackToast({
        type: "success",
        message: "All notifications marked as read.",
      });
    } catch (err: any) {
      console.error("Failed to mark all as read:", err);
      setFeedbackToast({
        type: "error",
        message: err.message || "Failed to mark all as read.",
      });
    }
  };

  // Open & mark single notification as read
  const openNotification = async (notification: CitizenNotification) => {
    if (notification.unread) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, unread: false } : n))
      );
      setSummary((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));

      try {
        if (isBackendConnected) {
          await notificationService.markAsRead(notification.id);
        }
      } catch (err) {
        console.warn("Could not sync read status with backend:", err);
      }
    }

    setSelectedNotification({ ...notification, unread: false });
  };

  // Delete notification
  const handleDeleteNotification = async (id: string | number) => {
    try {
      if (isBackendConnected) {
        await notificationService.deleteNotification(id);
      }

      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      if (target?.unread) {
        setSummary((prev) => ({
          ...prev,
          totalCount: Math.max(0, prev.totalCount - 1),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      } else {
        setSummary((prev) => ({
          ...prev,
          totalCount: Math.max(0, prev.totalCount - 1),
        }));
      }

      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }

      setFeedbackToast({
        type: "info",
        message: "Notification removed.",
      });
    } catch (err: any) {
      console.error("Failed to delete notification:", err);
      setFeedbackToast({
        type: "error",
        message: err.message || "Failed to delete notification.",
      });
    }
  };

  // Tabs configuration
  const tabs = [
    { name: "All", count: summary.totalCount },
    { name: "Unread", count: unreadCount },
    { name: "My requests", count: summary.myRequestsCount },
    { name: "Safety alerts", count: summary.safetyAlertsCount },
  ];

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="Notifications"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="min-h-screen lg:ml-[295px]">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT CONTAINER */}
        <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6">
          {/* TOAST FEEDBACK NOTIFICATION */}
          {feedbackToast && (
            <div
              className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-semibold shadow-md transition-all ${
                feedbackToast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : feedbackToast.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackToast.type === "success" ? (
                  <CheckCircle size={16} className="text-emerald-600" />
                ) : feedbackToast.type === "error" ? (
                  <AlertCircle size={16} className="text-red-600" />
                ) : (
                  <Info size={16} className="text-sky-600" />
                )}
                <span>{feedbackToast.message}</span>
              </div>
              <button
                onClick={() => setFeedbackToast(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* PAGE HEADER & CONTROLS */}
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight">
                  Notifications
                </h2>

                {/* BACKEND STATUS BADGE */}
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] shadow-xs">
                  {isBackendConnected === true ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Wifi size={11} /> Backend API Online
                      </span>
                    </>
                  ) : isBackendConnected === false ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="font-semibold text-amber-700 flex items-center gap-1">
                        <WifiOff size={11} /> Local Fallback Mode
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">Connecting...</span>
                  )}
                </div>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Important request updates, safety alerts, and vital disaster response notifications.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchNotifications()}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition"
                title="Refresh notifications"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin text-[#287da6]" : "text-slate-500"}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#287da6] hover:bg-sky-50 disabled:opacity-50 transition shadow-xs"
              >
                Mark all as read
              </button>
            </div>
          </section>

          {/* KPI COUNTERS */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Updates
              </span>
              <p className="mt-1.5 text-xl font-bold text-[#173d5b]">
                {summary.totalCount}
              </p>
              <p className="text-[9px] text-slate-400">All notifications</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Unread Messages
              </span>
              <p className="mt-1.5 text-xl font-bold text-rose-600">
                {unreadCount}
              </p>
              <p className="text-[9px] text-slate-400">Awaiting your attention</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Safety Alerts
              </span>
              <p className="mt-1.5 text-xl font-bold text-amber-600">
                {summary.safetyAlertsCount}
              </p>
              <p className="text-[9px] text-slate-400">Hazard & shelter updates</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#287da6]">
                My Requests
              </span>
              <p className="mt-1.5 text-xl font-bold text-[#287da6]">
                {summary.myRequestsCount}
              </p>
              <p className="text-[9px] text-slate-400">Dispatches & case notes</p>
            </div>
          </section>

          {/* TABS & SEARCH */}
          <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
            {/* TABS */}
            <div className="flex flex-wrap items-center gap-5 border-b border-slate-100 lg:border-b-0 pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    setSelectedNotification(null);
                  }}
                  className={`relative flex items-center gap-1.5 pb-2 text-xs font-semibold transition ${
                    activeTab === tab.name
                      ? "text-[#287da6] font-bold"
                      : "text-slate-500 hover:text-[#287da6]"
                  }`}
                >
                  {tab.name}

                  {tab.count !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        tab.name === "Unread" && unreadCount > 0
                          ? "bg-rose-100 text-rose-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
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
            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs outline-none focus:border-[#287da6] focus:bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </section>

          {/* NOTIFICATION LIST */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <RefreshCw size={28} className="animate-spin text-[#287da6]" />
                <p className="mt-3 text-xs font-semibold text-slate-600">
                  Loading notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                <Bell size={36} className="text-slate-300" />
                <h3 className="mt-3 text-sm font-bold text-slate-700">
                  No notifications found
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {search
                    ? "No notifications match your search terms."
                    : `There are no notifications in the "${activeTab}" filter.`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map((notification) => {
                  const style = iconStyles[notification.type] || iconStyles.alert;
                  const Icon = style.icon;
                  const isSelected = selectedNotification?.id === notification.id;

                  return (
                    <div
                      key={notification.id}
                      onClick={() => openNotification(notification)}
                      className={`flex w-full items-center gap-3.5 p-4 text-left transition hover:bg-slate-50/80 cursor-pointer sm:px-5 ${
                        notification.unread ? "bg-[#f4faf9]" : "bg-white"
                      } ${isSelected ? "border-l-4 border-l-[#287da6]" : ""}`}
                    >
                      {/* ICON */}
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs ${style.bg}`}
                      >
                        <Icon size={19} className={style.color} />
                      </div>

                      {/* CONTENT */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-xs font-bold text-[#173d5b] sm:text-sm">
                            {notification.title}
                          </h3>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-slate-500 uppercase">
                            {notification.category}
                          </span>
                        </div>

                        <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
                          {notification.description}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {notification.time}
                        </p>
                      </div>

                      {/* UNREAD INDICATOR & ACTIONS */}
                      <div className="flex shrink-0 items-center gap-3">
                        {notification.unread && (
                          <span
                            className="h-2.5 w-2.5 rounded-full bg-[#287da6] shadow-xs"
                            title="Unread"
                          />
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="rounded-lg p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 transition"
                          title="Dismiss notification"
                        >
                          <Trash2 size={14} />
                        </button>

                        <ChevronRight size={16} className="text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* NOTIFICATION DETAILS PANEL */}
          {selectedNotification && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                    Notification details
                  </span>
                  <span className="text-[10px] text-slate-400">• {selectedNotification.category}</span>
                </div>

                <button
                  onClick={() => setSelectedNotification(null)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 flex items-start gap-3.5">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    (iconStyles[selectedNotification.type] || iconStyles.alert).bg
                  }`}
                >
                  {(() => {
                    const style = iconStyles[selectedNotification.type] || iconStyles.alert;
                    const Icon = style.icon;
                    return <Icon size={22} className={style.color} />;
                  })()}
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#173d5b]">
                    {selectedNotification.title}
                  </h4>

                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    {selectedNotification.description}
                  </p>

                  <p className="mt-2 text-[10px] text-slate-400">
                    Received {selectedNotification.time}
                  </p>
                </div>
              </div>

              {/* ACTION LINKS */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                  <Check size={14} />
                  <span>Marked as read</span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedNotification.actionUrl && (
                    <button
                      onClick={() => navigate(selectedNotification.actionUrl!)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#287da6] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1e668e] transition"
                    >
                      <ExternalLink size={13} />
                      Open Related Page
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteNotification(selectedNotification.id)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 size={13} />
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support · Notifications System</p>
            <p>Real-time civic alert dispatch</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
