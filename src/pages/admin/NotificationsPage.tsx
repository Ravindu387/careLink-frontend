import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Filter,
  HeartPulse,
  MapPin,
  Package,
  Search,
  Settings2,
  ShieldAlert,
  Users,
  X,
  Archive,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  Plus,
  Send,
  Volume2,
  Mail,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../services/notificationService";
import type {
  NotificationItem,
  NotificationStats,
  NotificationType,
  NotificationPreferences,
  CreateNotificationRequest,
} from "../../types/notification";

const filters: ("All" | "Unread" | NotificationType)[] = [
  "All",
  "Unread",
  "Emergency",
  "Assistance",
  "Volunteer",
  "Resource",
  "System",
];

const typeStyles: Record<NotificationType, { icon: string; badge: string }> = {
  Emergency: { icon: "bg-rose-50 text-rose-600", badge: "bg-rose-50 text-rose-700" },
  Assistance: { icon: "bg-blue-50 text-blue-600", badge: "bg-blue-50 text-blue-700" },
  Volunteer: { icon: "bg-violet-50 text-violet-600", badge: "bg-violet-50 text-violet-700" },
  Resource: { icon: "bg-amber-50 text-amber-700", badge: "bg-amber-50 text-amber-700" },
  System: { icon: "bg-emerald-50 text-emerald-700", badge: "bg-emerald-50 text-emerald-700" },
};

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "Emergency":
      return ShieldAlert;
    case "Assistance":
      return ClipboardList;
    case "Volunteer":
      return Users;
    case "Resource":
      return Package;
    case "System":
    default:
      return Info;
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate();

  // Core Notification State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All priorities");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [notice, setNotice] = useState("");

  // Preferences Modal
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailAlerts: true,
    pushNotifications: true,
    emergencyCriticalSound: true,
    assistanceRequestsNotify: true,
    volunteerCheckInsNotify: true,
    lowResourceStockNotify: true,
    dailySummaryDigest: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Create Alert Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAlert, setNewAlert] = useState<CreateNotificationRequest>({
    title: "",
    message: "",
    type: "Emergency",
    priority: "High",
    location: "",
    action: "View incident",
    actionUrl: "/admin/dashboard",
  });

  const fetchStats = useCallback(async () => {
    try {
      const data = await notificationService.getStats();
      setStats(data);
    } catch {
      // ignore
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationService.getNotifications({
        search: search.trim() || undefined,
        type: activeFilter === "All" ? undefined : activeFilter,
        priority: priority === "All priorities" ? undefined : priority,
        unreadOnly: activeFilter === "Unread" ? true : undefined,
      });
      setNotifications(result.items);
      await fetchStats();
    } catch (err: any) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter, priority, fetchStats]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const loadPreferences = async () => {
    try {
      const data = await notificationService.getPreferences();
      setPreferences(data);
      setIsPreferencesOpen(true);
    } catch (err: any) {
      setNotice(`Failed to load preferences: ${err.message}`);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      await notificationService.updatePreferences(preferences);
      setIsPreferencesOpen(false);
      setNotice("Notification delivery preferences updated successfully.");
      setTimeout(() => setNotice(""), 4000);
    } catch (err: any) {
      alert(`Could not save preferences: ${err.message}`);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.title.trim() || !newAlert.message.trim()) {
      alert("Please provide both an alert headline and a description.");
      return;
    }

    setCreating(true);
    try {
      await notificationService.createNotification(newAlert);
      setIsCreateOpen(false);
      setNewAlert({
        title: "",
        message: "",
        type: "Emergency",
        priority: "High",
        location: "",
        action: "View incident",
        actionUrl: "/admin/dashboard",
      });
      setNotice("Operational alert broadcasted successfully across the network.");
      setTimeout(() => setNotice(""), 4000);
      await fetchNotifications();
    } catch (err: any) {
      alert(`Failed to broadcast alert: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const markRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, unread: false } : item))
      );
      if (stats) {
        setStats({ ...stats, unreadCount: Math.max(0, stats.unreadCount - 1) });
      }
    } catch (err: any) {
      setNotice(`Failed to mark read: ${err.message}`);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
      setSelected([]);
      if (stats) {
        setStats({ ...stats, unreadCount: 0 });
      }
      setNotice("All active notifications marked as read.");
      setTimeout(() => setNotice(""), 4000);
    } catch (err: any) {
      setNotice(`Failed to mark all as read: ${err.message}`);
    }
  };

  const archiveSingle = async (id: number) => {
    try {
      await notificationService.archiveNotification(id);
      setNotifications((current) => current.filter((item) => item.id !== id));
      setSelected((current) => current.filter((val) => val !== id));
      await fetchStats();
      setNotice("Notification archived.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err: any) {
      setNotice(`Failed to archive notification: ${err.message}`);
    }
  };

  const archiveSelected = async () => {
    if (selected.length === 0) return;
    try {
      await notificationService.batchAction({
        notificationIds: selected,
        action: "archive",
      });
      setNotifications((current) => current.filter((item) => !selected.includes(item.id)));
      setSelected([]);
      await fetchStats();
      setNotice(`${selected.length} notifications archived successfully.`);
      setTimeout(() => setNotice(""), 4000);
    } catch (err: any) {
      setNotice(`Batch archive failed: ${err.message}`);
    }
  };

  const markSelectedAsRead = async () => {
    if (selected.length === 0) return;
    try {
      await notificationService.batchAction({
        notificationIds: selected,
        action: "mark_read",
      });
      setNotifications((current) =>
        current.map((item) => (selected.includes(item.id) ? { ...item, unread: false } : item))
      );
      setSelected([]);
      await fetchStats();
      setNotice(`${selected.length} notifications marked as read.`);
      setTimeout(() => setNotice(""), 4000);
    } catch (err: any) {
      setNotice(`Batch mark read failed: ${err.message}`);
    }
  };

  const toggleSelected = (id: number) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const handleActionClick = (item: NotificationItem) => {
    if (item.unread) {
      markRead(item.id);
    }
    if (item.actionUrl) {
      navigate(item.actionUrl);
    } else {
      setNotice(`${item.action ?? "Action"}: ${item.title}`);
    }
  };

  const unreadCount = stats ? stats.unreadCount : notifications.filter((n) => n.unread).length;
  const criticalCount = stats ? stats.criticalCount : notifications.filter((n) => n.priority === "Critical").length;
  const totalCount = stats ? stats.total : notifications.length;

  const getFilterBadgeCount = (filter: string) => {
    if (!stats) return 0;
    switch (filter) {
      case "All":
        return stats.total;
      case "Unread":
        return stats.unreadCount;
      case "Emergency":
        return stats.emergencyCount;
      case "Assistance":
        return stats.assistanceCount;
      case "Volunteer":
        return stats.volunteerCount;
      case "Resource":
        return stats.resourceCount;
      case "System":
        return stats.systemCount;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-full bg-[#EFF6F8] text-[#173B59]">
      <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 xl:p-8">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-[11px] text-slate-500">
          <span>Operations</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-[#173B59]">Notifications</span>
        </div>

        {/* Page heading */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0F1F5] text-[#247DA8]">
                <Bell size={18} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#319A89]">
                Live Operational Network
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#123B5B] sm:text-[30px]">
              Command Notifications
            </h1>
            <p className="mt-1 text-[12px] text-slate-500 sm:text-sm">
              Real-time humanitarian incident escalation, resource requisitions, and emergency team dispatches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2785B2] px-3.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#1E6B91]"
            >
              <Plus size={15} /> Broadcast Alert
            </button>

            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#C8DCE5] bg-white px-3 text-[11px] font-semibold text-[#276F96] transition hover:bg-[#F4FAFC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={15} /> Mark all as read
            </button>

            <button
              onClick={loadPreferences}
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-[11px] font-semibold transition ${
                showFilters
                  ? "border-[#247DA8] bg-[#E8F3F8] text-[#176F9F]"
                  : "border-[#C8DCE5] bg-white text-[#276F96] hover:bg-[#F4FAFC]"
              }`}
            >
              <Settings2 size={15} /> Preferences
            </button>

            <button
              onClick={() => fetchNotifications()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#C8DCE5] bg-white text-[#276F96] transition hover:bg-[#F4FAFC]"
              title="Refresh notifications"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#D8E5EB] bg-white p-4 shadow-[0_4px_14px_rgba(24,62,86,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Total notifications</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Bell size={16} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#123B5B]">{totalCount}</p>
            <p className="mt-1 text-[10px] text-slate-400">Recorded across active operational scope</p>
          </div>

          <div className="rounded-xl border border-[#D8E5EB] bg-white p-4 shadow-[0_4px_14px_rgba(24,62,86,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Unread notifications</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <Bell size={16} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#123B5B]">{unreadCount}</p>
            <p className="mt-1 text-[10px] text-rose-600 font-medium">Require operator action</p>
          </div>

          <div className="rounded-xl border border-[#D8E5EB] bg-white p-4 shadow-[0_4px_14px_rgba(24,62,86,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Critical alerts</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <AlertTriangle size={16} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#123B5B]">{criticalCount}</p>
            <p className="mt-1 text-[10px] text-slate-400">Emergency & severe threshold alerts</p>
          </div>
        </section>

        {/* Notification panel */}
        <section className="overflow-hidden rounded-xl border border-[#D8E5EB] bg-white shadow-[0_5px_18px_rgba(24,62,86,0.05)]">
          <div className="border-b border-[#E3EDF1] p-4 sm:p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#173B59]">All notifications</h2>
                <p className="mt-1 text-[10px] text-slate-400">
                  {unreadCount} unread · {totalCount} total in system
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search notifications..."
                    className="h-10 w-full rounded-lg border border-[#D8E5EB] bg-[#FBFDFE] pl-9 pr-3 text-[11px] outline-none transition placeholder:text-slate-400 focus:border-[#2785B2] focus:ring-2 focus:ring-[#2785B2]/10"
                  />
                </div>

                <button
                  onClick={() => setShowFilters((value) => !value)}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-[11px] font-medium transition ${
                    showFilters || priority !== "All priorities"
                      ? "border-[#2785B2] bg-[#EAF4F8] text-[#176F9F]"
                      : "border-[#D8E5EB] text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Filter size={14} /> Filter <ChevronDown size={13} />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 flex flex-col gap-3 rounded-lg bg-[#F5F9FB] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-[#173B59]">Priority Classification</p>
                  <p className="mt-1 text-[10px] text-slate-400">Filter notifications by operational severity.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    className="h-9 rounded-lg border border-[#D8E5EB] bg-white px-3 text-[10px] text-[#173B59] outline-none"
                  >
                    <option>All priorities</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Normal</option>
                  </select>

                  <button
                    onClick={() => {
                      setPriority("All priorities");
                      setSearch("");
                    }}
                    className="h-9 rounded-lg px-3 text-[10px] font-semibold text-[#247DA8] hover:bg-white"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
              {filters.map((filter) => {
                const count = getFilterBadgeCount(filter);
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-semibold transition ${
                      activeFilter === filter
                        ? "bg-[#E7F2F7] text-[#176F9F]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#173B59]"
                    }`}
                  >
                    {filter}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        activeFilter === filter
                          ? "bg-white text-[#176F9F]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Batch Actions Bar */}
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3EDF1] bg-[#F4F9FB] px-4 py-3">
              <span className="text-[11px] font-semibold text-[#173B59]">
                {selected.length} notification{selected.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={markSelectedAsRead}
                  className="rounded-md border border-[#C8DCE5] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#247DA8] transition hover:bg-slate-50"
                >
                  Mark as read
                </button>
                <button
                  onClick={archiveSelected}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <Archive size={13} /> Archive
                </button>
              </div>
            </div>
          )}

          {/* User Notice Toast */}
          {notice && (
            <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-4 py-2.5 text-[10px] font-medium text-emerald-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                {notice}
              </span>
              <button onClick={() => setNotice("")} aria-label="Dismiss message">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Notification List View */}
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <RefreshCw size={26} className="animate-spin text-[#2785B2]" />
                <p className="mt-3 text-[11px] font-medium">Synchronizing live notifications...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-rose-600">
                <AlertTriangle size={28} className="mb-2" />
                <p className="text-sm font-semibold">{error}</p>
                <button
                  onClick={() => fetchNotifications()}
                  className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-rose-700"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-16 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Bell size={21} />
                </span>
                <h3 className="text-sm font-semibold text-[#173B59]">No notifications found</h3>
                <p className="mt-1 text-[11px] text-slate-400">
                  Try adjusting your search query, priority filter, or view tabs.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const Icon = getNotificationIcon(item.type);
                const style = typeStyles[item.type] || typeStyles.System;

                return (
                  <article
                    key={item.id}
                    className={`group flex gap-3 border-b border-[#EAF0F3] px-4 py-4 transition last:border-b-0 sm:gap-4 sm:px-5 ${
                      item.unread ? "bg-[#F7FBFD]" : "bg-white hover:bg-[#FBFDFE]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${item.title}`}
                      checked={selected.includes(item.id)}
                      onChange={() => toggleSelected(item.id)}
                      className="mt-3 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[#247DA8]"
                    />

                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-[12px] ${
                            item.unread ? "font-bold text-[#173B59]" : "font-semibold text-slate-700"
                          }`}
                        >
                          {item.title}
                        </h3>

                        {item.unread && <span className="h-2 w-2 rounded-full bg-[#2785B2]" />}

                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${style.badge}`}>
                          {item.type}
                        </span>

                        {item.priority === "Critical" && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                            Critical
                          </span>
                        )}

                        {item.priority === "High" && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                            High priority
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 max-w-4xl text-[11px] leading-5 text-slate-600 sm:text-[11px]">
                        {item.message}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Clock3 size={11} />
                          {item.time}
                        </span>
                        {item.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={11} />
                            {item.location}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {item.action && (
                          <button
                            onClick={() => handleActionClick(item)}
                            className="inline-flex items-center gap-1 rounded-md bg-[#EAF4F8] px-2.5 py-1.5 text-[10px] font-semibold text-[#176F9F] transition hover:bg-[#DCEEF5]"
                          >
                            {item.action} <ExternalLink size={10} />
                          </button>
                        )}

                        {item.unread && (
                          <button
                            onClick={() => markRead(item.id)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100"
                          >
                            <Check size={11} /> Mark as read
                          </button>
                        )}

                        <button
                          onClick={() => archiveSingle(item.id)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Archive size={11} /> Archive
                        </button>
                      </div>
                    </div>

                    <span className="hidden shrink-0 pt-1 text-[10px] font-medium text-slate-400 sm:block">
                      {item.date}
                    </span>
                  </article>
                );
              })
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#E3EDF1] bg-[#FCFDFE] px-4 py-3 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {notifications.length} of {totalCount} notifications
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <CheckCircle2 size={13} className="text-emerald-600" /> Live response synchronization connected
            </span>
          </div>
        </section>
      </div>

      {/* PREFERENCES MODAL */}
      {isPreferencesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F2F8] text-[#2383B5]">
                  <Settings2 size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#123B5C]">Notification Preferences</h3>
                  <p className="text-[10px] text-slate-400">Configure alert channels and domain triggers</p>
                </div>
              </div>
              <button
                onClick={() => setIsPreferencesOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-[11px] text-slate-600">
              <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-[#2785B2]" />
                  <div>
                    <span className="font-semibold text-[#173B59]">Email Alerts</span>
                    <p className="text-[10px] text-slate-400">Send dispatch digests to registered admin email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailAlerts}
                  onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#2785B2]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <Smartphone size={16} className="text-[#2785B2]" />
                  <div>
                    <span className="font-semibold text-[#173B59]">Push Notifications</span>
                    <p className="text-[10px] text-slate-400">Browser toast alerts for high priority incidents</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#2785B2]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <Volume2 size={16} className="text-rose-500" />
                  <div>
                    <span className="font-semibold text-[#173B59]">Critical Emergency Audible Alarm</span>
                    <p className="text-[10px] text-slate-400">Audible tone when Level-1 disaster escalations occur</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emergencyCriticalSound}
                  onChange={(e) => setPreferences({ ...preferences, emergencyCriticalSound: e.target.checked })}
                  className="h-4 w-4 rounded accent-rose-600"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                <div>
                  <span className="font-semibold text-[#173B59]">Assistance Requisitions</span>
                  <p className="text-[10px] text-slate-400">Notify when citizen requests require triage</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.assistanceRequestsNotify}
                  onChange={(e) => setPreferences({ ...preferences, assistanceRequestsNotify: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#2785B2]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                <div>
                  <span className="font-semibold text-[#173B59]">Volunteer Check-in Alerts</span>
                  <p className="text-[10px] text-slate-400">Alerts for deployment shift completions</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.volunteerCheckInsNotify}
                  onChange={(e) => setPreferences({ ...preferences, volunteerCheckInsNotify: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#2785B2]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                <div>
                  <span className="font-semibold text-[#173B59]">Low Resource Stock Warnings</span>
                  <p className="text-[10px] text-slate-400">Notify when warehouse inventory drops below 20%</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.lowResourceStockNotify}
                  onChange={(e) => setPreferences({ ...preferences, lowResourceStockNotify: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#2785B2]"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingPrefs}
                onClick={handleSavePreferences}
                className="flex items-center gap-1.5 rounded-lg bg-[#2785B2] px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-[#1E6B91] disabled:opacity-50"
              >
                {savingPrefs ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ALERT / BROADCAST MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateAlert}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Send size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#123B5C]">Broadcast Operational Alert</h3>
                  <p className="text-[10px] text-slate-400">Send an immediate notification to platform coordinators</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-[11px]">
              <div>
                <label className="mb-1 block font-semibold text-[#173B59]">Alert Headline / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Flood Escalation - Southern Coastal Belt"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  className="h-9 w-full rounded-lg border border-[#D5E3EA] px-3 outline-none focus:border-[#2785B2] focus:ring-1 focus:ring-[#2785B2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-[#173B59]">Category</label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as NotificationType })}
                    className="h-9 w-full rounded-lg border border-[#D5E3EA] bg-white px-2.5 outline-none"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Assistance">Assistance</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Resource">Resource</option>
                    <option value="System">System</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-[#173B59]">Priority Level</label>
                  <select
                    value={newAlert.priority}
                    onChange={(e) => setNewAlert({ ...newAlert, priority: e.target.value as any })}
                    className="h-9 w-full rounded-lg border border-[#D5E3EA] bg-white px-2.5 outline-none"
                  >
                    <option value="Critical">Critical (Immediate Response)</option>
                    <option value="High">High Priority</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-[#173B59]">Operational Location</label>
                <input
                  type="text"
                  placeholder="e.g. Kalutara North District · Shelter 4"
                  value={newAlert.location || ""}
                  onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                  className="h-9 w-full rounded-lg border border-[#D5E3EA] px-3 outline-none focus:border-[#2785B2] focus:ring-1 focus:ring-[#2785B2]"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-[#173B59]">Notification Body Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed situational brief and required administrative action..."
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  className="w-full rounded-lg border border-[#D5E3EA] p-2.5 outline-none focus:border-[#2785B2] focus:ring-1 focus:ring-[#2785B2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-[#173B59]">Action Button Label</label>
                  <input
                    type="text"
                    placeholder="e.g. View incident"
                    value={newAlert.action || ""}
                    onChange={(e) => setNewAlert({ ...newAlert, action: e.target.value })}
                    className="h-9 w-full rounded-lg border border-[#D5E3EA] px-3 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-[#173B59]">Target Route / URL</label>
                  <input
                    type="text"
                    placeholder="e.g. /admin/dashboard"
                    value={newAlert.actionUrl || ""}
                    onChange={(e) => setNewAlert({ ...newAlert, actionUrl: e.target.value })}
                    className="h-9 w-full rounded-lg border border-[#D5E3EA] px-3 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-1.5 rounded-lg bg-[#2785B2] px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-[#1E6B91] disabled:opacity-50"
              >
                <Send size={13} />
                {creating ? "Broadcasting..." : "Broadcast Alert"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
