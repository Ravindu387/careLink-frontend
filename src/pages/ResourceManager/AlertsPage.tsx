import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Warehouse, ClipboardList, GitBranch, Truck,
  ArrowLeftRight, ShoppingCart, BriefcaseBusiness,
  AlertTriangle, ChartNoAxesCombined, Clock3, Settings,
  Search, Bell, ShieldCheck, ChevronRight, Check,
  X, Menu, Timer, CircleCheck, SlidersHorizontal,
  RefreshCw, Plus, Wifi, WifiOff
} from "lucide-react";

import { alertService } from "../../services/alertService";
import type {
  AlertItem,
  AlertSeverity,
  AlertStatus,
  AlertRules,
  CreateAlertPayload,
} from "../../types/alert";

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
  { label: "Inventory", path: "/resource-manager/inventory", icon: Package },
  { label: "Warehouses", path: "/resource-manager/warehouses", icon: Warehouse },
  { label: "Resource Requests", path: "/resource-manager/requests", icon: ClipboardList, count: 18 },
  { label: "Allocations", path: "/resource-manager/allocations", icon: GitBranch, count: 7 },
  { label: "Dispatch & Tracking", path: "/resource-manager/dispatch", icon: Truck, count: 12 },
  { label: "Stock Transfers", path: "/resource-manager/transfers", icon: ArrowLeftRight },
  { label: "Procurement", path: "/resource-manager/procurement", icon: ShoppingCart },
  { label: "Suppliers", path: "/resource-manager/suppliers", icon: BriefcaseBusiness },
  { label: "Alerts", path: "/resource-manager/alerts", icon: AlertTriangle, count: 9 },
  { label: "Reports & Analytics", path: "/resource-manager/reports", icon: ChartNoAxesCombined },
  { label: "Audit Log", path: "/resource-manager/audit-log", icon: Clock3 },
  { label: "Settings", path: "/resource-manager/settings", icon: Settings }
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
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [activeTab, setActiveTab] = useState("Open");
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const [showRules, setShowRules] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const [rules, setRules] = useState<AlertRules>({
    critical: true,
    lowStock: true,
    capacity: true,
    dispatch: true,
    expiry: true
  });

  const [newAlertForm, setNewAlertForm] = useState<CreateAlertPayload>({
    title: "",
    description: "",
    location: "Central Logistics Hub",
    severity: "Warning",
    icon: "alert"
  });

  // FETCH ALERTS & RULES FROM BACKEND
  const loadAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await alertService.getAlerts();
      if (data && Array.isArray(data) && data.length > 0) {
        setAlerts(data);
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("CareLink API not reachable, using local alerts:", err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRules = useCallback(async () => {
    try {
      const data = await alertService.getAlertRules();
      if (data) {
        setRules(data);
      }
    } catch {
      // Backend not running, use defaults
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    loadRules();
  }, [loadAlerts, loadRules]);

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
  const handleAcknowledge = async (id: number) => {
    setActionInProgress(id);
    try {
      await alertService.acknowledgeAlert(id);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, falling back to local update:", err);
    } finally {
      setActionInProgress(null);
    }

    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id
          ? { ...alert, status: "Acknowledged" as AlertStatus }
          : alert
      )
    );

    setSelectedAlert(null);
  };

  // RESOLVE ALERT
  const handleResolve = async (id: number) => {
    setActionInProgress(id);
    try {
      await alertService.resolveAlert(id);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, falling back to local update:", err);
    } finally {
      setActionInProgress(null);
    }

    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id
          ? { ...alert, status: "Resolved" as AlertStatus }
          : alert
      )
    );

    setSelectedAlert(null);
  };

  // MARK ALL REVIEWED
  const handleMarkAllReviewed = async () => {
    try {
      await alertService.markAllReviewed();
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, falling back to local update:", err);
    }

    setAlerts(prev =>
      prev.map(alert =>
        alert.status === "Open"
          ? { ...alert, status: "Acknowledged" as AlertStatus }
          : alert
      )
    );
  };

  // SAVE ALERT RULES
  const handleSaveRules = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await alertService.updateAlertRules(rules);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, saved locally:", err);
    }
    setShowRules(false);
  };

  // CREATE NEW ALERT
  const handleCreateAlert = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newAlertForm.title.trim()) return;

    try {
      const created = await alertService.createAlert(newAlertForm);
      setAlerts(prev => [created, ...prev]);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend error, adding locally:", err);
      const localAlert: AlertItem = {
        id: Math.max(...alerts.map(a => a.id), 0) + 1,
        title: newAlertForm.title,
        description: newAlertForm.description,
        location: newAlertForm.location,
        time: "Just now",
        severity: newAlertForm.severity,
        status: "Open",
        icon: (newAlertForm.icon as AlertItem["icon"]) || "alert"
      };
      setAlerts(prev => [localAlert, ...prev]);
    }

    setNewAlertForm({
      title: "",
      description: "",
      location: "Central Logistics Hub",
      severity: "Warning",
      icon: "alert"
    });
    setShowCreateModal(false);
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
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">ReliefOS</h1>
            <p className="text-sm text-sky-200">
              Resource Management
            </p>
          </div>
        </div>

        {/* ACTIVE OPERATION */}
        <div className="mx-4 mt-4 rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            ● Active Operation
          </p>

          <p className="mt-2 text-sm font-bold">
            Monsoon Floods 2025
          </p>

          <p className="mt-1 text-sm text-sky-200">
            Greater Riverton · Level 4
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map(item => {
            const Icon = item.icon;
            const active = item.label === "Alerts";

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (active) return;
                  if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                  active
                    ? "border-l-[3px] border-[#62b7a8] bg-[#287ba5] font-semibold text-white"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />

                <span className="flex-1">{item.label}</span>

                {"count" in item && item.count && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-xs">
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
            <p className="text-sm font-bold">Daniel Perera</p>
            <p className="text-sm text-sky-200">
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
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resources, requests, dispatches..."
              className="w-full bg-transparent text-sm sm:text-[15px] outline-none"
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={15} className="text-slate-400" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* BACKEND API STATUS BADGE */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
              {isBackendConnected ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Wifi size={12} /> Backend API Online
                  </span>
                </>
              ) : isBackendConnected === false ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-amber-700 font-medium flex items-center gap-1">
                    <WifiOff size={12} /> Local Fallback Mode
                  </span>
                </>
              ) : (
                <span className="text-slate-400">Connecting...</span>
              )}
            </div>

            <div className="hidden border-r border-slate-200 pr-5 text-right md:block">
              <p className="text-xs uppercase text-slate-400">
                Primary Hub
              </p>
              <p className="text-sm font-bold">
                Central Logistics Hub
              </p>
            </div>

            <button
              onClick={loadAlerts}
              title="Refresh alerts from backend"
              className="rounded-lg border p-2.5 text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={17} className={isLoading ? "animate-spin text-sky-700" : ""} />
            </button>

            <button className="hidden rounded-lg border p-2.5 sm:block">
              <ShieldCheck size={18} />
            </button>

            <button className="relative rounded-lg border p-2.5">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white">
                {alerts.filter(a => a.status === "Open").length}
              </span>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold text-white">
              DP
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold">Daniel P.</p>
              <p className="text-xs text-slate-400">
                Resource Manager
              </p>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="space-y-6 p-4 sm:p-6 lg:p-7">

          {/* BREADCRUMB */}
          <div className="text-[13px] text-slate-400">
            Resource Operations
            <ChevronRight size={12} className="mx-1 inline" />
            <span className="font-semibold text-[#163d5c]">
              Alerts
            </span>
          </div>

          {/* TITLE & ACTIONS */}
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Alerts
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Resolve stock, capacity, dispatch, expiry, and procurement exceptions in real-time.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                <Plus size={15} />
                New alert
              </button>

              <button
                onClick={handleMarkAllReviewed}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-sky-700 hover:bg-slate-50 transition"
              >
                Mark all reviewed
              </button>

              <button
                onClick={() => setShowRules(true)}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1c668d] transition"
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
                value: acknowledgedCount,
                note: "Assigned to owners",
                icon: Check,
                color: "bg-sky-50 text-sky-700"
              },
              {
                title: "Resolved",
                value: resolvedCount,
                note: "Closed & verified",
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
                    <p className="text-[13px] text-slate-400">
                      {card.title}
                    </p>

                    <h3 className="text-2xl font-bold">
                      {card.value}
                    </h3>

                    <p className="text-xs text-slate-400">
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
                    className={`relative flex items-center gap-1.5 pb-4 text-sm transition ${
                      activeTab === tab
                        ? "font-bold text-sky-700"
                        : "text-slate-500 hover:text-sky-700"
                    }`}
                  >
                    {tab}

                    {count !== undefined && (
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs">
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
              placeholder="Search alerts by title, description, location, or severity..."
              className="w-full py-3 text-sm sm:text-[15px] outline-none"
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
                className="flex items-center gap-3 border-b border-slate-200 p-4 sm:gap-4 sm:p-5 transition hover:bg-slate-50/50"
              >

                {/* ALERT ICON */}
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                  severityColor(alert.severity)
                }`}>
                  <AlertIcon type={alert.icon} />
                </div>

                {/* ALERT INFORMATION */}
                <div className="min-w-0 flex-1">

                  <div className="mb-1 flex items-center gap-2">
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${
                      severityStyles[alert.severity]
                    }`}>
                      {alert.severity}
                    </span>

                    <span className="text-[13px] text-slate-400">
                      ALT-{alert.id.toString().padStart(4, "0")}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800">
                    {alert.title}
                  </h3>

                  <p className="mt-1 text-[13px] text-slate-500">
                    {alert.description}
                  </p>

                  <div className="mt-1 flex items-center gap-3 text-[13px] text-slate-400">
                    <span>{alert.location}</span>
                    <span>•</span>
                    <span>{alert.time}</span>
                    {alert.status !== "Open" && (
                      <>
                        <span>•</span>
                        <span className={`font-semibold ${
                          alert.status === "Resolved"
                            ? "text-emerald-600"
                            : "text-sky-700"
                        }`}>
                          {alert.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="flex items-center gap-2">
                  {alert.status === "Open" && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={actionInProgress === alert.id}
                      className="hidden sm:inline-flex rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100 transition"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status !== "Resolved" && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      disabled={actionInProgress === alert.id}
                      className="hidden sm:inline-flex rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                    >
                      Resolve
                    </button>
                  )}

                  <button
                    onClick={() => handleReview(alert)}
                    className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => handleReview(alert)}
                    aria-label="View alert details"
                    className="shrink-0 text-slate-400 hover:text-sky-700 transition"
                  >
                    <ChevronRight size={19} />
                  </button>
                </div>
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
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <CircleCheck size={14} />
            Alerts synchronize with CareLink Logistics API backend.
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

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {selectedAlert.description}
            </p>

            <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">

              <div>
                <p className="text-[13px] text-slate-400">
                  Location
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedAlert.location}
                </p>
              </div>

              <div>
                <p className="text-[13px] text-slate-400">
                  Reported
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedAlert.time}
                </p>
              </div>

              <div>
                <p className="text-[13px] text-slate-400">
                  Current Status
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedAlert.status}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">

              <button
                onClick={() => setSelectedAlert(null)}
                className="rounded-lg border px-4 py-2.5 text-sm font-semibold text-slate-600"
              >
                Close
              </button>

              {selectedAlert.status !== "Resolved" && (
                <>
                  {selectedAlert.status === "Open" && (
                    <button
                      onClick={() => handleAcknowledge(selectedAlert.id)}
                      disabled={actionInProgress === selectedAlert.id}
                      className="rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"
                    >
                      Acknowledge
                    </button>
                  )}

                  <button
                    onClick={() => handleResolve(selectedAlert.id)}
                    disabled={actionInProgress === selectedAlert.id}
                    className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Mark Resolved
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE ALERT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={handleCreateAlert}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">New Resource Alert</h3>
                <p className="text-xs text-slate-400">Broadcast a logistics or resource alert</p>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Alert Title</label>
              <input
                required
                value={newAlertForm.title}
                onChange={e => setNewAlertForm({ ...newAlertForm, title: e.target.value })}
                placeholder="e.g. Critical stock shortage · Trauma Medical Kits"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Description</label>
              <textarea
                required
                rows={3}
                value={newAlertForm.description}
                onChange={e => setNewAlertForm({ ...newAlertForm, description: e.target.value })}
                placeholder="Provide details on quantity, thresholds, or affected units..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Severity</label>
                <select
                  value={newAlertForm.severity}
                  onChange={e => setNewAlertForm({ ...newAlertForm, severity: e.target.value as AlertSeverity })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500 bg-white"
                >
                  <option value="Critical">Critical</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Near Capacity">Near Capacity</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Warning">Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Category Icon</label>
                <select
                  value={newAlertForm.icon}
                  onChange={e => setNewAlertForm({ ...newAlertForm, icon: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500 bg-white"
                >
                  <option value="alert">Alert / Supplies</option>
                  <option value="truck">Dispatch / Vehicle</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="clock">Time / Expiry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Location / Hub</label>
              <input
                value={newAlertForm.location}
                onChange={e => setNewAlertForm({ ...newAlertForm, location: e.target.value })}
                placeholder="e.g. Central Logistics Hub"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Create Alert
              </button>
            </div>
          </form>
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
                  Configure operational notifications saved on the backend.
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
                className="flex cursor-pointer items-center justify-between border-b border-slate-100 py-4 text-sm font-medium text-slate-700"
              >
                {label}

                <input
                  type="checkbox"
                  checked={rules[key as keyof AlertRules]}
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
                className="rounded-lg border px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-[#287ba5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1c668d]"
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
