import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  Truck,
  Clock,
  ChevronRight,
  Filter,
  Download,
  Plus,
  X,
  RefreshCw,
  RotateCcw,
  Warehouse,
} from "lucide-react";
import {
  resourceService,
  type ResourceItem,
  type ResourceMetrics,
} from "../../services/resourceService";

const statusStyles: Record<string, string> = {
  Healthy: "bg-emerald-100 text-emerald-700",
  "Low Stock": "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700",
};

export default function ResourceOverview() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [metrics, setMetrics] = useState<ResourceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All operational areas");
  const [status, setStatus] = useState("All statuses");
  const [availability, setAvailability] = useState("Any availability");
  const [showFilters, setShowFilters] = useState(false);

  const [selected, setSelected] = useState<ResourceItem | null>(null);

  // Request Resource Modal
  const [showRequest, setShowRequest] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestQty, setRequestQty] = useState("");
  const [requestLocation, setRequestLocation] = useState("Central Depot");
  const [requestPriority, setRequestPriority] = useState<"Normal" | "High" | "Critical">("High");
  const [requestNotes, setRequestNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [items, met] = await Promise.all([
        resourceService.getAll({
          search: search || undefined,
          area: area !== "All operational areas" ? area : undefined,
          status: status !== "All statuses" ? status : undefined,
          availability: availability !== "Any availability" ? availability : undefined,
        }),
        resourceService.getMetrics(),
      ]);
      setResources(items);
      setMetrics(met);
      setIsLiveConnected(true);
    } catch {
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, area, status, availability]);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 25000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleResetData = async () => {
    setRefreshing(true);
    await resourceService.reset();
    await loadData();
  };

  const resetFilters = () => {
    setSearch("");
    setArea("All operational areas");
    setStatus("All statuses");
    setAvailability("Any availability");
  };

  const exportCSV = () => {
    const headers = [
      "Resource",
      "Category",
      "Location",
      "Available",
      "Reserved",
      "Availability",
      "Status",
    ];

    const rows = resources.map((r) => [
      r.name,
      r.category,
      r.location,
      r.available,
      r.reserved,
      `${r.availability}%`,
      r.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carelink-resources-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const submitRequest = async () => {
    if (!requestName || !requestQty || Number(requestQty) <= 0) {
      setMessage("Please enter a valid resource name and quantity.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await resourceService.createRequest({
        resourceName: requestName,
        quantity: parseInt(requestQty, 10),
        operationalArea: requestLocation,
        priority: requestPriority,
        notes: requestNotes || undefined,
      });

      setMessage("Resource request dispatched to warehouse.");
      setRequestName("");
      setRequestQty("");
      setRequestNotes("");

      // Refresh data to reflect updated counts
      await loadData();

      setTimeout(() => {
        setShowRequest(false);
        setMessage("");
      }, 1400);
    } catch (err: unknown) {
      const error = err as Error;
      setMessage(error.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeMetrics = useMemo(() => {
    return (
      metrics ?? {
        availabilityPercent: 68,
        totalWarehouses: 12,
        criticalShortages: 3,
        criticalShortagesSummary: "Medical · transport",
        activeDispatches: 27,
        arrivingToday: 8,
        pendingRequests: 43,
        highPriorityRequests: 12,
        lastUpdated: "",
      }
    );
  }, [metrics]);

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">
      {/* Page heading */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-[#153f5e]">Resource Overview</h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                isLiveConnected ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLiveConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {isLiveConnected ? "Live Backend Synchronized" : "Local Cached"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Monitor critical stock, reservations, dispatches, and cross-operation shortages across all active hubs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh inventory"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Reset to default seed fixtures"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b8d0df] bg-white px-3.5 py-2 text-sm font-medium text-[#175477] hover:bg-sky-50 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowRequest(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#153f5e] transition-colors"
          >
            <Plus size={15} />
            <span>Request Resources</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {/* Availability */}
        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sky-100 p-3 text-sky-600">
              <Package size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Resource Availability
              </p>
              <h2 className="text-2xl font-bold text-[#153f5e]">
                {activeMetrics.availabilityPercent}%
              </h2>
              <p className="text-[13px] text-slate-400">
                Across {activeMetrics.totalWarehouses} operational hubs
              </p>
            </div>
          </div>
        </div>

        {/* Critical Shortages */}
        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-3 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Critical Shortages
              </p>
              <h2 className="text-2xl font-bold text-[#153f5e]">
                {activeMetrics.criticalShortages}
              </h2>
              <p className="text-[13px] text-slate-400">
                {activeMetrics.criticalShortagesSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Active Dispatches */}
        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Active Dispatches
              </p>
              <h2 className="text-2xl font-bold text-[#153f5e]">
                {activeMetrics.activeDispatches}
              </h2>
              <p className="text-[13px] text-slate-400">
                {activeMetrics.arrivingToday} arriving today
              </p>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Pending Requests
              </p>
              <h2 className="text-2xl font-bold text-[#153f5e]">
                {activeMetrics.pendingRequests}
              </h2>
              <p className="text-[13px] text-slate-400">
                {activeMetrics.highPriorityRequests} urgent priority
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(140px,auto))_auto]">
        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2 shadow-2xs">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, categories, or hubs..."
            className="w-full min-w-0 bg-transparent text-sm sm:text-[15px] outline-none placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2 text-sm sm:text-[15px] text-slate-700 outline-none shadow-2xs"
        >
          <option>All operational areas</option>
          <option>Central Depot</option>
          <option>North Hub</option>
          <option>Eastbank Store</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2 text-sm sm:text-[15px] text-slate-700 outline-none shadow-2xs"
        >
          <option>All statuses</option>
          <option>Healthy</option>
          <option>Low Stock</option>
          <option>Critical</option>
        </select>

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2 text-sm sm:text-[15px] text-slate-700 outline-none shadow-2xs"
        >
          <option>Any availability</option>
          <option>Above 60%</option>
          <option>Below 60%</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#287da5] bg-white px-3 py-2 text-sm font-semibold text-[#287da5] hover:bg-sky-50 shadow-2xs transition-colors"
        >
          <Filter size={13} />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-[#d5e2e9] bg-white p-3 shadow-2xs">
          <span className="text-xs text-slate-500">
            Active filters applied: {area !== "All operational areas" ? `Area: ${area} · ` : ""}
            {status !== "All statuses" ? `Status: ${status} · ` : ""}
            {availability !== "Any availability" ? `Availability: ${availability}` : "Showing all records"}
          </span>
          <button
            onClick={resetFilters}
            className="text-sm font-semibold text-[#287da5] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Inventory Table */}
      <section className="overflow-hidden rounded-xl border border-[#d5e2e9] bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-[#d5e2e9] px-4 py-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#153f5e]">Resource Inventory</h2>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Live operational records linked to central warehouses & field supply points
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {resources.length} resources
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="border-b border-[#d5e2e9] bg-[#f7fafb]">
              <tr>
                {[
                  "Resource",
                  "Category",
                  "Location",
                  "Available",
                  "Reserved",
                  "Availability",
                  "Status",
                  "",
                ].map((heading, index) => (
                  <th
                    key={index}
                    className="whitespace-nowrap px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                    <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-[#287da5]" />
                    Loading inventory records...
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                    No resources match the selected criteria.
                  </td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr
                    key={resource.id}
                    onClick={() => setSelected(resource)}
                    className="cursor-pointer transition hover:bg-[#f0f6f8]"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-[#153f5e]">
                      {resource.name}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">
                      {resource.category}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">
                      {resource.location}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-slate-800">
                      {resource.available.toLocaleString()} {resource.unit ?? "Units"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-500">
                      {resource.reserved.toLocaleString()}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">
                          {resource.availability}%
                        </span>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full ${
                              resource.availability > 60
                                ? "bg-emerald-500"
                                : resource.availability >= 30
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(100, resource.availability)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                          statusStyles[resource.status] ?? "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {resource.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <ChevronRight size={16} className="text-slate-400" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-4 py-3 text-[13px] text-slate-400">
          Showing {resources.length} resources across active hubs.
        </div>
      </section>

      {/* Resource Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Package size={22} className="text-[#287da5]" />
                <h2 className="text-lg sm:text-xl font-bold text-[#153f5e]">Resource Details</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl bg-[#edf4f7] p-4">
              <h3 className="text-base font-bold text-[#153f5e]">{selected.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selected.category}</p>

              <div className="mt-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Warehouse Location:</span>
                  <span className="font-semibold text-slate-800">{selected.location}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Available Stock:</span>
                  <span className="font-bold text-emerald-700">
                    {selected.available.toLocaleString()} {selected.unit ?? "Units"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Reserved for Dispatches:</span>
                  <span className="font-semibold text-slate-800">
                    {selected.reserved.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Availability Ratio:</span>
                  <span className="font-bold text-sky-700">{selected.availability}%</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Inventory Status:</span>
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${statusStyles[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg bg-[#287da5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#153f5e]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Resources Modal */}
      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Warehouse size={22} className="text-[#287da5]" />
                <h2 className="text-lg sm:text-xl font-bold text-[#153f5e]">Request Emergency Resources</h2>
              </div>
              <button
                onClick={() => {
                  setShowRequest(false);
                  setMessage("");
                }}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {message && (
              <div
                className={`mb-3 rounded-lg p-3 text-xs ${
                  message.includes("success") || message.includes("dispatched")
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {message}
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="text-sm font-bold text-slate-700">Resource Name</label>
                <input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="e.g. Clean Drinking Water 10L, Trauma Kits"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#287da5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-slate-700">Required Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={requestQty}
                    onChange={(e) => setRequestQty(e.target.value)}
                    placeholder="e.g. 500"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#287da5]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">Destination Hub</label>
                  <select
                    value={requestLocation}
                    onChange={(e) => setRequestLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#287da5]"
                  >
                    <option>Central Depot</option>
                    <option>North Hub</option>
                    <option>Eastbank Store</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Priority Level</label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {(["Normal", "High", "Critical"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setRequestPriority(p)}
                      className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${
                        requestPriority === p
                          ? p === "Critical"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : p === "High"
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-sky-500 bg-sky-50 text-sky-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Operational Notes</label>
                <textarea
                  rows={2}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Optional mission justification or delivery instructions..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-[#287da5]"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowRequest(false);
                  setMessage("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={submitRequest}
                className="rounded-lg bg-[#287da5] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#153f5e] transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
