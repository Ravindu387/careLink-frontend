
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { apiClient } from "../../services/api";
import {
  Search,
  Globe,
  Bell,
  CircleHelp,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Users,
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
} from "lucide-react";

/* ================= TYPES ================= */

type StaffStatus = "Active" | "Inactive";

type Availability =
  | "Available"
  | "On duty"
  | "Leave"
  | "Absent";

type Staff = {
  id: string;
  name: string;
  designation: string;
  contact: string;
  email: string;
  shelter: string;
  shift: string;
  availability: Availability;
  status: StaffStatus;
};

type ShiftDay = {
  day: string;
  date: number;
  assigned: number;
  capacity: number;
};

/* ================= SAMPLE DATA ================= */

const initialStaff: Staff[] = [
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
  { day: "Mon", date: 22, assigned: 18, capacity: 24 },
  { day: "Tue", date: 23, assigned: 19, capacity: 24 },
  { day: "Wed", date: 24, assigned: 20, capacity: 24 },
  { day: "Thu", date: 25, assigned: 21, capacity: 24 },
  { day: "Fri", date: 26, assigned: 18, capacity: 24 },
  { day: "Sat", date: 27, assigned: 19, capacity: 24 },
  { day: "Sun", date: 28, assigned: 20, capacity: 24 },
];

/* ================= MAIN COMPONENT ================= */

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [coverage, setCoverage] =
    useState<ShiftDay[]>(initialCoverage);

  const [search, setSearch] = useState("");
  const [shelterFilter, setShelterFilter] =
    useState("All shelters");
  const [designationFilter, setDesignationFilter] =
    useState("All designations");
  const [shiftFilter, setShiftFilter] =
    useState("All shifts");
  const [availabilityFilter, setAvailabilityFilter] =
    useState("All availability");

  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedStaff, setSelectedStaff] =
    useState<Staff | null>(null);

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    apiClient.get<any>("/staff").then((res) => {
      const items = res?.items ?? (Array.isArray(res) ? res : null);
      if (items?.length) {
        setStaff(
          items.map((s: any) => ({
            id: s.id || s.staffCode || "ST-001",
            name: s.name || s.fullName || "Staff Member",
            designation: s.designation || s.role || "Shelter Manager",
            contact: s.contact || s.phone || "077 000 0000",
            email: s.email || "staff@carelink.org",
            shelter: s.shelter || s.shelterName || "Riverton Central",
            shift: s.shift || "Morning",
            availability: (s.availability as Availability) || "Available",
            status: (s.status as StaffStatus) || "Active",
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const [newStaff, setNewStaff] = useState({
    name: "",
    designation: "Shelter Manager",
    contact: "",
    email: "",
    shelter: "Riverton Central",
    shift: "Morning",
    availability: "Available" as Availability,
  });

  /* ================= KPI CALCULATIONS ================= */

  const totalStaff = staff.filter(
    (s) => s.status === "Active"
  ).length;

  const onDuty = staff.filter(
    (s) =>
      s.status === "Active" &&
      s.availability === "On duty"
  ).length;

  const unavailable = staff.filter(
    (s) =>
      s.status === "Active" &&
      (s.availability === "Leave" ||
        s.availability === "Absent")
  ).length;

  const nextShift = staff.filter(
    (s) =>
      s.status === "Active" &&
      s.availability === "Available" &&
      s.shift !== "Night"
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
        shelterFilter === "All shelters" ||
        s.shelter === shelterFilter;

      const designationMatch =
        designationFilter === "All designations" ||
        s.designation === designationFilter;

      const shiftMatch =
        shiftFilter === "All shifts" ||
        s.shift === shiftFilter;

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

  const handleAddStaff = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const member: Staff = {
      ...newStaff,
      id: `ST-${String(
        Math.max(
          0,
          ...staff.map((s) => Number(s.id.replace("ST-", "")) || 0)
        ) + 1
      ).padStart(3, "0")}`,
      status: "Active",
    };

    setStaff((prev) => [...prev, member]);

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
    setSuccessMessage("New staff member added successfully.");
  };

  /* ================= UPDATE STAFF ================= */

  const updateStaff = (
    id: string,
    changes: Partial<Staff>
  ) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...changes } : s
      )
    );

    setSelectedStaff((prev) =>
      prev && prev.id === id
        ? { ...prev, ...changes }
        : prev
    );

    setSuccessMessage("Staff information updated successfully.");
  };

  /* ================= SHIFT COVERAGE ================= */

  const updateCoverage = (
    index: number,
    value: number
  ) => {
    setCoverage((prev) =>
      prev.map((day, i) =>
        i === index
          ? {
              ...day,
              assigned: Math.min(
                day.capacity,
                Math.max(0, value)
              ),
            }
          : day
      )
    );
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

        <div className="flex items-center gap-2 text-xs mb-7">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="text-slate-400">
            Shelter Administration
          </span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="font-semibold">Staff Management</span>
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Staff Management
            </h1>

            <p className="text-[13px] text-slate-500 mt-2">
              Manage shelter teams, roles, availability, shifts, and responsibilities.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={() => setShowShiftModal(true)}
              className="h-9 px-4 border border-[#aac4d2] bg-white rounded-lg text-sm font-semibold hover:bg-slate-50"
            >
              Manage shifts
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="h-9 px-4 bg-[#1c638a] text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#144665]"
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
            value={totalStaff.toString()}
            description="Across 5 shelters"
          />

          <KpiCard
            icon={<Check size={19} />}
            color="green"
            title="On duty now"
            value={onDuty.toString()}
            description="Currently working"
          />

          <KpiCard
            icon={<Clock size={19} />}
            color="blue"
            title="Next shift"
            value="42"
            description="Starts at 14:00"
          />

          <KpiCard
            icon={<AlertTriangle size={19} />}
            color="orange"
            title="Unavailable"
            value={unavailable.toString()}
            description="Leave and absent"
          />
        </section>

        {/* ================= DIRECTORY + COVERAGE ================= */}

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,0.9fr)] gap-3">

          {/* STAFF DIRECTORY */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">

            <div className="px-3.5 py-3.5 border-b border-slate-200 flex items-center justify-between">

              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Staff directory
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Verified shelter personnel · {filteredStaff.length} records
                </p>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-9 px-3 border rounded-lg text-sm font-semibold flex items-center gap-2 ${
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
                  className="w-full h-9 border border-slate-200 rounded-lg pl-9 pr-3 text-sm sm:text-[15px] outline-none focus:border-[#45b99b]"
                />
              </div>
            </div>

            {/* FILTER PANEL */}

            {showFilters && (
              <div className="p-3 bg-[#f7fafb] border-b border-slate-200">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                  <FilterSelect
                    value={shelterFilter}
                    options={["All shelters", ...shelters]}
                    onChange={setShelterFilter}
                  />

                  <FilterSelect
                    value={designationFilter}
                    options={[
                      "All designations",
                      ...designations,
                    ]}
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
                  className="text-sm text-[#267ca6] font-semibold mt-3"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* TABLE */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-[#f5f9fa] border-b border-slate-200">
                  <tr className="text-sm text-slate-500">
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
                      className="border-b border-slate-100 hover:bg-[#f5faf9] cursor-pointer text-sm transition"
                    >

                      <td className="px-3 py-3.5 font-semibold whitespace-nowrap">
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

                      <td className="px-3 py-3.5">
                        {member.shift}
                      </td>

                      <td className="px-3 py-3.5">
                        <AvailabilityBadge
                          availability={member.availability}
                        />
                      </td>

                      <td className="px-3 py-3.5">
                        <span className="px-2 py-1 rounded-md bg-[#e5f8f1] text-[#218d70] text-xs font-semibold">
                          {member.status}
                        </span>
                      </td>

                      <td className="px-3 py-3.5">
                        <ChevronRight
                          size={13}
                          className="text-slate-400"
                        />
                      </td>
                    </tr>
                  ))}

                  {filteredStaff.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center py-12 text-sm text-slate-400"
                      >
                        No staff members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-3.5 py-3 border-t border-slate-100 flex justify-between items-center">
              <p className="text-xs text-slate-400">
                Showing {filteredStaff.length} staff members
              </p>

              <button
                onClick={() => setShowAddModal(true)}
                className="text-sm font-semibold text-[#267ca6] flex items-center gap-1"
              >
                <Plus size={12} />
                Add staff
              </button>
            </div>
          </div>

          {/* WEEKLY SHIFT COVERAGE */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">

            <div className="px-3.5 py-3.5 border-b border-slate-200">
              <h2 className="text-base sm:text-lg font-semibold">
                Weekly shift coverage
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Riverton Central · 22–28 June
              </p>
            </div>

            <div className="p-3.5 space-y-4">

              {coverage.map((day, index) => {
                const percentage =
                  (day.assigned / day.capacity) * 100;

                return (
                  <div
                    key={day.day}
                    className="flex items-center gap-2"
                  >

                    <div className="w-10 shrink-0">
                      <p className="text-xs font-semibold">
                        {day.day}
                      </p>
                      <p className="text-xs text-slate-400">
                        {day.date}
                      </p>
                    </div>

                    <div className="flex-1 h-[6px] rounded-full bg-[#e9eef1] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentage >= 75
                            ? "bg-[#48b99c]"
                            : "bg-[#efb44b]"
                        }`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <button
                      title="Edit daily shift coverage"
                      onClick={() => {
                        setCoverage((prev) =>
                          prev.map((d, i) =>
                            i === index
                              ? {
                                  ...d,
                                  assigned:
                                    d.assigned >= d.capacity
                                      ? 0
                                      : d.assigned + 1,
                                }
                              : d
                          )
                        );
                      }}
                      className="w-9 text-right text-sm font-medium hover:text-[#2785b7]"
                    >
                      {day.assigned}/{day.capacity}
                    </button>
                  </div>
                );
              })}

              {/* COVERAGE STATUS */}

              <div className={`rounded-lg p-3 flex items-start gap-2 mt-5 ${
                adequateCoverage
                  ? "bg-[#eef9f5]"
                  : "bg-[#fff5e5]"
              }`}>

                {adequateCoverage ? (
                  <Check
                    size={15}
                    className="text-[#168e6e] mt-0.5"
                  />
                ) : (
                  <AlertTriangle
                    size={15}
                    className="text-[#d99a24] mt-0.5"
                  />
                )}

                <div>
                  <p className="text-xs font-semibold">
                    {adequateCoverage
                      ? "Coverage is adequate"
                      : "Staff coverage requires attention"}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {adequateCoverage
                      ? "All critical roles have assigned staff."
                      : "Some days have less than 75% staffing coverage."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowShiftModal(true)}
                className="w-full h-9 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 flex items-center justify-center gap-2"
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
              onChange={(v) =>
                setNewStaff({ ...newStaff, name: v })
              }
            />

            <FormSelect
              label="Designation"
              value={newStaff.designation}
              options={designations.map((d) => ({
                value: d,
                label: d,
              }))}
              onChange={(v) =>
                setNewStaff({ ...newStaff, designation: v })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <FormInput
                label="Contact number"
                placeholder="077 123 4567"
                value={newStaff.contact}
                onChange={(v) =>
                  setNewStaff({ ...newStaff, contact: v })
                }
              />

              <FormInput
                label="Email address"
                type="email"
                placeholder="staff@carelink.org"
                value={newStaff.email}
                onChange={(v) =>
                  setNewStaff({ ...newStaff, email: v })
                }
              />
            </div>

            <FormSelect
              label="Assigned shelter"
              value={newStaff.shelter}
              options={shelters.map((s) => ({
                value: s,
                label: s,
              }))}
              onChange={(v) =>
                setNewStaff({ ...newStaff, shelter: v })
              }
            />

            <FormSelect
              label="Assigned shift"
              value={newStaff.shift}
              options={shiftTypes.map((s) => ({
                value: s,
                label: s,
              }))}
              onChange={(v) =>
                setNewStaff({ ...newStaff, shift: v })
              }
            />

            <FormSelect
              label="Availability"
              value={newStaff.availability}
              options={["Available", "On duty", "Leave", "Absent"].map(
                (s) => ({ value: s, label: s })
              )}
              onChange={(v) =>
                setNewStaff({
                  ...newStaff,
                  availability: v as Availability,
                })
              }
            />

            <ModalActions
              onCancel={() => setShowAddModal(false)}
              submitLabel="Register staff"
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
                className="border border-slate-100 rounded-lg p-3"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {day.day}, {day.date} June
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Staff assigned
                    </p>
                  </div>

                  <span className="text-xs font-bold">
                    {day.assigned}/{day.capacity}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={day.capacity}
                  value={day.assigned}
                  onChange={(e) =>
                    updateCoverage(index, Number(e.target.value))
                  }
                  className="w-full accent-[#35b795]"
                />

                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0 staff</span>
                  <span>{day.capacity} staff</span>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setShowShiftModal(false);
                setSuccessMessage("Weekly shift coverage updated.");
              }}
              className="w-full bg-[#1c638a] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#144665]"
            >
              Save shift coverage
            </button>
          </div>
        </Modal>
      )}

      {/* ================= STAFF DETAILS PANEL ================= */}

      {selectedStaff && (
        <div className="fixed inset-0 z-40 bg-black/30 flex justify-end">

          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Staff details
              </h2>

              <button onClick={() => setSelectedStaff(null)}>
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
                <AvailabilityBadge
                  availability={selectedStaff.availability}
                />
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

              <h3 className="text-base font-semibold">
                Update availability
              </h3>

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
                className="w-full bg-[#1c638a] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#144665]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUCCESS MESSAGE ================= */}

      {successMessage && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">

          <CheckCircle2 size={17} className="shrink-0" />

          <p className="text-sm">{successMessage}</p>

          <button onClick={() => setSuccessMessage("")}>
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

      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${styles[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <h3 className="text-[21px] font-bold leading-tight mt-0.5">
          {value}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {description}
        </p>
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
        className="w-full h-9 appearance-none bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-8 text-sm sm:text-[15px] outline-none focus:border-[#45b99b] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
    <span className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-xs font-semibold ${styles[availability]}`}>
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
      <label className="block text-sm font-medium mb-1.5">
        {label}
      </label>

      <input
        required
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-[#45b99b]"
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
      <label className="block text-sm font-medium mb-1.5">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm sm:text-[15px] outline-none focus:border-[#45b99b]"
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-[13px] text-slate-400 mt-1">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
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
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex gap-3 pt-3">

      <button
        type="button"
        onClick={onCancel}
        className="flex-1 border border-slate-200 rounded-lg py-3 text-sm font-semibold hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="flex-1 bg-[#1c638a] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#144665]"
      >
        {submitLabel}
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
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold mt-1 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
