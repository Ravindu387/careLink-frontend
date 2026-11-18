import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Download,
  AlertTriangle,
  Clock,
  Package,
  Boxes,
  CheckCircle2,
  SlidersHorizontal,
  CalendarDays,
  MapPin,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { resourceService } from "../../services/resourceService";
import type {
  Resource,
  ResourceSummary,
  StockStatus,
} from "../../types/resource";
import type { Shelter } from "../../types/accommodation";

/* ================= FALLBACK DATA ================= */

const fallbackResources: Resource[] = [
  {
    id: "INV-104",
    name: "Drinking Water - 10L",
    category: "Food & Water",
    available: 842,
    minimum: 500,
    unit: "Units",
    expiry: "—",
    lastUpdated: "22 Jun",
    shelter: "Riverton Central School",
    status: "Healthy",
  },
  {
    id: "INV-107",
    name: "Family Food Packs",
    category: "Food & Water",
    available: 84,
    minimum: 120,
    unit: "Packs",
    expiry: "12 Jul",
    lastUpdated: "22 Jun",
    shelter: "Riverton Central School",
    status: "Low Stock",
  },
  {
    id: "INV-112",
    name: "Thermal Blankets",
    category: "Bedding",
    available: 318,
    minimum: 150,
    unit: "Units",
    expiry: "—",
    lastUpdated: "22 Jun",
    shelter: "Riverton Central School",
    status: "Healthy",
  },
  {
    id: "INV-118",
    name: "First Aid Kits",
    category: "Medical",
    available: 12,
    minimum: 25,
    unit: "Kits",
    expiry: "03 Aug",
    lastUpdated: "22 Jun",
    shelter: "Riverton Central School",
    status: "Critical",
  },
  {
    id: "INV-124",
    name: "Hygiene Kits",
    category: "Hygiene",
    available: 0,
    minimum: 50,
    unit: "Kits",
    expiry: "28 Sep",
    lastUpdated: "22 Jun",
    shelter: "Riverton Central School",
    status: "Out of Stock",
  },
];

const categories = [
  "Food & Water",
  "Bedding",
  "Medical",
  "Hygiene",
  "Clothing",
  "Equipment",
];

const fallbackShelters = [
  "Riverton Central School",
  "North Community Hall",
  "St. Mary Civic Centre",
  "Lakeside Sports Hall",
];

/* ================= STATUS CALCULATION ================= */

function getStockStatus(resource: Resource): StockStatus {
  if (resource.status) return resource.status;
  if (resource.available === 0) return "Out of Stock";
  if (resource.available < resource.minimum * 0.5) return "Critical";
  if (resource.available < resource.minimum) return "Low Stock";
  return "Healthy";
}

/* ================= MAIN COMPONENT ================= */

export default function ResourceInventoryPage() {
  const [resources, setResources] = useState<Resource[]>(fallbackResources);
  const [shelterList, setShelterList] = useState<string[]>(fallbackShelters);
  const [summary, setSummary] = useState<ResourceSummary | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All stock statuses");
  const [expiryFilter, setExpiryFilter] = useState("Any expiry");
  const [shelterFilter, setShelterFilter] = useState("All shelters");

  const [moreFilters, setMoreFilters] = useState(false);
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Modals & Panels
  const [addModal, setAddModal] = useState(false);
  const [distributionModal, setDistributionModal] = useState(false);
  const [detailsResource, setDetailsResource] = useState<Resource | null>(null);

  // Status & Feedback
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [newResource, setNewResource] = useState({
    name: "",
    category: "Food & Water",
    available: "",
    minimum: "",
    unit: "Units",
    expiry: "",
    shelter: fallbackShelters[0],
  });

  const [distribution, setDistribution] = useState({
    resourceId: "",
    quantity: "",
    shelter: fallbackShelters[0],
    recipient: "",
    notes: "",
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load shelters from API
  useEffect(() => {
    const loadShelters = async () => {
      try {
        const data: Shelter[] = await resourceService.getShelters();
        if (data && data.length > 0) {
          const names = data.map((s) => s.name);
          setShelterList(names);
          setNewResource((prev) => ({
            ...prev,
            shelter: prev.shelter || names[0],
          }));
          setDistribution((prev) => ({
            ...prev,
            shelter: prev.shelter || names[0],
          }));
        }
      } catch (err) {
        console.warn("Could not load shelters from API, using fallback shelters:", err);
      }
    };
    loadShelters();
  }, []);

  // Fetch Summary / KPI counts
  const fetchSummary = useCallback(async () => {
    try {
      const data = await resourceService.getResourceSummary();
      setSummary(data);
    } catch (err) {
      console.warn("Could not load resource summary:", err);
    }
  }, []);

  // Fetch Resources from Backend
  const fetchResources = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const result = await resourceService.getResources({
        search: debouncedSearch || undefined,
        category: categoryFilter !== "All categories" ? categoryFilter : undefined,
        status: statusFilter !== "All stock statuses" ? statusFilter : undefined,
        expiryFilter: expiryFilter !== "Any expiry" ? expiryFilter : undefined,
        shelterId: shelterFilter !== "All shelters" ? shelterFilter : undefined,
        minQuantity: minQuantity ? Number(minQuantity) : undefined,
        maxQuantity: maxQuantity ? Number(maxQuantity) : undefined,
        page: currentPage,
        pageSize: itemsPerPage,
      });

      setResources(result.items || []);
      setTotalCount(result.totalCount);
      setTotalPages(Math.max(1, result.totalPages));
    } catch (err: any) {
      console.error("Error fetching resources:", err);
      setErrorMessage(
        err.message || "Failed to load inventory from backend. Check that the API is running."
      );
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    categoryFilter,
    statusFilter,
    expiryFilter,
    shelterFilter,
    minQuantity,
    maxQuantity,
    currentPage,
    itemsPerPage,
  ]);

  // Refetch resources when filters change
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Refetch summary on mount
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategoryFilter("All categories");
    setStatusFilter("All stock statuses");
    setExpiryFilter("Any expiry");
    setShelterFilter("All shelters");
    setMinQuantity("");
    setMaxQuantity("");
    setCurrentPage(1);
  };

  /* ================= ADD RESOURCE ================= */

  const handleAddResource = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const created = await resourceService.createResource({
        name: newResource.name.trim(),
        category: newResource.category,
        available: Number(newResource.available),
        minimum: Number(newResource.minimum),
        unit: newResource.unit,
        expiryDate: newResource.expiry || undefined,
        shelter: newResource.shelter,
      });

      setSuccessMessage(`Resource "${created.name}" (${created.id}) added successfully.`);
      setAddModal(false);

      // Reset form
      setNewResource({
        name: "",
        category: "Food & Water",
        available: "",
        minimum: "",
        unit: "Units",
        expiry: "",
        shelter: shelterList[0] || fallbackShelters[0],
      });

      // Refetch
      setCurrentPage(1);
      await fetchResources();
      await fetchSummary();
    } catch (err: any) {
      console.error("Error adding resource:", err);
      setErrorMessage(err.message || "Failed to add resource.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= RECORD DISTRIBUTION ================= */

  const handleDistribution = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const qty = Number(distribution.quantity);

    if (!distribution.resourceId || qty <= 0) {
      setErrorMessage("Please select a resource and enter a valid quantity.");
      return;
    }

    setIsDistributing(true);
    setErrorMessage("");

    try {
      const updated = await resourceService.recordDistribution({
        resourceId: distribution.resourceId,
        quantity: qty,
        shelter: distribution.shelter,
        recipient: distribution.recipient.trim(),
        notes: distribution.notes.trim() || undefined,
      });

      setSuccessMessage(
        `${qty} ${updated.unit} distributed successfully from ${updated.name}.`
      );
      setDistributionModal(false);
      setDetailsResource(null);

      // Reset form
      setDistribution({
        resourceId: "",
        quantity: "",
        shelter: shelterList[0] || fallbackShelters[0],
        recipient: "",
        notes: "",
      });

      await fetchResources();
      await fetchSummary();
    } catch (err: any) {
      console.error("Error recording distribution:", err);
      setErrorMessage(err.message || "Failed to record distribution.");
    } finally {
      setIsDistributing(false);
    }
  };

  /* ================= EXPORT CSV ================= */

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let exportData: Resource[] = [];
      try {
        exportData = await resourceService.getAllResources();
      } catch {
        exportData = resources;
      }

      if (!exportData || exportData.length === 0) {
        exportData = resources;
      }

      const headers = [
        "Resource ID",
        "Resource Name",
        "Category",
        "Available",
        "Minimum",
        "Unit",
        "Expiry",
        "Last Updated",
        "Shelter",
        "Status",
      ];

      const rows = exportData.map((r) => [
        r.id,
        r.name,
        r.category,
        r.available,
        r.minimum,
        r.unit,
        r.expiry,
        r.lastUpdated,
        r.shelter,
        getStockStatus(r),
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `carelink-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();

      URL.revokeObjectURL(url);
      setSuccessMessage("Inventory report exported successfully.");
    } catch (err: any) {
      setErrorMessage("Failed to export inventory: " + (err.message || ""));
    } finally {
      setIsExporting(false);
    }
  };

  // KPI Calculations
  const immediateActionCount =
    summary?.immediateActionCount ??
    resources.filter(
      (r) => getStockStatus(r) === "Critical" || getStockStatus(r) === "Out of Stock"
    ).length;

  const expiringCount =
    summary?.expiringSoonCount ??
    resources.filter((r) => r.expiry !== "—").length;

  const incomingDonations = summary?.incomingDonationsCount ?? 4;

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">
      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-5 pb-10">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[9px] mb-7">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="text-slate-400">Shelter Administration</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="font-semibold">Resource & Inventory Management</span>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => {
                fetchResources();
                fetchSummary();
              }}
              className="text-xs font-semibold underline text-red-700 hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[23px] md:text-[25px] font-normal">
              Resource & Inventory Management
            </h1>
            <p className="text-[11px] text-slate-500 mt-2">
              Track stock, donations, distributions, minimum levels, and expiry risks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchResources();
                fetchSummary();
              }}
              title="Refresh inventory"
              className="h-9 px-3 border border-[#aac4d2] bg-white rounded-lg text-[10px] font-semibold flex items-center gap-1.5 hover:bg-slate-50 text-slate-600"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={() => setDistributionModal(true)}
              className="h-9 px-4 border border-[#aac4d2] bg-white rounded-lg text-[10px] font-semibold hover:bg-slate-50"
            >
              Record distribution
            </button>

            <button
              onClick={() => setAddModal(true)}
              className="h-9 px-4 bg-[#1c638a] text-white rounded-lg text-[10px] font-semibold flex items-center gap-2 hover:bg-[#144665]"
            >
              <Plus size={14} />
              Add resource
            </button>
          </div>
        </div>

        {/* ================= ALERT CARDS ================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <AlertCard
            icon={<AlertTriangle size={17} />}
            color="red"
            title={`${immediateActionCount} items require immediate action`}
            description="Critical and out-of-stock inventory items"
          />

          <AlertCard
            icon={<Clock size={17} />}
            color="orange"
            title={`${expiringCount} items expiring soon`}
            description="Review items expiring within 30 days"
          />

          <AlertCard
            icon={<Package size={17} />}
            color="green"
            title={`${incomingDonations} incoming donations`}
            description="Expected within the next 48 hours"
          />
        </section>

        {/* ================= SEARCH + FILTERS ================= */}
        <section className="flex flex-col xl:flex-row gap-2 mb-3">
          <div className="relative flex-1 min-w-0">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search resource ID or name..."
              className="w-full h-9 border border-[#d5e3e9] bg-white rounded-lg pl-9 pr-3 text-[10px] outline-none focus:border-[#45b99b]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex gap-2">
            <FilterSelect
              value={categoryFilter}
              options={["All categories", ...categories]}
              onChange={(v) => {
                setCategoryFilter(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={statusFilter}
              options={[
                "All stock statuses",
                "Healthy",
                "Low Stock",
                "Critical",
                "Out of Stock",
              ]}
              onChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={expiryFilter}
              options={[
                "Any expiry",
                "Has expiry date",
                "No expiry date",
                "Expiring soon",
              ]}
              onChange={(v) => {
                setExpiryFilter(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={shelterFilter}
              options={["All shelters", ...shelterList]}
              onChange={(v) => {
                setShelterFilter(v);
                setCurrentPage(1);
              }}
            />

            <button
              onClick={() => setMoreFilters(!moreFilters)}
              className={`h-9 px-3 bg-white border rounded-lg text-[10px] font-semibold flex items-center justify-center gap-2 whitespace-nowrap ${
                moreFilters
                  ? "border-[#2785b7] text-[#2785b7]"
                  : "border-[#aac4d2]"
              }`}
            >
              <SlidersHorizontal size={13} />
              More filters
            </button>
          </div>
        </section>

        {/* ================= ADVANCED FILTERS ================= */}
        {moreFilters && (
          <section className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-semibold">Advanced filters</h3>
              <button
                onClick={resetFilters}
                className="text-[10px] text-[#267ca6] font-semibold"
              >
                Clear filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Minimum available quantity"
                type="number"
                value={minQuantity}
                onChange={(v) => {
                  setMinQuantity(v);
                  setCurrentPage(1);
                }}
                placeholder="Minimum quantity"
              />

              <FormInput
                label="Maximum available quantity"
                type="number"
                value={maxQuantity}
                onChange={(v) => {
                  setMaxQuantity(v);
                  setCurrentPage(1);
                }}
                placeholder="Maximum quantity"
              />
            </div>
          </section>
        )}

        {/* ================= INVENTORY TABLE ================= */}
        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">
          {/* TABLE HEADER */}
          <div className="px-3.5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-semibold">Current inventory</h2>
              <p className="text-[8px] text-slate-400 mt-1">
                {shelterFilter === "All shelters"
                  ? "All registered shelters"
                  : shelterFilter}
                {" · "}
                {(totalCount || resources.length)} resource records
              </p>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 text-[10px] font-semibold text-[#1c638a] hover:text-[#144665] disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={14} />}
              Inventory report
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto relative min-h-[220px]">
            {loading && (
              <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1c638a]">
                  <Loader2 size={18} className="animate-spin" />
                  Loading inventory records...
                </div>
              </div>
            )}

            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-[#f5f9fa] border-b border-slate-200">
                <tr className="text-[8px] text-slate-500">
                  <th className="px-3 py-3 font-medium">Resource ID</th>
                  <th className="px-3 py-3 font-medium">Resource Name</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Available</th>
                  <th className="px-3 py-3 font-medium">Minimum</th>
                  <th className="px-3 py-3 font-medium">Unit</th>
                  <th className="px-3 py-3 font-medium">Expiry</th>
                  <th className="px-3 py-3 font-medium">Last Updated</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {resources.map((resource) => {
                  const status = getStockStatus(resource);

                  return (
                    <tr
                      key={resource.id}
                      onClick={() => setDetailsResource(resource)}
                      className="border-b border-slate-100 hover:bg-[#f5faf9] cursor-pointer text-[8px] transition"
                    >
                      <td className="px-3 py-3.5 font-semibold text-[#174f75]">
                        {resource.id}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {resource.name}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {resource.category}
                      </td>
                      <td className="px-3 py-3.5 font-medium">
                        {resource.available.toLocaleString()}
                      </td>
                      <td className="px-3 py-3.5">
                        {resource.minimum.toLocaleString()}
                      </td>
                      <td className="px-3 py-3.5">{resource.unit}</td>
                      <td className="px-3 py-3.5">{resource.expiry}</td>
                      <td className="px-3 py-3.5">{resource.lastUpdated}</td>
                      <td className="px-3 py-3.5">
                        <StockBadge status={status} />
                      </td>
                      <td className="px-3 py-3.5">
                        <ChevronRight size={13} className="text-slate-400" />
                      </td>
                    </tr>
                  );
                })}

                {!loading && resources.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-12 text-xs text-slate-400"
                    >
                      No inventory records found. Try changing your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-3.5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[9px] text-slate-400">
              Showing{" "}
              {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
              {"–"}
              {Math.min(currentPage * itemsPerPage, totalCount || resources.length)}
              {" of "}
              {(totalCount || resources.length).toLocaleString()}
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-8 px-3 border border-slate-200 rounded-lg text-[9px] disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-8 rounded-lg border text-[9px] ${
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
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-8 px-3 border border-slate-200 rounded-lg text-[9px] disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= ADD RESOURCE MODAL ================= */}
      {addModal && (
        <Modal
          title="Add new resource"
          subtitle="Register a new inventory item."
          onClose={() => setAddModal(false)}
        >
          <form onSubmit={handleAddResource} className="space-y-4">
            <FormInput
              label="Resource name"
              placeholder="Example: Drinking Water - 10L"
              value={newResource.name}
              onChange={(v) => setNewResource({ ...newResource, name: v })}
            />

            <FormSelect
              label="Category"
              value={newResource.category}
              options={categories.map((c) => ({
                value: c,
                label: c,
              }))}
              onChange={(v) => setNewResource({ ...newResource, category: v })}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Available quantity"
                type="number"
                value={newResource.available}
                onChange={(v) =>
                  setNewResource({ ...newResource, available: v })
                }
              />

              <FormInput
                label="Minimum stock level"
                type="number"
                value={newResource.minimum}
                onChange={(v) => setNewResource({ ...newResource, minimum: v })}
              />
            </div>

            <FormSelect
              label="Unit"
              value={newResource.unit}
              options={[
                "Units",
                "Packs",
                "Kits",
                "Boxes",
                "Litres",
                "Bottles",
              ].map((u) => ({
                value: u,
                label: u,
              }))}
              onChange={(v) => setNewResource({ ...newResource, unit: v })}
            />

            <FormInput
              label="Expiry date"
              type="date"
              required={false}
              value={newResource.expiry}
              onChange={(v) => setNewResource({ ...newResource, expiry: v })}
            />

            <FormSelect
              label="Shelter"
              value={newResource.shelter}
              options={shelterList.map((s) => ({
                value: s,
                label: s,
              }))}
              onChange={(v) => setNewResource({ ...newResource, shelter: v })}
            />

            <ModalActions
              onCancel={() => setAddModal(false)}
              submitLabel="Add resource"
              loading={isSubmitting}
            />
          </form>
        </Modal>
      )}

      {/* ================= DISTRIBUTION MODAL ================= */}
      {distributionModal && (
        <Modal
          title="Record resource distribution"
          subtitle="Record the quantity distributed to a shelter."
          onClose={() => setDistributionModal(false)}
        >
          <form onSubmit={handleDistribution} className="space-y-4">
            <FormSelect
              label="Select resource"
              value={distribution.resourceId}
              options={[
                { value: "", label: "Choose a resource" },
                ...resources.map((r) => ({
                  value: r.id,
                  label: `${r.name} (${r.available} ${r.unit})`,
                })),
              ]}
              onChange={(v) =>
                setDistribution({
                  ...distribution,
                  resourceId: v,
                })
              }
            />

            <FormInput
              label="Distribution quantity"
              type="number"
              value={distribution.quantity}
              onChange={(v) =>
                setDistribution({
                  ...distribution,
                  quantity: v,
                })
              }
            />

            <FormSelect
              label="Destination shelter"
              value={distribution.shelter}
              options={shelterList.map((s) => ({
                value: s,
                label: s,
              }))}
              onChange={(v) =>
                setDistribution({
                  ...distribution,
                  shelter: v,
                })
              }
            />

            <FormInput
              label="Recipient / responsible person"
              placeholder="Enter recipient name"
              value={distribution.recipient}
              onChange={(v) =>
                setDistribution({
                  ...distribution,
                  recipient: v,
                })
              }
            />

            <div>
              <label className="block text-xs font-medium mb-1.5">Notes</label>
              <textarea
                value={distribution.notes}
                onChange={(e) =>
                  setDistribution({
                    ...distribution,
                    notes: e.target.value,
                  })
                }
                placeholder="Additional distribution details..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b] resize-none"
                rows={3}
              />
            </div>

            <ModalActions
              onCancel={() => setDistributionModal(false)}
              submitLabel="Confirm distribution"
              loading={isDistributing}
            />
          </form>
        </Modal>
      )}

      {/* ================= RESOURCE DETAILS PANEL ================= */}
      {detailsResource && (
        <div className="fixed inset-0 z-40 bg-black/30 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Resource details</h2>
              <button onClick={() => setDetailsResource(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="mt-7">
              <div className="w-14 h-14 rounded-xl bg-[#eaf3f8] text-[#287da7] flex items-center justify-center">
                <Package size={25} />
              </div>

              <h3 className="text-lg font-semibold mt-4">
                {detailsResource.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{detailsResource.id}</p>

              <div className="mt-3">
                <StockBadge status={getStockStatus(detailsResource)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-7">
              <div className="bg-[#f4f8fa] rounded-lg p-3">
                <p className="text-[9px] text-slate-500">Available stock</p>
                <p className="text-xl font-bold mt-1">
                  {detailsResource.available.toLocaleString()} {detailsResource.unit}
                </p>
              </div>

              <div className="bg-[#f4f8fa] rounded-lg p-3">
                <p className="text-[9px] text-slate-500">Minimum stock</p>
                <p className="text-xl font-bold mt-1">
                  {detailsResource.minimum.toLocaleString()} {detailsResource.unit}
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-4">
              <DetailRow
                icon={<Boxes size={15} />}
                label="Category"
                value={detailsResource.category}
              />

              <DetailRow
                icon={<Package size={15} />}
                label="Unit"
                value={detailsResource.unit}
              />

              <DetailRow
                icon={<MapPin size={15} />}
                label="Shelter"
                value={detailsResource.shelter}
              />

              <DetailRow
                icon={<CalendarDays size={15} />}
                label="Expiry date"
                value={detailsResource.expiry}
              />

              <DetailRow
                icon={<Clock size={15} />}
                label="Last updated"
                value={detailsResource.lastUpdated}
              />
            </div>

            <button
              onClick={() => {
                setDistribution({
                  resourceId: detailsResource.id,
                  quantity: "",
                  shelter: detailsResource.shelter,
                  recipient: "",
                  notes: "",
                });
                setDetailsResource(null);
                setDistributionModal(true);
              }}
              disabled={detailsResource.available === 0}
              className="w-full mt-8 bg-[#1c638a] text-white py-3 rounded-lg text-xs font-semibold hover:bg-[#144665] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Record distribution
            </button>

            <button
              onClick={() => setDetailsResource(null)}
              className="w-full mt-3 border border-slate-200 py-3 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Close details
            </button>
          </div>
        </div>
      )}

      {/* ================= SUCCESS MESSAGE ================= */}
      {successMessage && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={17} className="shrink-0 text-emerald-400" />
          <p className="text-xs flex-1">{successMessage}</p>
          <button onClick={() => setSuccessMessage("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function AlertCard({
  icon,
  color,
  title,
  description,
}: {
  icon: ReactNode;
  color: "red" | "orange" | "green";
  title: string;
  description: string;
}) {
  const styles = {
    red: "bg-[#fff2f2] border-[#ffd6d6] text-[#b93737]",
    orange: "bg-[#fff8ee] border-[#ffe6bf] text-[#bd6a00]",
    green: "bg-[#f2faf6] border-[#d4edd9] text-[#1c834a]",
  };

  return (
    <div
      className={`border rounded-xl p-3 flex items-center gap-3 ${styles[color]}`}
    >
      <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-xs font-semibold">{title}</h3>
        <p className="text-[9px] text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function StockBadge({ status }: { status: StockStatus }) {
  const styles: Record<StockStatus, string> = {
    Healthy: "bg-[#e5f8f1] text-[#269a77]",
    "Low Stock": "bg-[#fff7ea] text-[#cf8700]",
    Critical: "bg-[#feeceb] text-[#d64545]",
    "Out of Stock": "bg-[#f1f5f7] text-[#556977]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-[8px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full xl:w-[135px] h-9 appearance-none bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-7 text-[9px] outline-none focus:border-[#45b99b] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
      />
    </div>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>
      <input
        required={required}
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
      <div className="text-[#2785b7]">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] text-slate-400">{label}</p>
        <p className="text-xs font-semibold mt-1 break-words">{value}</p>
      </div>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>
          </div>
          <button onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  submitLabel,
  loading = false,
}: {
  onCancel: () => void;
  submitLabel: string;
  loading?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 border border-slate-200 rounded-lg py-3 text-xs font-semibold"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-[#1c638a] text-white rounded-lg py-3 text-xs font-semibold hover:bg-[#144665] flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}
