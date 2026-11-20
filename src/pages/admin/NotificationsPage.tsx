import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Filter,
  HeartPulse,
  MapPin,
  Package,
  Search,
  Settings2,
  ShieldAlert,
  Users,
  X,
  Archive,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

type NotificationType =
  | "Emergency"
  | "Assistance"
  | "Volunteer"
  | "Resource"
  | "System";

type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  date: string;
  location?: string;
  unread: boolean;
  priority: "Critical" | "High" | "Normal";
  icon: typeof Bell;
  action?: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    type: "Emergency",
    title: "Flood warning escalated – Greater Riverton",
    message:
      "Water levels have risen above the warning threshold. Review the affected locations and coordinate the emergency response team.",
    time: "2 min ago",
    date: "Today",
    location: "Greater Riverton · North Ward",
    unread: true,
    priority: "Critical",
    icon: ShieldAlert,
    action: "View incident",
  },
  {
    id: 2,
    type: "Assistance",
    title: "New urgent assistance request",
    message:
      "A family of five has requested temporary shelter and drinking water. The request is awaiting assignment.",
    time: "14 min ago",
    date: "Today",
    location: "Central Clinic area",
    unread: true,
    priority: "High",
    icon: ClipboardList,
    action: "Review request",
  },
  {
    id: 3,
    type: "Volunteer",
    title: "Volunteer team check-in received",
    message:
      "Team Delta has checked in successfully. All 8 volunteers have been marked as available for the afternoon shift.",
    time: "32 min ago",
    date: "Today",
    location: "Riverton Community Centre",
    unread: true,
    priority: "Normal",
    icon: Users,
    action: "View team",
  },
  {
    id: 4,
    type: "Resource",
    title: "Low stock alert: drinking water",
    message:
      "The Central Warehouse has less than 20% of its target drinking-water stock remaining. Replenishment is recommended.",
    time: "1 hour ago",
    date: "Today",
    location: "Central Warehouse",
    unread: true,
    priority: "High",
    icon: Package,
    action: "View inventory",
  },
  {
    id: 5,
    type: "Emergency",
    title: "Shelter capacity nearing limit",
    message:
      "Riverton Primary School Shelter has reached 92% occupancy. Consider redirecting new arrivals to nearby shelters.",
    time: "2 hours ago",
    date: "Today",
    location: "Riverton Primary School",
    unread: false,
    priority: "High",
    icon: HeartPulse,
    action: "View shelter",
  },
  {
    id: 6,
    type: "System",
    title: "Daily operational summary is ready",
    message:
      "Your daily response summary includes 48 resolved requests, 12 active incidents and 6 pending verifications.",
    time: "8:00 AM",
    date: "Today",
    unread: false,
    priority: "Normal",
    icon: Info,
    action: "View summary",
  },
  {
    id: 7,
    type: "Assistance",
    title: "Assistance request successfully assigned",
    message:
      "Request REQ-2048 has been assigned to Case Manager N. Perera.",
    time: "Yesterday",
    date: "Yesterday",
    location: "East Riverton",
    unread: false,
    priority: "Normal",
    icon: CheckCircle2,
    action: "View request",
  },
  {
    id: 8,
    type: "Volunteer",
    title: "Volunteer verification completed",
    message:
      "Three volunteer profiles have passed identity verification and are ready for deployment.",
    time: "Yesterday",
    date: "Yesterday",
    unread: false,
    priority: "Normal",
    icon: Users,
    action: "View volunteers",
  },
];

const filters = ["All", "Unread", "Emergency", "Assistance", "Volunteer", "Resource", "System"];

const typeStyles: Record<NotificationType, { icon: string; badge: string }> = {
  Emergency: { icon: "bg-rose-50 text-rose-600", badge: "bg-rose-50 text-rose-700" },
  Assistance: { icon: "bg-blue-50 text-blue-600", badge: "bg-blue-50 text-blue-700" },
  Volunteer: { icon: "bg-violet-50 text-violet-600", badge: "bg-violet-50 text-violet-700" },
  Resource: { icon: "bg-amber-50 text-amber-700", badge: "bg-amber-50 text-amber-700" },
  System: { icon: "bg-emerald-50 text-emerald-700", badge: "bg-emerald-50 text-emerald-700" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priority, setPriority] = useState("All priorities");
  const [notice, setNotice] = useState("");

  const unreadCount = notifications.filter((item) => item.unread).length;

  const visibleNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesTab =
        activeFilter === "All" ||
        (activeFilter === "Unread" ? item.unread : item.type === activeFilter);
      const matchesSearch = `${item.title} ${item.message} ${item.location ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesPriority = priority === "All priorities" || item.priority === priority;
      return matchesTab && matchesSearch && matchesPriority;
    });
  }, [notifications, activeFilter, search, priority]);

  const markRead = (id: number) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  };

  const markAllRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
    setSelected([]);
    setNotice("All notifications marked as read.");
  };

  const archiveSelected = () => {
    setNotifications((current) => current.filter((item) => !selected.includes(item.id)));
    setSelected([]);
    setNotice("Selected notifications archived.");
  };

  const toggleSelected = (id: number) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const handleAction = (item: NotificationItem) => {
    markRead(item.id);
    setNotice(`${item.action ?? "Notification"} selected: ${item.title}`);
  };

  return (
    <div className="min-h-full bg-[#EFF6F8] text-[#173B59]">
      <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 xl:p-8">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-[11px] text-slate-500">
          <span>Operations</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-[#173B59]">Notifications</span>
        </div>

        {/* Page heading */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0F1F5] text-[#247DA8]">
                <Bell size={18} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#319A89]">
                Response centre
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#123B5B] sm:text-[30px]">
              Notifications
            </h1>
            <p className="mt-1 text-[12px] text-slate-500 sm:text-sm">
              Stay up to date with incidents, assistance requests and response activities.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#C8DCE5] bg-white px-3 text-[11px] font-semibold text-[#276F96] transition hover:bg-[#F4FAFC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={15} /> Mark all as read
            </button>
            <button
              onClick={() => setShowFilters((value) => !value)}
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-[11px] font-semibold transition ${
                showFilters
                  ? "border-[#247DA8] bg-[#E8F3F8] text-[#176F9F]"
                  : "border-[#C8DCE5] bg-white text-[#276F96] hover:bg-[#F4FAFC]"
              }`}
            >
              <Settings2 size={15} /> Preferences
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#D8E5EB] bg-white p-4 shadow-[0_4px_14px_rgba(24,62,86,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Total notifications</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Bell size={16} /></span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#123B5B]">{notifications.length}</p>
            <p className="mt-1 text-[10px] text-slate-400">Across all categories</p>
          </div>
          <div className="rounded-xl border border-[#D8E5EB] bg-white p-4 shadow-[0_4px_14px_rgba(24,62,86,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Unread notifications</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600"><Bell size={16} /></span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#123B5B]">{unreadCount}</p>
            <p className="mt-1 text-[10px] text-rose-600">Require your attention</p>
          </div>
          <div className="rounded-xl border border-[#D8E5EB] bg-white p-4 shadow-[0_4px_14px_rgba(24,62,86,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Critical alerts</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><AlertTriangle size={16} /></span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#123B5B]">
              {notifications.filter((item) => item.priority === "Critical").length}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">Emergency-level notifications</p>
          </div>
        </section>

        {/* Notification panel */}
        <section className="overflow-hidden rounded-xl border border-[#D8E5EB] bg-white shadow-[0_5px_18px_rgba(24,62,86,0.05)]">
          <div className="border-b border-[#E3EDF1] p-4 sm:p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#173B59]">All notifications</h2>
                <p className="mt-1 text-[10px] text-slate-400">
                  {unreadCount} unread · {notifications.length} total
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search notifications..."
                    className="h-10 w-full rounded-lg border border-[#D8E5EB] bg-[#FBFDFE] pl-9 pr-3 text-[11px] outline-none transition placeholder:text-slate-400 focus:border-[#2785B2] focus:ring-2 focus:ring-[#2785B2]/10"
                  />
                </div>
                <button
                  onClick={() => setShowFilters((value) => !value)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D8E5EB] px-3 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Filter size={14} /> Filter <ChevronDown size={13} />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 flex flex-col gap-3 rounded-lg bg-[#F5F9FB] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-[#173B59]">Advanced filters</p>
                  <p className="mt-1 text-[10px] text-slate-400">Narrow notifications by priority.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    className="h-9 rounded-lg border border-[#D8E5EB] bg-white px-3 text-[10px] outline-none"
                  >
                    <option>All priorities</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Normal</option>
                  </select>
                  <button
                    onClick={() => { setPriority("All priorities"); setSearch(""); }}
                    className="h-9 rounded-lg px-3 text-[10px] font-semibold text-[#247DA8] hover:bg-white"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
              {filters.map((filter) => {
                const count =
                  filter === "All"
                    ? notifications.length
                    : filter === "Unread"
                    ? unreadCount
                    : notifications.filter((item) => item.type === filter).length;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-semibold transition ${
                      activeFilter === filter
                        ? "bg-[#E7F2F7] text-[#176F9F]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#173B59]"
                    }`}
                  >
                    {filter}
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                      activeFilter === filter ? "bg-white text-[#176F9F]" : "bg-slate-100 text-slate-500"
                    }`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3EDF1] bg-[#F4F9FB] px-4 py-3">
              <span className="text-[11px] font-semibold text-[#173B59]">{selected.length} selected</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setNotifications((current) => current.map((item) =>
                      selected.includes(item.id) ? { ...item, unread: false } : item
                    ));
                    setSelected([]);
                    setNotice("Selected notifications marked as read.");
                  }}
                  className="rounded-md border border-[#C8DCE5] bg-white px-3 py-2 text-[10px] font-semibold text-[#247DA8]"
                >
                  Mark as read
                </button>
                <button onClick={archiveSelected} className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-3 py-2 text-[10px] font-semibold text-rose-600">
                  <Archive size={13} /> Archive
                </button>
              </div>
            </div>
          )}

          {notice && (
            <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-4 py-2.5 text-[10px] text-emerald-700">
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={14} /></button>
            </div>
          )}

          <div>
            {visibleNotifications.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-16 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Bell size={21} /></span>
                <h3 className="text-sm font-semibold text-[#173B59]">No notifications found</h3>
                <p className="mt-1 text-[11px] text-slate-400">Try changing your search or filters.</p>
              </div>
            ) : (
              visibleNotifications.map((item) => {
                const Icon = item.icon;
                const style = typeStyles[item.type];
                return (
                  <article
                    key={item.id}
                    className={`group flex gap-3 border-b border-[#EAF0F3] px-4 py-4 transition last:border-b-0 sm:gap-4 sm:px-5 ${
                      item.unread ? "bg-[#F7FBFD]" : "bg-white hover:bg-[#FBFDFE]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${item.title}`}
                      checked={selected.includes(item.id)}
                      onChange={() => toggleSelected(item.id)}
                      className="mt-3 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[#247DA8]"
                    />
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-[11px] ${item.unread ? "font-bold text-[#173B59]" : "font-semibold text-slate-700"}`}>
                          {item.title}
                        </h3>
                        {item.unread && <span className="h-1.5 w-1.5 rounded-full bg-[#2785B2]" />}
                        <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${style.badge}`}>{item.type}</span>
                        {item.priority === "Critical" && (
                          <span className="rounded-full bg-rose-100 px-2 py-1 text-[9px] font-semibold text-rose-700">Critical</span>
                        )}
                        {item.priority === "High" && (
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">High priority</span>
                        )}
                      </div>
                      <p className="mt-1.5 max-w-4xl text-[10px] leading-5 text-slate-500 sm:text-[11px]">{item.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-slate-400">
                        <span className="inline-flex items-center gap-1"><Clock3 size={11} />{item.time}</span>
                        {item.location && <span className="inline-flex items-center gap-1"><MapPin size={11} />{item.location}</span>}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {item.action && (
                          <button
                            onClick={() => handleAction(item)}
                            className="inline-flex items-center gap-1 rounded-md bg-[#EAF4F8] px-2.5 py-1.5 text-[9px] font-semibold text-[#176F9F] transition hover:bg-[#DCEEF5]"
                          >
                            {item.action} <ExternalLink size={10} />
                          </button>
                        )}
                        {item.unread && (
                          <button onClick={() => markRead(item.id)} className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[9px] font-semibold text-slate-500 hover:bg-slate-100">
                            <Check size={11} /> Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                    <span className="hidden shrink-0 pt-1 text-[9px] text-slate-400 sm:block">{item.date}</span>
                  </article>
                );
              })
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#E3EDF1] bg-[#FCFDFE] px-4 py-3 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>Showing {visibleNotifications.length} of {notifications.length} notifications</span>
            <span className="inline-flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-600" /> You are up to date with the latest alerts</span>
          </div>
        </section>

        <p className="mt-4 text-center text-[9px] text-slate-400">
          Notification data shown is sample data. Connect the notification API to receive live alerts.
        </p>
      </div>
    </div>
  );
}
