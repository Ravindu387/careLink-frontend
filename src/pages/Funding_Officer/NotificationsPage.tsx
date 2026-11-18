import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Bell,
  ChevronRight,
  AlertTriangle,
  Clock,
  Check,
  FileText,
  Megaphone,
  ShieldCheck,
  X,
  Settings,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { notificationService } from "../../services/notificationService";
import type {
  NotificationItem,
  NotificationSummary,
  NotificationPreference,
  NotificationQueryParams,
} from "../../types/notification";

type TabName = "All" | "Unread" | "Flags" | "Verification" | "Campaigns";

const ROLE = "FundingOfficer";
const ROWS_PER_PAGE = 6;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabName>("All");
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const [preferences, setPreferences] = useState<NotificationPreference>({
    role: ROLE,
    inApp: true,
    email: true,
    sms: false,
    critical: true,
    verification: true,
    campaigns: true,
    reports: true,
  });

  const [summary, setSummary] = useState<NotificationSummary>({
    unreadCount: 0,
    criticalCount: 0,
    requestCount: 0,
    inventoryCount: 0,
    systemCount: 0,
    flagsCount: 0,
    verificationCount: 0,
    campaignsCount: 0,
    allocationCount: 0,
    expenditureCount: 0,
    reportsCount: 0,
    totalCount: 0,
  });

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };

  // Fetch summary counts for tabs
  const fetchSummary = useCallback(async () => {
    try {
      const data = await notificationService.getSummary(ROLE);
      setSummary(data);
    } catch (err) {
      console.error("Failed to load notifications summary:", err);
    }
  }, []);

  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    try {
      const prefs = await notificationService.getPreferences(ROLE);
      setPreferences(prefs);
    } catch (err) {
      console.error("Failed to load preferences:", err);
    }
  }, []);

  // Fetch paginated notification list
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: NotificationQueryParams = {
        role: ROLE,
        page,
        pageSize: ROWS_PER_PAGE,
      };

      if (activeTab === "Unread") {
        params.unread = true;
      } else if (activeTab !== "All") {
        params.type = activeTab;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await notificationService.getNotifications(params);
      setNotifications(res.items);
      setTotalCount(res.totalCount);
    } catch (err: unknown) {
      console.error("Failed to load notifications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    fetchSummary();
    fetchPreferences();
  }, [fetchSummary, fetchPreferences]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ROWS_PER_PAGE));

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(ROLE);
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, unread: false }))
      );
      notify("All notifications marked as read.");
      fetchSummary();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      notify("Failed to mark all as read.");
    }
  };

  const openNotification = async (notification: NotificationItem) => {
    setSelectedNotification(notification);

    if (notification.unread) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, unread: false } : item
          )
        );
        fetchSummary();
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const saved = await notificationService.savePreferences(preferences, ROLE);
      setPreferences(saved);
      setShowPreferences(false);
      notify("Notification preferences saved successfully.");
    } catch (err) {
      console.error("Failed to save preferences:", err);
      notify("Failed to save preferences. Please try again.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const tabs: { label: TabName; count?: number }[] = [
    { label: "All", count: summary.totalCount },
    { label: "Unread", count: summary.unreadCount },
    { label: "Flags", count: summary.flagsCount },
    { label: "Verification", count: summary.verificationCount },
    { label: "Campaigns", count: summary.campaignsCount },
  ];

  const getIconConfig = (iconKey?: string) => {
    switch (iconKey?.toLowerCase()) {
      case "alert":
      case "warning":
        return { icon: AlertTriangle, style: "bg-[#fdebed] text-[#dc2626]" };
      case "clock":
      case "time":
        return { icon: Clock, style: "bg-[#fff3dd] text-[#d28b18]" };
      case "check":
      case "success":
        return { icon: Check, style: "bg-[#e5f6f0] text-[#159b79]" };
      case "file":
      case "document":
        return { icon: FileText, style: "bg-[#e8f1f6] text-[#23749e]" };
      case "campaign":
      case "megaphone":
        return { icon: Megaphone, style: "bg-[#e5f6f0] text-[#159b79]" };
      case "shield":
      case "security":
        return { icon: ShieldCheck, style: "bg-[#e8f1f6] text-[#23749e]" };
      default:
        return { icon: Bell, style: "bg-[#e8f1f6] text-[#23749e]" };
    }
  };

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60]">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 py-5">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[11px] mb-6">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={13} />
          <span className="text-slate-500">Funding & Donations</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-[#123e60]">Notifications</span>
        </div>

        {/* PAGE TITLE & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[28px] font-medium tracking-tight">Notifications</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Review funding alerts, verification updates, approvals, and reporting deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-[40px] pl-9 pr-4 text-[12px] bg-white border border-[#b9cfda] rounded-xl outline-none focus:border-[#287ba5] w-[200px] sm:w-[240px] shadow-2xs"
              />
            </div>

            <button
              onClick={markAllAsRead}
              className="h-[40px] px-4 bg-white border border-[#b9cfda] rounded-xl text-[12px] font-medium hover:bg-[#f5fafc] transition-colors shadow-2xs cursor-pointer"
            >
              Mark all as read
            </button>

            <button
              onClick={() => setShowPreferences(true)}
              className="h-[40px] px-4 bg-[#287ba5] hover:bg-[#1e6388] text-white rounded-xl text-[12px] font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Settings size={15} />
              Preferences
            </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-[13px]">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchNotifications}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* TABS */}
        <div className="flex items-center gap-6 border-b border-[#d5e3e9] mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.label);
                setPage(1);
              }}
              className={`h-[42px] flex items-center gap-2 text-[12px] whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.label
                  ? "border-[#23749e] text-[#23749e] font-semibold"
                  : "border-transparent text-slate-500 hover:text-[#23749e]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    activeTab === tab.label
                      ? "bg-[#23749e] text-white"
                      : "bg-[#e8f1f6] text-[#23749e]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* NOTIFICATION LIST */}
        <section className="bg-white border border-[#d5e3e9] rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 size={32} className="animate-spin text-[#287ba5]" />
              <p className="text-[13px]">Loading notifications...</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => {
                const config = getIconConfig(notification.icon);
                const IconComponent = config.icon;
                const iconStyle = config.style;

                return (
                  <button
                    key={notification.id}
                    onClick={() => openNotification(notification)}
                    className={`w-full min-h-[76px] px-5 py-4 border-b border-[#d5e3e9] flex items-center gap-4 text-left hover:bg-[#f1f8f7] transition-colors cursor-pointer ${
                      notification.unread ? "bg-[#f4faf8]" : "bg-white"
                    }`}
                  >
                    {/* ICON */}
                    <div
                      className={`w-[40px] h-[40px] rounded-xl flex items-center justify-center shrink-0 ${iconStyle}`}
                    >
                      <IconComponent size={20} />
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <p className="text-[13px] font-semibold text-[#123e60]">
                          {notification.title}
                        </p>
                        {notification.reference && (
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {notification.reference}
                          </span>
                        )}
                      </div>

                      <p className="text-[12px] text-slate-500 mt-1 truncate">
                        {notification.description}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-1">
                        {notification.time}
                      </p>
                    </div>

                    {/* UNREAD DOT */}
                    {notification.unread && (
                      <span className="w-[8px] h-[8px] rounded-full bg-[#237ba7] shrink-0" />
                    )}

                    <ChevronRight size={18} className="text-slate-400 shrink-0" />
                  </button>
                );
              })}

              {/* EMPTY STATE */}
              {notifications.length === 0 && (
                <div className="py-20 text-center">
                  <Bell size={36} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-[14px] font-semibold text-slate-700">
                    No notifications found
                  </p>
                  <p className="text-[12px] text-slate-400 mt-1">
                    There are no notifications matching your selection.
                  </p>
                </div>
              )}

              {/* PAGINATION */}
              <div className="px-5 py-3.5 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#d5e3e9]">
                <p className="text-[12px] text-slate-500">
                  Showing{" "}
                  {totalCount === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–
                  {Math.min(page * ROWS_PER_PAGE, totalCount)} of {totalCount}
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-[32px] px-3 border border-[#d5e3e9] bg-white rounded-lg text-[11px] font-medium disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => setPage(number)}
                        className={`w-[32px] h-[32px] rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                          page === number
                            ? "bg-[#287ba5] text-white border-[#287ba5]"
                            : "bg-white border-[#d5e3e9] text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {number}
                      </button>
                    )
                  )}

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-[32px] px-3 border border-[#d5e3e9] bg-white rounded-lg text-[11px] font-medium disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* NOTIFICATION DETAILS MODAL */}
      {selectedNotification && (
        <Modal onClose={() => setSelectedNotification(null)}>
          <div className="w-11 h-11 rounded-xl bg-[#e8f1f6] flex items-center justify-center mb-4 text-[#23749e]">
            <Bell size={22} />
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-[#23749e] uppercase tracking-wider">
              {selectedNotification.category || selectedNotification.type}
            </span>
            {selectedNotification.reference && (
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {selectedNotification.reference}
              </span>
            )}
          </div>

          <h2 className="text-[18px] font-semibold leading-snug">
            {selectedNotification.title}
          </h2>

          <p className="text-[11px] text-slate-400 mt-2">
            {selectedNotification.time}
          </p>

          <div className="bg-[#f5f9fa] rounded-xl p-4 mt-5 border border-[#e4edf1]">
            <p className="text-[11px] font-semibold mb-2 text-slate-700">
              Notification details
            </p>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              {selectedNotification.details || selectedNotification.description}
            </p>
          </div>

          <div className="mt-4 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">
              Reference: {selectedNotification.reference || "N/A"}
            </span>

            <span className="text-[#078c70] flex items-center gap-1 font-medium">
              <CheckCircle2 size={14} />
              Marked as read
            </span>
          </div>

          <button
            onClick={() => setSelectedNotification(null)}
            className="w-full mt-6 h-11 bg-[#287ba5] hover:bg-[#1e6489] text-white rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </Modal>
      )}

      {/* PREFERENCES MODAL */}
      {showPreferences && (
        <Modal onClose={() => setShowPreferences(false)}>
          <div className="w-11 h-11 rounded-xl bg-[#e8f1f6] flex items-center justify-center mb-4 text-[#23749e]">
            <Settings size={22} />
          </div>

          <h2 className="text-[18px] font-semibold">Notification preferences</h2>

          <p className="text-[11px] text-slate-400 mt-1 mb-5">
            Manage how you receive funding and donation updates.
          </p>

          <div className="space-y-5">
            <PreferenceSection title="Delivery channels">
              <PreferenceToggle
                label="In-app notifications"
                description="Receive alerts inside CareLink workspace."
                checked={preferences.inApp}
                onChange={(value) =>
                  setPreferences((p) => ({ ...p, inApp: value }))
                }
              />

              <PreferenceToggle
                label="Email notifications"
                description="Receive updates through registered email."
                checked={preferences.email}
                onChange={(value) =>
                  setPreferences((p) => ({ ...p, email: value }))
                }
              />

              <PreferenceToggle
                label="SMS notifications"
                description="Receive important updates through text message."
                checked={preferences.sms}
                onChange={(value) =>
                  setPreferences((p) => ({ ...p, sms: value }))
                }
              />
            </PreferenceSection>

            <div className="border-t border-[#e5edf1]" />

            <PreferenceSection title="Notification categories">
              <PreferenceToggle
                label="Critical flags"
                description="Suspicious donations and transactions."
                checked={preferences.critical}
                onChange={(value) =>
                  setPreferences((p) => ({ ...p, critical: value }))
                }
              />

              <PreferenceToggle
                label="Verification updates"
                description="Donor and contribution verification."
                checked={preferences.verification ?? true}
                onChange={(value) =>
                  setPreferences((p) => ({ ...p, verification: value }))
                }
              />

              <PreferenceToggle
                label="Campaign updates"
                description="Campaign progress and deadlines."
                checked={preferences.campaigns ?? true}
                onChange={(value) =>
                  setPreferences((p) => ({ ...p, campaigns: value }))
                }
              />

              <PreferenceToggle
                label="Reports and approvals"
                description="Transparency reports and allocations."
                checked={preferences.reports ?? true}
                onChange={(value) =>
                  setPreferences((p) => ({ ...p, reports: value }))
                }
              />
            </PreferenceSection>
          </div>

          <button
            onClick={handleSavePreferences}
            disabled={savingPrefs}
            className="w-full mt-6 h-11 bg-[#287ba5] hover:bg-[#1e6489] disabled:opacity-50 text-white rounded-xl text-[12px] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {savingPrefs ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save preferences"
            )}
          </button>
        </Modal>
      )}

      {/* FLOATING TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#143d5c] text-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 text-[12px] animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-[#57d6ad]" />
          <span>{toast}</span>
          <button
            onClick={() => setToast("")}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================
// MODAL COMPONENT
// =====================================

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] bg-[#102d42]/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100"
        >
          <X size={18} />
        </button>

        {children}
      </div>
    </div>
  );
}

// =====================================
// PREFERENCE SECTION
// =====================================

function PreferenceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[12px] font-semibold mb-3 text-slate-700">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// =====================================
// PREFERENCE TOGGLE
// =====================================

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[12px] font-medium text-slate-800">{label}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
          checked ? "bg-[#287ba5]" : "bg-slate-300"
        }`}
      >
        <span
          className={`block w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
