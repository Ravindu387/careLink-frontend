
import { useState } from "react";
import type { FormEvent } from "react";
import {
  Package, Warehouse, ClipboardList, GitBranch, Truck,
  ArrowLeftRight, ShoppingCart, BriefcaseBusiness,
  AlertTriangle, ChartNoAxesCombined, Clock3, Settings,
  Search, Bell, ShieldCheck, ChevronRight, Check,
  X, Menu, CircleAlert, Timer, CheckCircle2,
  CircleCheck, SlidersHorizontal
} from "lucide-react";

type AlertSeverity =
  | "Critical"
  | "Delayed"
  | "Low Stock"
  | "Near Capacity"
  | "Expiring Soon"
  | "Warning";

type AlertStatus = "Open" | "Acknowledged" | "Resolved";

type AlertItem = {
  id: number;
  title: string;
  description: string;
  location: string;
  time: string;
  severity: AlertSeverity;
  status: AlertStatus;
  icon: "alert" | "truck" | "warehouse" | "clock";
};

const initialAlerts: AlertItem[] = [
  {
    id: 1,
    title: "Critical stock shortage · Trauma Medical Kits",
    description: "Central Logistics Hub · 4 units available · threshold 20",
    location: "Central Logistics Hub",
    time: "8 min ago",
    severity: "Critical",
    status: "Open",
    icon: "alert"
  },
  {
    id: 2,
    title: "Dispatch delayed · DSP-1089 · Fuel delivery",
    description: "West Depot → Central Ward · ETA delayed by 42 minutes",
    location: "West Depot",
    time: "18 min ago",
    severity: "Delayed",
    status: "Open",
    icon: "truck"
  },
  {
    id: 3,
    title: "Low stock threshold · Family Food Packs",
    description: "North District Hub · 94 units available · 500 requested",
    location: "North District Hub",
    time: "26 min ago",
    severity: "Low Stock",
    status: "Open",
    icon: "alert"
  },
  {
    id: 4,
    title: "Warehouse capacity warning · North District Hub",
    description: "Storage utilization reached 91% · Rebalancing recommended",
    location: "North District Hub",
    time: "35 min ago",
    severity: "Near Capacity",
    status: "Open",
    icon: "warehouse"
  },
  {
    id: 5,
    title: "Expiring supplies · Medical Stock",
    description: "Medical supplies expiring within the next 7 days",
    location: "Central Logistics Hub",
    time: "42 min ago",
    severity: "Expiring Soon",
    status: "Acknowledged",
    icon: "clock"
  },
  {
    id: 6,
    title: "Procurement approval pending · PO-2025-174",
    description: "Shelter kits · Awaiting manager approval",
    location: "Central Logistics Hub",
    time: "1 hour ago",
    severity: "Warning",
    status: "Open",
    icon: "alert"
  },
  {
    id: 7,
    title: "Fuel stock below recommended level",
    description: "West Coast Depot · Replenishment required",
    location: "West Coast Depot",
    time: "2 hours ago",
    severity: "Low Stock",
    status: "Resolved",
    icon: "alert"
  },
  {
    id: 8,
    title: "Delivery route delay · DSP-1092",
    description: "North Ward · Delivery schedule updated",
    location: "North Ward",
    time: "3 hours ago",
    severity: "Delayed",
    status: "Acknowledged",
    icon: "truck"
  },
  {
    id: 9,
    title: "Warehouse temperature warning",
    description: "Eastbank Warehouse · Temperature requires inspection",
    location: "Eastbank Warehouse",
    time: "4 hours ago",
    severity: "Warning",
    status: "Resolved",
    icon: "warehouse"
  }
];

const navigation = [
  { label: "Inventory", icon: Package },
  { label: "Warehouses", icon: Warehouse },
  { label: "Resource Requests", icon: ClipboardList, count: 18 },
  { label: "Allocations", icon: GitBranch, count: 7 },
  { label: "Dispatch & Tracking", icon: Truck, count: 12 },
  { label: "Stock Transfers", icon: ArrowLeftRight },
  { label: "Procurement", icon: ShoppingCart },
  { label: "Suppliers", icon: BriefcaseBusiness },
  { label: "Alerts", icon: AlertTriangle, count: 9 },
  { label: "Reports & Analytics", icon: ChartNoAxesCombined },
  { label: "Audit Log", icon: Clock3 },
  { label: "Settings", icon: Settings }
];

const tabs = [
  "Open",
  "Critical",
  "Assigned to me",
  "Acknowledged",
  "Resolved"
];

const severityStyles: Record<AlertSeverity, string> = {
  Critical: "bg-red-50 text-red-700",
  Delayed: "bg-amber-50 text-amber-700",
  "Low Stock": "bg-amber-50 text-amber-700",
  "Near Capacity": "bg-amber-50 text-amber-700",
  "Expiring Soon": "bg-red-50 text-red-700",
  Warning: "bg-slate-100 text-slate-700"
};

function AlertIcon({ type }: { type: AlertItem["icon"] }) {
  const iconClass = "h-5 w-5";

  if (type === "truck") {
    return <Truck className={iconClass} />;
  }

  if (type === "warehouse") {
    return <Warehouse className={iconClass} />;
  }

  if (type === "clock") {
    return <Clock3 className={iconClass} />;
  }

  return <AlertTriangle className={iconClass} />;
}

function severityColor(severity: AlertSeverity) {
  if (severity === "Critical" || severity === "Expiring Soon") {
    return "bg-red-50 text-red-600";
  }

  if (severity === "Delayed") {
    return "bg-amber-50 text-amber-600";
  }

  if (severity === "Low Stock" || severity === "Near Capacity") {
    return "bg-amber-50 text-amber-600";
  }

  return "bg-slate-100 text-slate-600";
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);

  const [activeTab, setActiveTab] = useState("Open");
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const [showRules, setShowRules] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [rules, setRules] = useState({
    critical: true,
    lowStock: true,
    capacity: true,
    dispatch: true,
    expiry: true
  });

  // ALERT COUNTS
  const criticalCount = alerts.filter(
    a => a.severity === "Critical" && a.status !== "Resolved"
  ).length;

  const warningCount = alerts.filter(
    a => ["Warning", "Low Stock", "Near Capacity", "Expiring Soon", "Delayed"].includes(a.severity)
      && a.status !== "Resolved"
  ).length;

  const acknowledgedCount = alerts.filter(
    a => a.status === "Acknowledged"
  ).length;

  const resolvedCount = alerts.filter(
    a => a.status === "Resolved"
  ).length;

  // FILTER ALERTS
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = [
      alert.title,
      alert.description,
      alert.location,
      alert.severity
    ].join(" ").toLowerCase().includes(search.toLowerCase());

    const matchesTab =
      activeTab === "Open"
        ? alert.status === "Open"
        : activeTab === "Critical"
          ? alert.severity === "Critical" && alert.status !== "Resolved"
          : activeTab === "Assigned to me"
            ? alert.status === "Acknowledged"
            : activeTab === "Acknowledged"
              ? alert.status === "Acknowledged"
              : alert.status === "Resolved";

    return matchesSearch && matchesTab;
  });

  // REVIEW ALERT
  const handleReview = (alert: AlertItem) => {
    setSelectedAlert(alert);
  };

  // ACKNOWLEDGE ALERT
  const handleAcknowledge = (id: number) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id
          ? { ...alert, status: "Acknowledged" }
          : alert
      )
    );

    setSelectedAlert(null);
  };

  // RESOLVE ALERT
  const handleResolve = (id: number) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id
          ? { ...alert, status: "Resolved" }
          : alert
      )
    );

    setSelectedAlert(null);
  };

  // MARK ALL REVIEWED
  const handleMarkAllReviewed = () => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.status === "Open"
          ? { ...alert, status: "Acknowledged" }
          : alert
      )
    );
  };

  // SAVE ALERT RULES
  const handleSaveRules = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowRules(false);
  };

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#163d5c]">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#143d5e] text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* LOGO */}
        <div className="flex h-[74px] items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#62b7a8] text-[#143d5e]">
            <Package size={23} />
          </div>

          <div>
            <h1 className="text-xl font-bold">ReliefOS</h1>
            <p className="text-[10px] text-sky-200">
              Resource Management
            </p>
          </div>
        </div>

        {/* ACTIVE OPERATION */}
        <div className="mx-4 mt-4 rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Operation
          </p>

          <p className="mt-2 text-xs font-bold">
            Monsoon Floods 2025
          </p>

          <p className="mt-1 text-[10px] text-sky-200">
            Greater Riverton · Level 4
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map(item => {
            const Icon = item.icon;
            const active = item.label === "Alerts";

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (!active) {
                    alert(`${item.label} page is not connected yet.`);
                  }
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[11px] transition ${
                  active
                    ? "border-l-[3px] border-[#62b7a8] bg-[#287ba5] font-semibold text-white"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />

                <span className="flex-1">{item.label}</span>

                {"count" in item && item.count && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* PROFILE */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold">
            DP
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold">Daniel Perera</p>
            <p className="text-[10px] text-sky-200">
              Resource Manager
            </p>
          </div>

          <ChevronRight size={18} />
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[280px]">

        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 lg:px-7">

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="flex max-w-[480px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
            <Search size={16} className="text-slate-400" />

            <input
              placeholder="Search resources, requests, dispatches..."
              className="w-full bg-transparent text-xs outline-none"
            />

            <span className="hidden rounded border bg-white px-2 py-1 text-[9px] text-slate-400 sm:block">
              ⌘ K
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden border-r border-slate-200 pr-5 text-right md:block">
              <p className="text-[9px] uppercase text-slate-400">
                Primary Hub
              </p>
              <p className="text-[10px] font-bold">
                Central Logistics Hub
              </p>
            </div>

            <button className="hidden rounded-lg border p-2.5 sm:block">
              <ShieldCheck size={18} />
            </button>

            <button className="relative rounded-lg border p-2.5">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">
                {alerts.filter(a => a.status === "Open").length}
              </span>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold text-white">
              DP
            </div>

            <div className="hidden sm:block">
              <p className="text-[10px] font-bold">Daniel P.</p>
              <p className="text-[9px] text-slate-400">
                Resource Manager
              </p>
            </div>

            <ChevronRight size={17} className="hidden sm:block" />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="space-y-6 p-4 sm:p-6 lg:p-7">

          {/* BREADCRUMB */}
          <div className="text-[10px] text-slate-400">
            Resource Operations
            <ChevronRight size={12} className="mx-1 inline" />
            <span className="font-semibold text-[#163d5c]">
              Alerts
            </span>
          </div>

          {/* TITLE */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Alerts
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Resolve stock, capacity, dispatch, expiry, and procurement exceptions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleMarkAllReviewed}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-sky-700 hover:bg-slate-50"
              >
                Mark all reviewed
              </button>

              <button
                onClick={() => setShowRules(true)}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-3 text-xs font-semibold text-white hover:bg-[#1c668d]"
              >
                <SlidersHorizontal size={15} />
                Alert rules
              </button>
            </div>
          </section>

          {/* SUMMARY CARDS */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {[
              {
                title: "Critical alerts",
                value: criticalCount,
                note: "Immediate action needed",
                icon: AlertTriangle,
                color: "bg-red-50 text-red-600"
              },
              {
                title: "Warnings",
                value: warningCount,
                note: "Monitor or resolve today",
                icon: AlertTriangle,
                color: "bg-amber-50 text-amber-600"
              },
              {
                title: "Acknowledged",
                value: acknowledgedCount + 12,
                note: "Assigned to owners",
                icon: Check,
                color: "bg-sky-50 text-sky-700"
              },
              {
                title: "Resolved today",
                value: resolvedCount + 20,
                note: "Average 38 minutes",
                icon: Timer,
                color: "bg-emerald-50 text-emerald-600"
              }
            ].map(card => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}>
                    <Icon size={20} />
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">
                      {card.title}
                    </p>

                    <h3 className="text-2xl font-bold">
                      {card.value}
                    </h3>

                    <p className="text-[9px] text-slate-400">
                      {card.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* TABS */}
          <section>
            <div className="flex flex-wrap gap-6 border-b border-slate-200">
              {tabs.map(tab => {
                const count =
                  tab === "Open"
                    ? alerts.filter(a => a.status === "Open").length
                    : tab === "Critical"
                      ? criticalCount
                      : undefined;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex items-center gap-1.5 pb-4 text-[11px] ${
                      activeTab === tab
                        ? "font-bold text-sky-700"
                        : "text-slate-500 hover:text-sky-700"
                    }`}
                  >
                    {tab}

                    {count !== undefined && (
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px]">
                        {count}
                      </span>
                    )}

                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-700" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* SEARCH */}
          <section className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
            <Search size={17} className="text-slate-400" />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search alerts..."
              className="w-full py-3 text-xs outline-none"
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={16} className="text-slate-400" />
              </button>
            )}
          </section>

          {/* ALERT LIST */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-center gap-3 border-b border-slate-200 p-4 sm:gap-4 sm:p-5"
              >

                {/* ALERT ICON */}
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                  severityColor(alert.severity)
                }`}>
                  <AlertIcon type={alert.icon} />
                </div>

                {/* ALERT INFORMATION */}
                <div className="min-w-0 flex-1">

                  <div className="mb-1">
                    <span className={`rounded-md px-2 py-1 text-[9px] font-bold ${
                      severityStyles[alert.severity]
                    }`}>
                      {alert.severity}
                    </span>
                  </div>

                  <h3 className="text-[11px] font-bold text-slate-800">
                    {alert.title}
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {alert.description}
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">
                    {alert.time}
                  </p>

                  {alert.status !== "Open" && (
                    <p className={`mt-1 text-[9px] font-semibold ${
                      alert.status === "Resolved"
                        ? "text-emerald-600"
                        : "text-sky-700"
                    }`}>
                      {alert.status}
                    </p>
                  )}
                </div>

                {/* REVIEW BUTTON */}
                <button
                  onClick={() => handleReview(alert)}
                  className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[10px] font-semibold text-sky-700 hover:bg-sky-50"
                >
                  Review
                </button>

                <button
                  onClick={() => handleReview(alert)}
                  aria-label="View alert details"
                  className="shrink-0 text-slate-600 hover:text-sky-700"
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="p-12 text-center">
                <CircleCheck
                  size={35}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  No alerts found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  There are no alerts matching your selection.
                </p>
              </div>
            )}
          </section>

          {/* BOTTOM INFO */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <CircleCheck size={14} />
            Alerts are updated based on operational activity.
          </div>

        </div>
      </main>

      {/* REVIEW ALERT MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Alert Details
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Alert ID: ALT-{selectedAlert.id.toString().padStart(4, "0")}
                </p>
              </div>

              <button onClick={() => setSelectedAlert(null)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className={`mb-4 rounded-xl p-4 ${severityColor(selectedAlert.severity)}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} />

                <span className="text-xs font-bold">
                  {selectedAlert.severity} Alert
                </span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-800">
              {selectedAlert.title}
            </h4>

            <p className="mt-2 text-xs leading-6 text-slate-500">
              {selectedAlert.description}
            </p>

            <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">

              <div>
                <p className="text-[10px] text-slate-400">
                  Location
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  {selectedAlert.location}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400">
                  Reported
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  {selectedAlert.time}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400">
                  Current Status
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  {selectedAlert.status}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">

              <button
                onClick={() => setSelectedAlert(null)}
                className="rounded-lg border px-4 py-2.5 text-xs font-semibold text-slate-600"
              >
                Close
              </button>

              {selectedAlert.status !== "Resolved" && (
                <>
                  {selectedAlert.status === "Open" && (
                    <button
                      onClick={() => handleAcknowledge(selectedAlert.id)}
                      className="rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-800"
                    >
                      Acknowledge
                    </button>
                  )}

                  <button
                    onClick={() => handleResolve(selectedAlert.id)}
                    className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Mark Resolved
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ALERT RULES MODAL */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <form
            onSubmit={handleSaveRules}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Alert Rules
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Configure operational notifications.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRules(false)}
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {[
              ["critical", "Critical stock alerts"],
              ["lowStock", "Low stock notifications"],
              ["capacity", "Warehouse capacity warnings"],
              ["dispatch", "Dispatch delay alerts"],
              ["expiry", "Expiring resource notifications"]
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between border-b border-slate-100 py-4 text-xs font-medium text-slate-700"
              >
                {label}

                <input
                  type="checkbox"
                  checked={rules[key as keyof typeof rules]}
                  onChange={e =>
                    setRules(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))
                  }
                  className="h-4 w-4 accent-sky-700"
                />
              </label>
            ))}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="rounded-lg border px-4 py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-[#287ba5] px-4 py-2.5 text-xs font-semibold text-white"
              >
                Save Rules
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
