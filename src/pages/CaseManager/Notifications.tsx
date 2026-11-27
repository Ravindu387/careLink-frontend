import React, { useState, useEffect, useCallback, useMemo } from "react";

import {
  Bell,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Copy,
  MessageSquareText,
  ArrowUpToLine,
  Sparkles,
  Check,
  CheckCircle2,
  X,
  Settings,
  Mail,
  Smartphone,
  Monitor,
  RefreshCw,
  Server,
  Trash2,
  Search,
} from "lucide-react";

import { notificationsService } from "../../services/notificationsService";
import type {
  NotificationItem,
  NotificationSummaryDto,
  NotificationPreferencesDto,
  NotificationQueryDto,
} from "../../types/notifications";

const Notifications: React.FC = () => {
  // State
  const [summary, setSummary] = useState<NotificationSummaryDto | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals & Selection
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Preferences State
  const [preferences, setPreferences] = useState<NotificationPreferencesDto>({
    inAppEnabled: true,
    emailEnabled: true,
    pushEnabled: true,
    criticalEnabled: true,
    assignmentEnabled: true,
    evidenceEnabled: true,
  });
  const [isSavingPrefs, setIsSavingPrefs] = useState<boolean>(false);

  const itemsPerPage = 6;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Load Notifications & Summary
  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const query: NotificationQueryDto = {
          tab: activeTab !== "All" ? activeTab : undefined,
          search: searchTerm.trim() || undefined,
          pageNumber: currentPage,
          pageSize: itemsPerPage,
        };

        const [summaryRes, notifRes] = await Promise.all([
          notificationsService.getSummary(),
          notificationsService.getNotifications(query),
        ]);

        setSummary(summaryRes.data);
        setNotifications(notifRes.data.items);
        setTotalCount(notifRes.data.totalCount);
        setTotalPages(notifRes.data.totalPages);
        setIsLiveBackend(summaryRes.isLiveBackend || notifRes.isLiveBackend);
      } catch (err) {
        console.error("Failed to load notifications", err);
        showToast("Error connecting to notification service; demo mode active.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeTab, searchTerm, currentPage, itemsPerPage]
  );

  // Initial Load & Refresh
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load Preferences on open
  const openPreferencesModal = async () => {
    setShowPreferences(true);
    try {
      const res = await notificationsService.getPreferences();
      setPreferences(res.data);
    } catch (err) {
      console.error("Failed to load preferences", err);
    }
  };

  // Save Preferences
  const handleSavePreferences = async () => {
    try {
      setIsSavingPrefs(true);
      const res = await notificationsService.updatePreferences(preferences);
      showToast(res.message);
      setShowPreferences(false);
    } catch (err) {
      console.error("Failed to save preferences", err);
      showToast("Error updating preferences.");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Mark single as read
  const markAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      if (summary) {
        setSummary({
          ...summary,
          unreadCount: Math.max(0, summary.unreadCount - 1),
        });
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await notificationsService.markAllAsRead();
      showToast(res.message);
      loadData(true);
    } catch (err) {
      console.error("Failed to mark all as read", err);
      showToast("Failed to mark all as read.");
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await notificationsService.deleteNotification(id);
      showToast(res.message);
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
      loadData(true);
    } catch (err) {
      console.error("Failed to delete notification", err);
      showToast("Failed to delete notification.");
    }
  };

  // Open notification details
  const openNotification = (item: NotificationItem) => {
    setSelectedNotification(item);
    if (!item.read) {
      markAsRead(item.id);
    }
  };

  // Icon generator
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "Critical":
        return <AlertTriangle size={20} />;
      case "Assignment":
        return <Monitor size={20} />;
      case "Duplicate":
        return <Copy size={20} />;
      case "Evidence":
        return <MessageSquareText size={20} />;
      case "Escalation":
        return <ArrowUpToLine size={20} />;
      case "AI":
        return <Sparkles size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const getIconStyle = (type: string) => {
    switch (type) {
      case "Critical":
        return "bg-red-50 text-red-600";
      case "Assignment":
        return "bg-sky-100 text-[#287da8]";
      case "Duplicate":
        return "bg-purple-100 text-purple-700";
      case "Evidence":
        return "bg-emerald-100 text-emerald-700";
      case "Escalation":
        return "bg-amber-100 text-amber-700";
      case "AI":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // Tabs configuration
  const tabs = useMemo(
    () => [
      { name: "All", count: summary?.totalCount ?? totalCount },
      { name: "Unread", count: summary?.unreadCount ?? 0 },
      { name: "Critical", count: summary?.criticalCount ?? 0 },
      { name: "Assignments", count: summary?.assignmentCount ?? 0 },
      { name: "Evidence", count: summary?.evidenceCount ?? 0 },
    ],
    [summary, totalCount]
  );

  return (
    <div className="min-h-screen bg-[#eff6f8] text-slate-800">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-sky-200 bg-white px-5 py-4 shadow-xl">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span className="text-sm font-medium text-slate-700">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-slate-400 hover:text-slate-600">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-8">
        {/* Breadcrumb & Live Sync Pill */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Operations</span>
            <ChevronRight size={13} />
            <span>Case Management</span>
            <ChevronRight size={13} />
            <span className="font-semibold text-slate-800">Notifications</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isLiveBackend
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <Server size={12} className={isLiveBackend ? "text-emerald-600" : "text-amber-600"} />
              {isLiveBackend ? "Backend Live (Port 5277)" : "Demo Mode (Offline)"}
            </span>

            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-[#b9d0df] bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 disabled:opacity-50"
              title="Refresh notifications"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#287da8]" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">Notifications</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review case assignments, escalations, evidence updates, and SLA alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="rounded-lg border border-[#b9d0df] bg-white px-4 py-2.5 text-sm font-medium text-[#287da8] shadow-sm transition hover:bg-sky-50"
            >
              Mark all as read
            </button>

            <button
              onClick={openPreferencesModal}
              className="flex items-center gap-2 rounded-lg bg-[#287da8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#17678f]"
            >
              <Settings size={15} />
              Preferences
            </button>
          </div>
        </div>

        {/* Search Bar & Tabs */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#d5e2eb]">
          <div className="flex flex-wrap items-center gap-7">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setCurrentPage(1);
                }}
                className={`relative flex items-center gap-1.5 py-4 text-sm transition ${
                  activeTab === tab.name
                    ? "font-semibold text-[#287da8]"
                    : "text-slate-500 hover:text-sky-700"
                }`}
              >
                {tab.name}
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      activeTab === tab.name
                        ? "bg-sky-100 text-[#287da8]"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.name && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#287da8]" />
                )}
              </button>
            ))}
          </div>

          <div className="relative mb-2 flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-[#d2e0e9] bg-white py-1.5 pl-8 pr-7 text-sm sm:text-[15px] outline-none focus:border-sky-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Notification Content Grid */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2.5fr)_minmax(280px,0.95fr)]">
          {/* Left Notification List */}
          <section className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.05)]">
            <div className="divide-y divide-[#d5e2eb]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-sm text-slate-400">
                  <RefreshCw size={24} className="mb-2 animate-spin text-[#287da8]" />
                  <span>Loading notifications...</span>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openNotification(item)}
                    className={`group flex cursor-pointer items-center gap-3.5 px-4 py-4 transition hover:bg-[#edf7f8] sm:px-5 ${
                      !item.read ? "bg-[#f4faf8]" : "bg-white"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${getIconStyle(
                        item.type
                      )}`}
                    >
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-[#173e5b]">{item.title}</p>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                          {item.caseId}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">{item.description}</p>
                      <p className="mt-1 text-[13px] text-slate-400">{item.time}</p>
                    </div>

                    {/* Actions & Status */}
                    <div className="flex items-center gap-2">
                      {!item.read && (
                        <span
                          title="Unread alert"
                          className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#287da8]"
                        />
                      )}

                      <button
                        title="Delete notification"
                        onClick={(e) => handleDeleteNotification(item.id, e)}
                        className="rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      >
                        <Trash2 size={15} />
                      </button>

                      <ChevronRight size={18} className="shrink-0 text-slate-400" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center">
                  <Bell size={35} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">No notifications found</p>
                  <p className="mt-1 text-xs text-slate-400">You are all caught up!</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d5e2eb] px-4 py-3.5 sm:px-5">
              <p className="text-xs text-slate-500">
                Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} –{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} notification(s)
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="flex items-center gap-1 rounded-lg border border-[#d5e2eb] px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={13} />
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg border text-sm transition ${
                      currentPage === page
                        ? "border-[#287da8] bg-[#287da8] font-semibold text-white"
                        : "border-[#d5e2eb] bg-white text-slate-600 hover:bg-sky-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="flex items-center gap-1 rounded-lg border border-[#b9d0df] px-3 py-1.5 text-sm font-medium text-[#287da8] hover:bg-sky-50 disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </section>

          {/* Right Notification Summary */}
          <aside className="rounded-xl border border-[#d5e2eb] bg-white p-5 shadow-[0_8px_25px_rgba(30,64,90,0.05)]">
            <h2 className="mb-5 text-base sm:text-lg font-semibold text-[#173e5b]">Notification summary</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Unread</span>
                <span className="text-xs font-bold text-[#173e5b]">
                  {summary?.unreadCount ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Critical</span>
                <span className="text-xs font-bold text-red-600">
                  {summary?.criticalCount ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Assignments</span>
                <span className="text-xs font-bold text-[#173e5b]">
                  {summary?.assignmentCount ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Evidence updates</span>
                <span className="text-xs font-bold text-[#173e5b]">
                  {summary?.evidenceCount ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">AI Recommendations</span>
                <span className="text-xs font-bold text-[#173e5b]">
                  {summary?.aiCount ?? 0}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="my-5 border-t border-[#d5e2eb]" />

            {/* Delivery Services */}
            <h3 className="mb-3 text-base font-semibold text-[#173e5b]">Delivery services</h3>

            <div className="space-y-3">
              {summary?.deliveryServices && summary.deliveryServices.length > 0 ? (
                summary.deliveryServices.map((svc) => (
                  <div key={svc.name} className="flex items-center gap-3">
                    {svc.status === "Operational" ? (
                      <Check size={17} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={17} className="text-amber-600" />
                    )}
                    <span className="text-xs text-slate-600">{svc.message}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Check size={17} className="text-emerald-600" />
                    <span className="text-xs text-slate-600">In-app operational</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check size={17} className="text-emerald-600" />
                    <span className="text-xs text-slate-600">Email operational</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={17} className="text-amber-600" />
                    <span className="text-xs text-slate-600">SMS provider degraded</span>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* ============================================================
          NOTIFICATION DETAILS MODAL
      ============================================================ */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#173e5b]">Notification Details</h2>
              <button
                onClick={() => setSelectedNotification(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${getIconStyle(
                  selectedNotification.type
                )}`}
              >
                {getNotificationIcon(selectedNotification.type)}
              </div>

              <div>
                <p className="text-sm font-semibold text-[#173e5b]">{selectedNotification.title}</p>
                <p className="mt-1 text-xs text-slate-400">{selectedNotification.time}</p>
              </div>
            </div>

            <div className="space-y-3.5 rounded-xl bg-slate-50 p-4 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Notification Type:</span>
                <span className="font-semibold text-slate-700">{selectedNotification.type}</span>
              </div>

              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Related Case ID:</span>
                <span className="font-semibold text-[#173e5b]">{selectedNotification.caseId}</span>
              </div>

              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Read Status:</span>
                <span className="font-semibold text-emerald-600">Read</span>
              </div>

              <div className="pt-1">
                <span className="text-slate-400">Description:</span>
                <p className="mt-1.5 text-sm text-slate-700">{selectedNotification.description}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-3">
              <button
                onClick={() => handleDeleteNotification(selectedNotification.id)}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                <Trash2 size={14} />
                Delete
              </button>

              <button
                onClick={() => setSelectedNotification(null)}
                className="rounded-lg bg-[#287da8] px-6 py-2 text-sm font-semibold text-white hover:bg-[#17678f]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          NOTIFICATION PREFERENCES MODAL
      ============================================================ */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-sky-50 p-2 text-[#287da8]">
                  <Settings size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#173e5b]">Notification Preferences</h2>
                  <p className="text-xs text-slate-400">
                    Configure active channels and alert category preferences.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPreferences(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Delivery Channels */}
            <h3 className="mb-3 text-base font-bold uppercase tracking-wider text-slate-500">
              Delivery channels
            </h3>

            <div className="space-y-3">
              {[
                {
                  title: "In-app notifications",
                  description: "Receive notifications inside the platform.",
                  icon: <Monitor size={18} />,
                  value: preferences.inAppEnabled,
                  key: "inAppEnabled" as const,
                },
                {
                  title: "Email notifications",
                  description: "Receive updates through your email.",
                  icon: <Mail size={18} />,
                  value: preferences.emailEnabled,
                  key: "emailEnabled" as const,
                },
                {
                  title: "Push notifications",
                  description: "Receive browser and device alerts.",
                  icon: <Smartphone size={18} />,
                  value: preferences.pushEnabled,
                  key: "pushEnabled" as const,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-sky-50 p-2 text-[#287da8]">{item.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                      <p className="mt-0.5 text-[13px] text-slate-400">{item.description}</p>
                    </div>
                  </div>

                  <button
                    role="switch"
                    aria-checked={item.value}
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      item.value ? "bg-[#287da8]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        item.value ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Notification Types */}
            <h3 className="mb-3 mt-6 text-base font-bold uppercase tracking-wider text-slate-500">
              Notification types
            </h3>

            <div className="space-y-3">
              {[
                {
                  title: "Critical alerts",
                  value: preferences.criticalEnabled,
                  key: "criticalEnabled" as const,
                },
                {
                  title: "Case assignments",
                  value: preferences.assignmentEnabled,
                  key: "assignmentEnabled" as const,
                },
                {
                  title: "Evidence updates",
                  value: preferences.evidenceEnabled,
                  key: "evidenceEnabled" as const,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                >
                  <span className="text-xs font-medium text-slate-700">{item.title}</span>

                  <button
                    role="switch"
                    aria-checked={item.value}
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      item.value ? "bg-[#287da8]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        item.value ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="rounded-lg border border-[#b9d0df] px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSavingPrefs}
                onClick={handleSavePreferences}
                className="flex items-center gap-2 rounded-lg bg-[#287da8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#17678f] disabled:opacity-50"
              >
                {isSavingPrefs ? "Saving..." : "Save preferences"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
