import React, { useEffect, useState, useCallback } from "react";
import {
  Bell,
  AlertTriangle,
  Sparkles,
  Package,
  House,
  Building2,
  FileText,
  ChevronRight,
  X,
  Search,
  RefreshCw,
  Check,
  Plus,
  SlidersHorizontal,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import {
  notificationService,
  type Notification,
  type NotificationType,
  type NotificationPreferences,
  type NotificationCounts,
  type CreateNotificationPayload,
} from "../../services/notificationService";

const tabs = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Critical", value: "critical" },
  { label: "AI Review", value: "ai" },
  { label: "Resources", value: "resource" },
  { label: "Shelters", value: "shelter" },
  { label: "Partners", value: "partner" },
  { label: "Reports", value: "report" },
];

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  critical: AlertTriangle,
  ai: Sparkles,
  resource: Package,
  shelter: House,
  partner: Building2,
  report: FileText,
};

const colorMap: Record<string, string> = {
  critical: "bg-red-50 text-red-600 border-red-200",
  ai: "bg-purple-50 text-purple-600 border-purple-200",
  resource: "bg-amber-50 text-amber-600 border-amber-200",
  shelter: "bg-emerald-50 text-emerald-600 border-emerald-200",
  partner: "bg-blue-50 text-blue-600 border-blue-200",
  report: "bg-sky-50 text-sky-600 border-sky-200",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({
    all: 0,
    unread: 0,
    critical: 0,
    ai: 0,
    resource: 0,
    shelter: 0,
    partner: 0,
    report: 0,
  });

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 6;

  const [selected, setSelected] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPreferences, setShowPreferences] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    critical: true,
    ai: true,
    resources: true,
    shelter: true,
    partner: true,
    reports: true,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newAlert, setNewAlert] = useState<CreateNotificationPayload>({
    title: "",
    description: "",
    category: "critical",
    reference: "",
    details: "",
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  const showNotificationToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Fetch notifications and counts
  const loadNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [pagedResult, metricsResult] = await Promise.all([
        notificationService.getPaged({
          search,
          category: activeTab,
          page,
          pageSize,
        }),
        notificationService.getMetrics(),
      ]);

      setNotifications(pagedResult.items);
      setTotalPages(pagedResult.totalPages);
      setTotalCount(pagedResult.totalCount);
      setCounts(metricsResult);
    } catch (err) {
      console.error(err);
      setError("Unable to sync notifications with server. Using cached data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, search, page]);

  // Load preferences once on mount
  useEffect(() => {
    notificationService.getPreferences().then((p) => {
      if (p) setPreferences(p);
    });
  }, []);

  // Reload when tab, search, or page changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Mark all read handler
  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, unread: false }))
      );
      setCounts((prev) => ({ ...prev, unread: 0 }));
      showNotificationToast("All notifications marked as read.");
    } catch {
      showNotificationToast("Failed to mark all as read.");
    }
  };

  // Mark single read handler
  const markRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
      );
      setCounts((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));
    } catch {
      // ignore
    }
  };

  // Open notification detail modal
  const openNotification = (item: Notification) => {
    setSelected(item);
    if (item.unread) {
      markRead(item.id);
    }
  };

  // Save Preferences handler
  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      const updated = await notificationService.updatePreferences(preferences);
      setPreferences(updated);
      setShowPreferences(false);
      showNotificationToast("Notification preferences updated.");
    } catch {
      showNotificationToast("Failed to save preferences.");
    } finally {
      setSavingPreferences(false);
    }
  };

  // Create/Dispatch Notification handler
  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.title || !newAlert.description) return;

    setCreateLoading(true);
    try {
      await notificationService.create(newAlert);
      setShowCreateModal(false);
      setNewAlert({
        title: "",
        description: "",
        category: "critical",
        reference: "",
        details: "",
      });
      showNotificationToast("Notification dispatched successfully.");
      loadNotifications(true);
    } catch {
      showNotificationToast("Failed to dispatch alert.");
    } finally {
      setCreateLoading(false);
    }
  };

  // Reset Demo Data
  const handleReset = async () => {
    if (!window.confirm("Reset notifications to default initial dataset?")) return;
    try {
      await notificationService.reset();
      showNotificationToast("Notifications reset to default scenario.");
      loadNotifications(true);
    } catch {
      showNotificationToast("Could not reset notifications.");
    }
  };

  const changeTab = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  const tabCounts: Record<string, number> = {
    all: counts.all,
    unread: counts.unread,
    critical: counts.critical,
    ai: counts.ai,
    resource: counts.resource,
    shelter: counts.shelter,
    partner: counts.partner,
    report: counts.report,
  };

  return (
    <div className="min-h-screen bg-[#edf4f6] px-4 py-6 sm:px-6 lg:px-7">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-[#153f5e] px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <Check size={16} className="text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-[#153f5e]">
              Operational Notifications
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-semibold text-[#153f5e]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#287da5] animate-pulse" />
              Live Connected
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Real-time critical alerts, AI recommendations, logistical warnings, shelter thresholds, and inter-agency dispatch updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh / Sync Button */}
          <button
            onClick={() => loadNotifications(true)}
            disabled={refreshing || loading}
            title="Sync with server"
            className="flex items-center gap-1.5 rounded-lg border border-[#c5d9e3] bg-white px-3 py-2 text-xs font-semibold text-[#175477] hover:bg-sky-50 disabled:opacity-50 transition"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* Dispatch Alert */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition shadow-xs"
          >
            <Plus size={15} />
            <span>Dispatch Alert</span>
          </button>

          {/* Mark all as read */}
          <button
            onClick={markAllRead}
            disabled={counts.unread === 0}
            className="rounded-lg border border-[#c5d9e3] bg-white px-3.5 py-2 text-xs font-semibold text-[#175477] hover:bg-sky-50 disabled:opacity-40 transition"
          >
            Mark all read
          </button>

          {/* Preferences */}
          <button
            onClick={() => setShowPreferences(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#287da5] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#216789] transition shadow-xs"
          >
            <SlidersHorizontal size={14} />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* Error alert with retry */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadNotifications()}
            className="font-semibold text-amber-900 underline hover:no-underline cursor-pointer"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Search and Quick Filters Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-[#d4e2e9] bg-white px-3 py-2 shadow-2xs">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search alerts, reference IDs, or keywords..."
            className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={handleReset}
          title="Reset to default seed alerts"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-2xs"
        >
          Reset Demo
        </button>
      </div>

      {/* Category Tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#d4e2e9] pb-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = tabCounts[tab.value] ?? 0;

          return (
            <button
              key={tab.value}
              onClick={() => changeTab(tab.value)}
              className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-[#287da5] font-semibold text-[#287da5]"
                  : "border-transparent text-slate-600 hover:text-[#287da5]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-[#e4f0f6] text-[#287da5]"
                    : "bg-[#e9eff2] text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications List Container */}
      <div className="overflow-hidden rounded-2xl border border-[#d4e2e9] bg-white shadow-sm">
        {/* Loading state indicator */}
        {loading && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw size={24} className="animate-spin text-[#287da5]" />
            <span className="text-xs font-medium text-slate-500">Loading notifications...</span>
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <div>
            {notifications.map((item) => {
              const Icon = iconMap[item.category] || Bell;

              return (
                <div
                  key={item.id}
                  onClick={() => openNotification(item)}
                  className={`group flex cursor-pointer items-start gap-3.5 border-b border-[#dce7ec] px-4 py-4 transition hover:bg-[#eef6f8] last:border-b-0 ${
                    item.unread ? "bg-[#f3f9f8]" : "bg-white"
                  }`}
                >
                  {/* Category Icon Badge */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                      colorMap[item.category] || "bg-slate-50 text-slate-600"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-xs font-semibold ${item.unread ? "text-[#153f5e]" : "text-slate-700"}`}>
                        {item.title}
                      </h3>
                      {item.reference && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                          {item.reference}
                        </span>
                      )}
                      <span className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[9px] font-medium capitalize text-slate-500">
                        {item.category}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-600 line-clamp-1">
                      {item.description}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {item.time}
                    </p>
                  </div>

                  {/* Unread dot and Chevron */}
                  <div className="flex shrink-0 items-center gap-3 pt-1">
                    {item.unread && (
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-[#287da5] ring-4 ring-sky-100"
                        title="Unread notification"
                      />
                    )}

                    <ChevronRight
                      size={18}
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#153f5e]"
                    />
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {notifications.length === 0 && (
              <div className="flex min-h-[320px] flex-col items-center justify-center p-6 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4f6]">
                  <Bell size={26} className="text-[#287da5]" />
                </div>

                <h3 className="text-sm font-semibold text-[#153f5e]">
                  No notifications found
                </h3>

                <p className="mt-1 text-xs text-slate-400 max-w-xs">
                  {search
                    ? `No notifications matched "${search}". Try clearing search or selecting a different tab.`
                    : "There are currently no notifications in this category."}
                </p>

                {(search || activeTab !== "all") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setActiveTab("all");
                      setPage(1);
                    }}
                    className="mt-3 rounded-lg bg-[#153f5e] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4f73]"
                  >
                    View All Notifications
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dce7ec] bg-slate-50/50 px-4 py-3">
          <p className="text-[11px] text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>
            {" – "}
            <span className="font-semibold text-slate-700">
              {Math.min(page * pageSize, totalCount)}
            </span>{" "}
            of <span className="font-semibold text-slate-700">{totalCount}</span> notifications
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#d4e2e9] bg-white px-3 py-1.5 text-xs font-medium text-[#287da5] hover:bg-sky-50 disabled:opacity-40 transition"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`h-7 min-w-7 rounded-lg border text-xs font-medium transition ${
                  page === number
                    ? "border-[#287da5] bg-[#287da5] text-white"
                    : "border-[#d4e2e9] bg-white text-slate-600 hover:bg-sky-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-[#d4e2e9] bg-white px-3 py-1.5 text-xs font-medium text-[#287da5] hover:bg-sky-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Notification Details Modal */}
      {selected && (
        <Modal title="Notification Details" onClose={() => setSelected(null)}>
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                colorMap[selected.category] || "bg-slate-50 text-slate-600"
              }`}
            >
              {(() => {
                const Icon = iconMap[selected.category] || Bell;
                return <Icon size={22} />;
              })()}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-[#153f5e] leading-snug">
                {selected.title}
              </h3>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {selected.time}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Detail label="Reference ID" value={selected.reference || "N/A"} />
            <Detail label="Category" value={selected.category} />
            <Detail label="Status" value={selected.unread ? "Unread" : "Read"} />

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Operational Details
              </p>
              <p className="text-xs leading-relaxed text-slate-700">
                {selected.details || selected.description}
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            {selected.actionUrl && (
              <a
                href={selected.actionUrl}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#153f5e] py-2.5 text-xs font-semibold text-white hover:bg-[#1d4f73] transition"
              >
                <span>{selected.actionLabel || "View Incident"}</span>
                <ExternalLink size={13} />
              </a>
            )}

            <button
              onClick={() => setSelected(null)}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <Modal
          title="Notification Preferences"
          onClose={() => setShowPreferences(false)}
        >
          <p className="mb-4 text-xs text-slate-500">
            Choose which operational event channels you want to receive active alerts for.
          </p>

          <div className="space-y-2.5">
            {(
              [
                ["critical", "Critical Alerts & SLA Breaches"],
                ["ai", "AI Priority & Triage Recommendations"],
                ["resources", "Resource Stockouts & Dispatch Alerts"],
                ["shelter", "Shelter Capacity Threshold Warnings"],
                ["partner", "Partner Agency Updates & Assignments"],
                ["reports", "Situation Reports & Authorisation Notices"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-[#e0e9ed] p-3 hover:bg-[#f5f9fa] transition"
              >
                <span className="text-xs font-medium text-[#153f5e]">
                  {label}
                </span>

                <input
                  type="checkbox"
                  checked={preferences[key]}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[#287da5] rounded"
                />
              </label>
            ))}
          </div>

          <button
            onClick={handleSavePreferences}
            disabled={savingPreferences}
            className="mt-5 w-full rounded-lg bg-[#287da5] py-2.5 text-xs font-semibold text-white hover:bg-[#216789] transition disabled:opacity-50"
          >
            {savingPreferences ? "Saving Preferences..." : "Save Preferences"}
          </button>
        </Modal>
      )}

      {/* Dispatch Alert Modal */}
      {showCreateModal && (
        <Modal
          title="Dispatch Operational Alert"
          onClose={() => setShowCreateModal(false)}
        >
          <p className="mb-3 text-xs text-slate-500">
            Publish a critical notification to the unified emergency operations feed.
          </p>

          <form onSubmit={handleCreateNotification} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Alert Title
              </label>
              <input
                required
                value={newAlert.title}
                onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                placeholder="e.g. Flash Flood Evacuation Notice"
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newAlert.category}
                  onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value as NotificationType })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
                >
                  <option value="critical">Critical</option>
                  <option value="ai">AI</option>
                  <option value="resource">Resource</option>
                  <option value="shelter">Shelter</option>
                  <option value="partner">Partner</option>
                  <option value="report">Report</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Reference ID
                </label>
                <input
                  value={newAlert.reference}
                  onChange={(e) => setNewAlert({ ...newAlert, reference: e.target.value })}
                  placeholder="e.g. REQ-2850"
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Brief Description
              </label>
              <input
                required
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                placeholder="Brief single-line operational summary"
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Full Details & Action Required
              </label>
              <textarea
                rows={3}
                value={newAlert.details}
                onChange={(e) => setNewAlert({ ...newAlert, details: e.target.value })}
                placeholder="Provide complete situational context and required action for duty coordinators."
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {createLoading ? "Dispatching..." : "Dispatch Alert"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// Reusable Modal Component
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl animate-in zoom-in-95">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#153f5e]">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Reusable Detail Row Component
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 pb-2.5">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-right text-xs font-semibold capitalize text-[#153f5e]">
        {value}
      </span>
    </div>
  );
}
