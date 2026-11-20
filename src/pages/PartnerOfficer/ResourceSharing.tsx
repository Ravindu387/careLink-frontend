import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
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
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Check,
  Send,
  Trash2,
  Archive,
} from "lucide-react";
import {
  resourceSharingService,
  type ResourceSharingCommitment,
  type ResourceSharingMetrics,
  type CreateResourceSharingPayload,
} from "../../services/resourceSharingService";

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const ResourceSharing = () => {
  const [resources, setResources] = useState<ResourceSharingCommitment[]>([]);
  const [metrics, setMetrics] = useState<ResourceSharingMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All resource types");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [partnerFilter, setPartnerFilter] = useState("All partners");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showFilters, setShowFilters] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceSharingCommitment | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [fetchedItems, fetchedMetrics] = await Promise.all([
        resourceSharingService.getAll(),
        resourceSharingService.getMetrics(),
      ]);

      setResources(fetchedItems);
      setMetrics(fetchedMetrics);
      setIsLiveBackend(true);
    } catch (err) {
      console.warn("Using offline fallback resource commitments:", err);
      setIsLiveBackend(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [fetchedItems, fetchedMetrics] = await Promise.all([
          resourceSharingService.getAll(),
          resourceSharingService.getMetrics(),
        ]);
        if (mounted) {
          setResources(fetchedItems);
          setMetrics(fetchedMetrics);
          setIsLiveBackend(true);
        }
      } catch (err) {
        if (mounted) {
          console.warn("Initial load offline:", err);
          setIsLiveBackend(false);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const searchText = [
        item.id,
        item.resource,
        item.source,
        item.destination,
        item.partner,
        item.location,
        item.description || "",
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
        locationFilter === "All locations" || item.location === locationFilter;

      const matchesPartner =
        partnerFilter === "All partners" || item.partner === partnerFilter;

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
  const totalPages = Math.max(1, Math.ceil(filteredResources.length / pageSize));

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
      "Type",
      "Location",
      "Description",
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
      item.type,
      item.location,
      item.description || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `resource-sharing-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    showNotification("Resource commitments exported to CSV.");
  };

  // Create resource offer
  const handleCreateResource = async (payload: CreateResourceSharingPayload) => {
    try {
      const created = await resourceSharingService.create(payload);
      setResources((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      setActiveTab("All");
      setSearch("");
      setTypeFilter("All resource types");
      setLocationFilter("All locations");
      setPartnerFilter("All partners");
      setStatusFilter("All statuses");
      setCurrentPage(1);
      setShowOfferModal(false);
      showNotification(`Resource commitment '${created.resource}' offered successfully.`);
      loadData(true);
    } catch {
      showNotification("Failed to submit resource offer. Please try again.", "error");
    }
  };

  // Update status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await resourceSharingService.updateStatus(id, newStatus);
      setResources((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (selectedResource?.id === id) {
        setSelectedResource(updated);
      }
      showNotification(`Commitment '${id}' marked as ${newStatus}.`);
      loadData(true);
    } catch {
      showNotification("Failed to update status. Please try again.", "error");
    }
  };

  // Delete commitment
  const handleDeleteCommitment = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete commitment ${id}?`)) {
      return;
    }
    try {
      await resourceSharingService.delete(id);
      setResources((prev) => prev.filter((item) => item.id !== id));
      setSelectedResource(null);
      showNotification(`Commitment '${id}' deleted.`);
      loadData(true);
    } catch {
      showNotification("Failed to delete commitment.", "error");
    }
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

  // Dynamic tab count helper
  const getTabCount = (tab: string): number => {
    if (metrics) {
      if (tab === "All") return metrics.totalCommitments;
      if (tab === "Needs action") return metrics.needsActionCount;
      if (tab === "Active") return metrics.activeCount;
      if (tab === "Completed") return metrics.completedCount;
      if (tab === "Archived") return metrics.archivedCount;
    }
    if (tab === "All") return resources.length;
    if (tab === "Needs action") {
      return resources.filter((i) => ["Pending Approval", "Partial Delivery"].includes(i.status)).length;
    }
    if (tab === "Active") {
      return resources.filter((i) => ["Approved", "In Transit"].includes(i.status)).length;
    }
    if (tab === "Completed") {
      return resources.filter((i) => ["Delivered", "Completed"].includes(i.status)).length;
    }
    if (tab === "Archived") {
      return resources.filter((i) => i.status === "Archived").length;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`mb-4 flex items-center justify-between rounded-lg p-3 text-xs shadow-sm transition ${
            feedbackMessage.type === "success"
              ? "border border-[#8ad1b8] bg-[#e6f7f1] text-[#1e7a5d]"
              : "border border-[#f5b8b8] bg-[#fdeeee] text-[#b92c2c]"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <p className="text-xs text-slate-500">
              Partner Coordination
              <span className="mx-2">›</span>
              <span className="font-semibold text-[#153e5b]">Resource Sharing</span>
            </p>

            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isLiveBackend
                  ? "bg-[#e5f6f0] text-[#299b7d]"
                  : "bg-[#fff4df] text-[#bd8229]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLiveBackend ? "bg-[#299b7d]" : "bg-[#bd8229]"
                }`}
              />
              {isLiveBackend ? "Live Backend" : "Offline Cache"}
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Resource Sharing
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Offer and track resource commitments with clear ownership, delivery, and receipt evidence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            title="Refresh commitments from backend"
            className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-2 text-xs font-medium text-[#267ba4] hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            Sync
          </button>

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
          value={metrics ? String(metrics.activeCommitments) : "12"}
          subtitle={metrics?.activeCommitmentsSubtitle ?? "5 in delivery"}
          color="blue"
        />

        <StatCard
          icon={<Package size={20} />}
          title="Units committed"
          value={metrics?.unitsCommitted ?? "24.8K"}
          subtitle={metrics?.unitsCommittedSubtitle ?? "Across 8 categories"}
          color="green"
        />

        <StatCard
          icon={<Truck size={20} />}
          title="Delivered this week"
          value={metrics?.deliveredThisWeek ?? "18.4K"}
          subtitle={metrics?.deliveredThisWeekSubtitle ?? "96% confirmed"}
          color="green"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Exceptions"
          value={metrics ? String(metrics.exceptions) : "3"}
          subtitle={metrics?.exceptionsSubtitle ?? "Partial or delayed"}
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
            <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
              {getTabCount(tab)}
            </span>

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
            placeholder="Search resource sharing by ID, item, source, destination, or partner..."
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
          <option>Logistics</option>
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
              Additional filters active
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Narrow commitments by operational area, partner agency, resource category, and dispatch status.
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs font-medium text-[#267ba4] hover:underline"
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
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={15} className="animate-spin text-[#267ba4]" />
                      <span>Loading resource commitments...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedResources.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No resource commitments found.
                  </td>
                </tr>
              ) : (
                displayedResources.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedResource(item)}
                    className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                  >
                    <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
                      {item.id}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 font-medium text-[#153e5b]">
                      {item.resource}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
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

                    <td className="whitespace-nowrap px-3 py-4 text-slate-500">
                      {item.scheduled}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-3 py-4 text-right">
                      <ChevronRight
                        size={17}
                        className="inline text-[#64849a]"
                      />
                    </td>
                  </tr>
                ))
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
            {Math.min(currentPage * pageSize, filteredResources.length)}{" "}
            of {filteredResources.length} commitments
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteCommitment}
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
  icon: ReactNode;
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
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          colors[color] || colors.blue
        }`}
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
      className={`inline-block rounded-md px-2 py-1 text-[9px] font-medium ${
        styles[status] || "bg-slate-100 text-slate-500"
      }`}
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
  onUpdateStatus,
  onDelete,
}: {
  resource: ResourceSharingCommitment;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#267ba4]">
                {resource.id}
              </span>
              <StatusBadge status={resource.status} />
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Commitment Details
            </h2>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <h3 className="mb-4 text-sm font-semibold text-[#153e5b]">
          {resource.resource}
        </h3>

        {resource.description && (
          <div className="mb-4 rounded-lg bg-[#f8fafc] p-3 text-xs leading-relaxed text-slate-600">
            {resource.description}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Detail
            label="Quantity"
            value={`${resource.quantity.toLocaleString()} units`}
          />
          <Detail label="Resource Type" value={resource.type} />
          <Detail label="Source Location" value={resource.source} />
          <Detail label="Destination" value={resource.destination} />
          <Detail label="Partner Agency" value={resource.partner} />
          <Detail label="Scheduled" value={resource.scheduled} />
          <Detail label="Operational Area" value={resource.location} />
          <Detail label="Status" value={resource.status} />
        </div>

        {/* Quick Actions */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Actions
          </p>
          <div className="flex flex-wrap gap-2">
            {resource.status === "Pending Approval" && (
              <button
                onClick={() => onUpdateStatus(resource.id, "Approved")}
                className="flex items-center gap-1.5 rounded-lg bg-[#299b7d] px-3 py-2 text-xs font-medium text-white hover:bg-[#208369]"
              >
                <Check size={13} />
                Approve Offer
              </button>
            )}

            {resource.status === "Approved" && (
              <button
                onClick={() => onUpdateStatus(resource.id, "In Transit")}
                className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-3 py-2 text-xs font-medium text-white hover:bg-[#1c668a]"
              >
                <Truck size={13} />
                Dispatch (In Transit)
              </button>
            )}

            {(resource.status === "In Transit" || resource.status === "Partial Delivery") && (
              <button
                onClick={() => onUpdateStatus(resource.id, "Delivered")}
                className="flex items-center gap-1.5 rounded-lg bg-[#299b7d] px-3 py-2 text-xs font-medium text-white hover:bg-[#208369]"
              >
                <Check size={13} />
                Mark Delivered
              </button>
            )}

            {resource.status === "Delivered" && (
              <button
                onClick={() => onUpdateStatus(resource.id, "Completed")}
                className="flex items-center gap-1.5 rounded-lg bg-[#267ba4] px-3 py-2 text-xs font-medium text-white hover:bg-[#1c668a]"
              >
                <Check size={13} />
                Mark Completed
              </button>
            )}

            {resource.status !== "Archived" ? (
              <button
                onClick={() => onUpdateStatus(resource.id, "Archived")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Archive size={13} />
                Archive
              </button>
            ) : (
              <button
                onClick={() => onUpdateStatus(resource.id, "Pending Approval")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Restore to Pending
              </button>
            )}

            <button
              onClick={() => onDelete(resource.id)}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-slate-100 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
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
  onSubmit: (resource: CreateResourceSharingPayload) => void;
}) {
  const [resourceName, setResourceName] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [type, setType] = useState("Food");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [partner, setPartner] = useState("Global Relief Network");
  const [location, setLocation] = useState("North District");
  const [scheduled, setScheduled] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formattedScheduled = scheduled
      ? new Date(`${scheduled}T12:00:00`).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })
      : "Not scheduled";

    onSubmit({
      resource: resourceName,
      quantity: Number(quantity),
      source,
      destination,
      partner,
      scheduled: formattedScheduled,
      status: "Pending Approval",
      type,
      location,
      description,
    });
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
              Submit a new humanitarian resource commitment to the coordination cluster.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-500 hover:text-slate-700" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Resource Name *
            </label>
            <input
              required
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              placeholder="e.g. Family Food Packs, Clean Water Bottles"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Quantity (units) *
              </label>
              <input
                required
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Resource Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
              >
                <option>Food</option>
                <option>Health</option>
                <option>WASH</option>
                <option>Shelter</option>
                <option>Logistics</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Source Location *
            </label>
            <input
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. North District Logistics Hub"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Destination *
            </label>
            <input
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. North Ward Shelters, Community Camp 2"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Partner Organisation
            </label>
            <select
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Description / Delivery Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Packaging specifics, handling precautions, or driver contact..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Send size={14} />
            Submit Offer
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResourceSharing;
