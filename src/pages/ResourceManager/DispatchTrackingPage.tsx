
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Truck, Package, Warehouse, ClipboardList, GitBranch,
  ArrowLeftRight, ShoppingCart, BriefcaseBusiness,
  AlertTriangle, ChartNoAxesCombined, Clock3, Settings,
  Search, Bell, ShieldCheck, ChevronRight, ChevronDown,
  Plus, Download, Check, Filter, X, Menu
} from "lucide-react";

type Status = "In Transit" | "Delayed" | "Delivered" | "Pending";

type Dispatch = {
  id: string;
  route: string;
  resource: string;
  quantity: string;
  vehicle: string;
  driver: string;
  departed: string;
  eta: string;
  status: Status;
};

const initialData: Dispatch[] = [
  {
    id: "DSP-1092", route: "Central Hub → North Ward",
    resource: "Drinking Water", quantity: "2,400 units",
    vehicle: "Truck · RT-204", driver: "Amir Khan",
    departed: "13:28", eta: "14:12", status: "In Transit"
  },
  {
    id: "DSP-1089", route: "West Depot → Central Ward",
    resource: "Fuel · Diesel", quantity: "1,200 L",
    vehicle: "Tanker · TK-018", driver: "L. Perera",
    departed: "12:55", eta: "13:48", status: "Delayed"
  },
  {
    id: "DSP-1084", route: "Eastbank → CareLink Shelter",
    resource: "Shelter Kits", quantity: "80 units",
    vehicle: "Truck · RT-118", driver: "N. Okafor",
    departed: "11:22", eta: "12:14", status: "Delivered"
  },
  {
    id: "DSP-1078", route: "North Hub → Riverton High",
    resource: "Food Packs", quantity: "420 units",
    vehicle: "Van · VN-042", driver: "S. Mensah",
    departed: "10:42", eta: "11:38", status: "Delivered"
  },
  {
    id: "DSP-1075", route: "Central Hub → South Shelter",
    resource: "Medical Kits", quantity: "150 units",
    vehicle: "Truck · RT-205", driver: "Daniel Silva",
    departed: "09:15", eta: "10:30", status: "In Transit"
  },
  {
    id: "DSP-1072", route: "West Depot → Eastbank",
    resource: "Hygiene Kits", quantity: "300 units",
    vehicle: "Van · VN-051", driver: "A. Fernando",
    departed: "08:45", eta: "09:50", status: "Pending"
  },
  {
    id: "DSP-1069", route: "North Hub → Central Ward",
    resource: "Thermal Blankets", quantity: "200 units",
    vehicle: "Truck · RT-120", driver: "M. Perera",
    departed: "07:30", eta: "08:45", status: "Delayed"
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

const tabs = ["All", "Needs action", "Active", "Completed", "Exceptions"];

const statusColor: Record<Status, string> = {
  "In Transit": "bg-sky-50 text-sky-700",
  Delayed: "bg-amber-50 text-amber-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Pending: "bg-slate-100 text-slate-600"
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-500";

export default function DispatchTrackingPage() {
  const [dispatches, setDispatches] = useState(initialData);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [route, setRoute] = useState("All routes");
  const [vehicle, setVehicle] = useState("All vehicles");
  const [status, setStatus] = useState("All delivery states");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Dispatch | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [newDispatch, setNewDispatch] = useState({
    from: "Central Hub",
    to: "",
    resource: "",
    quantity: "",
    vehicle: "",
    driver: "",
    eta: ""
  });

  const pageSize = 4;

  const filtered = useMemo(() => {
    return dispatches.filter((item) => {
      const matchesSearch =
        Object.values(item).join(" ").toLowerCase()
          .includes(search.toLowerCase());

      const matchesRoute =
        route === "All routes" || item.route === route;

      const matchesVehicle =
        vehicle === "All vehicles" || item.vehicle === vehicle;

      const matchesStatus =
        status === "All delivery states" || item.status === status;

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          ["Delayed", "Pending"].includes(item.status)) ||
        (activeTab === "Active" && item.status === "In Transit") ||
        (activeTab === "Completed" && item.status === "Delivered") ||
        (activeTab === "Exceptions" && item.status === "Delayed");

      return matchesSearch && matchesRoute &&
        matchesVehicle && matchesStatus && matchesTab;
    });
  }, [dispatches, search, route, vehicle, status, activeTab]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const counts = {
    active: dispatches.filter(d => d.status !== "Delivered").length,
    onSchedule: dispatches.filter(d => d.status === "In Transit").length,
    delayed: dispatches.filter(d => d.status === "Delayed").length,
    delivered: dispatches.filter(d => d.status === "Delivered").length
  };

  const needsAction = dispatches.filter(
    d => d.status === "Delayed" || d.status === "Pending"
  ).length;

  const resetFilters = () => {
    setSearch("");
    setRoute("All routes");
    setVehicle("All vehicles");
    setStatus("All delivery states");
    setActiveTab("All");
    setPage(1);
  };

  const createDispatch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !newDispatch.to.trim() ||
      !newDispatch.resource.trim() ||
      !newDispatch.quantity.trim() ||
      !newDispatch.vehicle.trim() ||
      !newDispatch.driver.trim() ||
      !newDispatch.eta
    ) return;

    const nextId =
      Math.max(...dispatches.map(d => Number(d.id.split("-")[1])), 1092) + 1;

    const now = new Date();
    const departed = now.toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit"
    });

    const item: Dispatch = {
      id: `DSP-${nextId}`,
      route: `${newDispatch.from} → ${newDispatch.to}`,
      resource: newDispatch.resource,
      quantity: newDispatch.quantity,
      vehicle: newDispatch.vehicle,
      driver: newDispatch.driver,
      departed,
      eta: newDispatch.eta,
      status: "Pending"
    };

    setDispatches(prev => [item, ...prev]);
    setShowCreate(false);
    setNewDispatch({
      from: "Central Hub", to: "", resource: "",
      quantity: "", vehicle: "", driver: "", eta: ""
    });
    resetFilters();
  };

  const exportCSV = () => {
    const headers = [
      "Dispatch", "Route", "Resources", "Quantity",
      "Vehicle", "Driver", "Departed", "ETA", "Status"
    ];

    const rows = filtered.map(d => [
      d.id, d.route, d.resource, d.quantity,
      d.vehicle, d.driver, d.departed, d.eta, d.status
    ]);

    const csv = [headers, ...rows].map(row =>
      row.map(value =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(",")
    ).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dispatch-tracking.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Active dispatches", value: counts.active,
      note: "Across 4 districts", icon: Truck,
      color: "bg-sky-50 text-sky-700"
    },
    {
      label: "On schedule", value: counts.onSchedule,
      note: "Active fleet on route", icon: Check,
      color: "bg-emerald-50 text-emerald-700"
    },
    {
      label: "Delayed", value: counts.delayed,
      note: "Route exceptions", icon: AlertTriangle,
      color: "bg-amber-50 text-amber-700"
    },
    {
      label: "Delivered", value: counts.delivered,
      note: "Delivery records", icon: Check,
      color: "bg-emerald-50 text-emerald-700"
    }
  ];

  return (
    <div className="min-h-screen bg-[#eef4f7] font-sans text-[#163d5c]">

      {/* SIDEBAR - NO DASHBOARD */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#143d5e] text-white transition-transform lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-[74px] items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#62b7a8] text-[#143d5e]">
            <Package size={23} />
          </div>
          <div>
            <h1 className="text-xl font-bold">ReliefOS</h1>
            <p className="text-[10px] text-sky-200">Resource Management</p>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Operation
          </p>
          <p className="mt-2 text-xs font-bold">Monsoon Floods 2025</p>
          <p className="mt-1 text-[10px] text-sky-200">
            Greater Riverton · Level 4
          </p>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto px-3">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map(item => {
            const Icon = item.icon;
            const active = item.label === "Dispatch & Tracking";
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (!active) alert(`${item.label} page is not connected yet.`);
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[11px] ${
                  active
                    ? "border-l-[3px] border-[#62b7a8] bg-[#287ba5] font-semibold"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />
                <span className="flex-1">{item.label}</span>
                {"count" in item && item.count && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] text-white">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold">
            DP
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold">Daniel Perera</p>
            <p className="text-[10px] text-sky-200">Resource Manager</p>
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

      {/* MAIN PAGE */}
      <main className="min-h-screen lg:ml-[280px]">

        {/* TOP BAR */}
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
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-xs outline-none"
            />
            <span className="hidden rounded border bg-white px-2 py-1 text-[9px] text-slate-400 sm:block">
              ⌘ K
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden border-r border-slate-200 pr-5 text-right md:block">
              <p className="text-[9px] uppercase text-slate-400">Primary Hub</p>
              <p className="text-[10px] font-bold">Central Logistics Hub</p>
            </div>
            <button className="hidden rounded-lg border p-2.5 sm:block" aria-label="Security">
              <ShieldCheck size={18} />
            </button>
            <button className="relative rounded-lg border p-2.5" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">
                9
              </span>
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold text-white">
              DP
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold">Daniel P.</p>
              <p className="text-[9px] text-slate-400">Resource Manager</p>
            </div>
            <ChevronRight size={17} className="hidden sm:block" />
          </div>
        </header>

        <div className="space-y-6 p-4 sm:p-6 lg:p-7">
          {/* HEADING */}
          <div className="text-[10px] text-slate-400">
            Resource Operations <ChevronRight size={12} className="mx-1 inline" />
            <span className="font-semibold text-[#163d5c]">
              Dispatch & Tracking
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Dispatch & Tracking
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                Coordinate loading, release, live movement, proof of delivery, and exceptions.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-sky-700"
              >
                <Download size={15} /> Export
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-4 py-3 text-xs font-semibold text-white hover:bg-[#1c668d]"
              >
                <Plus size={16} /> Create Dispatch
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">{card.label}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-[9px] text-slate-400">{card.note}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TABS */}
          <div className="flex flex-wrap gap-6 border-b border-slate-200">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`relative flex items-center gap-1.5 pb-4 text-[11px] ${
                  activeTab === tab ? "font-bold text-sky-700" : "text-slate-500"
                }`}
              >
                {tab}
                {tab === "All" && (
                  <span className="rounded-full bg-sky-100 px-1.5 text-[9px]">
                    {dispatches.length}
                  </span>
                )}
                {tab === "Needs action" && (
                  <span className="rounded-full bg-slate-100 px-1.5 text-[9px]">
                    {needsAction}
                  </span>
                )}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-700" />
                )}
              </button>
            ))}
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap gap-2">
            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search dispatch & tracking..."
                className="w-full py-3 text-xs outline-none"
              />
            </div>

            <select
              value={route}
              onChange={e => { setRoute(e.target.value); setPage(1); }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All routes</option>
              {[...new Set(dispatches.map(d => d.route))].map(r => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <select
              value={vehicle}
              onChange={e => { setVehicle(e.target.value); setPage(1); }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All vehicles</option>
              {[...new Set(dispatches.map(d => d.vehicle))].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className={inputClass}
              style={{ width: "auto" }}
            >
              <option>All delivery states</option>
              {(["In Transit", "Delayed", "Delivered", "Pending"] as Status[]).map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-sky-700"
            >
              <Filter size={15} /> More filters
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-500">
                  <tr>
                    {["Dispatch", "Route", "Resources", "Quantity", "Vehicle", "Driver", "Departed", "ETA", "Status", ""].map(h => (
                      <th key={h} className="px-3 py-4 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map(d => (
                    <tr key={d.id} className="border-t border-slate-100 text-[11px] hover:bg-slate-50">
                      <td className="px-3 py-4 font-bold">{d.id}</td>
                      <td className="px-3 py-4">{d.route}</td>
                      <td className="px-3 py-4">{d.resource}</td>
                      <td className="px-3 py-4">{d.quantity}</td>
                      <td className="px-3 py-4">{d.vehicle}</td>
                      <td className="px-3 py-4">{d.driver}</td>
                      <td className="px-3 py-4">{d.departed}</td>
                      <td className="px-3 py-4">{d.eta}</td>
                      <td className="px-3 py-4">
                        <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${statusColor[d.status]}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <button onClick={() => setSelected(d)} aria-label={`View ${d.id}`}>
                          <ChevronRight size={18} className="text-slate-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visible.length === 0 && (
                <p className="p-10 text-center text-sm text-slate-400">
                  No dispatches found.
                </p>
              )}
            </div>

            {/* PAGINATION */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <p className="text-[10px] text-slate-400">
                Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}
                –{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded-lg border px-3 py-2 text-[10px] disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-8 min-w-8 rounded-lg border px-2 text-[10px] ${
                      currentPage === n
                        ? "border-sky-700 bg-sky-700 text-white"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  disabled={currentPage === pages}
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  className="rounded-lg border px-3 py-2 text-[10px] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CREATE DISPATCH MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={createDispatch}
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Create Dispatch</h3>
              <button type="button" onClick={() => setShowCreate(false)}>
                <X size={20} />
              </button>
            </div>

            <label className="block text-xs font-semibold">
              Source Warehouse
              <select
                value={newDispatch.from}
                onChange={e => setNewDispatch({ ...newDispatch, from: e.target.value })}
                className={`mt-2 ${inputClass}`}
              >
                <option>Central Hub</option>
                <option>West Depot</option>
                <option>Eastbank</option>
                <option>North Hub</option>
              </select>
            </label>

            {([
              ["to", "Destination", "Enter destination"],
              ["resource", "Resource", "Enter resource"],
              ["quantity", "Quantity", "e.g. 100 units"],
              ["vehicle", "Vehicle", "e.g. Truck · RT-204"],
              ["driver", "Driver", "Enter driver name"]
            ] as const).map(([key, label, placeholder]) => (
              <label key={key} className="block text-xs font-semibold">
                {label}
                <input
                  required
                  value={newDispatch[key]}
                  onChange={e => setNewDispatch({ ...newDispatch, [key]: e.target.value })}
                  placeholder={placeholder}
                  className={`mt-2 ${inputClass}`}
                />
              </label>
            ))}

            <label className="block text-xs font-semibold">
              Estimated Arrival Time
              <input
                type="time"
                required
                value={newDispatch.eta}
                onChange={e => setNewDispatch({ ...newDispatch, eta: e.target.value })}
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border px-4 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#287ba5] px-4 py-2 text-xs font-bold text-white"
              >
                Create Dispatch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">Dispatch Details</h3>
              <button onClick={() => setSelected(null)}>
                <X size={20} />
              </button>
            </div>

            {Object.entries(selected).map(([key, value]) => (
              <div key={key} className="mb-2 rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] capitalize text-slate-400">{key}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}

            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full rounded-lg bg-[#287ba5] py-3 text-xs font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
