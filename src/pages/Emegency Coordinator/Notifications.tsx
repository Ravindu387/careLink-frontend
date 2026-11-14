
import { useMemo, useState } from "react";
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
} from "lucide-react";

type NotificationType =
  | "critical"
  | "ai"
  | "resource"
  | "shelter"
  | "partner"
  | "report";

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  category: NotificationType;
  unread: boolean;
  reference: string;
  details: string;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Critical request overdue",
    description: "REQ-2821 exceeded critical response SLA.",
    time: "3 min ago",
    category: "critical",
    unread: true,
    reference: "REQ-2821",
    details:
      "This critical assistance request has exceeded the expected response time. Immediate coordinator review and escalation are required.",
  },
  {
    id: 2,
    title: "AI recommendation awaiting review",
    description: "REQ-2841 · Critical · 94% confidence.",
    time: "12 min ago",
    category: "ai",
    unread: true,
    reference: "REQ-2841",
    details:
      "Priority Assist AI recommends Critical priority based on verified flood risk and vulnerable household information. An authorised coordinator must review this recommendation.",
  },
  {
    id: 3,
    title: "Critical medical stock alert",
    description: "Trauma kits at 25% availability.",
    time: "24 min ago",
    category: "resource",
    unread: true,
    reference: "RES-102",
    details:
      "Available trauma kit inventory has reached a critical level. Resource managers should review stock and arrange emergency replenishment.",
  },
  {
    id: 4,
    title: "Shelter reached full capacity",
    description: "St. Mary Civic Centre cannot accept arrivals.",
    time: "38 min ago",
    category: "shelter",
    unread: false,
    reference: "SH-003",
    details:
      "St. Mary Civic Centre has reached its maximum accommodation capacity. New arrivals should be redirected to alternative available shelters.",
  },
  {
    id: 5,
    title: "Partner collaboration accepted",
    description: "Global Relief Network accepted food response role.",
    time: "1 hr ago",
    category: "partner",
    unread: false,
    reference: "ORG-027",
    details:
      "Global Relief Network has accepted the assigned food response responsibility. Coordination teams can now proceed with the shared operation.",
  },
  {
    id: 6,
    title: "Situation report ready for approval",
    description: "SITREP 025 draft is complete.",
    time: "2 hr ago",
    category: "report",
    unread: false,
    reference: "SITREP-025",
    details:
      "The latest situation report draft is ready for review. An authorised coordinator should verify the report before approval and distribution.",
  },
  {
    id: 7,
    title: "Resource dispatch completed",
    description: "DEP-104 delivered to Eastbank.",
    time: "3 hr ago",
    category: "resource",
    unread: true,
    reference: "DEP-104",
    details:
      "Emergency resources have been successfully delivered to the Eastbank operational area.",
  },
  {
    id: 8,
    title: "New assistance request received",
    description: "REQ-2845 · North Ward · High priority.",
    time: "4 hr ago",
    category: "critical",
    unread: false,
    reference: "REQ-2845",
    details:
      "A new assistance request has been submitted from North Ward and requires verification by the emergency coordination team.",
  },
  {
    id: 9,
    title: "AI review completed",
    description: "REQ-2836 recommendation approved.",
    time: "5 hr ago",
    category: "ai",
    unread: false,
    reference: "REQ-2836",
    details:
      "The AI priority recommendation has been reviewed and approved by an authorised coordinator.",
  },
  {
    id: 10,
    title: "Shelter capacity warning",
    description: "Riverton High School at 92% capacity.",
    time: "6 hr ago",
    category: "shelter",
    unread: true,
    reference: "SH-001",
    details:
      "Riverton High School is approaching full capacity. Monitor incoming arrivals and prepare alternative shelter arrangements.",
  },
  {
    id: 11,
    title: "Partner verification completed",
    description: "National Disaster Authority verified.",
    time: "7 hr ago",
    category: "partner",
    unread: false,
    reference: "ORG-001",
    details:
      "The partner organisation verification process has been completed successfully.",
  },
  {
    id: 12,
    title: "Situation report published",
    description: "SITREP 024 distributed to partners.",
    time: "8 hr ago",
    category: "report",
    unread: false,
    reference: "SITREP-024",
    details:
      "The approved situation report has been published and distributed to registered partner organisations.",
  },
];

const tabs = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Critical", value: "critical" },
  { label: "AI Review", value: "ai" },
  { label: "Resources", value: "resource" },
];

const iconMap = {
  critical: AlertTriangle,
  ai: Sparkles,
  resource: Package,
  shelter: House,
  partner: Building2,
  report: FileText,
};

const colorMap = {
  critical: "bg-red-50 text-red-600",
  ai: "bg-purple-50 text-purple-600",
  resource: "bg-amber-50 text-amber-600",
  shelter: "bg-red-50 text-red-600",
  partner: "bg-emerald-50 text-emerald-600",
  report: "bg-sky-50 text-sky-600",
};

export default function Notifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] =
    useState<Notification | null>(null);

  const [showPreferences, setShowPreferences] =
    useState(false);

  const [preferences, setPreferences] = useState({
    critical: true,
    ai: true,
    resources: true,
    shelter: true,
    partner: true,
    reports: true,
  });

  const [unreadOnly] = useState(false);

  const unreadCount = notifications.filter(
    (item) => item.unread
  ).length;

  const counts = {
    all: notifications.length,
    unread: unreadCount,
    critical: notifications.filter(
      (item) => item.category === "critical"
    ).length,
    ai: notifications.filter(
      (item) => item.category === "ai"
    ).length,
    resource: notifications.filter(
      (item) => item.category === "resource"
    ).length,
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === "unread") return item.unread;
      if (activeTab !== "all" && item.category !== activeTab)
        return false;
      if (unreadOnly && !item.unread) return false;

      return true;
    });
  }, [notifications, activeTab, unreadOnly]);

  const pageSize = 6;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / pageSize)
  );

  const currentNotifications = filteredNotifications.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        unread: false,
      }))
    );
  };

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, unread: false }
          : item
      )
    );
  };

  const openNotification = (item: Notification) => {
    setSelected(item);
    markRead(item.id);
  };

  const changeTab = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#edf4f6] px-4 py-6 sm:px-6 lg:px-7">

      {/* Page Header */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            Notifications
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Review operational alerts, decisions, assignments,
            and cross-organisation updates.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="rounded-lg border border-[#c5d9e3] bg-white px-4 py-2.5 text-xs font-semibold text-[#175477] hover:bg-sky-50 disabled:opacity-50"
          >
            Mark all as read
          </button>

          <button
            onClick={() => setShowPreferences(true)}
            className="rounded-lg bg-[#287da5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#216789]"
          >
            Preferences
          </button>

        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-6 border-b border-[#d4e2e9]">

        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => changeTab(tab.value)}
              className={`flex items-center gap-2 border-b-2 px-0 py-3 text-[11px] transition ${
                isActive
                  ? "border-[#287da5] font-semibold text-[#287da5]"
                  : "border-transparent text-slate-500 hover:text-[#287da5]"
              }`}
            >
              {tab.label}

              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                  isActive
                    ? "bg-[#e4f0f6] text-[#287da5]"
                    : "bg-[#e9eff2] text-slate-500"
                }`}
              >
                {counts[tab.value as keyof typeof counts]}
              </span>

            </button>
          );
        })}

      </div>

      {/* Notification Card */}
      <div className="overflow-hidden rounded-xl border border-[#d4e2e9] bg-white shadow-sm">

        {/* Notification list */}
        <div>

          {currentNotifications.map((item) => {
            const Icon = iconMap[item.category];

            return (
              <div
                key={item.id}
                onClick={() => openNotification(item)}
                className={`group flex cursor-pointer items-center gap-3 border-b border-[#dce7ec] px-3 py-4 transition hover:bg-[#eef6f8] sm:px-4 ${
                  item.unread ? "bg-[#f3f9f8]" : "bg-white"
                }`}
              >

                {/* Icon */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    colorMap[item.category]
                  }`}
                >
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="text-[11px] font-semibold text-[#153f5e]">
                      {item.title}
                    </h3>

                  </div>

                  <p className="mt-1 truncate text-[10px] text-slate-500">
                    {item.description}
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">
                    {item.time}
                  </p>

                </div>

                {/* Unread indicator */}
                <div className="flex shrink-0 items-center gap-3">

                  {item.unread && (
                    <span
                      className="h-2 w-2 rounded-full bg-[#287da5]"
                      title="Unread"
                    />
                  )}

                  <ChevronRight
                    size={19}
                    className="text-[#153f5e] transition group-hover:translate-x-1"
                  />

                </div>

              </div>
            );
          })}

          {currentNotifications.length === 0 && (
            <div className="flex min-h-[300px] flex-col items-center justify-center">

              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4f6]">
                <Bell size={25} className="text-[#287da5]" />
              </div>

              <h3 className="text-sm font-semibold text-[#153f5e]">
                No notifications found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                There are no notifications in this category.
              </p>

            </div>
          )}

        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">

          <p className="text-[10px] text-slate-500">
            Showing{" "}
            {filteredNotifications.length === 0
              ? 0
              : (page - 1) * pageSize + 1}
            –
            {Math.min(
              page * pageSize,
              filteredNotifications.length
            )}{" "}
            of {filteredNotifications.length}
          </p>

          <div className="flex items-center gap-2">

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[#d4e2e9] px-3 py-2 text-[10px] text-[#287da5] hover:bg-sky-50 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from(
              { length: Math.min(totalPages, 3) },
              (_, i) => i + 1
            ).map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`h-8 min-w-8 rounded-lg border text-[10px] ${
                  page === number
                    ? "border-[#287da5] bg-[#287da5] text-white"
                    : "border-[#d4e2e9] text-[#153f5e] hover:bg-sky-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              className="rounded-lg border border-[#d4e2e9] px-3 py-2 text-[10px] text-[#287da5] hover:bg-sky-50 disabled:opacity-40"
            >
              Next
            </button>

          </div>
        </div>

      </div>

      {/* Notification Details Modal */}
      {selected && (
        <Modal
          title="Notification details"
          onClose={() => setSelected(null)}
        >

          <div className="mb-4 flex items-center gap-3">

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                colorMap[selected.category]
              }`}
            >
              {(() => {
                const Icon = iconMap[selected.category];
                return <Icon size={21} />;
              })()}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#153f5e]">
                {selected.title}
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                {selected.time}
              </p>
            </div>

          </div>

          <div className="space-y-3">

            <Detail label="Reference ID" value={selected.reference} />

            <Detail label="Category" value={selected.category} />

            <Detail label="Time received" value={selected.time} />

            <div className="rounded-lg bg-[#f1f6f8] p-3">

              <p className="mb-2 text-[10px] font-semibold text-[#153f5e]">
                Description
              </p>

              <p className="text-xs leading-6 text-slate-600">
                {selected.details}
              </p>

            </div>

          </div>

          <button
            onClick={() => setSelected(null)}
            className="mt-5 w-full rounded-lg bg-[#287da5] py-2.5 text-xs font-semibold text-white hover:bg-[#216789]"
          >
            Close
          </button>

        </Modal>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <Modal
          title="Notification preferences"
          onClose={() => setShowPreferences(false)}
        >

          <p className="mb-4 text-xs text-slate-500">
            Choose which operational notifications you want
            to receive.
          </p>

          <div className="space-y-3">

            {(
              [
                ["critical", "Critical alerts"],
                ["ai", "AI recommendations"],
                ["resources", "Resource alerts"],
                ["shelter", "Shelter updates"],
                ["partner", "Partner updates"],
                ["reports", "Situation reports"],
              ] as const
            ).map(([key, label]) => (

              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-[#e0e9ed] p-3 hover:bg-[#f5f9fa]"
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
                  className="h-4 w-4 accent-[#287da5]"
                />

              </label>
            ))}

          </div>

          <button
            onClick={() => setShowPreferences(false)}
            className="mt-5 w-full rounded-lg bg-[#287da5] py-2.5 text-xs font-semibold text-white hover:bg-[#216789]"
          >
            Save preferences
          </button>

        </Modal>
      )}

    </div>
  );
}

// Reusable Modal
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-base font-semibold text-[#153f5e]">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>

        </div>

        {children}

      </div>

    </div>
  );
}

// Detail component
function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 pb-3">

      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="text-right text-xs font-medium capitalize text-[#153f5e]">
        {value}
      </span>

    </div>
  );
}
