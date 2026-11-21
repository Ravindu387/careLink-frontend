import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Search,
  House,
  Users,
  Check,
  AlertTriangle,
  Download,
  Plus,
  Filter,
  ChevronRight,
  X,
  MapPin,
  RotateCcw,
  Loader2,
  Trash2,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  shelterService,
  type Shelter,
  type ShelterMetrics,
} from "../../services/shelterService";

const statusStyles: Record<string, string> = {
  Operational: "bg-emerald-100 text-emerald-700",
  "Near Capacity": "bg-amber-100 text-amber-700",
  Full: "bg-red-100 text-red-700",
};

export default function ShelterOverview() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [metrics, setMetrics] = useState<ShelterMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All operational areas");
  const [status, setStatus] = useState("All statuses");
  const [availability, setAvailability] = useState("Any availability");

  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Shelter | null>(null);
  const [showModal, setShowModal] = useState(false);

  // New shelter form state
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("Central Ward");
  const [newCapacity, setNewCapacity] = useState("");
  const [newOccupied, setNewOccupied] = useState("0");
  const [newServices, setNewServices] = useState("Food, Medical");
  const [newContactPerson, setNewContactPerson] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Edit occupancy state inside details modal
  const [editOccupied, setEditOccupied] = useState<number | string>("");
  const [isUpdatingOccupancy, setIsUpdatingOccupancy] = useState(false);

  // Banners
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sheltersData, metricsData] = await Promise.all([
        shelterService.getAll(),
        shelterService.getMetrics(),
      ]);
      setShelters(sheltersData);
      setMetrics(metricsData);
    } catch {
      setErrorBanner("Failed to load shelter data from server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When selected shelter changes, sync editOccupied
  useEffect(() => {
    if (selected) {
      setEditOccupied(selected.occupied);
    }
  }, [selected]);

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setErrorBanner(null);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorBanner(msg);
    setSuccessBanner(null);
    setTimeout(() => setErrorBanner(null), 5000);
  };

  // Client-side filtering on current shelters
  const filteredShelters = useMemo(() => {
    return shelters.filter((shelter) => {
      const searchMatch =
        `${shelter.name} ${shelter.location} ${shelter.services.join(" ")} ${shelter.notes || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const areaMatch =
        area === "All operational areas" ||
        area === "All" ||
        shelter.location === area;

      const statusMatch =
        status === "All statuses" ||
        status === "All" ||
        shelter.status === status;

      const availabilityMatch =
        availability === "Any availability" ||
        availability === "All" ||
        (availability === "Available" && shelter.remaining > 0) ||
        (availability === "Full" && shelter.remaining === 0);

      return searchMatch && areaMatch && statusMatch && availabilityMatch;
    });
  }, [shelters, search, area, status, availability]);

  // Fallback summary calculations if metrics not yet loaded
  const totalCapacity =
    metrics?.totalCapacity ??
    shelters.reduce((sum, s) => sum + s.capacity, 0);

  const totalOccupied =
    metrics?.totalOccupied ??
    shelters.reduce((sum, s) => sum + s.occupied, 0);

  const availableSpaces =
    metrics?.availableSpaces ??
    Math.max(0, totalCapacity - totalOccupied);

  const acceptingCount =
    metrics?.acceptingArrivals ??
    shelters.filter((s) => s.remaining > 0).length;

  const nearCapacityCount =
    metrics?.nearCapacityCount ??
    shelters.filter((s) => s.status === "Near Capacity").length;

  const operationalCount =
    metrics?.operationalShelters ??
    shelters.length + 34;

  const exportCSV = () => {
    const headers = [
      "Shelter",
      "Location",
      "Capacity",
      "Occupied",
      "Remaining",
      "Services",
      "Status",
      "Contact Person",
      "Contact Phone",
    ];

    const rows = filteredShelters.map((s) => [
      s.name,
      s.location,
      s.capacity,
      s.occupied,
      s.remaining,
      s.services.join(" / "),
      s.status,
      s.contactPerson || "",
      s.contactPhone || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shelter-overview-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addShelter = async () => {
    if (!newName.trim() || !newCapacity || Number(newCapacity) <= 0) {
      setModalMessage("Please enter a shelter name and valid capacity.");
      return;
    }

    const capacity = Number(newCapacity);
    const occupied = Number(newOccupied) || 0;

    if (occupied > capacity) {
      setModalMessage("Occupied count cannot exceed capacity.");
      return;
    }

    setIsSubmitting(true);
    setModalMessage("");

    try {
      const created = await shelterService.create({
        name: newName.trim(),
        location: newLocation,
        capacity,
        occupied,
        services: newServices
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        contactPerson: newContactPerson.trim(),
        contactPhone: newContactPhone.trim(),
        notes: newNotes.trim(),
      });

      setShelters((prev) => [created, ...prev.filter((s) => s.id !== created.id)]);
      showSuccess(`Shelter "${created.name}" coordinated successfully.`);

      setNewName("");
      setNewCapacity("");
      setNewOccupied("0");
      setNewServices("Food, Medical");
      setNewContactPerson("");
      setNewContactPhone("");
      setNewNotes("");
      setShowModal(false);

      // Refresh metrics from server
      shelterService.getMetrics().then(setMetrics).catch(() => {});
    } catch (err: any) {
      setModalMessage(err.message || "Failed to create shelter.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOccupancy = async () => {
    if (!selected) return;

    const occ = Number(editOccupied);
    if (isNaN(occ) || occ < 0) {
      showError("Please enter a valid occupancy number.");
      return;
    }
    if (occ > selected.capacity) {
      showError(`Occupancy cannot exceed capacity (${selected.capacity}).`);
      return;
    }

    setIsUpdatingOccupancy(true);
    try {
      const updated = await shelterService.updateOccupancy(selected.id, occ);
      setShelters((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSelected(updated);
      showSuccess(`Updated occupancy for ${updated.name} to ${updated.occupied}.`);

      // Refresh metrics
      shelterService.getMetrics().then(setMetrics).catch(() => {});
    } catch (err: any) {
      showError(err.message || "Failed to update occupancy.");
    } finally {
      setIsUpdatingOccupancy(false);
    }
  };

  const handleDeleteShelter = async (id: number) => {
    if (!window.confirm("Are you sure you want to decommission/remove this shelter?")) {
      return;
    }

    try {
      await shelterService.delete(id);
      setShelters((prev) => prev.filter((s) => s.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
      showSuccess("Shelter decommissioned successfully.");
      shelterService.getMetrics().then(setMetrics).catch(() => {});
    } catch {
      showError("Failed to delete shelter.");
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Reset all shelter overview data back to default emergency staging?")) {
      return;
    }

    setIsLoading(true);
    try {
      await shelterService.reset();
      await loadData();
      showSuccess("Shelter records reset to default staging.");
    } catch {
      showError("Failed to reset shelters.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setArea("All operational areas");
    setStatus("All statuses");
    setAvailability("Any availability");
  };

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">
      {/* Page heading */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            Shelter Overview
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Monitor shelter capacity, accessibility, services, and allocation risk in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-[#b8d0df] bg-white px-3.5 py-2.5 text-xs text-[#175477] shadow-sm transition hover:bg-sky-50 disabled:opacity-60"
            title="Reset to default seed data"
          >
            <RotateCcw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Reset</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b8d0df] bg-white px-4 py-2.5 text-xs text-[#175477] shadow-sm transition hover:bg-sky-50"
          >
            <Download size={15} />
            Export CSV
          </button>

          <button
            onClick={() => {
              setModalMessage("");
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#216789]"
          >
            <Plus size={15} />
            Coordinate shelter
          </button>
        </div>
      </div>

      {/* Success banner */}
      {successBanner && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Error banner */}
      {errorBanner && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 shadow-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Operational shelters */}
        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm transition hover:border-[#b4cddc]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sky-100 p-3 text-sky-600">
              <House size={19} />
            </div>

            <div>
              <p className="text-[9px] text-slate-500">
                Operational shelters
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                {operationalCount}
              </h2>
              <p className="text-[9px] text-slate-400">
                {acceptingCount} accepting arrivals
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Total capacity */}
        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm transition hover:border-[#b4cddc]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <Users size={19} />
            </div>

            <div>
              <p className="text-[9px] text-slate-500">
                Total capacity
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                {totalCapacity.toLocaleString()}
              </h2>
              <p className="text-[9px] text-slate-400">
                {totalOccupied.toLocaleString()} occupied
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Available spaces */}
        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm transition hover:border-[#b4cddc]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <Check size={19} />
            </div>

            <div>
              <p className="text-[9px] text-slate-500">
                Available spaces
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                {availableSpaces.toLocaleString()}
              </h2>
              <p className="text-[9px] text-slate-400">
                Across {shelters.length} active facilities
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Near capacity */}
        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm transition hover:border-[#b4cddc]">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
              <AlertTriangle size={19} />
            </div>

            <div>
              <p className="text-[9px] text-slate-500">
                Near capacity
              </p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                {nearCapacityCount}
              </h2>
              <p className="text-[9px] text-slate-400">
                Requires escalation monitoring
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_repeat(3,minmax(130px,auto))_auto]">
        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 shadow-sm">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shelters by name, area, or service..."
            className="w-full min-w-0 bg-transparent text-[11px] text-[#153f5e] outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[11px] text-slate-600 outline-none shadow-sm focus:border-sky-500"
        >
          <option>All operational areas</option>
          <option>Central Ward</option>
          <option>North Ward</option>
          <option>Eastbank</option>
          <option>West District</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[11px] text-slate-600 outline-none shadow-sm focus:border-sky-500"
        >
          <option>All statuses</option>
          <option>Operational</option>
          <option>Near Capacity</option>
          <option>Full</option>
        </select>

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[11px] text-slate-600 outline-none shadow-sm focus:border-sky-500"
        >
          <option>Any availability</option>
          <option>Available</option>
          <option>Full</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[11px] font-medium transition shadow-sm ${
            showFilters
              ? "border-sky-700 bg-sky-50 text-sky-800"
              : "border-sky-600 bg-white text-sky-700 hover:bg-sky-50"
          }`}
        >
          <Filter size={13} />
          More filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-[#d5e2e9] bg-white p-3 shadow-sm">
          <span className="text-[11px] text-slate-500">
            Filtering by location, capacity risk, and bed availability.
          </span>

          <button
            onClick={clearFilters}
            className="text-[11px] font-semibold text-sky-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Shelter table */}
      <section className="overflow-hidden rounded-xl border border-[#d5e2e9] bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 size={26} className="animate-spin text-[#287da5]" />
            <p className="text-xs">Loading shelters...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-[#d5e2e9] bg-[#f7fafb]">
                <tr>
                  {[
                    "Shelter",
                    "Location",
                    "Capacity",
                    "Occupied",
                    "Remaining",
                    "Services",
                    "Status",
                    "",
                  ].map((heading, index) => (
                    <th
                      key={index}
                      className="whitespace-nowrap px-3.5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredShelters.map((shelter) => (
                  <tr
                    key={shelter.id}
                    onClick={() => setSelected(shelter)}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-[#f0f6f8]"
                  >
                    <td className="whitespace-nowrap px-3.5 py-3.5 text-xs font-semibold text-[#153f5e]">
                      <div>{shelter.name}</div>
                      {shelter.contactPerson && (
                        <div className="text-[10px] font-normal text-slate-400">
                          {shelter.contactPerson}
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3.5 py-3.5 text-xs text-slate-600">
                      {shelter.location}
                    </td>

                    <td className="px-3.5 py-3.5 text-xs font-medium text-slate-700">
                      {shelter.capacity.toLocaleString()}
                    </td>

                    <td className="px-3.5 py-3.5 text-xs font-medium text-slate-700">
                      {shelter.occupied.toLocaleString()}
                    </td>

                    <td className="px-3.5 py-3.5 text-xs font-bold text-emerald-600">
                      {shelter.remaining.toLocaleString()}
                    </td>

                    <td className="px-3.5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {shelter.services.map((service) => (
                          <span
                            key={service}
                            className="whitespace-nowrap rounded-md bg-sky-100 px-2 py-0.5 text-[9px] font-medium text-sky-700"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-3.5 py-3.5">
                      <span
                        className={`rounded-md px-2 py-1 text-[9px] font-semibold ${
                          statusStyles[shelter.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {shelter.status}
                      </span>
                    </td>

                    <td className="px-3.5 py-3.5 text-right">
                      <ChevronRight size={16} className="text-slate-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredShelters.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No emergency shelters matching the selected criteria.
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-[10px] text-slate-500">
            Showing {filteredShelters.length} of {shelters.length} shelters
          </p>
          <span className="text-[9px] text-slate-400">
            Live occupancy sync active
          </span>
        </div>
      </section>

      {/* Shelter details modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#153f5e]">
                Shelter details
              </h2>

              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={19} />
              </button>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center gap-2 mb-2 text-sky-600">
                <House size={22} />
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                  Active Emergency Shelter
                </span>
              </div>

              <h3 className="text-base font-semibold text-[#153f5e]">
                {selected.name}
              </h3>

              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={13} className="text-[#287da5]" />
                {selected.location}
              </p>

              {selected.notes && (
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600 italic bg-white p-2.5 rounded border border-slate-200">
                  "{selected.notes}"
                </p>
              )}

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Total capacity</span>
                  <span className="font-semibold text-slate-800">{selected.capacity}</span>
                </div>

                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Occupied</span>
                  <span className="font-semibold text-slate-800">{selected.occupied}</span>
                </div>

                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Remaining spaces</span>
                  <span className="font-semibold text-emerald-600">
                    {selected.remaining}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Status</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      statusStyles[selected.status]
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>

                {selected.contactPerson && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="flex items-center gap-1 text-slate-500">
                      <User size={12} /> Contact
                    </span>
                    <span className="text-slate-700 font-medium">
                      {selected.contactPerson} {selected.contactPhone ? `(${selected.contactPhone})` : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Occupancy quick update */}
              <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50/50 p-3">
                <label className="mb-1.5 block text-[10px] font-semibold text-[#153f5e]">
                  Update live occupancy headcount
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={selected.capacity}
                    value={editOccupied}
                    onChange={(e) => setEditOccupied(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    disabled={isUpdatingOccupancy}
                    onClick={handleUpdateOccupancy}
                    className="rounded bg-[#287da5] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#206788] disabled:opacity-50 shrink-0"
                  >
                    {isUpdatingOccupancy ? "Saving..." : "Update"}
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-3">
                <p className="mb-2 text-[11px] font-medium text-slate-600">
                  Available services
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {selected.services.map((service) => (
                    <span
                      key={service}
                      className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] text-sky-700"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleDeleteShelter(selected.id)}
                className="flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 size={14} />
                <span>Decommission</span>
              </button>

              <button
                onClick={() => setSelected(null)}
                className="flex-1 rounded-lg bg-[#153f5e] py-2.5 text-xs font-semibold text-white transition hover:bg-[#205879]"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coordinate shelter modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#153f5e]">
                  Coordinate emergency shelter
                </h2>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Register a facility into the emergency accommodation network.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-700">
                  Shelter name *
                </label>

                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. West District Sports Complex"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-[#153f5e] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-700">
                  Operational area *
                </label>

                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-[#153f5e] outline-none focus:border-sky-500"
                >
                  <option>Central Ward</option>
                  <option>North Ward</option>
                  <option>Eastbank</option>
                  <option>West District</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-700">
                    Total capacity *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-[#153f5e] outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-700">
                    Currently occupied
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={newOccupied}
                    onChange={(e) => setNewOccupied(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-[#153f5e] outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-700">
                  Available services (comma separated)
                </label>

                <input
                  value={newServices}
                  onChange={(e) => setNewServices(e.target.value)}
                  placeholder="Food, Medical, Accessible, Childcare"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-[#153f5e] outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-700">
                    Contact person
                  </label>

                  <input
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    placeholder="e.g. Officer Silva"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-[#153f5e] outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-700">
                    Contact phone
                  </label>

                  <input
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-[#153f5e] outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-700">
                  Operational notes
                </label>

                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Access instructions, generator status, water supply..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-[#153f5e] outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {modalMessage && (
                <p className="rounded border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
                  {modalMessage}
                </p>
              )}

              <button
                onClick={addShelter}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#287da5] py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#206889] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Adding shelter...</span>
                  </>
                ) : (
                  <span>Coordinate shelter</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
