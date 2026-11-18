import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Search,
  ChevronRight,
  Plus,
  X,
  Users,
  Home,
  BedDouble,
  Clock,
  ChartNoAxesColumn,
  AlertTriangle,
  Settings2,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { occupancyService } from "../../services/occupancyService";
import type {
  OccupancyShelter,
  Admission,
  OccupancyThreshold,
  OccupancySummary,
} from "../../types/occupancy";

/* ================= DEFAULT FALLBACKS ================= */

const defaultThresholds: OccupancyThreshold = {
  warning: 80,
  critical: 95,
};

/* ================= MAIN COMPONENT ================= */

export default function OccupancyManagementPage() {
  const [shelters, setShelters] = useState<OccupancyShelter[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [thresholds, setThresholds] =
    useState<OccupancyThreshold>(defaultThresholds);
  const [summary, setSummary] = useState<OccupancySummary | null>(null);

  const [modal, setModal] = useState<
    "admission" | "threshold" | "allocation" | null
  >(null);

  const [admissionForm, setAdmissionForm] = useState({
    resident: "",
    shelterId: "SH-001",
    people: "1",
    date: new Date().toISOString().slice(0, 10),
  });

  const [thresholdForm, setThresholdForm] = useState({
    warning: "80",
    critical: "95",
  });

  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= FETCH DATA ================= */

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [sheltersData, summaryData, admissionsData, thresholdsData] =
        await Promise.all([
          occupancyService.getShelters(),
          occupancyService.getSummary(),
          occupancyService.getAdmissions(),
          occupancyService.getThresholds(),
        ]);

      setShelters(sheltersData);
      setSummary(summaryData);
      setAdmissions(admissionsData);
      setThresholds(thresholdsData);

      if (sheltersData.length > 0 && !admissionForm.shelterId) {
        setAdmissionForm((prev) => ({
          ...prev,
          shelterId: sheltersData[0].id,
        }));
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to load occupancy data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [admissionForm.shelterId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-dismiss success toast
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  /* ================= DERIVED CALCULATIONS ================= */

  const totalCapacity = summary?.totalCapacity ?? 0;
  const totalOccupied = summary?.totalOccupied ?? 0;
  const totalReserved = summary?.totalReserved ?? 0;
  const totalAvailable = summary?.totalAvailable ?? 0;
  const occupancyRate = summary?.occupancyRate ?? 0;
  const totalDepartures = summary?.totalDeparturesToday ?? 35;
  const totalAdmissions = summary?.totalAdmissionsToday ?? 62;

  const filteredShelters = useMemo(
    () =>
      shelters.filter(
        (shelter) =>
          shelter.name.toLowerCase().includes(search.toLowerCase()) ||
          shelter.district.toLowerCase().includes(search.toLowerCase())
      ),
    [shelters, search]
  );

  /* ================= SHELTER STATUS ================= */

  const getShelterStatus = (shelter: OccupancyShelter) => {
    const rate =
      shelter.capacity > 0 ? (shelter.occupied / shelter.capacity) * 100 : 0;

    if (rate >= thresholds.critical) {
      return {
        label: "Critical",
        color: "#e94b5a",
        badge: "bg-[#fff0f1] text-[#d93f50]",
      };
    }

    if (rate >= thresholds.warning) {
      return {
        label: "Warning",
        color: "#f2b544",
        badge: "bg-[#fff5e2] text-[#b77b17]",
      };
    }

    return {
      label: "Available",
      color: "#43b99a",
      badge: "bg-[#e5f8f1] text-[#269a77]",
    };
  };

  /* ================= RECORD ADMISSION ================= */

  const handleAdmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const people = Number(admissionForm.people);
    if (!admissionForm.resident.trim() || people <= 0) {
      setSuccessMessage("Please enter a valid resident name and number of people.");
      return;
    }

    const selectedShelter = shelters.find(
      (s) => s.id === admissionForm.shelterId
    );

    if (!selectedShelter) return;

    if (people > selectedShelter.available) {
      setSuccessMessage(
        `Not enough available beds. Only ${selectedShelter.available} spaces are available in ${selectedShelter.name}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await occupancyService.recordAdmission({
        resident: admissionForm.resident.trim(),
        shelterId: admissionForm.shelterId,
        people,
        date: admissionForm.date,
      });

      setAdmissions((prev) => [created, ...prev]);

      setAdmissionForm({
        resident: "",
        shelterId: shelters[0]?.id || "SH-001",
        people: "1",
        date: new Date().toISOString().slice(0, 10),
      });

      setModal(null);
      setSuccessMessage(`Admission ${created.id} recorded successfully.`);

      // Refresh live shelters & summary from backend
      const [freshShelters, freshSummary] = await Promise.all([
        occupancyService.getShelters(),
        occupancyService.getSummary(),
      ]);
      setShelters(freshShelters);
      setSummary(freshSummary);
    } catch (err: any) {
      setSuccessMessage(err?.message || "Failed to record admission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= CONFIGURE THRESHOLDS ================= */

  const handleThresholdSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const warning = Number(thresholdForm.warning);
    const critical = Number(thresholdForm.critical);

    if (warning <= 0 || critical > 100 || critical <= warning) {
      setSuccessMessage(
        "Critical threshold must be higher than warning and both must be within 1–100%."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await occupancyService.saveThresholds({ warning, critical });
      setThresholds(saved);
      setModal(null);
      setSuccessMessage("Occupancy thresholds updated successfully.");

      // Refresh shelters with updated thresholds
      const [freshShelters, freshSummary] = await Promise.all([
        occupancyService.getShelters(),
        occupancyService.getSummary(),
      ]);
      setShelters(freshShelters);
      setSummary(freshSummary);
    } catch (err: any) {
      setSuccessMessage(err?.message || "Failed to update thresholds.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-5 pb-10">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[9px] mb-7">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="text-slate-400">Shelter Administration</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="font-semibold">Occupancy Management</span>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={loadData}
              className="text-xs font-semibold text-red-600 hover:text-red-800 underline flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[23px] md:text-[25px] font-normal">
              Occupancy Management
            </h1>
            <p className="text-[11px] text-slate-500 mt-2">
              Monitor capacity, reservations, admissions, and departures in real time.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={loadData}
              title="Refresh occupancy data"
              disabled={isLoading}
              className="h-9 px-3 border border-[#aac4d2] bg-white rounded-lg text-[10px] font-semibold flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => {
                setThresholdForm({
                  warning: String(thresholds.warning),
                  critical: String(thresholds.critical),
                });
                setModal("threshold");
              }}
              className="h-9 px-3 md:px-4 border border-[#aac4d2] bg-white rounded-lg text-[10px] font-semibold flex items-center gap-2 hover:bg-slate-50"
            >
              <Settings2 size={14} />
              Configure thresholds
            </button>

            <button
              onClick={() => setModal("admission")}
              className="h-9 px-3 md:px-4 bg-[#1c5d83] text-white rounded-lg text-[10px] font-semibold flex items-center gap-2 hover:bg-[#144665]"
            >
              <Plus size={14} />
              Record admission
            </button>
          </div>
        </div>

        {/* CAPACITY WARNING */}
        {shelters.some((s) => getShelterStatus(s).label !== "Available") && (
          <section className="bg-[#fff8e9] border border-[#f6d58b] border-l-[3px] border-l-[#f4b638] rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <AlertTriangle size={18} className="text-[#a56b0c] shrink-0" />

            <div className="flex-1">
              <p className="text-[10px] font-bold text-[#96620d]">
                Capacity warning
              </p>
              <p className="text-[9px] text-[#96620d] mt-1">
                {shelters
                  .filter((s) => getShelterStatus(s).label !== "Available")
                  .map(
                    (s) =>
                      `${s.name} is ${Math.round(
                        (s.occupied / s.capacity) * 100
                      )}% occupied`
                  )
                  .join(". ")}
                .
              </p>
            </div>

            <button
              onClick={() => setModal("allocation")}
              className="h-9 px-3 border border-[#d8c28f] bg-white rounded-lg text-[9px] font-semibold whitespace-nowrap hover:bg-[#fffdf7]"
            >
              Review allocation plan
            </button>
          </section>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-3">
          <KpiCard
            icon={<Users size={18} />}
            color="blue"
            title="Total capacity"
            value={totalCapacity.toLocaleString()}
            description={`Across ${shelters.length} shelters`}
          />

          <KpiCard
            icon={<Home size={18} />}
            color="blue"
            title="Occupied"
            value={totalOccupied.toLocaleString()}
            description={`${occupancyRate.toFixed(1)}% overall`}
          />

          <KpiCard
            icon={<BedDouble size={18} />}
            color="green"
            title="Available"
            value={totalAvailable.toLocaleString()}
            description="Safe to allocate"
          />

          <KpiCard
            icon={<Clock size={18} />}
            color="orange"
            title="Reserved"
            value={totalReserved.toLocaleString()}
            description="Approved arrivals"
          />

          <KpiCard
            icon={<ChartNoAxesColumn size={18} />}
            color="blue"
            title="Departures today"
            value={String(totalDepartures)}
            description={`${totalAdmissions} admissions`}
          />
        </div>

        {/* OCCUPANCY + DISTRIBUTION */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.25fr)_minmax(300px,0.9fr)] gap-3">
          {/* SHELTER-WISE OCCUPANCY */}
          <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-semibold">Shelter-wise occupancy</h2>
                <p className="text-[9px] text-slate-400 mt-1">
                  Warning at {thresholds.warning}% · Critical at{" "}
                  {thresholds.critical}%
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter shelters..."
                    className="h-7 w-40 pl-7 pr-2 border border-slate-200 rounded-md text-[9px] outline-none focus:border-[#45b99b]"
                  />
                </div>

                <span className="bg-[#eaf3f8] text-[#267ba6] px-2 py-1 rounded-md text-[8px] font-semibold whitespace-nowrap">
                  Live capacity
                </span>
              </div>
            </div>

            <div className="px-4 py-1">
              {isLoading && shelters.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#1c5d83]" />
                  <span>Loading shelters...</span>
                </div>
              ) : (
                filteredShelters.map((shelter) => {
                  const rate =
                    shelter.capacity > 0
                      ? (shelter.occupied / shelter.capacity) * 100
                      : 0;

                  const available =
                    shelter.capacity - shelter.occupied - shelter.reserved;

                  const shelterStatus = getShelterStatus(shelter);

                  return (
                    <div
                      key={shelter.id}
                      className="py-4 border-b border-[#dbe6eb] last:border-b-0"
                    >
                      <div className="flex justify-between items-center gap-3 mb-2">
                        <div>
                          <p className="text-[10px] font-semibold">
                            {shelter.name}
                          </p>
                          <p className="text-[8px] text-slate-400 mt-1">
                            {shelter.district} · {available} beds available
                          </p>
                        </div>

                        <span
                          className={`px-2 py-1 rounded-md text-[8px] font-semibold whitespace-nowrap ${shelterStatus.badge}`}
                        >
                          {shelterStatus.label} · {Math.round(rate)}%
                        </span>
                      </div>

                      <div className="h-[6px] w-full rounded-full bg-[#e9eff2] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(rate, 100)}%`,
                            backgroundColor: shelterStatus.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}

              {filteredShelters.length === 0 && !isLoading && (
                <div className="py-12 text-center text-xs text-slate-400">
                  No shelters found.
                </div>
              )}
            </div>
          </section>

          {/* CAPACITY DISTRIBUTION */}
          <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-200">
              <h2 className="text-xs font-semibold">Capacity distribution</h2>
              <p className="text-[9px] text-slate-400 mt-1">
                All registered shelters
              </p>
            </div>

            <div className="px-5 py-5">
              {/* DONUT CHART */}
              <div className="flex justify-center py-1">
                <div
                  className="relative w-[150px] h-[150px] rounded-full"
                  style={{
                    background:
                      totalCapacity > 0
                        ? `conic-gradient(
                            #21638d 0% ${occupancyRate}%,
                            #45b99b ${occupancyRate}% ${
                            occupancyRate +
                            (totalAvailable / totalCapacity) * 100
                          }%,
                            #f3b443 ${
                            occupancyRate +
                            (totalAvailable / totalCapacity) * 100
                          }% 100%
                          )`
                        : "#e9eff2",
                  }}
                >
                  <div className="absolute inset-[23px] bg-white rounded-full flex flex-col items-center justify-center">
                    <p className="text-[21px] font-bold">
                      {occupancyRate.toFixed(1)}%
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1">Occupied</p>
                  </div>
                </div>
              </div>

              {/* LEGEND */}
              <div className="mt-5 space-y-4">
                <LegendItem
                  color="#21638d"
                  label="Occupied"
                  value={totalOccupied.toLocaleString()}
                />

                <LegendItem
                  color="#45b99b"
                  label="Available"
                  value={totalAvailable.toLocaleString()}
                />

                <LegendItem
                  color="#f3b443"
                  label="Reserved"
                  value={totalReserved.toLocaleString()}
                />
              </div>
            </div>
          </section>
        </div>

        {/* ADMISSION HISTORY */}
        {admissions.length > 0 && (
          <section className="mt-3 bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200">
              <h2 className="text-xs font-semibold">Recent admissions</h2>
              <p className="text-[9px] text-slate-400 mt-1">
                Resident admissions recorded in the system
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left">
                <thead className="bg-[#f5f9fa] text-[9px] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Admission ID</th>
                    <th className="px-4 py-3">Resident</th>
                    <th className="px-4 py-3">Shelter</th>
                    <th className="px-4 py-3">People</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {admissions.map((admission) => (
                    <tr
                      key={admission.id}
                      className="border-t border-slate-100 text-[10px]"
                    >
                      <td className="px-4 py-3 font-semibold">{admission.id}</td>
                      <td className="px-4 py-3">{admission.resident}</td>
                      <td className="px-4 py-3">
                        {admission.shelterName ||
                          shelters.find((s) => s.id === admission.shelterId)?.name ||
                          admission.shelterId}
                      </td>
                      <td className="px-4 py-3">{admission.people}</td>
                      <td className="px-4 py-3">{admission.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* MODALS */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-semibold">
                  {modal === "admission" && "Record admission"}
                  {modal === "threshold" && "Configure thresholds"}
                  {modal === "allocation" && "Review allocation plan"}
                </h2>

                <p className="text-[10px] text-slate-400 mt-1">
                  {modal === "admission"
                    ? "Register a new resident admission."
                    : modal === "threshold"
                    ? "Set shelter occupancy warning levels."
                    : "Review shelters requiring attention."}
                </p>
              </div>

              <button
                onClick={() => setModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            {/* ADMISSION FORM */}
            {modal === "admission" && (
              <form onSubmit={handleAdmission} className="space-y-4">
                <FormInput
                  label="Resident / Household name"
                  placeholder="Enter resident name"
                  value={admissionForm.resident}
                  onChange={(v) =>
                    setAdmissionForm({ ...admissionForm, resident: v })
                  }
                />

                <div>
                  <label className="text-xs font-medium block mb-1.5">
                    Select shelter
                  </label>

                  <select
                    value={admissionForm.shelterId}
                    onChange={(e) =>
                      setAdmissionForm({
                        ...admissionForm,
                        shelterId: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
                  >
                    {shelters.map((shelter) => {
                      const available =
                        shelter.capacity - shelter.occupied - shelter.reserved;

                      return (
                        <option
                          key={shelter.id}
                          value={shelter.id}
                          disabled={available <= 0}
                        >
                          {shelter.name} ({available} available)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <FormInput
                  label="Number of people"
                  type="number"
                  value={admissionForm.people}
                  onChange={(v) =>
                    setAdmissionForm({ ...admissionForm, people: v })
                  }
                />

                <div>
                  <label className="text-xs font-medium block mb-1.5">
                    Admission date
                  </label>

                  <input
                    required
                    type="date"
                    value={admissionForm.date}
                    onChange={(e) =>
                      setAdmissionForm({
                        ...admissionForm,
                        date: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1c5d83] text-white rounded-lg py-3 text-xs font-semibold hover:bg-[#144665] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{isSubmitting ? "Recording..." : "Confirm admission"}</span>
                </button>
              </form>
            )}

            {/* THRESHOLD FORM */}
            {modal === "threshold" && (
              <form onSubmit={handleThresholdSave} className="space-y-4">
                <FormInput
                  label="Warning threshold (%)"
                  type="number"
                  value={thresholdForm.warning}
                  onChange={(v) =>
                    setThresholdForm({ ...thresholdForm, warning: v })
                  }
                />

                <FormInput
                  label="Critical threshold (%)"
                  type="number"
                  value={thresholdForm.critical}
                  onChange={(v) =>
                    setThresholdForm({ ...thresholdForm, critical: v })
                  }
                />

                <p className="text-[10px] text-slate-400">
                  Warning should be lower than critical. Values must be between 1 and 100.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1c5d83] text-white rounded-lg py-3 text-xs font-semibold hover:bg-[#144665] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{isSubmitting ? "Saving..." : "Save thresholds"}</span>
                </button>
              </form>
            )}

            {/* ALLOCATION PLAN */}
            {modal === "allocation" && (
              <div className="space-y-3">
                {shelters
                  .filter((s) => getShelterStatus(s).label !== "Available")
                  .map((shelter) => (
                    <div
                      key={shelter.id}
                      className="border border-slate-200 rounded-lg p-3"
                    >
                      <div className="flex justify-between gap-2">
                        <p className="text-xs font-semibold">{shelter.name}</p>
                        <span className="text-xs text-red-500 font-semibold">
                          {Math.round((shelter.occupied / shelter.capacity) * 100)}%
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 mt-1">
                        {shelter.capacity - shelter.occupied - shelter.reserved}{" "}
                        spaces available
                      </p>
                    </div>
                  ))}

                <p className="text-[10px] text-slate-400">
                  Review the available spaces before reallocating residents.
                </p>
              </div>
            )}

            <button
              onClick={() => setModal(null)}
              className="w-full mt-4 border border-slate-200 rounded-lg py-2.5 text-xs font-semibold hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS / ERROR TOAST */}
      {successMessage && (
        <div className="fixed bottom-5 right-5 z-[60] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-start gap-3">
          <CheckCircle2 size={17} className="text-[#37b18d] shrink-0 mt-0.5" />
          <p className="text-xs leading-5">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-white/80 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function KpiCard({
  icon,
  color,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  color: "blue" | "green" | "orange";
  title: string;
  value: string;
  description: string;
}) {
  const styles = {
    blue: "bg-[#eaf3f8] text-[#287da7]",
    green: "bg-[#e5f8f1] text-[#37b18d]",
    orange: "bg-[#fff4df] text-[#e2a02d]",
  };

  return (
    <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm p-3.5 flex items-center gap-3 min-h-[77px]">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${styles[color]}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] text-slate-500">{title}</p>
        <h3 className="text-[21px] font-bold leading-tight mt-0.5">{value}</h3>
        <p className="text-[8px] text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-[9px] text-slate-600">{label}</span>
      </div>

      <span className="text-[9px] font-semibold">{value}</span>
    </div>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>

      <input
        required
        type={type}
        min={type === "number" ? 1 : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      />
    </div>
  );
}
