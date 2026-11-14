
import { useMemo, useState } from "react";
import {
  Search,
  Globe,
  Bell,
  CircleHelp,
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
  SlidersHorizontal,
} from "lucide-react";

type NotificationCategory =
  | "Flags"
  | "Verification"
  | "Campaigns"
  | "Allocation"
  | "Expenditure"
  | "Reports";

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  category: NotificationCategory;
  icon: "alert" | "clock" | "check" | "file" | "campaign" | "shield";
  unread: boolean;
  reference: string;
  details: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "High-risk contribution flagged",
    description: "DON-88398 · $18,420 requires investigation.",
    time: "3 min ago",
    category: "Flags",
    icon: "alert",
    unread: true,
    reference: "DON-88398",
    details:
      "A contribution of $18,420 has been flagged due to an unusual source pattern. An authorised investigator should review the donor information and supporting documents.",
  },
  {
    id: 2,
    title: "16 donations awaiting verification",
    description: "Combined value $82,400.",
    time: "18 min ago",
    category: "Verification",
    icon: "clock",
    unread: true,
    reference: "VER-0016",
    details:
      "There are 16 donations awaiting verification with a combined value of $82,400. Review the submitted donor information and supporting documents.",
  },
  {
    id: 3,
    title: "Allocation approved",
    description: "ALL-4408 · $180,000 shelter support.",
    time: "34 min ago",
    category: "Allocation",
    icon: "check",
    unread: true,
    reference: "ALL-4408",
    details:
      "The allocation of $180,000 for emergency shelter support has been approved. The allocation is associated with the Flood Response 2025 campaign.",
  },
  {
    id: 4,
    title: "Expenditure receipt uploaded",
    description: "EXP-9008 · Health Response Unit.",
    time: "1 hr ago",
    category: "Expenditure",
    icon: "file",
    unread: false,
    reference: "EXP-9008",
    details:
      "A new expenditure receipt has been uploaded by the Health Response Unit. The receipt requires verification against the approved expenditure.",
  },
  {
    id: 5,
    title: "Campaign reached 75%",
    description: "Clean Water Appeal · $318K raised.",
    time: "2 hr ago",
    category: "Campaigns",
    icon: "campaign",
    unread: false,
    reference: "CAM-112",
    details:
      "The Clean Water Appeal campaign has reached 75% of its fundraising target, with $318K raised so far.",
  },
  {
    id: 6,
    title: "Transparency report approved",
    description: "Weekly Funding Summary is ready to publish.",
    time: "3 hr ago",
    category: "Reports",
    icon: "shield",
    unread: false,
    reference: "REP-204",
    details:
      "The Weekly Funding Summary has passed its review process and is ready for publication after authorised approval.",
  },
  {
    id: 7,
    title: "New donor registration",
    description: "HealthAccess International · Verification submitted.",
    time: "4 hr ago",
    category: "Verification",
    icon: "check",
    unread: true,
    reference: "DNR-2028",
    details:
      "HealthAccess International submitted a new donor registration. Review the organisation profile and verification documents.",
  },
  {
    id: 8,
    title: "Campaign deadline approaching",
    description: "Emergency Shelter Fund · 3 days remaining.",
    time: "5 hr ago",
    category: "Campaigns",
    icon: "campaign",
    unread: true,
    reference: "CAM-108",
    details:
      "The Emergency Shelter Fund campaign is approaching its closing date. Review the fundraising progress and prepare the final report.",
  },
];

type TabName = "All" | "Unread" | "Flags" | "Verification" | "Campaigns";

const tabs: {
  label: TabName;
  count?: number;
}[] = [
  { label: "All", count: 28 },
  { label: "Unread", count: 9 },
  { label: "Flags", count: 5 },
  { label: "Verification" },
  { label: "Campaigns" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const [activeTab, setActiveTab] = useState<TabName>("All");

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const [showPreferences, setShowPreferences] = useState(false);

  const [preferences, setPreferences] = useState({
    inApp: true,
    email: true,
    sms: false,
    critical: true,
    verification: true,
    campaigns: true,
    reports: true,
  });

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [toast, setToast] = useState("");

  const rowsPerPage = 6;

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const unreadCount = notifications.filter(
    (n) => n.unread
  ).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Unread" && notification.unread) ||
        (activeTab === "Flags" &&
          notification.category === "Flags") ||
        (activeTab === "Verification" &&
          notification.category === "Verification") ||
        (activeTab === "Campaigns" &&
          notification.category === "Campaigns");

      const matchesSearch =
        notification.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        notification.description
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        notification.reference
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [notifications, activeTab, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / rowsPerPage)
  );

  const displayedNotifications = filteredNotifications.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );

    notify("All notifications marked as read.");
  };

  const openNotification = (notification: NotificationItem) => {
    setSelectedNotification(notification);

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notification.id
          ? { ...item, unread: false }
          : item
      )
    );
  };

  const iconConfig = {
    alert: {
      icon: AlertTriangle,
      style: "bg-[#fdebed] text-[#dc2626]",
    },
    clock: {
      icon: Clock,
      style: "bg-[#fff3dd] text-[#d28b18]",
    },
    check: {
      icon: Check,
      style: "bg-[#e5f6f0] text-[#159b79]",
    },
    file: {
      icon: FileText,
      style: "bg-[#e8f1f6] text-[#23749e]",
    },
    campaign: {
      icon: Megaphone,
      style: "bg-[#e5f6f0] text-[#159b79]",
    },
    shield: {
      icon: ShieldCheck,
      style: "bg-[#e8f1f6] text-[#23749e]",
    },
  };

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60]">

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 py-5">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-8">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={11} />
          <span className="text-slate-500">
            Funding & Donations
          </span>
          <ChevronRight size={11} />
          <span className="font-semibold">
            Notifications
          </span>
        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7">

          <div>
            <h1 className="text-[24px] font-medium">
              Notifications
            </h1>

            <p className="text-[11px] text-slate-500 mt-1">
              Review funding alerts, verification updates, approvals, and reporting deadlines.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={markAllAsRead}
              className="h-[37px] px-3 bg-white border border-[#b9cfda] rounded-lg text-[9px] hover:bg-[#f5fafc]"
            >
              Mark all as read
            </button>

            <button
              onClick={() => setShowPreferences(true)}
              className="h-[37px] px-4 bg-[#287ba5] text-white rounded-lg text-[9px] font-semibold hover:bg-[#1e6388]"
            >
              Preferences
            </button>

          </div>
        </div>

        {/* TABS */}

        <div className="flex items-center gap-6 border-b border-[#d5e3e9] mb-3 overflow-x-auto">

          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.label);
                setPage(1);
              }}
              className={`h-[39px] flex items-center gap-1.5 text-[9px] whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.label
                  ? "border-[#23749e] text-[#23749e] font-semibold"
                  : "border-transparent text-slate-500 hover:text-[#23749e]"
              }`}
            >
              {tab.label}

              {tab.count !== undefined && (
                <span className="bg-[#e8f1f6] text-[#23749e] rounded-full px-1.5 py-0.5 text-[8px]">
                  {tab.label === "Unread"
                    ? unreadCount
                    : tab.count}
                </span>
              )}
            </button>
          ))}

        </div>

        {/* NOTIFICATION LIST */}

        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">

          {displayedNotifications.map((notification) => {

            const Icon = iconConfig[notification.icon].icon;

            const iconStyle = iconConfig[notification.icon].style;

            return (
              <button
                key={notification.id}
                onClick={() => openNotification(notification)}
                className={`w-full min-h-[70px] px-3.5 py-3 border-b border-[#d5e3e9] flex items-center gap-3 text-left hover:bg-[#f1f8f7] transition-colors ${
                  notification.unread
                    ? "bg-[#f4faf8]"
                    : "bg-white"
                }`}
              >

                {/* ICON */}

                <div className={`w-[33px] h-[33px] rounded-lg flex items-center justify-center shrink-0 ${iconStyle}`}>
                  <Icon size={17} />
                </div>

                {/* CONTENT */}

                <div className="flex-1 min-w-0">

                  <p className="text-[9px] font-semibold text-[#123e60]">
                    {notification.title}
                  </p>

                  <p className="text-[8px] text-slate-500 mt-1">
                    {notification.description}
                  </p>

                  <p className="text-[8px] text-slate-400 mt-1">
                    {notification.time}
                  </p>

                </div>

                {/* UNREAD DOT */}

                {notification.unread && (
                  <span className="w-[7px] h-[7px] rounded-full bg-[#237ba7] shrink-0" />
                )}

                <ChevronRight
                  size={16}
                  className="text-[#123e60] shrink-0"
                />

              </button>
            );
          })}

          {/* EMPTY STATE */}

          {displayedNotifications.length === 0 && (
            <div className="py-16 text-center">

              <Bell
                size={30}
                className="mx-auto text-slate-300 mb-3"
              />

              <p className="text-[12px] font-semibold">
                No notifications found
              </p>

              <p className="text-[9px] text-slate-400 mt-1">
                There are no notifications matching your selection.
              </p>

            </div>
          )}

          {/* PAGINATION */}

          <div className="px-3.5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <p className="text-[9px] text-slate-400">
              Showing{" "}
              {filteredNotifications.length === 0
                ? 0
                : (page - 1) * rowsPerPage + 1}
              –
              {Math.min(
                page * rowsPerPage,
                filteredNotifications.length
              )}
              {" "}of {activeTab === "All" && !search ? 28 : filteredNotifications.length}
            </p>

            <div className="flex items-center gap-1.5">

              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-[29px] px-3 border border-[#d5e3e9] rounded-lg text-[9px] disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              ).map((number) => (
                <button
                  key={number}
                  onClick={() => setPage(number)}
                  className={`w-[28px] h-[29px] rounded-lg text-[9px] border ${
                    page === number
                      ? "bg-[#287ba5] text-white border-[#287ba5]"
                      : "bg-white border-[#d5e3e9]"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-[29px] px-3 border border-[#d5e3e9] rounded-lg text-[9px] disabled:opacity-40"
              >
                Next
              </button>

            </div>
          </div>

        </section>

      </main>

      {/* NOTIFICATION DETAILS MODAL */}

      {selectedNotification && (
        <Modal onClose={() => setSelectedNotification(null)}>

          <div className="w-10 h-10 rounded-lg bg-[#e8f1f6] flex items-center justify-center mb-4">
            <Bell size={19} className="text-[#23749e]" />
          </div>

          <p className="text-[8px] font-semibold text-[#23749e]">
            {selectedNotification.category}
          </p>

          <h2 className="text-[16px] font-semibold mt-1">
            {selectedNotification.title}
          </h2>

          <p className="text-[9px] text-slate-400 mt-2">
            {selectedNotification.time}
          </p>

          <div className="bg-[#f5f9fa] rounded-lg p-4 mt-5">

            <p className="text-[9px] font-semibold mb-2">
              Notification details
            </p>

            <p className="text-[9px] text-slate-500 leading-relaxed">
              {selectedNotification.details}
            </p>

          </div>

          <div className="mt-4 flex justify-between items-center">

            <span className="text-[9px] text-slate-400">
              Reference: {selectedNotification.reference}
            </span>

            <span className="text-[8px] text-[#078c70] flex items-center gap-1">
              <CheckCircle2 size={12} />
              Read
            </span>

          </div>

          <button
            onClick={() => setSelectedNotification(null)}
            className="w-full mt-6 h-10 bg-[#287ba5] text-white rounded-lg text-[10px] font-semibold"
          >
            Close
          </button>

        </Modal>
      )}

      {/* PREFERENCES MODAL */}

      {showPreferences && (
        <Modal onClose={() => setShowPreferences(false)}>

          <div className="w-10 h-10 rounded-lg bg-[#e8f1f6] flex items-center justify-center mb-4">
            <Settings size={20} className="text-[#23749e]" />
          </div>

          <h2 className="text-[16px] font-semibold">
            Notification preferences
          </h2>

          <p className="text-[9px] text-slate-400 mt-1 mb-5">
            Manage how you receive funding and donation updates.
          </p>

          <div className="space-y-5">

            <PreferenceSection title="Delivery channels">

              <PreferenceToggle
                label="In-app notifications"
                description="Receive alerts inside CareLink."
                checked={preferences.inApp}
                onChange={(value) =>
                  setPreferences((p) => ({
                    ...p,
                    inApp: value,
                  }))
                }
              />

              <PreferenceToggle
                label="Email notifications"
                description="Receive updates through email."
                checked={preferences.email}
                onChange={(value) =>
                  setPreferences((p) => ({
                    ...p,
                    email: value,
                  }))
                }
              />

              <PreferenceToggle
                label="SMS notifications"
                description="Receive important updates through SMS."
                checked={preferences.sms}
                onChange={(value) =>
                  setPreferences((p) => ({
                    ...p,
                    sms: value,
                  }))
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
                  setPreferences((p) => ({
                    ...p,
                    critical: value,
                  }))
                }
              />

              <PreferenceToggle
                label="Verification updates"
                description="Donor and contribution verification."
                checked={preferences.verification}
                onChange={(value) =>
                  setPreferences((p) => ({
                    ...p,
                    verification: value,
                  }))
                }
              />

              <PreferenceToggle
                label="Campaign updates"
                description="Campaign progress and deadlines."
                checked={preferences.campaigns}
                onChange={(value) =>
                  setPreferences((p) => ({
                    ...p,
                    campaigns: value,
                  }))
                }
              />

              <PreferenceToggle
                label="Reports and approvals"
                description="Transparency reports and approvals."
                checked={preferences.reports}
                onChange={(value) =>
                  setPreferences((p) => ({
                    ...p,
                    reports: value,
                  }))
                }
              />

            </PreferenceSection>

          </div>

          <button
            onClick={() => {
              setShowPreferences(false);
              notify("Notification preferences saved.");
            }}
            className="w-full mt-6 h-10 bg-[#287ba5] text-white rounded-lg text-[10px] font-semibold"
          >
            Save preferences
          </button>

        </Modal>
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] bg-[#143d5c] text-white rounded-lg px-4 py-3 shadow-xl flex items-center gap-3 text-[10px]">
          <CheckCircle2 size={15} />
          {toast}

          <button onClick={() => setToast("")}>
            <X size={13} />
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
      className="fixed inset-0 z-[80] bg-[#102d42]/45 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-[460px] max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-5 relative">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-red-500"
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
      <h3 className="text-[10px] font-semibold mb-3">
        {title}
      </h3>

      <div className="space-y-3">
        {children}
      </div>
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
        <p className="text-[9px] font-medium">
          {label}
        </p>

        <p className="text-[8px] text-slate-400 mt-0.5">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
          checked ? "bg-[#287ba5]" : "bg-slate-300"
        }`}
      >
        <span
          className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>

    </div>
  );
}
