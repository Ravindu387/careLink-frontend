
import { useEffect, useState } from "react";

type Stat = {
  title: string;
  value: string;
  note: string;
  icon: string;
  color: string;
};

type RequestItem = {
  id: string;
  unit: string;
  resource: string;
  quantity: string;
  priority: string;
  source: string;
  age: string;
  status: string;
};

const stats: Stat[] = [
  { title: "Total stock value", value: "$4.82M", note: "+6.4% this month", icon: "◇", color: "blue" },
  { title: "Available inventory", value: "68%", note: "3 critical shortages", icon: "▣", color: "orange" },
  { title: "Pending requests", value: "18", note: "7 high or critical", icon: "▤", color: "red" },
  { title: "Active dispatches", value: "12", note: "2 delayed in transit", icon: "▰", color: "blue" },
  { title: "Warehouse usage", value: "72%", note: "North Hub at 91%", icon: "▣", color: "orange" },
  { title: "Fulfilment rate", value: "93.8%", note: "+2.1% this week", icon: "✓", color: "green" },
  { title: "Open purchase orders", value: "24", note: "$186K committed", icon: "🛒", color: "blue" },
  { title: "Verified suppliers", value: "48", note: "4 categories covered", icon: "♧", color: "green" },
];

const initialRequests: RequestItem[] = [
  { id: "RR-2841", unit: "North Ward Shelter Network", resource: "Drinking Water - 10L", quantity: "2,400 units", priority: "Critical", source: "Central Hub", age: "18 min", status: "Awaiting Approval" },
  { id: "RR-2839", unit: "Medical Team 3", resource: "Trauma Medical Kit", quantity: "24 units", priority: "Critical", source: "Central Hub", age: "34 min", status: "Partially Available" },
  { id: "RR-2836", unit: "Eastbank Community Centre", resource: "Family Food Pack", quantity: "500 units", priority: "High", source: "North Hub", age: "49 min", status: "Awaiting Approval" },
  { id: "RR-2828", unit: "Mobility Response Team", resource: "Fuel - Diesel", quantity: "1,200 L", priority: "High", source: "West Depot", age: "1h 12m", status: "Allocated" },
];

const stockHealth = [
  { name: "Food & Water", value: 82, color: "bg-emerald-500" },
  { name: "Shelter", value: 68, color: "bg-sky-600" },
  { name: "Medical", value: 24, color: "bg-red-600" },
  { name: "WASH", value: 74, color: "bg-emerald-500" },
  { name: "Transport & Fuel", value: 36, color: "bg-amber-500" },
  { name: "Non-food Items", value: 57, color: "bg-sky-600" },
];

const stockMovement = [
  { day: "Mon", received: 68, issued: 45 },
  { day: "Tue", received: 42, issued: 61 },
  { day: "Wed", received: 85, issued: 55 },
  { day: "Thu", received: 60, issued: 70 },
  { day: "Fri", received: 96, issued: 73 },
  { day: "Sat", received: 48, issued: 38 },
  { day: "Today", received: 78, issued: 60 },
];

const activities = [
  { icon: "▣", title: "Dispatch DSP-1092 departed", detail: "2,400 water units · North Ward", time: "4 min" },
  { icon: "♧", title: "Allocation AL-1048 approved", detail: "18 trauma kits reserved", time: "12 min" },
  { icon: "△", title: "Low-stock threshold reached", detail: "Family Food Packs · North Hub", time: "21 min" },
  { icon: "◇", title: "Stock receipt completed", detail: "500 hygiene kits · West Depot", time: "38 min" },
];

const quickActions = [
  { icon: "+", label: "Record Receipt" },
  { icon: "▤", label: "Review Requests" },
  { icon: "♧", label: "Create Allocation" },
  { icon: "▰", label: "New Dispatch" },
  { icon: "⇄", label: "Stock Transfer" },
  { icon: "🛒", label: "Purchase Order" },
];

const colorMap: Record<string, string> = {
  blue: "bg-sky-50 text-sky-700",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  green: "bg-emerald-50 text-emerald-600",
};

const priorityStyle: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-slate-100 text-slate-700",
};

const statusStyle: Record<string, string> = {
  "Awaiting Approval": "bg-amber-100 text-amber-800",
  "Partially Available": "bg-slate-100 text-slate-700",
  Allocated: "bg-sky-100 text-sky-700",
};

export default function ResourceDashboard() {
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);
  const [activeMenu, setActiveMenu] = useState("Resource Dashboard");
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  // Connect to the backend API when VITE_API_BASE_URL is configured.
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

    if (!baseUrl) return;

    const controller = new AbortController();

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${baseUrl.replace(/\/$/, "")}/api/resource-requests`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: RequestItem[] = await response.json();
        setRequests(data);
        setApiMessage("Live API data connected");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setApiMessage("Showing demo data. API connection unavailable.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
    return () => controller.abort();
  }, []);

  const handleExport = () => {
    const csv = [
      ["Request ID", "Unit", "Resource", "Quantity", "Priority", "Status"],
      ...requests.map((r) => [
        r.id, r.unit, r.resource, r.quantity, r.priority, r.status,
      ]),
    ].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resource-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#eef4f7] text-slate-800">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-700 text-xl text-white">
            ✚
          </div>
          <div>
            <h1 className="text-sm font-bold">Humanitarian</h1>
            <p className="text-xs text-slate-500">Crisis Management</p>
          </div>
        </div>

        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Resource Operations
          </p>

          {[
            "Resource Dashboard",
            "Inventory",
            "Resource Requests",
            "Allocations",
            "Dispatches",
            "Warehouses",
            "Suppliers",
            "Purchase Orders",
          ].map((item, index) => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                activeMenu === item
                  ? "bg-sky-50 font-semibold text-sky-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="w-5 text-center">
                {["▦", "▣", "▤", "♧", "▰", "⌂", "♙", "▱"][index]}
              </span>
              {item}
            </button>
          ))}
        </div>

        <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-sky-50 p-4">
          <p className="text-xs font-semibold text-sky-800">Primary Hub</p>
          <p className="mt-1 text-sm font-bold text-slate-800">Central Logistics Hub</p>
          <p className="mt-2 text-xs text-slate-500">Humanitarian operations</p>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen lg:ml-64">

        {/* Top navigation */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <button className="text-xl text-slate-500 lg:hidden" onClick={() => setActiveMenu(activeMenu === "Menu" ? "Resource Dashboard" : "Menu")}>
              ☰
            </button>
            <div className="hidden w-64 items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2 sm:flex">
              <span className="text-slate-400">⌕</span>
              <input
                placeholder="Search resources, requests, dispatches..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] uppercase text-slate-400">Priority Hub</p>
              <p className="text-xs font-bold">Central Logistics Hub</p>
            </div>
            <button className="rounded-lg border p-2 text-slate-600">♢</button>
            <button className="relative rounded-lg border p-2 text-slate-600">
              ♧
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">9</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">DP</div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold">Daniel P.</p>
                <p className="text-[10px] text-slate-400">Resource Manager</p>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-5 p-4 sm:p-6 lg:p-7">

          {/* Page heading */}
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-xs text-slate-400">
                Resource Operations <span className="mx-2">›</span> Resource Dashboard
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {activeMenu === "Menu" ? "Resource Dashboard" : activeMenu}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Monitor inventory, fulfilment, storage, procurement, and field delivery across active operations.
              </p>
              {apiMessage && (
                <p className="mt-1 text-xs text-slate-500">{apiMessage}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                ↓ Export snapshot
              </button>
              <button
                onClick={() => window.alert("Connect your receipt form/API here.")}
                className="rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-800"
              >
                + Record receipt
              </button>
            </div>
          </section>

          {/* Critical alert */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 border-l-4 border-l-red-600 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-xl text-red-600">⚠</div>
              <div>
                <span className="rounded bg-red-100 px-2 py-1 text-[9px] font-bold uppercase text-red-700">
                  3 Critical shortages
                </span>
                <p className="mt-1 text-xs font-bold text-slate-800">
                  Medical kits and fuel require immediate action
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  18 resource requests are awaiting approval across 4 districts.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveMenu("Resource Requests")}
              className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-red-100"
            >
              Review alerts
            </button>
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${colorMap[stat.color]}`}>
                    {stat.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                    <p className="text-[9px] text-slate-400">{stat.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">

            {/* Stock movement */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold">Stock movement</h3>
                  <p className="mt-1 text-[10px] text-slate-400">Received and issued over the last 7 days</p>
                </div>
                <div className="flex gap-3 text-[10px]">
                  <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-sky-700" />Received</span>
                  <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-emerald-500" />Issued</span>
                </div>
              </div>

              <div className="relative h-56 px-5 pb-7 pt-5">
                <div className="absolute inset-x-0 top-1/4 border-t border-slate-100" />
                <div className="absolute inset-x-0 top-2/4 border-t border-slate-100" />
                <div className="absolute inset-x-0 top-3/4 border-t border-slate-100" />
                <div className="relative flex h-full items-end justify-around gap-2">
                  {stockMovement.map((item) => (
                    <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end">
                      <div className="flex h-full w-full items-end justify-center gap-1">
                        <div
                          title={`Received: ${item.received}`}
                          className="w-2.5 max-w-5 rounded-t-sm bg-sky-700 sm:w-4"
                          style={{ height: `${item.received}%` }}
                        />
                        <div
                          title={`Issued: ${item.issued}`}
                          className="w-2.5 max-w-5 rounded-t-sm bg-emerald-500 sm:w-4"
                          style={{ height: `${item.issued}%` }}
                        />
                      </div>
                      <span className="absolute -bottom-1 text-[9px] text-slate-400"
                        style={{ left: `${(stockMovement.indexOf(item) + 0.5) * (100 / stockMovement.length)}%`, transform: "translateX(-50%)" }}>
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stock health */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold">Stock health by category</h3>
                  <p className="mt-1 text-[10px] text-slate-400">Availability against operational thresholds</p>
                </div>
                <button
                  onClick={() => setActiveMenu("Inventory")}
                  className="text-xs font-medium text-sky-700"
                >
                  View inventory ›
                </button>
              </div>

              <div className="space-y-5 p-5">
                {stockHealth.map((item) => (
                  <div key={item.name} className="grid grid-cols-[105px_48px_1fr] items-center gap-2">
                    <span className="text-[10px] font-semibold">{item.name}</span>
                    <span className="text-right text-[9px] text-slate-400">{item.value}%</span>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Requests and activity */}
          <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.8fr_1fr]">

            {/* Requests table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold">Priority resource requests</h3>
                  <p className="mt-1 text-[10px] text-slate-400">Awaiting review or active fulfilment</p>
                </div>
                <button
                  onClick={() => setActiveMenu("Resource Requests")}
                  className="text-xs text-sky-700"
                >
                  View all ›
                </button>
              </div>

              {loading && (
                <p className="px-4 py-2 text-xs text-slate-500">Loading requests...</p>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left">
                  <thead className="bg-slate-50 text-[9px] text-slate-500">
                    <tr>
                      {["Request", "Requesting Unit", "Resource", "Quantity", "Priority", "Source", "Age", "Status"].map((heading) => (
                        <th key={heading} className="px-3 py-3 font-semibold">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id} className="border-t border-slate-100 text-[10px] hover:bg-slate-50">
                        <td className="px-3 py-4 font-bold text-slate-800">{request.id}</td>
                        <td className="px-3 py-4">{request.unit}</td>
                        <td className="px-3 py-4">{request.resource}</td>
                        <td className="px-3 py-4">{request.quantity}</td>
                        <td className="px-3 py-4">
                          <span className={`rounded px-2 py-1 font-semibold ${priorityStyle[request.priority] || "bg-slate-100 text-slate-600"}`}>
                            {request.priority}
                          </span>
                        </td>
                        <td className="px-3 py-4">{request.source}</td>
                        <td className="px-3 py-4">{request.age}</td>
                        <td className="px-3 py-4">
                          <span className={`whitespace-nowrap rounded px-2 py-1 font-semibold ${statusStyle[request.status] || "bg-slate-100 text-slate-600"}`}>
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!requests.length && !loading && (
                <p className="p-6 text-center text-sm text-slate-400">No resource requests available.</p>
              )}
            </div>

            {/* Activity */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold">Live logistics activity</h3>
                  <p className="mt-1 text-[10px] text-slate-400">Latest movements and decisions</p>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-700">Live</span>
              </div>

              {activities.map((activity) => (
                <div key={activity.title} className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-lg text-sky-700">
                    {activity.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold">{activity.title}</p>
                    <p className="mt-1 text-[9px] text-slate-400">{activity.detail}</p>
                  </div>
                  <span className="shrink-0 text-[9px] text-slate-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <h3 className="mb-3 text-sm font-semibold">Quick actions</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setActiveMenu(action.label)}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-xl text-sky-700">
                    {action.icon}
                  </span>
                  <span className="flex-1 text-xs font-semibold">{action.label}</span>
                  <span className="text-lg text-slate-500">›</span>
                </button>
              ))}
            </div>
          </section>

          <footer className="py-3 text-center text-[10px] text-slate-400">
            Humanitarian Crisis Management System · Resource Operations
          </footer>

        </div>
      </main>
    </div>
  );
}
