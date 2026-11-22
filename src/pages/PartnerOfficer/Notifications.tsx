import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  AlertTriangle,
  Handshake,
  Package,
  CalendarDays,
  FileText,
  Users,
  ChevronRight,
  X,
  Settings,
  Clock,
  Search,
  CheckCheck,
  RefreshCw,
  Radio,
  ExternalLink,
} from "lucide-react";
import {
  notificationService,
  type Notification,
  type NotificationCounts,
  type NotificationPreferences,
} from "../../services/notificationService";



const tabs = [
  "All",
  "Unread",
  "Urgent",
  "Collaboration",
  "Reporting",
];

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [metrics, setMetrics] = useState<NotificationCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const [showPreferences, setShowPreferences] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    urgent: true,
    referrals: true,
    collaboration: true,
    resources: true,
    reporting: true,
    team: true,
    email: false,
    push: true,
  });

  const loadData = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) {
      setIsLoading(true);
    } else {
      setIsSyncing(true);
    }

    try {
      const [list, countData, prefData] = await Promise.all([
        notificationService.getAll({ role: "partner" }),
        notificationService.getMetrics("partner"),
        notificationService.getPreferences(),
      ]);
      setNotifications(list);
      setMetrics(countData);
      setPreferences(prefData);
      setIsConnected(true);
      setError(null);
    } catch (err: unknown) {
      console.warn("Failed to load notifications from API:", err);
      setIsConnected(false);
      setError("Working with offline cached notifications.");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const [list, countData, prefData] = await Promise.all([
          notificationService.getAll({ role: "partner" }),
          notificationService.getMetrics("partner"),
          notificationService.getPreferences(),
        ]);
        if (isMounted) {
          setNotifications(list);
          setMetrics(countData);
          setPreferences(prefData);
          setIsConnected(true);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn("Initial load from API failed:", err);
          setIsConnected(false);
          setError("Working with offline cached notifications.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.unread).length;
  }, [notifications]);

  const urgentCount = useMemo(() => {
    return notifications.filter((n) => n.urgent && n.unread).length;
  }, [notifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const text = [
        notification.title,
        notification.description,
        notification.reference,
        notification.details,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Unread" && notification.unread) ||
        (activeTab === "Urgent" && (notification.urgent || notification.category.toLowerCase() === "urgent")) ||
        notification.category.toLowerCase() === activeTab.toLowerCase();

      return matchesSearch && matchesTab;
    });
  }, [notifications, activeTab, search]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      All: notifications.length,
      Unread: unreadCount,
      Urgent: urgentCount,
      Collaboration: notifications.filter(
        (n) => n.category.toLowerCase() === "collaboration"
      ).length,
      Reporting: notifications.filter(
        (n) => n.category.toLowerCase() === "reporting"
      ).length,
    };
  }, [notifications, unreadCount, urgentCount]);

  // Mark all as read
  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
    try {
      await notificationService.markAllRead("partner");
      const newMetrics = await notificationService.getMetrics("partner");
      setMetrics(newMetrics);
    } catch (err: unknown) {
      console.warn("Failed to mark all as read on backend:", err);
    }
  };

  // Mark single notification as read
  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
    try {
      await notificationService.markRead(id);
      const newMetrics = await notificationService.getMetrics("partner");
      setMetrics(newMetrics);
    } catch (err: unknown) {
      console.warn(`Failed to mark notification ${id} as read:`, err);
    }
  };

  // Open notification details
  const openNotification = (notification: Notification) => {
    if (notification.unread) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      const updated = await notificationService.updatePreferences(preferences);
      setPreferences(updated);
      setShowPreferences(false);
    } catch (err: unknown) {
      console.error("Failed to save preferences on backend:", err);
      setShowPreferences(false);
    } finally {
      setSavingPreferences(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs text-slate-500">
              Partner Coordination
              <span className="mx-2">›</span>
              <span className="font-semibold text-[#153e5b]">Notifications</span>
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <Radio size={10} className={isConnected ? "animate-pulse text-emerald-600" : "text-amber-600"} />
              {isConnected ? "Live Backend" : "Offline Cache"}
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-[#153e5b]">Notifications</h1>

          <p className="mt-1 text-sm text-slate-500">
            Review shared referrals, partner requests, operational exceptions, and reporting deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadData(false)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-2.5 text-xs font-medium text-[#267ba4] hover:bg-slate-50 disabled:opacity-50"
            title="Refresh notifications"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin text-[#267ba4]" : ""} />
            Sync
          </button>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-2.5 text-xs font-medium text-[#267ba4] hover:bg-slate-50 disabled:opacity-50"
          >
            <CheckCheck size={15} />
            Mark all as read
          </button>

          <button
            onClick={() => setShowPreferences(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Settings size={15} />
            Preferences
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData(true)}
            className="font-semibold text-amber-900 underline hover:no-underline"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<Bell size={19} />}
          title="Total notifications"
          value={metrics ? String(metrics.all) : String(notifications.length)}
          subtitle="All partner notifications"
          color="blue"
        />

        <SummaryCard
          icon={<AlertTriangle size={19} />}
          title="Unread notifications"
          value={metrics ? String(metrics.unread) : String(unreadCount)}
          subtitle="Require your attention"
          color="orange"
        />

        <SummaryCard
          icon={<Clock size={19} />}
          title="Urgent notifications"
          value={metrics ? String(metrics.urgent ?? urgentCount) : String(urgentCount)}
          subtitle="Priority actions required"
          color="red"
        />
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="w-full rounded-lg border border-[#d3e1e8] bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-[#267ba4]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">
        {tabs.map((tab) => {
          const count = tabCounts[tab as keyof typeof tabCounts];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex items-center gap-1.5 whitespace-nowrap pb-4 text-xs ${
                activeTab === tab
                  ? "font-semibold text-[#267ba4]"
                  : "text-slate-500 hover:text-[#267ba4]"
              }`}
            >
              {tab}
              {typeof count === "number" && (
                <span className="rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px] font-semibold text-[#153e5b]">
                  {count}
                </span>
              )}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-center text-xs text-slate-500 gap-2">
            <RefreshCw size={18} className="animate-spin text-[#267ba4]" />
            <span>Loading notifications from backend...</span>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onClick={() => openNotification(notification)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell size={32} className="mb-3 text-slate-300" />
            <h3 className="text-sm font-semibold text-[#153e5b]">
              No notifications found
            </h3>
            <p className="mt-2 text-xs text-slate-400">
              There are no notifications matching your selection.
            </p>
            <button
              onClick={() => {
                setActiveTab("All");
                setSearch("");
              }}
              className="mt-4 text-xs font-medium text-[#267ba4] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedNotification && (
        <NotificationDetailsModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <PreferencesModal
          preferences={preferences}
          togglePreference={togglePreference}
          onSave={handleSavePreferences}
          isSaving={savingPreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </div>
  );
};

// Summary Card
function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-[#e8f2f8] text-[#2783b1]",
    green: "bg-[#e5f6f0] text-[#299b7d]",
    orange: "bg-[#fff4df] text-[#d69b30]",
    red: "bg-[#fff0f0] text-[#e05252]",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#d7e5eb] bg-white p-4 shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          colors[color] || colors.blue
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[10px] text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-[#153e5b]">{value}</p>
        <p className="text-[9px] text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

// Notification Icon
function NotificationIcon({ category }: { category: string }) {
  const cat = category.toLowerCase();

  let icon: ReactNode = <Bell size={19} />;
  let colorClass = "bg-[#e8f2f8] text-[#2783b1]";

  if (cat === "urgent" || cat === "critical") {
    icon = <AlertTriangle size={19} />;
    colorClass = "bg-[#fff0f0] text-[#e05252]";
  } else if (cat === "collaboration" || cat === "partner") {
    icon = <Handshake size={19} />;
    colorClass = "bg-[#f0ebfb] text-[#8661c5]";
  } else if (cat === "resource") {
    icon = <Package size={19} />;
    colorClass = "bg-[#fff4df] text-[#c68b24]";
  } else if (cat === "reporting" || cat === "report") {
    icon = <CalendarDays size={19} />;
    colorClass = "bg-[#e8f2f8] text-[#2783b1]";
  } else if (cat === "agreement") {
    icon = <FileText size={19} />;
    colorClass = "bg-[#fff4df] text-[#bd8229]";
  } else if (cat === "team") {
    icon = <Users size={19} />;
    colorClass = "bg-[#e5f6f0] text-[#299b7d]";
  }

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
    >
      {icon}
    </div>
  );
}

// Notification Row
function NotificationRow({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const isUrgent =
    notification.urgent ||
    notification.category.toLowerCase() === "urgent" ||
    notification.category.toLowerCase() === "critical";

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-[#d7e5eb] px-3 py-4 text-left transition last:border-b-0 hover:bg-[#f0f8f7] sm:px-4 ${
        notification.unread ? "bg-[#f4faf8]" : "bg-white"
      }`}
    >
      <NotificationIcon category={notification.category} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[11px] font-semibold text-[#153e5b]">
            {notification.title}
          </h3>

          {isUrgent && (
            <span className="rounded bg-[#fff0f0] px-1.5 py-0.5 text-[8px] font-semibold text-[#d94b4b]">
              Urgent
            </span>
          )}
        </div>

        <p className="mt-1 truncate text-[10px] text-slate-500">
          {notification.description}
        </p>

        <p className="mt-1 text-[9px] text-slate-400">{notification.time}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {notification.unread && (
          <span className="h-2 w-2 rounded-full bg-[#2783b1]" />
        )}

        <ChevronRight size={19} className="text-[#153e5b]" />
      </div>
    </button>
  );
}

// Notification Details Modal
function NotificationDetailsModal({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const isUrgent =
    notification.urgent ||
    notification.category.toLowerCase() === "urgent" ||
    notification.category.toLowerCase() === "critical";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#267ba4]">
              Notification Details
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              {notification.title}
            </h2>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-lg bg-[#f5f8fa] p-4">
          <NotificationIcon category={notification.category} />

          <div>
            <p className="text-xs font-semibold text-[#153e5b]">
              {notification.category}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              {notification.time}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Detail label="Reference ID" value={notification.reference} />
          <Detail label="Description" value={notification.description} />

          <div>
            <p className="mb-2 text-[10px] text-slate-400">Details</p>
            <p className="rounded-lg bg-[#f5f8fa] p-3 text-xs leading-6 text-slate-600">
              {notification.details}
            </p>
          </div>

          <Detail
            label="Priority"
            value={isUrgent ? "Urgent" : "Normal"}
          />

          <Detail label="Read status" value="Read" />
        </div>

        <div className="mt-6 flex items-center gap-2">
          {notification.actionUrl && (
            <Link
              to={notification.actionUrl}
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
            >
              <ExternalLink size={13} />
              {notification.actionLabel || "Open Action"}
            </Link>
          )}

          <button
            onClick={onClose}
            className="ml-auto rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Preferences Modal
function PreferencesModal({
  preferences,
  togglePreference,
  onSave,
  isSaving,
  onClose,
}: {
  preferences: NotificationPreferences;
  togglePreference: (key: keyof NotificationPreferences) => void;
  onSave: () => void;
  isSaving?: boolean;
  onClose: () => void;
}) {
  const options: {
    key: keyof NotificationPreferences;
    label: string;
    description: string;
  }[] = [
    {
      key: "urgent",
      label: "Urgent alerts",
      description: "Critical referrals and emergency alerts",
    },
    {
      key: "referrals",
      label: "Assistance referrals",
      description: "New referrals and response updates",
    },
    {
      key: "collaboration",
      label: "Collaboration requests",
      description: "New partner collaboration requests",
    },
    {
      key: "resources",
      label: "Resource sharing",
      description: "Delivery updates and exceptions",
    },
    {
      key: "reporting",
      label: "Reporting deadlines",
      description: "Upcoming reports and reminders",
    },
    {
      key: "team",
      label: "Team activities",
      description: "Team check-ins and field updates",
    },
    {
      key: "email",
      label: "Email notifications",
      description: "Receive notifications through email",
    },
    {
      key: "push",
      label: "Push notifications",
      description: "Receive browser push notifications",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#153e5b]">
              Notification Preferences
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Manage which notifications you want to receive.
            </p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-1">
          {options.map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between gap-3 border-b border-slate-100 py-3"
            >
              <div>
                <p className="text-xs font-medium text-[#153e5b]">
                  {option.label}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {option.description}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={Boolean(preferences[option.key])}
                onClick={() => togglePreference(option.key)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                  preferences[option.key] ? "bg-[#267ba4]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                    preferences[option.key] ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-600"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a] disabled:opacity-50"
          >
            {isSaving && <RefreshCw size={14} className="animate-spin" />}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-medium text-[#153e5b]">{value}</p>
    </div>
  );
}

export default Notifications;
