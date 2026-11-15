import { useMemo, useState } from "react";
import type { ElementType } from "react";

import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Check,
  Award,
  MessageSquare,
  X,
  Settings,
  CheckCheck,
  Users,
  Trash2,
  CheckCircle2,
} from "lucide-react";

// ==============================
// TYPES
// ==============================

type NotificationCategory =
  | "Assignments"
  | "Verification"
  | "Safety"
  | "AI Matching"
  | "Communications";

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
  category: NotificationCategory;
  icon: ElementType;
  color: string;
  unread: boolean;
  urgent?: boolean;
  details: string;
}

interface Preferences {
  assignments: boolean;
  verification: boolean;
  safety: boolean;
  aiMatching: boolean;
  inApp: boolean;
  email: boolean;
  sms: boolean;
  urgentOnly: boolean;
}

// ==============================
// DEMO NOTIFICATIONS
// ==============================

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Urgent task needs two rescue drivers",
    description: "TASK-782 · North Ward",
    time: "3 min ago",
    category: "Safety",
    icon: AlertTriangle,
    color: "bg-[#fdebec] text-[#dc3545]",
    unread: true,
    urgent: true,
    details:
      "An urgent evacuation transport task requires two additional rescue drivers in North Ward. Please coordinate available volunteers immediately.",
  },
  {
    id: 2,
    title: "4 priority verifications awaiting review",
    description: "Nursing and heavy vehicle skills",
    time: "18 min ago",
    category: "Verification",
    icon: ShieldCheck,
    color: "bg-[#fff3df] text-[#b87813]",
    unread: true,
    details:
      "Four volunteer verification applications require coordinator review. These include nursing qualifications and heavy vehicle driving certifications.",
  },
  {
    id: 3,
    title: "AI match ready for approval",
    description: "TASK-774 · 6 recommended volunteers",
    time: "31 min ago",
    category: "Assignments",
    icon: Sparkles,
    color: "bg-[#f0eafb] text-[#7953c6]",
    unread: true,
    details:
      "The AI matching service has identified six suitable volunteers for TASK-774. Review the recommendations and approve or reject the proposed matches.",
  },
  {
    id: 4,
    title: "Volunteer team checked in",
    description: "TASK-779 · Central Clinic",
    time: "1 hr ago",
    category: "Assignments",
    icon: Check,
    color: "bg-[#e5f5ef] text-[#239879]",
    unread: false,
    details:
      "The assigned volunteer team has successfully checked in at Central Clinic. Their field activity status is now active.",
  },
  {
    id: 5,
    title: "42 certifications expiring soon",
    description: "Review within 30 days",
    time: "2 hr ago",
    category: "Verification",
    icon: Award,
    color: "bg-[#fff3df] text-[#b87813]",
    unread: false,
    details:
      "There are 42 volunteer certifications scheduled to expire within the next 30 days. Review the certification attention queue and contact affected volunteers.",
  },
  {
    id: 6,
    title: "Broadcast delivery completed",
    description: "1,204 of 1,204 recipients",
    time: "3 hr ago",
    category: "Communications",
    icon: MessageSquare,
    color: "bg-[#e8f1f6] text-[#287fa9]",
    unread: false,
    details:
      "The latest operational safety update was successfully delivered to all 1,204 intended recipients.",
  },
  {
    id: 7,
    title: "New volunteer assignment accepted",
    description: "ASGN-4421 · Elena Rossi",
    time: "4 hr ago",
    category: "Assignments",
    icon: Users,
    color: "bg-[#e5f5ef] text-[#239879]",
    unread: true,
    details:
      "Elena Rossi has accepted the evacuation support assignment. The volunteer is scheduled to report to North Ward.",
  },
  {
    id: 8,
    title: "Safety incident reported",
    description: "West District · Field alert",
    time: "5 hr ago",
    category: "Safety",
    icon: AlertTriangle,
    color: "bg-[#fdebec] text-[#dc3545]",
    unread: true,
    urgent: true,
    details:
      "A field safety incident has been reported in West District. Review the incident information and coordinate an appropriate response.",
  },
  {
    id: 9,
    title: "Volunteer verification approved",
    description: "Maya Fernando · First Aid",
    time: "6 hr ago",
    category: "Verification",
    icon: ShieldCheck,
    color: "bg-[#e5f5ef] text-[#239879]",
    unread: false,
    details:
      "Maya Fernando's First Aid qualification has been reviewed and approved.",
  },
  {
    id: 10,
    title: "AI matching model updated",
    description: "Model version 2.4",
    time: "Yesterday",
    category: "Assignments",
    icon: Sparkles,
    color: "bg-[#f0eafb] text-[#7953c6]",
    unread: false,
    details:
      "The volunteer matching model has been updated to version 2.4 with improvements to suitability scoring.",
  },
];

// ==============================
// TABS
// ==============================

const tabs = [
  "All",
  "Unread",
  "Assignments",
  "Verification",
  "Safety",
] as const;

type Tab = (typeof tabs)[number];

// ==============================
// MAIN COMPONENT
// ==============================

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const [activeTab, setActiveTab] = useState<Tab>("All");

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const [showPreferences, setShowPreferences] =
    useState(false);

  const [notification, setNotification] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");

  const [preferences, setPreferences] = useState<Preferences>({
    assignments: true,
    verification: true,
    safety: true,
    aiMatching: true,
    inApp: true,
    email: true,
    sms: false,
    urgentOnly: false,
  });

  const itemsPerPage = 6;

  // ==============================
  // TOAST MESSAGE
  // ==============================

  const notify = (message: string) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  // ==============================
  // FILTER NOTIFICATIONS
  // ==============================

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Unread" && item.unread) ||
        item.category === activeTab;

      const matchesSearch = [
        item.title,
        item.description,
        item.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [notifications, activeTab, search]);

  // ==============================
  // PAGINATION
  // ==============================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / itemsPerPage)
  );

  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==============================
  // STATISTICS
  // ==============================

  const unreadCount = notifications.filter(
    (item) => item.unread
  ).length;

  const urgentCount = notifications.filter(
    (item) => item.urgent && item.unread
  ).length;

  const assignmentCount = notifications.filter(
    (item) => item.category === "Assignments"
  ).length;

  const verificationCount = notifications.filter(
    (item) => item.category === "Verification"
  ).length;

  const safetyCount = notifications.filter(
    (item) => item.category === "Safety"
  ).length;

  // ==============================
  // MARK AS READ
  // ==============================

  const markAsRead = (id: number) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, unread: false }
          : item
      )
    );
  };

  // ==============================
  // MARK ALL AS READ
  // ==============================

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((item) => ({
        ...item,
        unread: false,
      }))
    );

    notify("All notifications marked as read!");
  };

  // ==============================
  // OPEN NOTIFICATION
  // ==============================

  const openNotification = (item: NotificationItem) => {
    setSelectedNotification({
      ...item,
      unread: false,
    });

    markAsRead(item.id);
  };

  // ==============================
  // DELETE NOTIFICATION
  // ==============================

  const deleteNotification = (id: number) => {
    setNotifications((previous) =>
      previous.filter((item) => item.id !== id)
    );

    setSelectedNotification(null);

    notify("Notification deleted successfully!");
  };

  // ==============================
  // CHANGE TAB
  // ==============================

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // ==============================
  // SAVE PREFERENCES
  // ==============================

  const savePreferences = () => {
    localStorage.setItem(
      "carelink_notification_preferences",
      JSON.stringify(preferences)
    );

    setShowPreferences(false);

    notify("Notification preferences saved!");
  };

  // ==============================
  // SUMMARY ITEM
  // ==============================

  const SummaryItem = ({
    label,
    value,
  }: {
    label: string;
    value: number;
  }) => (
    <div className="flex items-center justify-between mb-4">
      <span className="text-[9px] text-[#55728b]">
        {label}
      </span>

      <span className="text-[9px] font-semibold text-[#123c5b]">
        {value}
      </span>
    </div>
  );

  // ==============================
  // PREFERENCE TOGGLE
  // ==============================

  const PreferenceToggle = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#e5edf1]">
      <div>
        <p className="text-[11px] font-medium">
          {label}
        </p>

        <p className="text-[9px] text-[#8296aa] mt-1">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${
          checked ? "bg-[#287fa9]" : "bg-[#cbd5dc]"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );

  // ==============================
  // PAGE UI
  // ==============================

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">

      {/* TOP NAVIGATION */}


      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-7">

          <span className="text-[#8296aa]">
            Operations
          </span>

          <ChevronRight size={12} />

          <span className="text-[#8296aa]">
            Volunteer Coordination
          </span>

          <ChevronRight size={12} />

          <span className="font-semibold">
            Notifications
          </span>

        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div>

            <h1 className="text-[24px] font-normal">
              Notifications
            </h1>

            <p className="text-[11px] text-[#718ba0] mt-2">
              Review coordination alerts, volunteer responses, and system updates.
            </p>

          </div>

          <div className="flex gap-2">

            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="h-[36px] px-3 bg-white border border-[#b9d0dc] rounded-lg text-[9px] text-[#17648e] hover:bg-[#f5fafc] disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCheck size={13} />
              Mark all as read
            </button>

            <button
              onClick={() => setShowPreferences(true)}
              className="h-[36px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-[9px] font-semibold"
            >
              <Settings size={13} />
              Preferences
            </button>

          </div>

        </div>

        {/* TABS */}

        <div className="flex items-center gap-6 border-b border-[#d5e3e9] mb-3 overflow-x-auto">

          {tabs.map((tab) => {

            const count =
              tab === "All"
                ? notifications.length
                : tab === "Unread"
                ? unreadCount
                : tab === "Assignments"
                ? assignmentCount
                : tab === "Verification"
                ? verificationCount
                : safetyCount;

            const active = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => changeTab(tab)}
                className={`relative py-3 text-[9px] whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  active
                    ? "text-[#17648e] font-semibold"
                    : "text-[#8296aa] hover:text-[#17648e]"
                }`}
              >
                {tab}

                <span className="bg-[#e8f1f6] text-[#287fa9] rounded-full px-1.5 py-0.5 text-[8px]">
                  {count}
                </span>

                {active && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#287fa9]" />
                )}
              </button>
            );

          })}

        </div>

        {/* MAIN GRID */}

        <section className="grid grid-cols-1 lg:grid-cols-[2.7fr_0.85fr] gap-3 items-start">

          {/* NOTIFICATION LIST */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden">

            <div>

              {paginatedNotifications.map((item) => {

                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className={`relative flex items-center gap-3 px-3 py-4 border-b border-[#d5e3e9] transition-colors ${
                      item.unread
                        ? "bg-[#f3f9f8] hover:bg-[#edf6f4]"
                        : "bg-white hover:bg-[#f8fafb]"
                    }`}
                  >

                    {/* ICON */}

                    <div
                      className={`w-[33px] h-[33px] rounded-lg flex items-center justify-center shrink-0 ${item.color}`}
                    >
                      <Icon size={17} />
                    </div>

                    {/* CONTENT */}

                    <button
                      onClick={() => openNotification(item)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-[9px] font-semibold text-[#123c5b] truncate">
                        {item.title}
                      </p>

                      <p className="text-[8px] text-[#8296aa] mt-1 truncate">
                        {item.description}
                      </p>

                      <p className="text-[8px] text-[#8296aa] mt-1">
                        {item.time}
                      </p>
                    </button>

                    {/* UNREAD INDICATOR */}

                    {item.unread && (
                      <span
                        className="w-[7px] h-[7px] bg-[#287fa9] rounded-full shrink-0"
                        title="Unread"
                      />
                    )}

                    {/* DETAILS */}

                    <button
                      onClick={() => openNotification(item)}
                      className="p-1 hover:bg-[#e8f1f6] rounded shrink-0"
                      aria-label="View notification"
                    >
                      <ChevronRight
                        size={17}
                        className="text-[#123c5b]"
                      />
                    </button>

                  </div>
                );

              })}

              {/* EMPTY STATE */}

              {paginatedNotifications.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center">

                  <CheckCircle2
                    size={35}
                    className="text-[#65bda5] mb-3"
                  />

                  <p className="text-[12px] font-semibold">
                    No notifications found
                  </p>

                  <p className="text-[9px] text-[#8296aa] mt-1">
                    There are no notifications in this category.
                  </p>

                </div>
              )}

            </div>

            {/* PAGINATION */}

            <div className="px-3 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">

              <p className="text-[8px] text-[#8296aa]">

                Showing{" "}

                {filteredNotifications.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}

                –

                {Math.min(
                  currentPage * itemsPerPage,
                  filteredNotifications.length
                )}

                {" "}of {filteredNotifications.length}

              </p>

              <div className="flex items-center gap-1.5">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  className="h-[30px] px-3 border border-[#d5e3e9] rounded-lg text-[8px] text-[#718ba0] disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-[28px] h-[28px] rounded-md border text-[9px] ${
                      currentPage === page
                        ? "bg-[#287fa9] text-white border-[#287fa9]"
                        : "bg-white border-[#d5e3e9] hover:bg-[#f1f8fc]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  className="h-[30px] px-3 border border-[#b9d0dc] rounded-lg text-[8px] text-[#17648e] disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>

          </div>

          {/* RIGHT SIDEBAR */}

          <aside className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] p-4">

            <h2 className="text-[11px] font-medium mb-4">
              Notification summary
            </h2>

            <SummaryItem
              label="Unread"
              value={unreadCount}
            />

            <SummaryItem
              label="Urgent"
              value={urgentCount}
            />

            <SummaryItem
              label="Assignments"
              value={assignmentCount}
            />

            <SummaryItem
              label="Verification"
              value={verificationCount}
            />

            {/* DELIVERY SERVICES */}

            <div className="border-t border-[#d5e3e9] pt-3">

              <h3 className="text-[10px] font-medium mb-3">
                Delivery services
              </h3>

              <div className="space-y-2.5">

                <div className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-[#239879]"
                  />

                  <span className="text-[8px] text-[#718ba0]">
                    In-app operational
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-[#239879]"
                  />

                  <span className="text-[8px] text-[#718ba0]">
                    Email operational
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={14}
                    className="text-[#d18a18]"
                  />

                  <span className="text-[8px] text-[#718ba0]">
                    SMS provider degraded
                  </span>
                </div>

              </div>

            </div>

          </aside>

        </section>

      </main>

      {/* ============================== */}
      {/* NOTIFICATION DETAILS MODAL */}
      {/* ============================== */}

      {selectedNotification && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden">

            {/* HEADER */}

            <div className="p-5 border-b border-[#d5e3e9] flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedNotification.color}`}
                >
                  {(() => {
                    const Icon = selectedNotification.icon;
                    return <Icon size={20} />;
                  })()}
                </div>

                <div>
                  <h2 className="text-[14px] font-semibold">
                    Notification details
                  </h2>

                  <p className="text-[9px] text-[#8296aa] mt-1">
                    {selectedNotification.category}
                  </p>
                </div>

              </div>

              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>

            </div>

            {/* CONTENT */}

            <div className="p-5 space-y-4">

              <div>
                <p className="text-[9px] text-[#8296aa] mb-1">
                  NOTIFICATION TITLE
                </p>

                <h3 className="text-[13px] font-semibold">
                  {selectedNotification.title}
                </h3>
              </div>

              <div>
                <p className="text-[9px] text-[#8296aa] mb-1">
                  DESCRIPTION
                </p>

                <p className="text-[11px] leading-5 text-[#55728b]">
                  {selectedNotification.details}
                </p>
              </div>

              <div className="bg-[#f5f9fb] rounded-lg p-4 space-y-3">

                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#8296aa]">
                    Category
                  </span>

                  <span className="text-[9px] font-semibold">
                    {selectedNotification.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#8296aa]">
                    Received
                  </span>

                  <span className="text-[9px] font-semibold">
                    {selectedNotification.time}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#8296aa]">
                    Read status
                  </span>

                  <span className="text-[9px] text-[#239879] font-semibold">
                    Read
                  </span>
                </div>

              </div>

              {selectedNotification.urgent && (
                <div className="bg-[#fff3df] rounded-lg p-3 flex gap-2">

                  <AlertTriangle
                    size={16}
                    className="text-[#b87813] shrink-0"
                  />

                  <p className="text-[9px] text-[#986617] leading-4">
                    This notification requires urgent coordinator attention.
                  </p>

                </div>
              )}

            </div>

            {/* FOOTER */}

            <div className="p-4 border-t flex justify-between items-center">

              <button
                onClick={() =>
                  deleteNotification(selectedNotification.id)
                }
                className="text-[#dc3545] hover:bg-[#fdebec] rounded-lg px-3 py-2 text-[10px] flex items-center gap-2"
              >
                <Trash2 size={13} />
                Delete
              </button>

              <button
                onClick={() => setSelectedNotification(null)}
                className="bg-[#287fa9] text-white px-5 py-2.5 rounded-lg text-[10px]"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ============================== */}
      {/* NOTIFICATION PREFERENCES MODAL */}
      {/* ============================== */}

      {showPreferences && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[480px] rounded-xl shadow-2xl overflow-hidden">

            {/* HEADER */}

            <div className="p-5 border-b border-[#d5e3e9] flex items-center justify-between">

              <div>
                <h2 className="text-[16px] font-semibold">
                  Notification preferences
                </h2>

                <p className="text-[9px] text-[#8296aa] mt-1">
                  Manage which notifications you receive.
                </p>
              </div>

              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>

            </div>

            <div className="p-5 max-h-[65vh] overflow-y-auto">

              {/* CATEGORIES */}

              <h3 className="text-[10px] font-semibold mb-2">
                Notification categories
              </h3>

              <PreferenceToggle
                label="Assignments"
                description="Volunteer assignments and task updates."
                checked={preferences.assignments}
                onChange={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    assignments: !prev.assignments,
                  }))
                }
              />

              <PreferenceToggle
                label="Verification"
                description="Volunteer identity and qualification reviews."
                checked={preferences.verification}
                onChange={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    verification: !prev.verification,
                  }))
                }
              />

              <PreferenceToggle
                label="Safety alerts"
                description="Urgent incidents and field safety updates."
                checked={preferences.safety}
                onChange={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    safety: !prev.safety,
                  }))
                }
              />

              <PreferenceToggle
                label="AI matching"
                description="AI recommendations and approval requests."
                checked={preferences.aiMatching}
                onChange={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    aiMatching: !prev.aiMatching,
                  }))
                }
              />

              {/* CHANNELS */}

              <h3 className="text-[10px] font-semibold mt-5 mb-2">
                Delivery channels
              </h3>

              <PreferenceToggle
                label="In-app notifications"
                description="Receive updates inside CareLink."
                checked={preferences.inApp}
                onChange={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    inApp: !prev.inApp,
                  }))
                }
              />

              <PreferenceToggle
                label="Email notifications"
                description="Receive updates through email."
                checked={preferences.email}
                onChange={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    email: !prev.email,
                  }))
                }
              />

              <PreferenceToggle
                label="SMS notifications"
                description="Receive operational updates through SMS."
                checked={preferences.sms}
                onChange={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    sms: !prev.sms,
                  }))
                }
              />

              {/* ADDITIONAL SETTINGS */}

              <h3 className="text-[10px] font-semibold mt-5 mb-2">
                Additional settings
              </h3>

              <PreferenceToggle
                label="Urgent alerts only"
                description="Restrict optional notifications and prioritize urgent alerts."
                checked={preferences.urgentOnly}
                onChange={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    urgentOnly: !prev.urgentOnly,
                  }))
                }
              />

            </div>

            {/* FOOTER */}

            <div className="p-4 border-t flex justify-end gap-2">

              <button
                onClick={() => setShowPreferences(false)}
                className="border border-[#d5e3e9] rounded-lg px-4 py-2.5 text-[10px]"
              >
                Cancel
              </button>

              <button
                onClick={savePreferences}
                className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2.5 text-[10px] font-semibold"
              >
                Save preferences
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ============================== */}
      {/* TOAST MESSAGE */}
      {/* ============================== */}

      {notification && (

        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-5 py-3 shadow-xl text-xs flex items-center gap-2">

          <CheckCheck size={15} />

          {notification}

        </div>

      )}

      {/* HELP BUTTON */}

      <button
        type="button"
        aria-label="Help"
        className="fixed bottom-4 right-4 w-10 h-10 bg-[#282828] hover:bg-black text-white rounded-full flex items-center justify-center shadow-lg"
      >
        <HelpCircle size={21} />
      </button>

    </div>
  );
}