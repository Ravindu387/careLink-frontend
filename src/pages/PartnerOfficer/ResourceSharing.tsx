
import { useMemo, useState, type FormEvent } from "react";
import {
  Download,
  Plus,
  Package,
  Truck,
  AlertTriangle,
  Search,
  Filter,
  ChevronRight,
  X,
} from "lucide-react";

type Resource = {
  id: string;
  resource: string;
  quantity: number;
  source: string;
  destination: string;
  partner: string;
  scheduled: string;
  status: string;
  type: string;
  location: string;
};

const initialResources: Resource[] = [
  {
    id: "COM-1048",
    resource: "Family Food Packs",
    quantity: 500,
    source: "North District Hub",
    destination: "North Ward Shelters",
    partner: "Global Relief Network",
    scheduled: "22 Jun - 14:10",
    status: "In Transit",
    type: "Food",
    location: "North District",
  },
  {
    id: "COM-1044",
    resource: "Hygiene Kits",
    quantity: 300,
    source: "Eastbank Store",
    destination: "Eastbank Communities",
    partner: "CareLink Network",
    scheduled: "22 Jun - 13:48",
    status: "Approved",
    type: "Health",
    location: "Eastbank",
  },
  {
    id: "COM-1039",
    resource: "Water Purification Tablets",
    quantity: 20000,
    source: "Central Hub",
    destination: "North Ward",
    partner: "Global Relief Network",
    scheduled: "22 Jun - 12:14",
    status: "Partial Delivery",
    type: "WASH",
    location: "North District",
  },
  {
    id: "COM-1035",
    resource: "Emergency Medical Kits",
    quantity: 150,
    source: "Medical Store",
    destination: "Riverside Hospital",
    partner: "Health Support Foundation",
    scheduled: "21 Jun - 16:30",
    status: "Delivered",
    type: "Health",
    location: "Greater Riverton",
  },
  {
    id: "COM-1028",
    resource: "Emergency Shelter Tents",
    quantity: 80,
    source: "South Logistics Hub",
    destination: "Coastal Relief Camp",
    partner: "Global Relief Network",
    scheduled: "21 Jun - 11:20",
    status: "Pending Approval",
    type: "Shelter",
    location: "West Coast",
  },
  {
    id: "COM-1021",
    resource: "Drinking Water Bottles",
    quantity: 1000,
    source: "Eastbank Store",
    destination: "Eastbank Communities",
    partner: "CareLink Network",
    scheduled: "20 Jun - 09:15",
    status: "Completed",
    type: "WASH",
    location: "Eastbank",
  },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const ResourceSharing = () => {
  const [resources, setResources] = useState(initialResources);
  const [activeTab, setActiveTab] = useState("All");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All resource types");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [partnerFilter, setPartnerFilter] = useState("All partners");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showFilters, setShowFilters] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedResource, setSelectedResource] =
    useState<Resource | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const searchText = [
        item.id,
        item.resource,
        item.source,
        item.destination,
        item.partner,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          ["Pending Approval", "Partial Delivery"].includes(item.status)) ||
        (activeTab === "Active" &&
          ["Approved", "In Transit"].includes(item.status)) ||
        (activeTab === "Completed" &&
          ["Delivered", "Completed"].includes(item.status)) ||
        (activeTab === "Archived" && item.status === "Archived");

      const matchesType =
        typeFilter === "All resource types" || item.type === typeFilter;

      const matchesLocation =
        locationFilter === "All locations" ||
        item.location === locationFilter;

      const matchesPartner =
        partnerFilter === "All partners" ||
        item.partner === partnerFilter;

      const matchesStatus =
        statusFilter === "All statuses" || item.status === statusFilter;

      return (
        matchesSearch &&
        matchesTab &&
        matchesType &&
        matchesLocation &&
        matchesPartner &&
        matchesStatus
      );
    });
  }, [
    resources,
    activeTab,
    search,
    typeFilter,
    locationFilter,
    partnerFilter,
    statusFilter,
  ]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredResources.length / pageSize)
  );

  const displayedResources = filteredResources.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // CSV Export
  const exportCSV = () => {
    const headers = [
      "Commitment ID",
      "Resource",
      "Quantity",
      "Source",
      "Destination",
      "Partner",
      "Scheduled",
      "Status",
    ];

    const rows = filteredResources.map((item) => [
      item.id,
      item.resource,
      item.quantity,
      item.source,
      item.destination,
      item.partner,
      item.scheduled,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "resource-sharing.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Create resource offer
  const handleCreateResource = (newResource: Resource) => {
    setResources((prev) => [newResource, ...prev]);
    setActiveTab("All");
    setSearch("");
    setTypeFilter("All resource types");
    setLocationFilter("All locations");
    setPartnerFilter("All partners");
    setStatusFilter("All statuses");
    setCurrentPage(1);
    setShowOfferModal(false);
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("All resource types");
    setLocationFilter("All locations");
    setPartnerFilter("All partners");
    setStatusFilter("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">

      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

        <div>
          <p className="mb-3 text-xs text-slate-500">
            Partner Coordination
            <span className="mx-2">›</span>
            <span className="font-semibold text-[#153e5b]">
              Resource Sharing
            </span>
          </p>

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Resource Sharing
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Offer and track resource commitments with clear ownership,
            delivery, and receipt evidence.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-2.5 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
          >
            <Download size={15} />
            Export
          </button>

          <button
            onClick={() => setShowOfferModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Plus size={16} />
            Offer Resources
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<Package size={20} />}
          title="Active commitments"
          value="12"
          subtitle="5 in delivery"
          color="blue"
        />

        <StatCard
          icon={<Package size={20} />}
          title="Units committed"
          value="24.8K"
          subtitle="Across 8 categories"
          color="green"
        />

        <StatCard
          icon={<Truck size={20} />}
          title="Delivered this week"
          value="18.4K"
          subtitle="96% confirmed"
          color="green"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Exceptions"
          value="3"
          subtitle="Partial or delayed"
          color="orange"
        />

      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">

        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`relative whitespace-nowrap pb-4 text-xs ${
              activeTab === tab
                ? "font-semibold text-[#267ba4]"
                : "text-slate-500 hover:text-[#267ba4]"
            }`}
          >
            {tab}

            {tab === "All" && (
              <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px]">
                48
              </span>
            )}

            {tab === "Needs action" && (
              <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px]">
                7
              </span>
            )}

            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
            )}
          </button>
        ))}

      </div>

      {/* Search & Filters */}
      <div className="mb-3 flex flex-col gap-2 xl:flex-row">

        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search resource sharing..."
            className="w-full rounded-lg border border-[#d3e1e8] bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-[#267ba4]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All resource types</option>
          <option>Food</option>
          <option>Health</option>
          <option>WASH</option>
          <option>Shelter</option>
        </select>

        <select
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All locations</option>
          <option>North District</option>
          <option>Eastbank</option>
          <option>Greater Riverton</option>
          <option>West Coast</option>
        </select>

        <select
          value={partnerFilter}
          onChange={(e) => {
            setPartnerFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All partners</option>
          <option>Global Relief Network</option>
          <option>CareLink Network</option>
          <option>Health Support Foundation</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All statuses</option>
          <option>Pending Approval</option>
          <option>Approved</option>
          <option>In Transit</option>
          <option>Partial Delivery</option>
          <option>Delivered</option>
          <option>Completed</option>
          <option>Archived</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-3 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
        >
          <Filter size={15} />
          More filters
        </button>
      </div>

      {/* More Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d3e1e8] bg-white p-4">
          <div>
            <p className="text-xs font-semibold text-[#153e5b]">
              Additional filters
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Refine commitments using the filters above.
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs font-medium text-[#267ba4]"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Resource Table */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">

            <thead className="bg-[#f5f8fa]">
              <tr className="border-b border-[#d7e5eb] text-[10px] text-slate-500">
                {[
                  "Commitment",
                  "Resource",
                  "Quantity",
                  "Source",
                  "Destination",
                  "Partner",
                  "Scheduled",
                  "Status",
                  "",
                ].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {displayedResources.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedResource(item)}
                  className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                >
                  <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
                    {item.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.resource}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.quantity.toLocaleString()} units
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.source}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.destination}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.partner}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {item.scheduled}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="px-3 py-4">
                    <ChevronRight
                      size={17}
                      className="text-[#64849a]"
                    />
                  </td>
                </tr>
              ))}

              {displayedResources.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No resource commitments found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">

          <p className="text-[10px] text-slate-400">
            Showing{" "}
            {filteredResources.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(
              currentPage * pageSize,
              filteredResources.length
            )}{" "}
            of {filteredResources.length} commitments
          </p>

          <div className="flex items-center gap-1">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`h-8 w-8 rounded-lg border text-[10px] ${
                  currentPage === number
                    ? "border-[#267ba4] bg-[#267ba4] text-white"
                    : "border-[#d3e1e8] text-slate-600 hover:bg-slate-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Next
            </button>

          </div>
        </div>
      </div>

      {/* Resource Details Modal */}
      {selectedResource && (
        <ResourceDetailsModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}

      {/* Offer Resources Modal */}
      {showOfferModal && (
        <OfferResourceModal
          onClose={() => setShowOfferModal(false)}
          onSubmit={handleCreateResource}
        />
      )}

    </div>
  );
};

// Statistics Card
function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-[#e8f2f8] text-[#2783b1]",
    green: "bg-[#e5f6f0] text-[#299b7d]",
    orange: "bg-[#fff4df] text-[#d69b30]",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#d7e5eb] bg-white p-4 shadow-sm">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[9px] text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-[#153e5b]">{value}</p>
        <p className="text-[9px] text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "In Transit": "bg-[#e8f2f8] text-[#267ba4]",
    Approved: "bg-[#e5f6f0] text-[#299b7d]",
    "Partial Delivery": "bg-[#fff4df] text-[#bd8229]",
    Delivered: "bg-[#e5f6f0] text-[#299b7d]",
    "Pending Approval": "bg-[#fff4df] text-[#bd8229]",
    Completed: "bg-[#e5f6f0] text-[#299b7d]",
    Archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`rounded-md px-2 py-1 text-[9px] font-medium ${styles[status] || "bg-slate-100 text-slate-500"}`}
    >
      {status}
    </span>
  );
}

// Details Item
function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-medium text-[#153e5b]">{value}</p>
    </div>
  );
}

// Resource Details Modal
function ResourceDetailsModal({
  resource,
  onClose,
}: {
  resource: Resource;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#267ba4]">
              {resource.id}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Commitment Details
            </h2>
          </div>

          <button onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <h3 className="mb-5 text-sm font-semibold text-[#153e5b]">
          {resource.resource}
        </h3>

        <div className="grid grid-cols-2 gap-5">
          <Detail
            label="Quantity"
            value={`${resource.quantity.toLocaleString()} units`}
          />
          <Detail label="Resource Type" value={resource.type} />
          <Detail label="Source" value={resource.source} />
          <Detail label="Destination" value={resource.destination} />
          <Detail label="Partner" value={resource.partner} />
          <Detail label="Scheduled" value={resource.scheduled} />
          <Detail label="Location" value={resource.location} />
          <Detail label="Status" value={resource.status} />
        </div>

        <button
          onClick={onClose}
          className="mt-7 w-full rounded-lg bg-[#267ba4] py-3 text-xs font-medium text-white hover:bg-[#1c668a]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Offer Resources Modal
function OfferResourceModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (resource: Resource) => void;
}) {
  const [resourceName, setResourceName] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [type, setType] = useState("Food");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [partner, setPartner] = useState("Global Relief Network");
  const [location, setLocation] = useState("North District");
  const [scheduled, setScheduled] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newResource: Resource = {
      id: `COM-${Math.floor(1000 + Math.random() * 9000)}`,
      resource: resourceName,
      quantity: Number(quantity),
      source,
      destination,
      partner,
      scheduled: scheduled
        ? new Date(`${scheduled}T12:00:00`).toLocaleDateString("en-GB")
        : "Not scheduled",
      status: "Pending Approval",
      type,
      location,
    };

    onSubmit(newResource);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#153e5b]">
              Offer Resources
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Submit a new resource commitment.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Resource Name
            </label>
            <input
              required
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              placeholder="e.g. Family Food Packs"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Quantity (units)
              </label>
              <input
                required
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Resource Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
              >
                <option>Food</option>
                <option>Health</option>
                <option>WASH</option>
                <option>Shelter</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Source Location
            </label>
            <input
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Enter source location"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Destination
            </label>
            <input
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Partner Organisation
            </label>
            <select
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            >
              <option>Global Relief Network</option>
              <option>CareLink Network</option>
              <option>Health Support Foundation</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Operational Area
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
              >
                <option>North District</option>
                <option>Eastbank</option>
                <option>Greater Riverton</option>
                <option>West Coast</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduled}
                onChange={(e) => setScheduled(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
              />
            </div>
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-[#267ba4] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            Submit Offer
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResourceSharing;
