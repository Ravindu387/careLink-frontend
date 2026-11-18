import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Check,
  Clock,
  AlertTriangle,
  CalendarDays,
  UserRound,
  Filter,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { staffService } from "../../services/staffService";
import type {
  Staff,
  StaffStatus,
  Availability,
  ShiftDay,
  StaffSummary,
} from "../../types/staff";

/* ================= SAMPLE / FALLBACK DATA ================= */

const fallbackStaff: Staff[] = [
  {
    id: "ST-014",
    name: "Anura Perera",
    designation: "Shelter Manager",
    contact: "077 245 8891",
    email: "anura@carelink.org",
    shelter: "Riverton Central",
    shift: "Morning",
    availability: "Available",
    status: "Active",
  },
  {
    id: "ST-027",
    name: "Dr. Malini Rao",
    designation: "Medical Officer",
    contact: "071 928 1140",
    email: "malini@carelink.org",
    shelter: "Riverton Central",
    shift: "Day",
    availability: "On duty",
    status: "Active",
  },
  {
    id: "ST-042",
    name: "K. Bandara",
    designation: "Security Officer",
    contact: "075 318 0944",
    email: "bandara@carelink.org",
    shelter: "North Community",
    shift: "Night",
    availability: "Available",
    status: "Active",
  },
  {
    id: "ST-061",
    name: "S. Nirosha",
    designation: "Kitchen Staff",
    contact: "077 624 0122",
    email: "nirosha@carelink.org",
    shelter: "Lakeside Sports",
    shift: "Evening",
    availability: "Leave",
    status: "Active",
  },
];

const shelters = [
  "Riverton Central",
  "North Community",
  "Lakeside Sports",
  "St. Mary Civic Centre",
  "Hillview College",
];

const designations = [
  "Shelter Manager",
  "Medical Officer",
  "Nurse",
  "Security Officer",
  "Kitchen Staff",
  "Volunteer Coordinator",
  "Cleaning Staff",
  "Administrative Officer",
];

const shiftTypes = ["Morning", "Day", "Evening", "Night"];

const initialCoverage: ShiftDay[] = [
  { day: "Mon", date: 22, assigned: 18, capacity: 24, shelter: "Riverton Central" },
  { day: "Tue", date: 23, assigned: 19, capacity: 24, shelter: "Riverton Central" },
  { day: "Wed", date: 24, assigned: 20, capacity: 24, shelter: "Riverton Central" },
  { day: "Thu", date: 25, assigned: 21, capacity: 24, shelter: "Riverton Central" },
  { day: "Fri", date: 26, assigned: 18, capacity: 24, shelter: "Riverton Central" },
  { day: "Sat", date: 27, assigned: 19, capacity: 24, shelter: "Riverton Central" },
  { day: "Sun", date: 28, assigned: 20, capacity: 24, shelter: "Riverton Central" },
];

/* ================= MAIN COMPONENT ================= */

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>(fallbackStaff);
  const [coverage, setCoverage] = useState<ShiftDay[]>(initialCoverage);
  const [summary, setSummary] = useState<StaffSummary | null>(null);

  const [search, setSearch] = useState("");
  const [shelterFilter, setShelterFilter] = useState("All shelters");
  const [designationFilter, setDesignationFilter] = useState("All designations");
  const [shiftFilter, setShiftFilter] = useState("All shifts");
  const [availabilityFilter, setAvailabilityFilter] = useState("All availability");

  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingCoverage, setIsUpdatingCoverage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [newStaff, setNewStaff] = useState({
    name: "",
    designation: "Shelter Manager",
    contact: "",
    email: "",
    shelter: "Riverton Central",
    shift: "Morning",
    availability: "Available" as Availability,
  });

  // Fetch summary metrics
  const fetchSummary = useCallback(async () => {
    try {
      const data = await staffService.getStaffSummary();
      setSummary(data);
    } catch {
      // Fallback calculation from state
      const total = staff.filter((s) => s.status === "Active").length;
      const duty = staff.filter((s) => s.status === "Active" && s.availability === "On duty").length;
      const unavail = staff.filter(
        (s) => s.status === "Active" && (s.availability === "Leave" || s.availability === "Absent")
      ).length;
      const next = staff.filter(
        (s) => s.status === "Active" && s.availability === "Available" && s.shift !== "Night"
      ).length;
      setSummary({ totalStaff: total, onDuty: duty, nextShift: next, unavailable: unavail });
    }
  }, [staff]);

  // Fetch staff list
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await staffService.getAllStaff();
      setStaff(data);
    } catch {
      setErrorMessage("Could not load staff records. Showing cached data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch weekly shift coverage
  const fetchCoverage = useCallback(async () => {
    try {
      const data = await staffService.getCoverage("Riverton Central");
      if (data && data.length > 0) {
        setCoverage(data);
      }
    } catch {
      // Keep initial coverage
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchSummary();
    fetchCoverage();
  }, [fetchStaff, fetchSummary, fetchCoverage]);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  /* ================= KPI VALUES ================= */

  const totalStaffVal = summary ? summary.totalStaff : staff.filter((s) => s.status === "Active").length;
  const onDutyVal = summary
    ? summary.onDuty
    : staff.filter((s) => s.status === "Active" && s.availability === "On duty").length;
  const nextShiftVal = summary
    ? summary.nextShift
    : staff.filter(
        (s) => s.status === "Active" && s.availability === "Available" && s.shift !== "Night"
      ).length;
  const unavailableVal = summary
    ? summary.unavailable
    : staff.filter(
        (s) => s.status === "Active" && (s.availability === "Leave" || s.availability === "Absent")
      ).length;

  /* ================= FILTER STAFF ================= */

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const searchMatch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.designation.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());

      const shelterMatch =
        shelterFilter === "All shelters" || s.shelter === shelterFilter;

      const designationMatch =
        designationFilter === "All designations" ||
        s.designation === designationFilter;

      const shiftMatch =
        shiftFilter === "All shifts" || s.shift === shiftFilter;

      const availabilityMatch =
        availabilityFilter === "All availability" ||
        s.availability === availabilityFilter;

      return (
        searchMatch &&
        shelterMatch &&
        designationMatch &&
        shiftMatch &&
        availabilityMatch
      );
    });
  }, [
    staff,
    search,
    shelterFilter,
    designationFilter,
    shiftFilter,
    availabilityFilter,
  ]);

  /* ================= RESET FILTERS ================= */

  const resetFilters = () => {
    setSearch("");
    setShelterFilter("All shelters");
    setDesignationFilter("All designations");
    setShiftFilter("All shifts");
    setAvailabilityFilter("All availability");
  };

  /* ================= ADD STAFF ================= */

  const handleAddStaff = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newStaff.name.trim() || !newStaff.contact.trim() || !newStaff.email.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const created = await staffService.createStaff({
        name: newStaff.name.trim(),
        designation: newStaff.designation,
        contact: newStaff.contact.trim(),
        email: newStaff.email.trim(),
        shelter: newStaff.shelter,
        shift: newStaff.shift,
        availability: newStaff.availability,
        status: "Active",
      });

      setStaff((prev) => [created, ...prev]);
      setNewStaff({
        name: "",
        designation: "Shelter Manager",
        contact: "",
        email: "",
        shelter: "Riverton Central",
        shift: "Morning",
        availability: "Available",
      });

      resetFilters();
      setShowAddModal(false);
      setSuccessMessage(`New staff member "${created.name}" added successfully.`);
      fetchSummary();
    } catch {
      setErrorMessage("Failed to add new staff member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= UPDATE STAFF ================= */

  const updateStaff = async (id: string, changes: Partial<Staff>) => {
    try {
      const updated = await staffService.updateStaff(id, changes);
      setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));

      setSelectedStaff((prev) => (prev && prev.id === id ? updated : prev));
      setSuccessMessage("Staff information updated successfully.");
      fetchSummary();
    } catch {
      setErrorMessage("Failed to update staff record.");
    }
  };

  /* ================= SHIFT COVERAGE ================= */

  const updateCoverageLocally = (index: number, value: number) => {
    setCoverage((prev) =>
      prev.map((day, i) =>
        i === index
          ? {
              ...day,
              assigned: Math.min(day.capacity, Math.max(0, value)),
            }
          : day
      )
    );
  };

  const saveCoverageToBackend = async (newCoverage: ShiftDay[]) => {
    setIsUpdatingCoverage(true);
    try {
      const updated = await staffService.updateCoverage(newCoverage);
      setCoverage(updated);
      setSuccessMessage("Weekly shift coverage updated.");
      setShowShiftModal(false);
    } catch {
      setErrorMessage("Failed to save shift coverage to server.");
    } finally {
      setIsUpdatingCoverage(false);
    }
  };

  const adequateCoverage = coverage.every(
    (day) => day.assigned >= day.capacity * 0.75
  );

  /* ================= UI ================= */

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
          <span className="font-semibold">Staff Management</span>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-500 hover:text-red-700 font-semibold"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-emerald-500 hover:text-emerald-700 font-semibold"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[23px] md:text-[25px] font-normal">
              Staff Management
            </h1>
            <p className="text-[11px] text-slate-500 mt-2">
              Manage shelter teams, roles, availability, shifts, and responsibilities.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchStaff();
                fetchSummary();
                fetchCoverage();
              }}
              disabled={loading}
              title="Refresh staff records"
              className="h-9 px-3 border border-[#aac4d2] bg-white rounded-lg text-[10px] font-semibold flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setShowShiftModal(true)}
              className="h-9 px-4 border border-[#aac4d2] bg-white rounded-lg text-[10px] font-semibold hover:bg-slate-50"
            >
              Manage shifts
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="h-9 px-4 bg-[#1c638a] text-white rounded-lg text-[10px] font-semibold flex items-center gap-2 hover:bg-[#144665]"
            >
              <Plus size={14} />
              Add staff member
            </button>
          </div>
        </div>

        {/* ================= KPI CARDS ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
          <KpiCard
            icon={<UserRound size={19} />}
            color="blue"
            title="Total staff"
            value={totalStaffVal.toString()}
            description="Across 5 shelters"
          />

          <KpiCard
            icon={<Check size={19} />}
            color="green"
            title="On duty now"
            value={onDutyVal.toString()}
            description="Currently working"
          />

          <KpiCard
            icon={<Clock size={19} />}
            color="blue"
            title="Next shift"
            value={nextShiftVal.toString()}
            description="Available for assignment"
          />

          <KpiCard
            icon={<AlertTriangle size={19} />}
            color="orange"
            title="Unavailable"
            value={unavailableVal.toString()}
            description="Leave and absent"
          />
        </section>

        {/* ================= DIRECTORY + COVERAGE ================= */}
        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,0.9fr)] gap-3">
          {/* STAFF DIRECTORY */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">
            <div className="px-3.5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold">Staff directory</h2>
                <p className="text-[8px] text-slate-400 mt-1">
                  Verified shelter personnel · {filteredStaff.length} records
                </p>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-9 px-3 border rounded-lg text-[10px] font-semibold flex items-center gap-2 ${
                  showFilters
                    ? "border-[#2785b7] text-[#2785b7]"
                    : "border-[#aac4d2]"
                }`}
              >
                <Filter size={13} />
                Filters
              </button>
            </div>

            {/* SEARCH */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search staff ID, name, designation..."
                  className="w-full h-9 border border-slate-200 rounded-lg pl-9 pr-3 text-[10px] outline-none focus:border-[#45b99b]"
                />
              </div>
            </div>

            {/* FILTER PANEL */}
            {showFilters && (
              <div className="p-3 bg-[#f7fafb] border-b border-slate-200 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <FilterSelect
                    value={shelterFilter}
                    options={["All shelters", ...shelters]}
                    onChange={setShelterFilter}
                  />

                  <FilterSelect
                    value={designationFilter}
                    options={["All designations", ...designations]}
                    onChange={setDesignationFilter}
                  />

                  <FilterSelect
                    value={shiftFilter}
                    options={["All shifts", ...shiftTypes]}
                    onChange={setShiftFilter}
                  />

                  <FilterSelect
                    value={availabilityFilter}
                    options={[
                      "All availability",
                      "Available",
                      "On duty",
                      "Leave",
                      "Absent",
                    ]}
                    onChange={setAvailabilityFilter}
                  />
                </div>

                <button
                  onClick={resetFilters}
                  className="text-[9px] text-[#267ca6] font-semibold mt-3"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* LOADING STATE */}
            {loading && (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
                <Loader2 size={18} className="animate-spin text-[#1c638a]" />
                <span className="text-xs">Loading staff records...</span>
              </div>
            )}

            {/* TABLE */}
            {!loading && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-[#f5f9fa] border-b border-slate-200">
                    <tr className="text-[8px] text-slate-500">
                      <th className="px-3 py-3 font-medium">Staff ID</th>
                      <th className="px-3 py-3 font-medium">Full Name</th>
                      <th className="px-3 py-3 font-medium">Designation</th>
                      <th className="px-3 py-3 font-medium">Contact</th>
                      <th className="px-3 py-3 font-medium">Email</th>
                      <th className="px-3 py-3 font-medium">Shelter</th>
                      <th className="px-3 py-3 font-medium">Shift</th>
                      <th className="px-3 py-3 font-medium">Availability</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStaff.map((member) => (
                      <tr
                        key={member.id}
                        onClick={() => setSelectedStaff(member)}
                        className="border-b border-slate-100 hover:bg-[#f5faf9] cursor-pointer text-[8px] transition"
                      >
                        <td className="px-3 py-3.5 font-semibold whitespace-nowrap text-[#1c638a]">
                          {member.id}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          {member.name}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          {member.designation}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          {member.contact}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          {member.email}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          {member.shelter}
                        </td>
                        <td className="px-3 py-3.5">{member.shift}</td>
                        <td className="px-3 py-3.5">
                          <AvailabilityBadge availability={member.availability} />
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`px-2 py-1 rounded-md text-[8px] font-semibold ${
                              member.status === "Active"
                                ? "bg-[#e5f8f1] text-[#218d70]"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <ChevronRight size={13} className="text-slate-400" />
                        </td>
                      </tr>
                    ))}

                    {filteredStaff.length === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="text-center py-12 text-xs text-slate-400"
                        >
                          No staff members found matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-3.5 py-3 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[9px] text-slate-400">
                Showing {filteredStaff.length} staff members
              </p>

              <button
                onClick={() => setShowAddModal(true)}
                className="text-[9px] font-semibold text-[#267ca6] flex items-center gap-1 hover:underline"
              >
                <Plus size={12} />
                Add staff
              </button>
            </div>
          </div>

          {/* WEEKLY SHIFT COVERAGE */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden h-fit">
            <div className="px-3.5 py-3.5 border-b border-slate-200">
              <h2 className="text-xs font-semibold">Weekly shift coverage</h2>
              <p className="text-[8px] text-slate-400 mt-1">
                Riverton Central · 22–28 June
              </p>
            </div>

            <div className="p-3.5 space-y-4">
              {coverage.map((day, index) => {
                const percentage = Math.round(
                  (day.assigned / (day.capacity || 1)) * 100
                );

                return (
                  <div key={day.day} className="flex items-center gap-2">
                    <div className="w-10 shrink-0">
                      <p className="text-[9px] font-semibold">{day.day}</p>
                      <p className="text-[8px] text-slate-400">{day.date}</p>
                    </div>

                    <div className="flex-1 h-[6px] rounded-full bg-[#e9eef1] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percentage >= 75 ? "bg-[#48b99c]" : "bg-[#efb44b]"
                        }`}
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      />
                    </div>

                    <button
                      title="Click to cycle daily shift coverage (+1)"
                      onClick={() => {
                        const nextVal =
                          day.assigned >= day.capacity ? 0 : day.assigned + 1;
                        const updated = coverage.map((d, i) =>
                          i === index ? { ...d, assigned: nextVal } : d
                        );
                        setCoverage(updated);
                        staffService.updateCoverage(updated).catch(() => {});
                      }}
                      className="w-9 text-right text-[8px] font-medium hover:text-[#2785b7] transition"
                    >
                      {day.assigned}/{day.capacity}
                    </button>
                  </div>
                );
              })}

              {/* COVERAGE STATUS */}
              <div
                className={`rounded-lg p-3 flex items-start gap-2 mt-5 transition-colors ${
                  adequateCoverage ? "bg-[#eef9f5]" : "bg-[#fff5e5]"
                }`}
              >
                {adequateCoverage ? (
                  <Check size={15} className="text-[#168e6e] mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle
                    size={15}
                    className="text-[#d99a24] mt-0.5 shrink-0"
                  />
                )}

                <div>
                  <p className="text-[8px] font-semibold">
                    {adequateCoverage
                      ? "Coverage is adequate"
                      : "Staff coverage requires attention"}
                  </p>
                  <p className="text-[8px] text-slate-500 mt-1">
                    {adequateCoverage
                      ? "All critical roles have assigned staff."
                      : "Some days have less than 75% staffing coverage."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowShiftModal(true)}
                className="w-full h-9 border border-slate-200 rounded-lg text-[9px] font-semibold hover:bg-slate-50 flex items-center justify-center gap-2 transition"
              >
                <CalendarDays size={13} />
                Manage weekly shifts
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= ADD STAFF MODAL ================= */}
      {showAddModal && (
        <Modal
          title="Add staff member"
          subtitle="Register a new shelter team member."
          onClose={() => setShowAddModal(false)}
        >
          <form onSubmit={handleAddStaff} className="space-y-4">
            <FormInput
              label="Full name"
              placeholder="Enter full name"
              value={newStaff.name}
              onChange={(v) => setNewStaff({ ...newStaff, name: v })}
            />

            <FormSelect
              label="Designation"
              value={newStaff.designation}
              options={designations.map((d) => ({
                value: d,
                label: d,
              }))}
              onChange={(v) => setNewStaff({ ...newStaff, designation: v })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Contact number"
                placeholder="077 123 4567"
                value={newStaff.contact}
                onChange={(v) => setNewStaff({ ...newStaff, contact: v })}
              />

              <FormInput
                label="Email address"
                type="email"
                placeholder="staff@carelink.org"
                value={newStaff.email}
                onChange={(v) => setNewStaff({ ...newStaff, email: v })}
              />
            </div>

            <FormSelect
              label="Assigned shelter"
              value={newStaff.shelter}
              options={shelters.map((s) => ({
                value: s,
                label: s,
              }))}
              onChange={(v) => setNewStaff({ ...newStaff, shelter: v })}
            />

            <FormSelect
              label="Assigned shift"
              value={newStaff.shift}
              options={shiftTypes.map((s) => ({
                value: s,
                label: s,
              }))}
              onChange={(v) => setNewStaff({ ...newStaff, shift: v })}
            />

            <FormSelect
              label="Availability"
              value={newStaff.availability}
              options={["Available", "On duty", "Leave", "Absent"].map((s) => ({
                value: s,
                label: s,
              }))}
              onChange={(v) =>
                setNewStaff({
                  ...newStaff,
                  availability: v as Availability,
                })
              }
            />

            <ModalActions
              onCancel={() => setShowAddModal(false)}
              submitLabel={isSubmitting ? "Registering..." : "Register staff"}
              loading={isSubmitting}
            />
          </form>
        </Modal>
      )}

      {/* ================= MANAGE SHIFTS MODAL ================= */}
      {showShiftModal && (
        <Modal
          title="Manage weekly shifts"
          subtitle="Update the number of staff assigned to each day."
          onClose={() => setShowShiftModal(false)}
        >
          <div className="space-y-4">
            {coverage.map((day, index) => (
              <div
                key={day.day}
                className="border border-slate-100 rounded-lg p-3 bg-slate-50/50"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xs font-semibold">
                      {day.day}, {day.date} June
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1">
                      Staff assigned
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#1c638a]">
                    {day.assigned}/{day.capacity}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={day.capacity}
                  value={day.assigned}
                  onChange={(e) =>
                    updateCoverageLocally(index, Number(e.target.value))
                  }
                  className="w-full accent-[#35b795]"
                />

                <div className="flex justify-between text-[8px] text-slate-400 mt-1">
                  <span>0 staff</span>
                  <span>{day.capacity} staff</span>
                </div>
              </div>
            ))}

            <button
              onClick={() => saveCoverageToBackend(coverage)}
              disabled={isUpdatingCoverage}
              className="w-full bg-[#1c638a] hover:bg-[#144665] text-white rounded-lg py-3 text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {isUpdatingCoverage ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save shift coverage</span>
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* ================= STAFF DETAILS PANEL ================= */}
      {selectedStaff && (
        <div className="fixed inset-0 z-40 bg-black/30 flex justify-end animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Staff details</h2>
              <button
                onClick={() => setSelectedStaff(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-7">
              <div className="w-16 h-16 rounded-full bg-[#eaf3f8] text-[#287da7] flex items-center justify-center">
                <UserRound size={28} />
              </div>

              <h3 className="text-lg font-semibold mt-4">
                {selectedStaff.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedStaff.id} · {selectedStaff.designation}
              </p>

              <div className="mt-3">
                <AvailabilityBadge availability={selectedStaff.availability} />
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <DetailRow
                icon={<Phone size={15} />}
                label="Contact number"
                value={selectedStaff.contact}
              />

              <DetailRow
                icon={<Mail size={15} />}
                label="Email"
                value={selectedStaff.email}
              />

              <DetailRow
                icon={<MapPin size={15} />}
                label="Assigned shelter"
                value={selectedStaff.shelter}
              />

              <DetailRow
                icon={<BriefcaseBusiness size={15} />}
                label="Designation"
                value={selectedStaff.designation}
              />

              <DetailRow
                icon={<CalendarDays size={15} />}
                label="Assigned shift"
                value={selectedStaff.shift}
              />
            </div>

            <div className="mt-8 space-y-3">
              <h3 className="text-xs font-semibold">Update availability</h3>

              <FormSelect
                label="Availability status"
                value={selectedStaff.availability}
                options={["Available", "On duty", "Leave", "Absent"].map(
                  (s) => ({ value: s, label: s })
                )}
                onChange={(v) =>
                  updateStaff(selectedStaff.id, {
                    availability: v as Availability,
                  })
                }
              />

              <FormSelect
                label="Assigned shift"
                value={selectedStaff.shift}
                options={shiftTypes.map((s) => ({
                  value: s,
                  label: s,
                }))}
                onChange={(v) =>
                  updateStaff(selectedStaff.id, { shift: v })
                }
              />

              <FormSelect
                label="Account status"
                value={selectedStaff.status}
                options={["Active", "Inactive"].map((s) => ({
                  value: s,
                  label: s,
                }))}
                onChange={(v) =>
                  updateStaff(selectedStaff.id, {
                    status: v as StaffStatus,
                  })
                }
              />

              <button
                onClick={() => setSelectedStaff(null)}
                className="w-full bg-[#1c638a] hover:bg-[#144665] text-white py-3 rounded-lg text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
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

      <div>
        <p className="text-[9px] text-slate-500">{title}</p>
        <h3 className="text-[21px] font-bold leading-tight mt-0.5">
          {value}
        </h3>
        <p className="text-[8px] text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
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
        className="w-full h-9 appearance-none bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-8 text-[9px] outline-none focus:border-[#45b99b] cursor-pointer"
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

function AvailabilityBadge({
  availability,
}: {
  availability: Availability;
}) {
  const styles: Record<Availability, string> = {
    Available: "bg-[#e5f8f1] text-[#218d70]",
    "On duty": "bg-[#eaf3f8] text-[#287da7]",
    Leave: "bg-[#fff4dc] text-[#b47710]",
    Absent: "bg-[#fdebed] text-[#d83d4b]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-[8px] font-semibold ${styles[availability]}`}
    >
      {availability}
    </span>
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

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
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
    <div className="flex gap-3 pt-3">
      <button
        type="button"
        disabled={loading}
        onClick={onCancel}
        className="flex-1 border border-slate-200 rounded-lg py-3 text-xs font-semibold hover:bg-slate-50 transition"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-[#1c638a] hover:bg-[#144665] text-white rounded-lg py-3 text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>{submitLabel}</span>
        )}
      </button>
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
