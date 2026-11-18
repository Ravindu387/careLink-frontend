import { useCallback, useEffect, useState } from "react";
import {
  Search,
  ChevronRight,
  Check,
  CheckCheck,
  AlertTriangle,
  Package,
  HeartPulse,
  Wrench,
  Users,
  ClipboardList,
  X,
  Mail,
  Smartphone,
  CheckCircle2,
  Inbox,
  RefreshCw,
  Loader2,
  Bell,
} from "lucide-react";
import { notificationService } from "../../services/notificationService";
import type {
  NotificationItem,
  NotificationSummary,
  NotificationPreference,
  NotificationType,
} from "../../types/notification";

const tabs: NotificationType[] = [
  "All",
  "Unread",
  "Critical",
  "Requests",
  "Inventory",
  "System",
];

export default function ShelterNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [activeTab, setActiveTab] = useState<NotificationType>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<NotificationItem | null>(null);

  const [showPreferences, setShowPreferences] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const [summary, setSummary] = useState<NotificationSummary>({
    unreadCount: 0,
    criticalCount: 0,
    requestCount: 0,
    inventoryCount: 0,
    systemCount: 0,
    totalCount: 0,
  });

  const [preferences, setPreferences] = useState<NotificationPreference>({
    role: "ShelterAdmin",
    inApp: true,
    email: true,
    sms: false,
    critical: true,
    requests: true,
    inventory: true,
    system: false,
  });

  /* ================= FETCH DATA ================= */

  const fetchSummary = useCallback(async () => {
    try {
      const summaryData = await notificationService.getSummary("ShelterAdmin");
      setSummary(summaryData);
    } catch (err) {
      console.error("Failed to load notification summary:", err);
    }
  }, []);

  const fetchPreferences = useCallback(async () => {
    try {
      const prefs = await notificationService.getPreferences("ShelterAdmin");
      setPreferences(prefs);
    } catch (err) {
      console.error("Failed to load preferences:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const isUnreadOnly = activeTab === "Unread";
      const typeFilter =
        activeTab !== "All" && activeTab !== "Unread" ? activeTab : undefined;

      const result = await notificationService.getNotifications({
        role: "ShelterAdmin",
        type: typeFilter,
        unread: isUnreadOnly ? true : undefined,
        search: search.trim() || undefined,
        page: currentPage,
        pageSize,
      });

      setNotifications(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(Math.max(1, result.totalPages));
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to load notifications. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, search, currentPage, pageSize]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    fetchNotifications();
    fetchSummary();
  }, [fetchNotifications, fetchSummary]);

  // Auto-dismiss toast message
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [message]);

  /* ================= TAB & ACTIONS ================= */

  const changeTab = (tab: NotificationType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const markAllAsRead = async () => {
    try {
      const res = await notificationService.markAllAsRead("ShelterAdmin");
      setMessage(res.message || "All notifications marked as read.");

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, unread: false }))
      );

      await fetchSummary();
      await fetchNotifications();
    } catch (err: any) {
      alert(err?.message || "Failed to mark all as read.");
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
      setSummary((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const openNotification = async (item: NotificationItem) => {
    if (item.unread) {
      await markAsRead(item.id);
    }
    setSelected({ ...item, unread: false });
  };

  const savePreferences = async () => {
    setIsSavingPrefs(true);
    try {
      const saved = await notificationService.savePreferences(
        preferences,
        "ShelterAdmin"
      );
      setPreferences(saved);
      setShowPreferences(false);
      setMessage("Notification preferences saved successfully.");
    } catch (err: any) {
      alert(err?.message || "Failed to save preferences.");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const getTabCount = (tab: NotificationType) => {
    if (tab === "All") return summary.totalCount;
    if (tab === "Unread") return summary.unreadCount;
    if (tab === "Critical") return summary.criticalCount;
    if (tab === "Requests") return summary.requestCount;
    if (tab === "Inventory") return summary.inventoryCount;
    if (tab === "System") return summary.systemCount;
    return 0;
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-4 pb-8">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[8px] mb-6">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="text-slate-400">Shelter Administration</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="font-semibold">Notifications</span>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => {
                fetchNotifications();
                fetchSummary();
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-800 underline flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-[21px] font-normal">Notifications</h1>
            <p className="text-[9px] text-slate-500 mt-1.5">
              Review operational alerts, assignments, and system updates.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                fetchNotifications();
                fetchSummary();
              }}
              title="Refresh notifications"
              disabled={isLoading}
              className="h-[31px] px-2.5 bg-white border border-[#aac4d2] text-[#1c638a] rounded-md text-[9px] font-semibold hover:bg-slate-50 flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={markAllAsRead}
              className="h-[31px] px-3 bg-white border border-[#aac4d2] rounded-md text-[9px] font-semibold hover:bg-slate-50"
            >
              <CheckCheck size={12} className="inline mr-1 text-[#287da7]" />
              Mark all as read
            </button>

            <button
              onClick={() => setShowPreferences(true)}
              className="h-[31px] px-3 bg-[#1c638a] text-white rounded-md text-[9px] font-semibold hover:bg-[#144665]"
            >
              Preferences
            </button>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-4 border-b border-[#d5e3e9] mb-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => changeTab(tab)}
              className={`relative py-3 text-[8px] whitespace-nowrap transition ${
                activeTab === tab
                  ? "text-[#1c638a] font-bold"
                  : "text-slate-500 hover:text-[#1c638a]"
              }`}
            >
              {tab}

              <span className="ml-1 bg-[#e6eff4] text-slate-500 rounded-full px-1.5 py-0.5 text-[7px]">
                {getTabCount(tab)}
              </span>

              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1c638a] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* SEARCH FILTER */}
        <div className="relative mb-3">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search notifications..."
            className="w-full h-9 bg-white border border-[#d5e3e9] rounded-lg pl-9 pr-3 text-[9px] outline-none focus:border-[#45b99b]"
          />
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3.5fr)_minmax(230px,0.9fr)] gap-3">
          {/* NOTIFICATION LIST */}
          <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">
            {isLoading && notifications.length === 0 ? (
              <div className="py-16 text-center">
                <Loader2 size={24} className="mx-auto animate-spin text-[#1c638a]" />
                <p className="text-xs font-semibold mt-3">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div>
                {notifications.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onClick={() => openNotification(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Inbox size={30} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold mt-3">No notifications found</p>
                <p className="text-[9px] text-slate-400 mt-1">
                  Try selecting another category or clear the search term.
                </p>
              </div>
            )}

            {/* PAGINATION */}
            <div className="px-3 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[8px] text-slate-400">
                Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                {"–"}
                {Math.min(currentPage * pageSize, totalCount)}
                {" of "}
                {totalCount}
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1 || isLoading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-7 px-3 border border-slate-200 rounded-md text-[8px] disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-md border text-[8px] ${
                      currentPage === page
                        ? "bg-[#1c638a] text-white border-[#1c638a]"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages || isLoading}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-7 px-3 border border-slate-200 rounded-md text-[8px] disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm p-3 h-fit">
            <h2 className="text-[10px] font-semibold mb-4">Notification summary</h2>

            <SummaryRow label="Unread" value={summary.unreadCount} />
            <SummaryRow
              label="Critical"
              value={summary.criticalCount}
              color="red"
            />
            <SummaryRow label="Requests" value={summary.requestCount} />
            <SummaryRow label="Inventory" value={summary.inventoryCount} />
            <SummaryRow label="System" value={summary.systemCount} />

            {/* DELIVERY STATUS */}
            <div className="border-t border-slate-100 mt-3 pt-3">
              <h2 className="text-[10px] font-semibold mb-3">Delivery status</h2>

              <DeliveryRow
                status="In-app notifications operational"
                type="success"
              />
              <DeliveryRow
                status="Email delivery operational"
                type="success"
              />
              <DeliveryRow
                status="SMS provider degraded"
                type="warning"
              />
            </div>
          </aside>
        </div>
      </main>

      {/* NOTIFICATION DETAILS MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/30 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Notification details</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-8">
              <NotificationIcon item={selected} />

              <span className="inline-block mt-4 text-[8px] font-semibold text-[#287da7] bg-[#eaf3f8] rounded px-2 py-1">
                {selected.type}
              </span>

              <h3 className="text-base font-semibold mt-3">{selected.title}</h3>

              <p className="text-[9px] text-slate-400 mt-2">
                {selected.time} · Notification ID #{selected.id}
              </p>
            </div>

            <div className="bg-[#f5f9fa] rounded-lg p-4 mt-7">
              <p className="text-[10px] font-semibold mb-2">Description</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selected.description}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold mb-2">Additional information</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selected.details || "No additional information provided."}
              </p>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-5">
              <button
                onClick={() => setSelected(null)}
                className="w-full h-10 bg-[#1c638a] text-white rounded-lg text-xs font-semibold hover:bg-[#144665]"
              >
                Close notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREFERENCES MODAL */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold">
                  Notification preferences
                </h2>
                <p className="text-[9px] text-slate-400 mt-1">
                  Manage how you receive operational alerts.
                </p>
              </div>

              <button
                onClick={() => setShowPreferences(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <h3 className="text-xs font-semibold mb-3">Delivery channels</h3>

            <PreferenceRow
              icon={<Bell size={15} />}
              label="In-app notifications"
              checked={preferences.inApp}
              onChange={(v) =>
                setPreferences((prev) => ({ ...prev, inApp: v }))
              }
            />

            <PreferenceRow
              icon={<Mail size={15} />}
              label="Email notifications"
              checked={preferences.email}
              onChange={(v) =>
                setPreferences((prev) => ({ ...prev, email: v }))
              }
            />

            <PreferenceRow
              icon={<Smartphone size={15} />}
              label="SMS notifications"
              checked={preferences.sms}
              onChange={(v) =>
                setPreferences((prev) => ({ ...prev, sms: v }))
              }
            />

            <div className="border-t border-slate-200 my-5" />

            <h3 className="text-xs font-semibold mb-3">Notification categories</h3>

            {[
              ["Critical alerts", "critical"],
              ["Accommodation requests", "requests"],
              ["Inventory alerts", "inventory"],
              ["System updates", "system"],
            ].map(([label, key]) => (
              <PreferenceRow
                key={key}
                label={label}
                checked={preferences[key as keyof NotificationPreference] as boolean}
                onChange={(v) =>
                  setPreferences((prev) => ({
                    ...prev,
                    [key]: v,
                  }))
                }
              />
            ))}

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                disabled={isSavingPrefs}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={savePreferences}
                disabled={isSavingPrefs}
                className="flex-1 h-10 bg-[#1c638a] text-white rounded-lg text-xs font-semibold hover:bg-[#144665] flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSavingPrefs && <Loader2 size={13} className="animate-spin" />}
                <span>{isSavingPrefs ? "Saving..." : "Save preferences"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}
      {message && (
        <div className="fixed bottom-5 right-5 z-[70] bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle2 size={16} className="text-[#35b48e] shrink-0" />
          <p className="text-xs">{message}</p>
          <button
            onClick={() => setMessage("")}
            className="text-white/80 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= NOTIFICATION ROW ================= */

function NotificationRow({
  item,
  onClick,
}: {
  item: NotificationItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full min-h-[76px] px-3 py-3 flex items-center gap-2.5 text-left border-b border-[#d5e3e9] hover:bg-[#f5f9fa] transition ${
        item.unread ? "bg-[#f4faf9]" : "bg-white"
      }`}
    >
      <NotificationIcon item={item} />

      <div className="flex-1 min-w-0">
        <p className="text-[8px] font-bold text-[#123e60] truncate">
          {item.title}
        </p>
        <p className="text-[8px] text-slate-500 mt-1.5 truncate">
          {item.description}
        </p>
        <p className="text-[7px] text-slate-400 mt-2">{item.time}</p>
      </div>

      {item.unread && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#1c638a] shrink-0" />
      )}

      <ChevronRight size={13} className="text-[#123e60] shrink-0" />
    </button>
  );
}

/* ================= NOTIFICATION ICON ================= */

function NotificationIcon({ item }: { item: NotificationItem }) {
  const config: Record<string, { icon: React.ReactNode; style: string }> = {
    request: {
      icon: <ClipboardList size={15} />,
      style: "bg-[#fdebed] text-[#ed5260]",
    },
    warning: {
      icon: <AlertTriangle size={16} />,
      style: "bg-[#fff4df] text-[#d18a18]",
    },
    inventory: {
      icon: <Package size={15} />,
      style: "bg-[#fff4df] text-[#d18a18]",
    },
    medical: {
      icon: <HeartPulse size={16} />,
      style: "bg-[#eaf3f8] text-[#287da7]",
    },
    maintenance: {
      icon: <Wrench size={15} />,
      style: "bg-[#e5f8f1] text-[#35b48e]",
    },
    resident: {
      icon: <Users size={16} />,
      style: "bg-[#e5f8f1] text-[#35b48e]",
    },
  };

  const itemConfig = config[item.icon] || config.resident;

  return (
    <div
      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${itemConfig.style}`}
    >
      {itemConfig.icon}
    </div>
  );
}

/* ================= SUMMARY ROW ================= */

function SummaryRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[8px] text-slate-500">{label}</span>
      <span
        className={`text-[10px] font-bold ${
          color === "red" ? "text-[#e34b59]" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ================= DELIVERY STATUS ================= */

function DeliveryRow({
  status,
  type,
}: {
  status: string;
  type: "success" | "warning";
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      {type === "success" ? (
        <Check size={13} className="text-[#20b58b] shrink-0" />
      ) : (
        <AlertTriangle size={13} className="text-amber-500 shrink-0" />
      )}

      <span
        className={`text-[8px] ${
          type === "warning" ? "text-[#123e60]" : "text-slate-600"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

/* ================= PREFERENCE ROW ================= */

function PreferenceRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[#287da7]">{icon}</span>}
        <span className="text-[10px] text-slate-600">{label}</span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full relative transition ${
          checked ? "bg-[#35b48e]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
