
import { useMemo, useState, type ReactNode } from "react";
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
} from "lucide-react";

type NotificationType =
  | "Urgent"
  | "Collaboration"
  | "Resource"
  | "Reporting"
  | "Agreement"
  | "Team";

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  category: NotificationType;
  unread: boolean;
  urgent: boolean;
  details: string;
  reference: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Critical referral awaiting response",
    description: "REF-2841 · Emergency shelter · 6 people",
    time: "4 min ago",
    category: "Urgent",
    unread: true,
    urgent: true,
    reference: "REF-2841",
    details:
      "A critical emergency shelter referral has been received from the North Ward. Six affected people require urgent accommodation support. Please review and respond as soon as possible.",
  },
  {
    id: 2,
    title: "New collaboration request",
    description: "Mobile water distribution · North Ward",
    time: "12 min ago",
    category: "Collaboration",
    unread: true,
    urgent: false,
    reference: "COL-0742",
    details:
      "National Disaster Authority has requested collaboration for a mobile water distribution activity in North Ward. Your organisation is requested to provide vehicles and field staff.",
  },
  {
    id: 3,
    title: "Resource delivery exception",
    description: "COM-1039 · Partial delivery recorded",
    time: "28 min ago",
    category: "Resource",
    unread: true,
    urgent: true,
    reference: "COM-1039",
    details:
      "A partial delivery has been recorded for commitment COM-1039. Some water purification tablets have not reached the destination. Please review the delivery status and coordinate with the logistics team.",
  },
  {
    id: 4,
    title: "Partner report due today",
    description: "Daily activity report due at 18:00",
    time: "42 min ago",
    category: "Reporting",
    unread: true,
    urgent: false,
    reference: "RPT-1042",
    details:
      "Your Daily Partner Activity Report for Monsoon Floods 2025 must be submitted today before 18:00. The report is currently 82% complete and three sections require review.",
  },
  {
    id: 5,
    title: "Agreement review required",
    description: "Safeguarding attestation due in 18 days",
    time: "1 hr ago",
    category: "Agreement",
    unread: false,
    urgent: false,
    reference: "AGR-0038",
    details:
      "Your organisation's safeguarding attestation requires review. Please verify the information and submit the updated agreement before the due date.",
  },
  {
    id: 6,
    title: "Field team checked in",
    description: "North Ward distribution team · 12 members",
    time: "2 hr ago",
    category: "Team",
    unread: false,
    urgent: false,
    reference: "TEAM-0012",
    details:
      "The North Ward distribution team has successfully checked in. Twelve team members are currently active in the field and ready to continue the scheduled distribution activity.",
  },
];

const tabs = [
  "All",
  "Unread",
  "Urgent",
  "Collaboration",
  "Reporting",
];

const Notifications = () => {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const [showPreferences, setShowPreferences] = useState(false);

  const [preferences, setPreferences] = useState({
    urgent: true,
    referrals: true,
    collaboration: true,
    resources: true,
    reporting: true,
    team: true,
    email: false,
    push: true,
  });

  const unreadCount = notifications.filter(
    (n) => n.unread
  ).length;

  const urgentCount = notifications.filter(
    (n) => n.urgent && n.unread
  ).length;

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const text = [
        notification.title,
        notification.description,
        notification.reference,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Unread" && notification.unread) ||
        (activeTab === "Urgent" && notification.urgent) ||
        notification.category === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [notifications, activeTab, search]);

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  // Mark single notification as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  // Open notification details
  const openNotification = (notification: NotificationItem) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">

      {/* Header */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

        <div>
          <p className="mb-3 text-xs text-slate-500">
            Partner Coordination
            <span className="mx-2">›</span>
            <span className="font-semibold text-[#153e5b]">
              Notifications
            </span>
          </p>

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Notifications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review shared referrals, partner requests, operational
            exceptions, and reporting deadlines.
          </p>
        </div>

        <div className="flex gap-2">

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

      {/* Summary Cards */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

        <SummaryCard
          icon={<Bell size={19} />}
          title="Total notifications"
          value={String(notifications.length)}
          subtitle="All notifications"
          color="blue"
        />

        <SummaryCard
          icon={<AlertTriangle size={19} />}
          title="Unread notifications"
          value={String(unreadCount)}
          subtitle="Require your attention"
          color="orange"
        />

        <SummaryCard
          icon={<Clock size={19} />}
          title="Urgent notifications"
          value={String(urgentCount)}
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
          const count =
            tab === "All"
              ? notifications.length
              : tab === "Unread"
                ? unreadCount
                : tab === "Urgent"
                  ? urgentCount
                  : null;

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

              {count !== null && (
                <span className="rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px]">
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

        {filteredNotifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            onClick={() => openNotification(notification)}
          />
        ))}

        {filteredNotifications.length === 0 && (
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
              className="mt-4 text-xs font-medium text-[#267ba4]"
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

      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>
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
function NotificationIcon({
  category,
}: {
  category: NotificationType;
}) {
  const iconMap: Record<NotificationType, ReactNode> = {
    Urgent: <AlertTriangle size={19} />,
    Collaboration: <Handshake size={19} />,
    Resource: <Package size={19} />,
    Reporting: <CalendarDays size={19} />,
    Agreement: <FileText size={19} />,
    Team: <Users size={19} />,
  };

  const colorMap: Record<NotificationType, string> = {
    Urgent: "bg-[#fff0f0] text-[#e05252]",
    Collaboration: "bg-[#f0ebfb] text-[#8661c5]",
    Resource: "bg-[#fff4df] text-[#c68b24]",
    Reporting: "bg-[#e8f2f8] text-[#2783b1]",
    Agreement: "bg-[#fff4df] text-[#bd8229]",
    Team: "bg-[#e5f6f0] text-[#299b7d]",
  };

  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorMap[category]}`}>
      {iconMap[category]}
    </div>
  );
}

// Notification Row
function NotificationRow({
  notification,
  onClick,
}: {
  notification: NotificationItem;
  onClick: () => void;
}) {
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

          {notification.urgent && (
            <span className="rounded bg-[#fff0f0] px-1.5 py-0.5 text-[8px] font-semibold text-[#d94b4b]">
              Urgent
            </span>
          )}
        </div>

        <p className="mt-1 truncate text-[10px] text-slate-500">
          {notification.description}
        </p>

        <p className="mt-1 text-[9px] text-slate-400">
          {notification.time}
        </p>

      </div>

      <div className="flex shrink-0 items-center gap-3">

        {notification.unread && (
          <span className="h-2 w-2 rounded-full bg-[#2783b1]" />
        )}

        <ChevronRight
          size={19}
          className="text-[#153e5b]"
        />

      </div>

    </button>
  );
}

// Notification Details Modal
function NotificationDetailsModal({
  notification,
  onClose,
}: {
  notification: NotificationItem;
  onClose: () => void;
}) {
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

          <button onClick={onClose}>
            <X size={20} className="text-slate-500" />
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

          <Detail
            label="Reference ID"
            value={notification.reference}
          />

          <Detail
            label="Description"
            value={notification.description}
          />

          <div>
            <p className="mb-2 text-[10px] text-slate-400">
              Details
            </p>

            <p className="rounded-lg bg-[#f5f8fa] p-3 text-xs leading-6 text-slate-600">
              {notification.details}
            </p>
          </div>

          <Detail
            label="Priority"
            value={notification.urgent ? "Urgent" : "Normal"}
          />

          <Detail
            label="Read status"
            value="Read"
          />

        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#267ba4] py-3 text-xs font-medium text-white hover:bg-[#1c668a]"
        >
          Close
        </button>

      </div>

    </div>
  );
}

// Preferences Modal
function PreferencesModal({
  preferences,
  togglePreference,
  onClose,
}: {
  preferences: {
    urgent: boolean;
    referrals: boolean;
    collaboration: boolean;
    resources: boolean;
    reporting: boolean;
    team: boolean;
    email: boolean;
    push: boolean;
  };
  togglePreference: (
    key: keyof typeof preferences
  ) => void;
  onClose: () => void;
}) {
  const options: {
    key: keyof typeof preferences;
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

          <button onClick={onClose}>
            <X size={20} className="text-slate-500" />
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
                aria-checked={preferences[option.key]}
                onClick={() => togglePreference(option.key)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                  preferences[option.key]
                    ? "bg-[#267ba4]"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                    preferences[option.key]
                      ? "left-[18px]"
                      : "left-0.5"
                  }`}
                />
              </button>

            </div>
          ))}

        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#267ba4] py-3 text-xs font-medium text-white hover:bg-[#1c668a]"
        >
          Save Preferences
        </button>

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
      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-[#153e5b]">
        {value}
      </p>
    </div>
  );
}

export default Notifications;
