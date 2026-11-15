
import { useMemo, useState } from "react";
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
} from "lucide-react";

interface Resource {
  id: number;
  name: string;
  category: string;
  location: string;
  available: number;
  reserved: number;
  availability: number;
  status: string;
}

const initialResources: Resource[] = [
  {
    id: 1,
    name: "Water - 10L",
    category: "Food & Water",
    location: "Central Depot",
    available: 8420,
    reserved: 3100,
    availability: 68,
    status: "Healthy",
  },
  {
    id: 2,
    name: "Family Food Packs",
    category: "Food & Water",
    location: "North Hub",
    available: 1284,
    reserved: 940,
    availability: 42,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Shelter Kits",
    category: "Accommodation",
    location: "Eastbank Store",
    available: 342,
    reserved: 218,
    availability: 61,
    status: "Healthy",
  },
  {
    id: 4,
    name: "Trauma Kits",
    category: "Medical",
    location: "Central Depot",
    available: 86,
    reserved: 64,
    availability: 25,
    status: "Critical",
  },
  {
    id: 5,
    name: "Emergency Blankets",
    category: "Accommodation",
    location: "North Hub",
    available: 760,
    reserved: 240,
    availability: 75,
    status: "Healthy",
  },
  {
    id: 6,
    name: "First Aid Kits",
    category: "Medical",
    location: "Eastbank Store",
    available: 125,
    reserved: 90,
    availability: 35,
    status: "Low Stock",
  },
];

const statusStyles: Record<string, string> = {
  Healthy: "bg-emerald-100 text-emerald-700",
  "Low Stock": "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700",
};

export default function ResourceOverview() {
  const [resources] = useState(initialResources);
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All operational areas");
  const [status, setStatus] = useState("All statuses");
  const [availability, setAvailability] = useState("Any availability");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Resource | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestQty, setRequestQty] = useState("");
  const [requestLocation, setRequestLocation] = useState("Central Depot");
  const [message, setMessage] = useState("");

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        `${resource.name} ${resource.category} ${resource.location}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesArea =
        area === "All operational areas" ||
        resource.location === area;

      const matchesStatus =
        status === "All statuses" ||
        resource.status === status;

      const matchesAvailability =
        availability === "Any availability" ||
        (availability === "Above 60%" && resource.availability > 60) ||
        (availability === "Below 60%" && resource.availability <= 60);

      return (
        matchesSearch &&
        matchesArea &&
        matchesStatus &&
        matchesAvailability
      );
    });
  }, [resources, search, area, status, availability]);

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

    const rows = filteredResources.map((r) => [
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
    link.download = "resource-overview.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const submitRequest = () => {
    if (!requestName || !requestQty || Number(requestQty) <= 0) {
      setMessage("Please enter a resource and valid quantity.");
      return;
    }

    setMessage("Resource request submitted successfully.");
    setRequestName("");
    setRequestQty("");

    setTimeout(() => {
      setShowRequest(false);
      setMessage("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">

      {/* Page heading */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            Resource Overview
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitor critical stock, reservations, dispatches, and cross-operation shortages.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b8d0df] bg-white px-4 py-2.5 text-xs text-[#175477] hover:bg-sky-50"
          >
            <Download size={15} />
            Export
          </button>

          <button
            onClick={() => setShowRequest(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#216789]"
          >
            <Plus size={15} />
            Request resources
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sky-100 p-3 text-sky-600">
              <Package size={19} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">
                Resource availability
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">68%</h2>
              <p className="text-[9px] text-slate-400">
                Across 12 warehouses
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-3 text-red-600">
              <AlertTriangle size={19} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">
                Critical shortages
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">3</h2>
              <p className="text-[9px] text-slate-400">
                Medical · transport
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <Truck size={19} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">
                Active dispatches
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">27</h2>
              <p className="text-[9px] text-slate-400">
                8 arriving today
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
              <Clock size={19} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">
                Pending requests
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">43</h2>
              <p className="text-[9px] text-slate-400">
                12 high priority
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_repeat(3,minmax(130px,auto))_auto]">

        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full min-w-0 bg-transparent text-[10px] outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>All operational areas</option>
          <option>Central Depot</option>
          <option>North Hub</option>
          <option>Eastbank Store</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>All statuses</option>
          <option>Healthy</option>
          <option>Low Stock</option>
          <option>Critical</option>
        </select>

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>Any availability</option>
          <option>Above 60%</option>
          <option>Below 60%</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-lg border border-sky-600 bg-white px-3 py-2.5 text-[10px] font-medium text-sky-700 hover:bg-sky-50"
        >
          <Filter size={13} />
          More filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-[#d5e2e9] bg-white p-3">
          <span className="text-[10px] text-slate-500">
            Manage your resource filters.
          </span>
          <button
            onClick={resetFilters}
            className="text-[10px] font-semibold text-sky-700 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Resource inventory */}
      <section className="overflow-hidden rounded-xl border border-[#d5e2e9] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d5e2e9] px-4 py-3">
          <div>
            <h2 className="text-sm font-medium text-[#153f5e]">
              Resource inventory
            </h2>
            <p className="mt-1 text-[9px] text-slate-500">
              Live operational records · Demonstration data
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] text-slate-600">
            {filteredResources.length} resources
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
                    className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredResources.map((resource) => (
                <tr
                  key={resource.id}
                  onClick={() => setSelected(resource)}
                  className="cursor-pointer border-b border-slate-100 transition hover:bg-[#f0f6f8]"
                >
                  <td className="whitespace-nowrap px-3 py-4 text-[10px] font-semibold text-[#153f5e]">
                    {resource.name}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-600">
                    {resource.category}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-600">
                    {resource.location}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-700">
                    {resource.available.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-700">
                    {resource.reserved.toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <span className="rounded-md bg-sky-100 px-2 py-1 text-[8px] font-semibold text-sky-700">
                      {resource.availability}%
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <span className={`rounded-md px-2 py-1 text-[8px] font-semibold ${statusStyles[resource.status]}`}>
                      {resource.status}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <ChevronRight size={15} className="text-slate-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResources.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No resources found.
          </div>
        )}

        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-[9px] text-slate-500">
            Showing {filteredResources.length} resources
          </p>
        </div>
      </section>

      {/* Resource details modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#153f5e]">
                Resource details
              </h2>
              <button onClick={() => setSelected(null)}>
                <X size={19} className="text-slate-500" />
              </button>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <Package size={24} className="mb-3 text-sky-600" />
              <h3 className="font-semibold text-[#153f5e]">
                {selected.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {selected.category}
              </p>

              <div className="mt-4 space-y-3 text-xs">
                <p className="flex justify-between">
                  Location <span>{selected.location}</span>
                </p>
                <p className="flex justify-between">
                  Available <span>{selected.available.toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  Reserved <span>{selected.reserved.toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  Availability <span>{selected.availability}%</span>
                </p>
                <p className="flex justify-between">
                  Status
                  <span className="font-semibold">{selected.status}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setRequestName(selected.name);
                setShowRequest(true);
                setSelected(null);
              }}
              className="mt-4 w-full rounded-lg bg-[#153f5e] py-3 text-xs font-semibold text-white hover:bg-[#205879]"
            >
              Request this resource
            </button>
          </div>
        </div>
      )}

      {/* Request resources modal */}
      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#153f5e]">
                  Request resources
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  Create a new operational resource request.
                </p>
              </div>
              <button onClick={() => setShowRequest(false)}>
                <X size={19} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-600">
                  Resource name
                </label>
                <input
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="Enter resource name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-600">
                  Quantity required
                </label>
                <input
                  type="number"
                  min="1"
                  value={requestQty}
                  onChange={(e) => setRequestQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-600">
                  Operational area
                </label>
                <select
                  value={requestLocation}
                  onChange={(e) => setRequestLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
                >
                  <option>Central Depot</option>
                  <option>North Hub</option>
                  <option>Eastbank Store</option>
                </select>
              </div>

              {message && (
                <p className="text-xs text-emerald-600">{message}</p>
              )}

              <button
                onClick={submitRequest}
                className="w-full rounded-lg bg-[#153f5e] py-3 text-xs font-semibold text-white hover:bg-[#205879]"
              >
                Submit resource request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
