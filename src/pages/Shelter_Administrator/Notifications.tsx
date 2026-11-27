
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../services/api";
import {
  Search,
  Globe,
  Bell,
  CircleHelp,
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
  Settings,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Calendar,
} from "lucide-react";

type NotificationType =
  | "Critical"
  | "Requests"
  | "Inventory"
  | "System";

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  type: NotificationType;
  time: string;
  icon: string;
  unread: boolean;
  details: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "New critical accommodation request",
    description:
      "AR-2841 · Family of 6 in Riverside requires accessible shelter.",
    type: "Requests",
    time: "2 min ago",
    icon: "request",
    unread: true,
    details:
      "A new critical accommodation request has been submitted. A family of six in Riverside requires accessible shelter accommodation. Review the request and assign an appropriate shelter.",
  },
  {
    id: 2,
    title: "Shelter capacity warning",
    description:
      "Riverton Central has reached 92% occupancy.",
    type: "Critical",
    time: "18 min ago",
    icon: "warning",
    unread: true,
    details:
      "Riverton Central School has reached 92% occupancy. Review current allocations and consider redirecting incoming residents to alternative shelters.",
  },
  {
    id: 3,
    title: "Inventory below minimum level",
    description:
      "Family Food Packs are below the configured minimum.",
    type: "Inventory",
    time: "34 min ago",
    icon: "inventory",
    unread: true,
    details:
      "Family Food Packs have fallen below the configured minimum stock level. Review the inventory and arrange replenishment or redistribution.",
  },
  {
    id: 4,
    title: "Medical assistance request assigned",
    description:
      "HI-202 has been assigned to Dr. Malini Rao.",
    type: "Requests",
    time: "1 hr ago",
    icon: "medical",
    unread: false,
    details:
      "Medical incident HI-202 has been assigned to Dr. Malini Rao. The assigned medical officer can now review the case and provide assistance.",
  },
  {
    id: 5,
    title: "Maintenance request updated",
    description: "Water pump repair is now in progress.",
    type: "System",
    time: "2 hr ago",
    icon: "maintenance",
    unread: false,
    details:
      "The maintenance team has updated the water pump repair request. The repair is currently in progress.",
  },
  {
    id: 6,
    title: "New resident registration",
    description: "RES-10842 was checked into Room A-12.",
    type: "System",
    time: "3 hr ago",
    icon: "resident",
    unread: false,
    details:
      "Resident RES-10842 has successfully completed registration and has been checked into Room A-12.",
  },
  {
    id: 7,
    title: "Critical flood warning updated",
    description: "North Ward evacuation instructions have changed.",
    type: "Critical",
    time: "4 hr ago",
    icon: "warning",
    unread: true,
    details:
      "Updated flood evacuation instructions are available for North Ward. Review the latest disaster update before coordinating resident movements.",
  },
  {
    id: 8,
    title: "Resource distribution completed",
    description: "Food supplies delivered to North Community Hall.",
    type: "Inventory",
    time: "5 hr ago",
    icon: "inventory",
    unread: false,
    details:
      "The scheduled food supply distribution has been completed at North Community Hall.",
  },
  {
    id: 9,
    title: "Staff shift updated",
    description: "Evening shift coverage has been updated.",
    type: "System",
    time: "6 hr ago",
    icon: "resident",
    unread: false,
    details:
      "The shelter administrator has updated the evening shift schedule.",
  },
  {
    id: 10,
    title: "New accommodation request",
    description: "AR-2850 requires review and approval.",
    type: "Requests",
    time: "7 hr ago",
    icon: "request",
    unread: true,
    details:
      "A new accommodation request requires administrator review and shelter assignment.",
  },
  {
    id: 11,
    title: "First aid stock alert",
    description: "First Aid Kits are below the minimum quantity.",
    type: "Inventory",
    time: "8 hr ago",
    icon: "inventory",
    unread: true,
    details:
      "The available First Aid Kit stock has fallen below the configured minimum quantity.",
  },
  {
    id: 12,
    title: "Shelter inspection completed",
    description: "The latest safety inspection was completed.",
    type: "System",
    time: "9 hr ago",
    icon: "maintenance",
    unread: false,
    details:
      "The latest shelter safety inspection has been completed and recorded.",
  },
  {
    id: 13,
    title: "New resident assistance request",
    description: "A resident requires additional support.",
    type: "Requests",
    time: "10 hr ago",
    icon: "medical",
    unread: false,
    details: "A new resident assistance request has been recorded.",
  },
  {
    id: 14,
    title: "Resource delivery scheduled",
    description: "Additional supplies are expected tomorrow.",
    type: "Inventory",
    time: "11 hr ago",
    icon: "inventory",
    unread: false,
    details: "An additional resource delivery has been scheduled.",
  },
  {
    id: 15,
    title: "Shelter occupancy report generated",
    description: "The latest operational report is available.",
    type: "System",
    time: "12 hr ago",
    icon: "resident",
    unread: false,
    details: "The latest shelter occupancy report has been generated.",
  },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: i + 16,
    title: [
      "Volunteer assignment updated",
      "Shelter capacity reviewed",
      "New resource distribution recorded",
    ][i % 3],
    description: [
      "A new operational update is available.",
      "The shelter administration team has reviewed the latest records.",
      "Resource distribution records have been updated.",
    ][i % 3],
    type: (["System", "Critical", "Inventory"][i % 3]) as NotificationType,
    time: `${13 + i} hr ago`,
    icon: (["resident", "warning", "inventory"][i % 3]),
    unread: i % 3 === 0,
    details: "An operational notification has been recorded in CareLink.",
  })),
];

const tabs = [
  "All",
  "Unread",
  "Critical",
  "Requests",
  "Inventory",
  "System",
];

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState(initialNotifications);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] =
    useState<NotificationItem | null>(null);

  const [showPreferences, setShowPreferences] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiClient.get<any>("/notifications").then((res) => {
      const items = res?.items ?? (Array.isArray(res) ? res : null);
      if (items?.length) {
        setNotifications(
          items.map((n: any, idx: number) => ({
            id: Number(n.id) || idx + 1,
            title: n.title || "Notification",
            description: n.description || n.message || "",
            type: (n.type as NotificationType) || "System",
            time: n.time || "Recently",
            icon: n.icon || "resident",
            unread: n.unread !== undefined ? Boolean(n.unread) : !n.isRead,
            details: n.details || n.description || "",
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const [preferences, setPreferences] = useState({
    inApp: true,
    email: true,
    sms: false,
    critical: true,
    requests: true,
    inventory: true,
    system: false,
  });

  const unreadCount = notifications.filter(
    (n) => n.unread
  ).length;

  const criticalCount = notifications.filter(
    (n) => n.type === "Critical"
  ).length;

  const requestCount = notifications.filter(
    (n) => n.type === "Requests"
  ).length;

  const inventoryCount = notifications.filter(
    (n) => n.type === "Inventory"
  ).length;

  const filtered = useMemo(() => {
    let result = [...notifications];

    if (activeTab === "Unread") {
      result = result.filter((n) => n.unread);
    } else if (activeTab !== "All") {
      result = result.filter((n) => n.type === activeTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.details.toLowerCase().includes(q)
      );
    }

    return result;
  }, [notifications, activeTab, search]);

  const pageSize = 6;
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
    setMessage("All notifications marked as read.");
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, unread: false } : n
      )
    );
  };

  const openNotification = (item: NotificationItem) => {
    markAsRead(item.id);
    setSelected(item);
  };

  const savePreferences = () => {
    setShowPreferences(false);
    setMessage("Notification preferences saved.");
  };

  const getTabCount = (tab: string) => {
    if (tab === "All") return notifications.length;
    if (tab === "Unread") return unreadCount;
    return notifications.filter((n) => n.type === tab).length;
  };

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">

      {/* HEADER */}

      <header className="h-[55px] bg-white border-b border-slate-200 px-5 md:px-7 flex items-center justify-between gap-3">

        <div className="relative w-full max-w-[350px]">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            placeholder="Search residents, shelters, requests..."
            className="w-full h-[32px] bg-[#f5f9fa] border border-slate-200 rounded-lg pl-8 pr-3 text-sm sm:text-[15px] outline-none focus:border-[#45b99b]"
          />
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">

          <div className="hidden lg:block text-right mr-2">
            <p className="text-xs text-slate-400 uppercase">
              Operational Area
            </p>
            <p className="text-sm font-semibold mt-0.5">
              Greater Riverton
            </p>
          </div>

          <div className="hidden sm:block w-px h-7 bg-slate-200" />

          <button className="h-8 px-2 border border-slate-200 rounded-md flex items-center gap-1 text-xs">
            <Globe size={13} />
            EN
          </button>

          <button className="h-8 w-8 border border-slate-200 rounded-md flex items-center justify-center">
            <CircleHelp size={14} />
          </button>

          <button className="relative h-8 w-8 border border-slate-200 rounded-md flex items-center justify-center">
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-3 h-3 px-0.5 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2 ml-1">
            <div className="w-7 h-7 bg-[#1c638a] rounded-full text-white flex items-center justify-center text-xs font-bold">
              SA
            </div>
            <div>
              <p className="text-xs font-semibold">
                Sanjana A.
              </p>
              <p className="text-xs text-slate-400">
                Administrator
              </p>
            </div>
          </div>

          <ChevronRight size={12} className="hidden sm:block" />
        </div>
      </header>

      {/* MAIN */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-4 pb-8">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-xs mb-6">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="text-slate-400">
            Shelter Administration
          </span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="font-semibold">Notifications</span>
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Notifications
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Review operational alerts, assignments, and system updates.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              className="h-[31px] px-3 bg-white border border-[#aac4d2] rounded-md text-sm font-semibold hover:bg-slate-50"
            >
              <CheckCheck size={12} className="inline mr-1" />
              Mark all as read
            </button>

            <button
              onClick={() => setShowPreferences(true)}
              className="h-[31px] px-3 bg-[#1c638a] text-white rounded-md text-sm font-semibold hover:bg-[#144665]"
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
              className={`relative py-3 text-sm whitespace-nowrap transition ${
                activeTab === tab
                  ? "text-[#1c638a] font-bold"
                  : "text-slate-500 hover:text-[#1c638a]"
              }`}
            >
              {tab}

              {["All", "Unread", "Critical"].includes(tab) && (
                <span className="ml-1 bg-[#e6eff4] text-slate-500 rounded-full px-1.5 py-0.5 text-xs">
                  {getTabCount(tab)}
                </span>
              )}

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
            className="w-full h-9 bg-white border border-[#d5e3e9] rounded-lg pl-9 pr-3 text-sm sm:text-[15px] outline-none focus:border-[#45b99b]"
          />
        </div>

        {/* CONTENT GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3.5fr)_minmax(230px,0.9fr)] gap-3">

          {/* NOTIFICATION LIST */}

          <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">

            {pageItems.length > 0 ? (
              <div>
                {pageItems.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onClick={() => openNotification(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Inbox
                  size={30}
                  className="mx-auto text-slate-300"
                />
                <p className="text-sm font-semibold mt-3">
                  No notifications found
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try selecting another category or search term.
                </p>
              </div>
            )}

            {/* PAGINATION */}

            <div className="px-3 py-2 border-t border-slate-200 flex items-center justify-between">

              <span className="text-xs text-slate-400">
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                {"–"}
                {Math.min(currentPage * pageSize, filtered.length)}
                {" of "}
                {filtered.length}
              </span>

              <div className="flex items-center gap-1">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  className="h-7 px-3 border border-slate-200 rounded-md text-sm disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-md border text-sm ${
                      currentPage === page
                        ? "bg-[#1c638a] text-white border-[#1c638a]"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="h-7 px-3 border border-slate-200 rounded-md text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}

          <aside className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm p-3 h-fit">

            <h2 className="text-base sm:text-lg font-semibold mb-4">
              Notification summary
            </h2>

            <SummaryRow
              label="Unread"
              value={unreadCount}
            />

            <SummaryRow
              label="Critical"
              value={criticalCount}
              color="red"
            />

            <SummaryRow
              label="Requests"
              value={requestCount}
            />

            <SummaryRow
              label="Inventory"
              value={inventoryCount}
            />

            {/* DELIVERY STATUS */}

            <div className="border-t border-[#123e60] mt-3 pt-3">

              <h2 className="text-base sm:text-lg font-semibold mb-3">
                Delivery status
              </h2>

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
              <h2 className="text-lg font-semibold">
                Notification details
              </h2>

              <button onClick={() => setSelected(null)}>
                <X size={19} />
              </button>
            </div>

            <div className="mt-8">
              <NotificationIcon item={selected} />

              <span className="inline-block mt-4 text-xs font-semibold text-[#287da7] bg-[#eaf3f8] rounded px-2 py-1">
                {selected.type}
              </span>

              <h3 className="text-base font-semibold mt-3">
                {selected.title}
              </h3>

              <p className="text-xs text-slate-400 mt-2">
                {selected.time} · Notification ID #{selected.id}
              </p>
            </div>

            <div className="bg-[#f5f9fa] rounded-lg p-4 mt-7">
              <p className="text-sm font-semibold mb-2">
                Description
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {selected.description}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold mb-2">
                Additional information
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {selected.details}
              </p>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-5">
              <button
                onClick={() => setSelected(null)}
                className="w-full h-10 bg-[#1c638a] text-white rounded-lg text-sm font-semibold"
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
                <h2 className="text-lg sm:text-xl font-semibold">
                  Notification preferences
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage how you receive notifications.
                </p>
              </div>

              <button onClick={() => setShowPreferences(false)}>
                <X size={19} />
              </button>
            </div>

            <h3 className="text-base font-semibold mb-3">
              Delivery channels
            </h3>

            <PreferenceRow
              icon={<Bell size={15} />}
              label="In-app notifications"
              checked={preferences.inApp}
              onChange={(v) =>
                setPreferences({ ...preferences, inApp: v })
              }
            />

            <PreferenceRow
              icon={<Mail size={15} />}
              label="Email notifications"
              checked={preferences.email}
              onChange={(v) =>
                setPreferences({ ...preferences, email: v })
              }
            />

            <PreferenceRow
              icon={<Smartphone size={15} />}
              label="SMS notifications"
              checked={preferences.sms}
              onChange={(v) =>
                setPreferences({ ...preferences, sms: v })
              }
            />

            <div className="border-t border-slate-200 my-5" />

            <h3 className="text-base font-semibold mb-3">
              Notification categories
            </h3>

            {[
              ["Critical alerts", "critical"],
              ["Accommodation requests", "requests"],
              ["Inventory alerts", "inventory"],
              ["System updates", "system"],
            ].map(([label, key]) => (
              <PreferenceRow
                key={key}
                label={label}
                checked={
                  preferences[key as keyof typeof preferences]
                }
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
                onClick={() => setShowPreferences(false)}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={savePreferences}
                className="flex-1 h-10 bg-[#1c638a] text-white rounded-lg text-sm font-semibold"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}

      {message && (
        <div className="fixed bottom-5 right-5 z-[70] bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle2 size={16} />
          <p className="text-sm">{message}</p>
          <button onClick={() => setMessage("")}>
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

        <p className="text-xs font-bold text-[#123e60] truncate">
          {item.title}
        </p>

        <p className="text-xs text-slate-500 mt-1.5">
          {item.description}
        </p>

        <p className="text-xs text-slate-400 mt-2">
          {item.time}
        </p>
      </div>

      {item.unread && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#1c638a] shrink-0" />
      )}

      <ChevronRight
        size={13}
        className="text-[#123e60] shrink-0"
      />
    </button>
  );
}

/* ================= NOTIFICATION ICON ================= */

function NotificationIcon({
  item,
}: {
  item: NotificationItem;
}) {
  const config: Record<
    string,
    { icon: React.ReactNode; style: string }
  > = {
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
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span
        className={`text-sm font-bold ${
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
        <Check
          size={13}
          className="text-[#20b58b] shrink-0"
        />
      ) : (
        <AlertTriangle
          size={13}
          className="text-[#20b58b] shrink-0"
        />
      )}

      <span
        className={`text-xs ${
          type === "warning"
            ? "text-[#123e60]"
            : "text-slate-600"
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
        {icon && (
          <span className="text-[#287da7]">{icon}</span>
        )}
        <span className="text-sm text-slate-600">
          {label}
        </span>
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
