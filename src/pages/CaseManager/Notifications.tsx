import React, { useMemo, useState } from "react";

import {
  Menu,
  Search,
  Globe,
  HelpCircle,
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
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "Critical" | "Assignment" | "Duplicate" | "Evidence" | "Escalation" | "AI";
  read: boolean;
  caseId: string;
}

// ==========================================
// INITIAL DATA
// ==========================================

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Critical case overdue",
    description: "REQ-2821 exceeded critical review SLA.",
    time: "3 min ago",
    type: "Critical",
    read: false,
    caseId: "REQ-2821",
  },
  {
    id: 2,
    title: "New case assigned to you",
    description: "REQ-2841 · Emergency shelter.",
    time: "12 min ago",
    type: "Assignment",
    read: false,
    caseId: "REQ-2841",
  },
  {
    id: 3,
    title: "Potential duplicate detected",
    description: "REQ-2836 matches REQ-2811 at 88%.",
    time: "28 min ago",
    type: "Duplicate",
    read: false,
    caseId: "REQ-2836",
  },
  {
    id: 4,
    title: "Citizen supplied requested information",
    description: "REQ-2814 · Prescription uploaded.",
    time: "42 min ago",
    type: "Evidence",
    read: false,
    caseId: "REQ-2814",
  },
  {
    id: 5,
    title: "Escalation acknowledged",
    description: "Emergency Coordinator accepted REQ-2821.",
    time: "1 hr ago",
    type: "Escalation",
    read: true,
    caseId: "REQ-2821",
  },
  {
    id: 6,
    title: "AI recommendation ready",
    description: "REQ-2841 · 94% confidence.",
    time: "2 hr ago",
    type: "AI",
    read: true,
    caseId: "REQ-2841",
  },
  {
    id: 7,
    title: "New case assigned to your team",
    description: "REQ-2839 · Medical supplies.",
    time: "3 hr ago",
    type: "Assignment",
    read: true,
    caseId: "REQ-2839",
  },
  {
    id: 8,
    title: "Evidence verification completed",
    description: "REQ-2828 · Documents successfully verified.",
    time: "4 hr ago",
    type: "Evidence",
    read: true,
    caseId: "REQ-2828",
  },
  {
    id: 9,
    title: "Critical priority updated",
    description: "REQ-2789 · Priority changed to Critical.",
    time: "5 hr ago",
    type: "Critical",
    read: true,
    caseId: "REQ-2789",
  },
  {
    id: 10,
    title: "AI recommendation ready",
    description: "REQ-2761 · Resource matching completed.",
    time: "6 hr ago",
    type: "AI",
    read: true,
    caseId: "REQ-2761",
  },
  {
    id: 11,
    title: "Potential duplicate detected",
    description: "REQ-2701 matches REQ-2689 at 81%.",
    time: "Yesterday",
    type: "Duplicate",
    read: true,
    caseId: "REQ-2701",
  },
  {
    id: 12,
    title: "Case escalation received",
    description: "REQ-2650 requires senior review.",
    time: "Yesterday",
    type: "Escalation",
    read: true,
    caseId: "REQ-2650",
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const Notifications: React.FC = () => {

  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const [activeTab, setActiveTab] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [showPreferences, setShowPreferences] = useState(false);

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const [emailEnabled, setEmailEnabled] = useState(true);

  const [pushEnabled, setPushEnabled] = useState(true);

  const [inAppEnabled, setInAppEnabled] = useState(true);

  const [criticalEnabled, setCriticalEnabled] = useState(true);

  const [assignmentEnabled, setAssignmentEnabled] = useState(true);

  const [evidenceEnabled, setEvidenceEnabled] = useState(true);

  const [successMessage, setSuccessMessage] = useState("");

  const itemsPerPage = 6;

  // ==========================================
  // COUNTS
  // ==========================================

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  const criticalCount = notifications.filter(
    (item) => item.type === "Critical"
  ).length;

  const assignmentCount = notifications.filter(
    (item) => item.type === "Assignment"
  ).length;

  const evidenceCount = notifications.filter(
    (item) => item.type === "Evidence"
  ).length;

  // ==========================================
  // FILTER NOTIFICATIONS
  // ==========================================

  const filteredNotifications = useMemo(() => {

    return notifications.filter((item) => {

      if (activeTab === "Unread") {
        return !item.read;
      }

      if (activeTab === "Critical") {
        return item.type === "Critical";
      }

      if (activeTab === "Assignments") {
        return item.type === "Assignment";
      }

      if (activeTab === "Evidence") {
        return item.type === "Evidence";
      }

      return true;

    });

  }, [notifications, activeTab]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / itemsPerPage)
  );

  const currentNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==========================================
  // MARK SINGLE NOTIFICATION AS READ
  // ==========================================

  const markAsRead = (id: number) => {

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, read: true }
          : item
      )
    );

  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const markAllAsRead = () => {

    setNotifications((previous) =>
      previous.map((item) => ({
        ...item,
        read: true,
      }))
    );

    showSuccess("All notifications marked as read.");

  };

  // ==========================================
  // OPEN NOTIFICATION
  // ==========================================

  const openNotification = (item: Notification) => {

    setSelectedNotification(item);

    markAsRead(item.id);

  };

  // ==========================================
  // SUCCESS MESSAGE
  // ==========================================

  const showSuccess = (message: string) => {

    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

  };

  // ==========================================
  // NOTIFICATION ICON
  // ==========================================

  const getNotificationIcon = (type: string) => {

    switch (type) {

      case "Critical":
        return (
          <AlertTriangle size={21} />
        );

      case "Assignment":
        return (
          <Monitor size={21} />
        );

      case "Duplicate":
        return (
          <Copy size={21} />
        );

      case "Evidence":
        return (
          <MessageSquareText size={21} />
        );

      case "Escalation":
        return (
          <ArrowUpToLine size={21} />
        );

      case "AI":
        return (
          <Sparkles size={21} />
        );

      default:
        return (
          <Bell size={21} />
        );

    }

  };

  // ==========================================
  // NOTIFICATION ICON STYLE
  // ==========================================

  const getIconStyle = (type: string) => {

    switch (type) {

      case "Critical":
        return "bg-red-50 text-red-600";

      case "Assignment":
        return "bg-sky-100 text-sky-700";

      case "Duplicate":
        return "bg-purple-100 text-purple-700";

      case "Evidence":
        return "bg-emerald-100 text-emerald-700";

      case "Escalation":
        return "bg-emerald-100 text-emerald-700";

      case "AI":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-slate-100 text-slate-600";

    }

  };

  // ==========================================
  // TABS
  // ==========================================

  const tabs = [
    {
      name: "All",
      count: 34,
    },
    {
      name: "Unread",
      count: 11,
    },
    {
      name: "Critical",
      count: 3,
    },
    {
      name: "Assignments",
    },
    {
      name: "Evidence",
    },
  ];

  // ==========================================
  // JSX
  // ==========================================

  return (

    <div className="min-h-screen bg-[#eff6f8] text-slate-800">


      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-8">

        {/* BREADCRUMB */}

        <div className="mb-9 flex items-center gap-2 text-xs text-slate-400">

          <span>Operations</span>

          <ChevronRight size={13} />

          <span>Case Management</span>

          <ChevronRight size={13} />

          <span className="font-semibold text-slate-800">
            Notifications
          </span>

        </div>

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review case assignments, escalations, evidence updates, and SLA alerts.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-2">

            <button
              onClick={markAllAsRead}
              className="rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-xs font-medium text-[#287da8] transition hover:bg-sky-50"
            >
              Mark all as read
            </button>

            <button
              onClick={() => setShowPreferences(true)}
              className="rounded-lg bg-[#287da8] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#17678f]"
            >
              Preferences
            </button>

          </div>

        </div>

        {/* =====================================
            SUCCESS MESSAGE
        ===================================== */}

        {successMessage && (

          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">

            <CheckCircle2 size={17} />

            {successMessage}

          </div>

        )}

        {/* =====================================
            TABS
        ===================================== */}

        <div className="mb-4 flex flex-wrap items-center gap-7 border-b border-[#d5e2eb]">

          {tabs.map((tab) => (

            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                setCurrentPage(1);
              }}
              className={`relative flex items-center gap-1.5 py-4 text-xs transition ${
                activeTab === tab.name
                  ? "font-semibold text-[#287da8]"
                  : "text-slate-500 hover:text-sky-700"
              }`}
            >

              {tab.name}

              {tab.count !== undefined && (

                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                  {tab.name === "Unread"
                    ? unreadCount
                    : tab.name === "Critical"
                      ? criticalCount
                      : tab.count}
                </span>

              )}

              {activeTab === tab.name && (

                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#287da8]" />

              )}

            </button>

          ))}

        </div>

        {/* =====================================
            NOTIFICATION CONTENT
        ===================================== */}

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2.5fr)_minmax(280px,0.95fr)]">

          {/* =====================================
              LEFT NOTIFICATION LIST
          ===================================== */}

          <section className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.05)]">

            {/* NOTIFICATION LIST */}

            <div className="divide-y divide-[#d5e2eb]">

              {currentNotifications.length > 0 ? (

                currentNotifications.map((item) => (

                  <div
                    key={item.id}
                    onClick={() => openNotification(item)}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-5 transition hover:bg-[#edf7f8] sm:px-5 ${
                      !item.read
                        ? "bg-[#f4faf8]"
                        : "bg-white"
                    }`}
                  >

                    {/* ICON */}

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getIconStyle(
                        item.type
                      )}`}
                    >
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-[11px] font-bold text-[#173e5b]">
                        {item.title}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-slate-500">
                        {item.description}
                      </p>

                      <p className="mt-1.5 text-[9px] text-slate-400">
                        {item.time}
                      </p>

                    </div>

                    {/* UNREAD DOT */}

                    <div className="flex items-center gap-3">

                      {!item.read && (

                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#287da8]" />

                      )}

                      <ChevronRight
                        size={21}
                        className="shrink-0 text-slate-700"
                      />

                    </div>

                  </div>

                ))

              ) : (

                <div className="py-16 text-center">

                  <Bell
                    size={35}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    No notifications found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    You are all caught up!
                  </p>

                </div>

              )}

            </div>

            {/* =====================================
                PAGINATION
            ===================================== */}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d5e2eb] px-4 py-4 sm:px-5">

              <p className="text-[10px] text-slate-400">

                Showing{" "}

                {filteredNotifications.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}

                –

                {Math.min(
                  currentPage * itemsPerPage,
                  filteredNotifications.length
                )}

                {" "}of {filteredNotifications.length === 0
                  ? 0
                  : activeTab === "All"
                    ? 34
                    : filteredNotifications.length}

              </p>

              <div className="flex items-center gap-1.5">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((previous) =>
                      Math.max(1, previous - 1)
                    )
                  }
                  className="flex items-center gap-1 rounded-lg border border-[#d5e2eb] px-3 py-2 text-[10px] text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                >

                  <ChevronLeft size={13} />

                  Previous

                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (

                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-lg border text-xs transition ${
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
                  onClick={() =>
                    setCurrentPage((previous) =>
                      Math.min(totalPages, previous + 1)
                    )
                  }
                  className="flex items-center gap-1 rounded-lg border border-[#b9d0df] px-3 py-2 text-[10px] font-medium text-[#287da8] hover:bg-sky-50 disabled:opacity-40"
                >

                  Next

                  <ChevronRight size={13} />

                </button>

              </div>

            </div>

          </section>

          {/* =====================================
              RIGHT NOTIFICATION SUMMARY
          ===================================== */}

          <aside className="rounded-xl border border-[#d5e2eb] bg-white p-5 shadow-[0_8px_25px_rgba(30,64,90,0.05)]">

            <h2 className="mb-5 text-sm font-medium text-[#173e5b]">
              Notification summary
            </h2>

            {/* SUMMARY ITEMS */}

            <div className="space-y-5">

              <div className="flex items-center justify-between">

                <span className="text-[11px] text-slate-600">
                  Unread
                </span>

                <span className="text-[11px] font-bold text-[#173e5b]">
                  {unreadCount}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-[11px] text-slate-600">
                  Critical
                </span>

                <span className="text-[11px] font-bold text-[#173e5b]">
                  {criticalCount}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-[11px] text-slate-600">
                  Assignments
                </span>

                <span className="text-[11px] font-bold text-[#173e5b]">
                  {assignmentCount}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-[11px] text-slate-600">
                  Evidence updates
                </span>

                <span className="text-[11px] font-bold text-[#173e5b]">
                  {evidenceCount}
                </span>

              </div>

            </div>

            {/* DIVIDER */}

            <div className="my-4 border-t border-[#d5e2eb]" />

            {/* DELIVERY SERVICES */}

            <h3 className="mb-3 text-sm font-medium text-[#173e5b]">
              Delivery services
            </h3>

            <div className="space-y-3">

              <div className="flex items-center gap-3">

                <Check
                  size={19}
                  className="text-emerald-600"
                />

                <span className="text-[11px] text-slate-600">
                  In-app operational
                </span>

              </div>

              <div className="flex items-center gap-3">

                <Check
                  size={19}
                  className="text-emerald-600"
                />

                <span className="text-[11px] text-slate-600">
                  Email operational
                </span>

              </div>

              <div className="flex items-center gap-3">

                <AlertTriangle
                  size={19}
                  className="text-amber-600"
                />

                <span className="text-[11px] text-slate-600">
                  SMS provider degraded
                </span>

              </div>

            </div>

          </aside>

        </div>

      </main>

      {/* =====================================
          NOTIFICATION DETAILS MODAL
      ===================================== */}

      {selectedNotification && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-lg font-semibold text-[#173e5b]">
                Notification Details
              </h2>

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

                <p className="text-sm font-semibold text-[#173e5b]">
                  {selectedNotification.title}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedNotification.time}
                </p>

              </div>

            </div>

            <div className="space-y-4">

              {[
                ["Notification Type", selectedNotification.type],
                ["Case ID", selectedNotification.caseId],
                ["Description", selectedNotification.description],
                ["Read Status", "Read"],
              ].map(([label, value]) => (

                <div
                  key={label}
                  className="border-b border-slate-100 pb-3"
                >

                  <p className="text-[10px] text-slate-400">
                    {label}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-700">
                    {value}
                  </p>

                </div>

              ))}

            </div>

            <button
              onClick={() => setSelectedNotification(null)}
              className="mt-6 w-full rounded-lg bg-[#287da8] py-3 text-sm font-semibold text-white hover:bg-[#17678f]"
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* =====================================
          NOTIFICATION PREFERENCES MODAL
      ===================================== */}

      {showPreferences && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">

            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <Settings
                  size={22}
                  className="text-[#287da8]"
                />

                <div>

                  <h2 className="text-lg font-semibold text-[#173e5b]">
                    Notification Preferences
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Manage how you receive notifications.
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

            {/* DELIVERY CHANNELS */}

            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              Delivery channels
            </h3>

            <div className="space-y-3">

              {[
                {
                  title: "In-app notifications",
                  description: "Receive notifications inside the platform.",
                  icon: <Monitor size={19} />,
                  value: inAppEnabled,
                  setter: setInAppEnabled,
                },
                {
                  title: "Email notifications",
                  description: "Receive updates through your email.",
                  icon: <Mail size={19} />,
                  value: emailEnabled,
                  setter: setEmailEnabled,
                },
                {
                  title: "Push notifications",
                  description: "Receive browser and device alerts.",
                  icon: <Smartphone size={19} />,
                  value: pushEnabled,
                  setter: setPushEnabled,
                },
              ].map((item) => (

                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                >

                  <div className="flex items-center gap-3">

                    <div className="rounded-lg bg-sky-50 p-2 text-sky-700">
                      {item.icon}
                    </div>

                    <div>

                      <p className="text-xs font-semibold text-slate-700">
                        {item.title}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {item.description}
                      </p>

                    </div>

                  </div>

                  <button
                    role="switch"
                    aria-checked={item.value}
                    onClick={() => item.setter(!item.value)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      item.value
                        ? "bg-[#287da8]"
                        : "bg-slate-300"
                    }`}
                  >

                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        item.value
                          ? "left-6"
                          : "left-1"
                      }`}
                    />

                  </button>

                </div>

              ))}

            </div>

            {/* NOTIFICATION TYPES */}

            <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-700">
              Notification types
            </h3>

            <div className="space-y-3">

              {[
                {
                  title: "Critical alerts",
                  value: criticalEnabled,
                  setter: setCriticalEnabled,
                },
                {
                  title: "Case assignments",
                  value: assignmentEnabled,
                  setter: setAssignmentEnabled,
                },
                {
                  title: "Evidence updates",
                  value: evidenceEnabled,
                  setter: setEvidenceEnabled,
                },
              ].map((item) => (

                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                >

                  <span className="text-xs font-medium text-slate-700">
                    {item.title}
                  </span>

                  <button
                    role="switch"
                    aria-checked={item.value}
                    onClick={() => item.setter(!item.value)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      item.value
                        ? "bg-[#287da8]"
                        : "bg-slate-300"
                    }`}
                  >

                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        item.value
                          ? "left-6"
                          : "left-1"
                      }`}
                    />

                  </button>

                </div>

              ))}

            </div>

            {/* SAVE */}

            <button
              onClick={() => {
                setShowPreferences(false);
                showSuccess("Notification preferences updated.");
              }}
              className="mt-6 w-full rounded-lg bg-[#287da8] py-3 text-sm font-semibold text-white transition hover:bg-[#17678f]"
            >
              Save preferences
            </button>

          </div>

        </div>

      )}

    </div>

  );

};

export default Notifications;