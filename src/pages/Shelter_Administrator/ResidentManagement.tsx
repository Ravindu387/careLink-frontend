
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../services/api";
import {
  Search,
  Globe,
  Bell,
  CircleHelp,
  ChevronRight,
  ChevronDown,
  Plus,
  Download,
  X,
  SlidersHorizontal,
  Users,
  Home,
  HeartHandshake,
  Check,
  MapPin,
  Phone,
  CalendarDays,
  User,
  BedDouble,
  FileText,
  CheckCircle2,
} from "lucide-react";

/* ================= TYPES ================= */

type ResidentStatus = "Active" | "Assistance" | "Checked Out";

type Resident = {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  familyGroup: string;
  shelter: string;
  shelterId: string;
  room: string;
  bed: string;
  checkIn: string;
  status: ResidentStatus;
  assistanceNeeds: string;
};

/* ================= SAMPLE DATA ================= */

const initialResidents: Resident[] = [
  {
    id: "RES-10842",
    name: "Nimali Perera",
    age: 42,
    gender: "Female",
    contact: "077 234 8910",
    familyGroup: "FG-2041",
    shelter: "Riverton Central",
    shelterId: "SH-001",
    room: "A-12",
    bed: "B-02",
    checkIn: "21 Jun",
    status: "Active",
    assistanceNeeds: "None",
  },
  {
    id: "RES-10839",
    name: "Saman Kumara",
    age: 37,
    gender: "Male",
    contact: "071 528 1203",
    familyGroup: "FG-2038",
    shelter: "North Community",
    shelterId: "SH-002",
    room: "B-07",
    bed: "B-01",
    checkIn: "21 Jun",
    status: "Active",
    assistanceNeeds: "None",
  },
  {
    id: "RES-10831",
    name: "Fathima Rizna",
    age: 68,
    gender: "Female",
    contact: "075 831 9012",
    familyGroup: "FG-2031",
    shelter: "Riverton Central",
    shelterId: "SH-001",
    room: "A-04",
    bed: "B-03",
    checkIn: "20 Jun",
    status: "Assistance",
    assistanceNeeds: "Medical assistance",
  },
  {
    id: "RES-10822",
    name: "Kamal De Silva",
    age: 29,
    gender: "Male",
    contact: "076 445 8831",
    familyGroup: "FG-2024",
    shelter: "Lakeside Sports",
    shelterId: "SH-004",
    room: "C-11",
    bed: "B-02",
    checkIn: "20 Jun",
    status: "Active",
    assistanceNeeds: "None",
  },
  {
    id: "RES-10815",
    name: "Anusha Fernando",
    age: 34,
    gender: "Female",
    contact: "077 651 2389",
    familyGroup: "FG-2020",
    shelter: "North Community",
    shelterId: "SH-002",
    room: "B-08",
    bed: "B-03",
    checkIn: "19 Jun",
    status: "Active",
    assistanceNeeds: "None",
  },
  {
    id: "RES-10809",
    name: "Mohamed Irfan",
    age: 51,
    gender: "Male",
    contact: "071 872 4510",
    familyGroup: "FG-2018",
    shelter: "Riverton Central",
    shelterId: "SH-001",
    room: "A-08",
    bed: "B-01",
    checkIn: "19 Jun",
    status: "Assistance",
    assistanceNeeds: "Mobility support",
  },
  {
    id: "RES-10798",
    name: "Kavindi Silva",
    age: 24,
    gender: "Female",
    contact: "075 234 6789",
    familyGroup: "FG-2012",
    shelter: "Lakeside Sports",
    shelterId: "SH-004",
    room: "C-05",
    bed: "B-04",
    checkIn: "18 Jun",
    status: "Checked Out",
    assistanceNeeds: "None",
  },
  {
    id: "RES-10791",
    name: "Ruwan Jayasinghe",
    age: 46,
    gender: "Male",
    contact: "077 987 6543",
    familyGroup: "FG-2009",
    shelter: "North Community",
    shelterId: "SH-002",
    room: "B-02",
    bed: "B-02",
    checkIn: "18 Jun",
    status: "Active",
    assistanceNeeds: "None",
  },
];

const shelterOptions = [
  { id: "SH-001", name: "Riverton Central" },
  { id: "SH-002", name: "North Community" },
  { id: "SH-003", name: "St. Mary Civic Centre" },
  { id: "SH-004", name: "Lakeside Sports" },
];

/* ================= MAIN COMPONENT ================= */

export default function ResidentManagementPage() {
  const [residents, setResidents] = useState(initialResidents);

  const [search, setSearch] = useState("");
  const [shelterFilter, setShelterFilter] = useState("All shelters");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [assistanceFilter, setAssistanceFilter] =
    useState("All assistance needs");

  const [moreFilters, setMoreFilters] = useState(false);
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [genderFilter, setGenderFilter] = useState("All genders");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [selectedResident, setSelectedResident] =
    useState<Resident | null>(null);

  const [registerOpen, setRegisterOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    apiClient.get<any>("/residents").then((res) => {
      const items = res?.items ?? (Array.isArray(res) ? res : null);
      if (items?.length) {
        setResidents(
          items.map((r: any) => ({
            id: r.id || r.residentCode || `RES-${Math.floor(Math.random() * 90000 + 10000)}`,
            name: r.name || r.fullName || "Resident",
            age: Number(r.age ?? 30),
            gender: r.gender || "Female",
            contact: r.contact || r.phone || "077 000 0000",
            familyGroup: r.familyGroup || "Individual",
            shelter: r.shelter || r.shelterName || "Riverton Central",
            shelterId: r.shelterId || "SH-001",
            room: r.room || "A-01",
            bed: r.bed || "B-01",
            checkIn: r.checkIn || "Today",
            status: (r.status as ResidentStatus) || "Active",
            assistanceNeeds: r.assistanceNeeds || "None",
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const [newResident, setNewResident] = useState({
    name: "",
    age: "",
    gender: "Female",
    contact: "",
    familyGroup: "",
    shelterId: "SH-001",
    room: "",
    bed: "",
    assistanceNeeds: "None",
  });

  /* ================= SUMMARY DATA ================= */

  const registeredResidents = 1542;
  const familyGroups = 486;
  const assistanceNeeds = 74;
  const checkedOutToday = 35;

  /* ================= FILTERING ================= */

  const filteredResidents = useMemo(() => {
    return residents.filter((resident) => {
      const matchesSearch =
        resident.name.toLowerCase().includes(search.toLowerCase()) ||
        resident.id.toLowerCase().includes(search.toLowerCase()) ||
        resident.familyGroup.toLowerCase().includes(search.toLowerCase()) ||
        resident.contact.includes(search);

      const matchesShelter =
        shelterFilter === "All shelters" ||
        resident.shelterId === shelterFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        resident.status === statusFilter;

      const matchesAssistance =
        assistanceFilter === "All assistance needs" ||
        (assistanceFilter === "Needs assistance" &&
          resident.assistanceNeeds !== "None") ||
        (assistanceFilter === "No assistance needed" &&
          resident.assistanceNeeds === "None");

      const matchesMinAge =
        !minAge || resident.age >= Number(minAge);

      const matchesMaxAge =
        !maxAge || resident.age <= Number(maxAge);

      const matchesGender =
        genderFilter === "All genders" ||
        resident.gender === genderFilter;

      return (
        matchesSearch &&
        matchesShelter &&
        matchesStatus &&
        matchesAssistance &&
        matchesMinAge &&
        matchesMaxAge &&
        matchesGender
      );
    });
  }, [
    residents,
    search,
    shelterFilter,
    statusFilter,
    assistanceFilter,
    minAge,
    maxAge,
    genderFilter,
  ]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResidents.length / itemsPerPage)
  );

  const currentResidents = filteredResidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearch("");
    setShelterFilter("All shelters");
    setStatusFilter("All statuses");
    setAssistanceFilter("All assistance needs");
    setMinAge("");
    setMaxAge("");
    setGenderFilter("All genders");
    setCurrentPage(1);
  };

  /* ================= REGISTER RESIDENT ================= */

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const selectedShelter = shelterOptions.find(
      (s) => s.id === newResident.shelterId
    );

    if (!selectedShelter) return;

    apiClient.post("/residents", {
      name: newResident.name,
      age: Number(newResident.age),
      gender: newResident.gender,
      contact: newResident.contact,
      familyGroup: newResident.familyGroup || "Individual",
      shelterId: selectedShelter.id,
      room: newResident.room,
      bed: newResident.bed,
      assistanceNeeds: newResident.assistanceNeeds,
    }).catch(() => {});

    const resident: Resident = {
      id: `RES-${Date.now().toString().slice(-5)}`,
      name: newResident.name,
      age: Number(newResident.age),
      gender: newResident.gender,
      contact: newResident.contact,
      familyGroup: newResident.familyGroup || "Individual",
      shelter: selectedShelter.name,
      shelterId: selectedShelter.id,
      room: newResident.room,
      bed: newResident.bed,
      checkIn: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
      status: "Active",
      assistanceNeeds: newResident.assistanceNeeds,
    };

    setResidents((prev) => [resident, ...prev]);

    setSearch("");
    setShelterFilter("All shelters");
    setStatusFilter("All statuses");
    setAssistanceFilter("All assistance needs");
    setCurrentPage(1);

    setNewResident({
      name: "",
      age: "",
      gender: "Female",
      contact: "",
      familyGroup: "",
      shelterId: "SH-001",
      room: "",
      bed: "",
      assistanceNeeds: "None",
    });

    setRegisterOpen(false);
    setSuccessMessage("Resident registered successfully.");
  };

  /* ================= CHECK OUT RESIDENT ================= */

  const handleCheckout = () => {
    if (!selectedResident) return;

    setResidents((prev) =>
      prev.map((resident) =>
        resident.id === selectedResident.id
          ? { ...resident, status: "Checked Out" }
          : resident
      )
    );

    setSelectedResident({
      ...selectedResident,
      status: "Checked Out",
    });

    setSuccessMessage(
      `${selectedResident.name} has been checked out.`
    );
  };

  /* ================= EXPORT CSV ================= */

  const handleExport = () => {
    const headers = [
      "Resident ID",
      "Full Name",
      "Age",
      "Gender",
      "Contact",
      "Family Group",
      "Shelter",
      "Room",
      "Bed",
      "Check-in",
      "Status",
      "Assistance Needs",
    ];

    const rows = filteredResidents.map((r) => [
      r.id,
      r.name,
      r.age,
      r.gender,
      r.contact,
      r.familyGroup,
      r.shelter,
      r.room,
      r.bed,
      r.checkIn,
      r.status,
      r.assistanceNeeds,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "resident-management.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  /* ================= MAIN UI ================= */

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">

      {/* ================= MAIN CONTENT ================= */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-xs mb-7">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="text-slate-400">Shelter Administration</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="font-semibold">Resident Management</span>
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Resident Management
            </h1>

            <p className="text-[13px] text-slate-500 mt-2">
              Manage registrations, accommodation, family groups, and resident support needs.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={handleExport}
              className="h-9 px-4 border border-[#aac4d2] bg-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50"
            >
              <Download size={14} />
              Export
            </button>

            <button
              onClick={() => setRegisterOpen(true)}
              className="h-9 px-4 bg-[#1c638a] text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#144665]"
            >
              <Plus size={14} />
              Register resident
            </button>
          </div>
        </div>

        {/* ================= KPI CARDS ================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">

          <KpiCard
            icon={<Users size={19} />}
            color="blue"
            title="Registered residents"
            value={registeredResidents.toLocaleString()}
            description="Across 4 shelters"
          />

          <KpiCard
            icon={<Home size={19} />}
            color="blue"
            title="Family groups"
            value={familyGroups.toLocaleString()}
            description="38 single residents"
          />

          <KpiCard
            icon={<HeartHandshake size={19} />}
            color="orange"
            title="Assistance needs"
            value={assistanceNeeds.toLocaleString()}
            description="Restricted access notes"
          />

          <KpiCard
            icon={<Check size={19} />}
            color="green"
            title="Checked out today"
            value={checkedOutToday.toLocaleString()}
            description="62 new admissions"
          />
        </section>

        {/* ================= SEARCH + FILTERS ================= */}

        <section className="flex flex-col xl:flex-row gap-2 mb-3">

          {/* SEARCH */}
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
              placeholder="Search name, resident ID, or family group..."
              className="w-full h-9 border border-[#d5e3e9] bg-white rounded-lg pl-9 pr-3 text-sm sm:text-[15px] outline-none focus:border-[#45b99b]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:flex gap-2">

            <FilterSelect
              value={shelterFilter}
              options={[
                "All shelters",
                ...shelterOptions.map((s) => s.id),
              ]}
              labels={[
                "All shelters",
                ...shelterOptions.map((s) => s.name),
              ]}
              onChange={(v) => {
                setShelterFilter(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={statusFilter}
              options={[
                "All statuses",
                "Active",
                "Assistance",
                "Checked Out",
              ]}
              onChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              value={assistanceFilter}
              options={[
                "All assistance needs",
                "Needs assistance",
                "No assistance needed",
              ]}
              onChange={(v) => {
                setAssistanceFilter(v);
                setCurrentPage(1);
              }}
            />

            <button
              onClick={() => setMoreFilters(!moreFilters)}
              className={`h-9 px-3 bg-white border rounded-lg text-sm font-semibold whitespace-nowrap flex items-center justify-center gap-2 ${
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

        {/* ================= MORE FILTERS ================= */}

        {moreFilters && (
          <section className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-3">

            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold">
                Advanced filters
              </h3>

              <button
                onClick={resetFilters}
                className="text-sm text-[#267ca6] font-semibold"
              >
                Clear all filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <FormInput
                label="Minimum age"
                type="number"
                value={minAge}
                onChange={(v) => {
                  setMinAge(v);
                  setCurrentPage(1);
                }}
                placeholder="Minimum age"
              />

              <FormInput
                label="Maximum age"
                type="number"
                value={maxAge}
                onChange={(v) => {
                  setMaxAge(v);
                  setCurrentPage(1);
                }}
                placeholder="Maximum age"
              />

              <FormSelect
                label="Gender"
                value={genderFilter}
                options={[
                  { value: "All genders", label: "All genders" },
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
                onChange={(v) => {
                  setGenderFilter(v);
                  setCurrentPage(1);
                }}
              />
            </div>
          </section>
        )}

        {/* ================= RESIDENT TABLE ================= */}

        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left">

              <thead className="bg-[#f5f9fa] border-b border-slate-200">

                <tr className="text-sm text-slate-500">
                  <th className="px-3 py-3 font-medium">Resident ID</th>
                  <th className="px-3 py-3 font-medium">Full Name</th>
                  <th className="px-3 py-3 font-medium">Age</th>
                  <th className="px-3 py-3 font-medium">Gender</th>
                  <th className="px-3 py-3 font-medium">Contact</th>
                  <th className="px-3 py-3 font-medium">Family Group</th>
                  <th className="px-3 py-3 font-medium">Shelter</th>
                  <th className="px-3 py-3 font-medium">Room</th>
                  <th className="px-3 py-3 font-medium">Bed</th>
                  <th className="px-3 py-3 font-medium">Check-in</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {currentResidents.map((resident) => (

                  <tr
                    key={resident.id}
                    onClick={() => setSelectedResident(resident)}
                    className="border-b border-slate-100 hover:bg-[#f5faf9] cursor-pointer text-sm transition"
                  >

                    <td className="px-3 py-3.5 font-semibold text-[#174f75]">
                      {resident.id}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {resident.name}
                    </td>

                    <td className="px-3 py-3.5">
                      {resident.age}
                    </td>

                    <td className="px-3 py-3.5">
                      {resident.gender}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {resident.contact}
                    </td>

                    <td className="px-3 py-3.5">
                      {resident.familyGroup}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {resident.shelter}
                    </td>

                    <td className="px-3 py-3.5">
                      {resident.room}
                    </td>

                    <td className="px-3 py-3.5">
                      {resident.bed}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {resident.checkIn}
                    </td>

                    <td className="px-3 py-3.5">
                      <ResidentStatusBadge status={resident.status} />
                    </td>

                    <td className="px-3 py-3.5">
                      <ChevronRight
                        size={13}
                        className="text-slate-400"
                      />
                    </td>
                  </tr>
                ))}

                {currentResidents.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      className="text-center py-12 text-sm text-slate-400"
                    >
                      No residents found. Try changing your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ================= PAGINATION ================= */}

          <div className="px-3.5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">

            <p className="text-xs text-slate-400">
              Showing{" "}
              {filteredResidents.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
              {"–"}
              {Math.min(
                currentPage * itemsPerPage,
                filteredResidents.length
              )}
              {" of "}
              {filteredResidents.length.toLocaleString()}
            </p>

            <div className="flex items-center gap-1">

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-8 px-3 border border-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-8 rounded-lg border text-sm ${
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
                className="h-8 px-3 border border-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= RESIDENT DETAILS PANEL ================= */}

      {selectedResident && (
        <div className="fixed inset-0 z-40 bg-black/30 flex justify-end">

          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Resident details
              </h2>

              <button onClick={() => setSelectedResident(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="mt-7">

              <div className="w-14 h-14 rounded-full bg-[#eaf3f8] text-[#267ba6] flex items-center justify-center">
                <User size={25} />
              </div>

              <h3 className="text-lg font-semibold mt-4">
                {selectedResident.name}
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                {selectedResident.id}
              </p>

              <div className="mt-3">
                <ResidentStatusBadge status={selectedResident.status} />
              </div>
            </div>

            <div className="mt-7 space-y-4">

              <DetailRow
                icon={<User size={15} />}
                label="Age / Gender"
                value={`${selectedResident.age} years · ${selectedResident.gender}`}
              />

              <DetailRow
                icon={<Phone size={15} />}
                label="Contact"
                value={selectedResident.contact}
              />

              <DetailRow
                icon={<Users size={15} />}
                label="Family group"
                value={selectedResident.familyGroup}
              />

              <DetailRow
                icon={<Home size={15} />}
                label="Shelter"
                value={selectedResident.shelter}
              />

              <DetailRow
                icon={<BedDouble size={15} />}
                label="Room / Bed"
                value={`${selectedResident.room} / ${selectedResident.bed}`}
              />

              <DetailRow
                icon={<CalendarDays size={15} />}
                label="Check-in date"
                value={selectedResident.checkIn}
              />

              <DetailRow
                icon={<HeartHandshake size={15} />}
                label="Assistance needs"
                value={selectedResident.assistanceNeeds}
              />
            </div>

            {selectedResident.status !== "Checked Out" && (
              <button
                onClick={handleCheckout}
                className="w-full mt-8 bg-[#1c638a] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#144665]"
              >
                Check out resident
              </button>
            )}

            <button
              onClick={() => setSelectedResident(null)}
              className="w-full mt-3 border border-slate-200 py-3 rounded-lg text-sm font-semibold hover:bg-slate-50"
            >
              Close details
            </button>
          </div>
        </div>
      )}

      {/* ================= REGISTER RESIDENT MODAL ================= */}

      {registerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-5">

              <div>
                <h2 className="text-lg font-semibold">
                  Register new resident
                </h2>

                <p className="text-[13px] text-slate-400 mt-1">
                  Add resident and accommodation information.
                </p>
              </div>

              <button onClick={() => setRegisterOpen(false)}>
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">

              <FormInput
                label="Full name"
                placeholder="Enter resident full name"
                value={newResident.name}
                onChange={(v) =>
                  setNewResident({ ...newResident, name: v })
                }
              />

              <div className="grid grid-cols-2 gap-3">

                <FormInput
                  label="Age"
                  type="number"
                  value={newResident.age}
                  onChange={(v) =>
                    setNewResident({ ...newResident, age: v })
                  }
                  placeholder="Enter age"
                />

                <FormSelect
                  label="Gender"
                  value={newResident.gender}
                  options={[
                    { value: "Female", label: "Female" },
                    { value: "Male", label: "Male" },
                    { value: "Other", label: "Other" },
                  ]}
                  onChange={(v) =>
                    setNewResident({ ...newResident, gender: v })
                  }
                />
              </div>

              <FormInput
                label="Contact number"
                placeholder="Enter contact number"
                value={newResident.contact}
                onChange={(v) =>
                  setNewResident({ ...newResident, contact: v })
                }
              />

              <FormInput
                label="Family group ID"
                placeholder="Example: FG-2041"
                value={newResident.familyGroup}
                onChange={(v) =>
                  setNewResident({ ...newResident, familyGroup: v })
                }
              />

              <FormSelect
                label="Select shelter"
                value={newResident.shelterId}
                options={shelterOptions.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                onChange={(v) =>
                  setNewResident({ ...newResident, shelterId: v })
                }
              />

              <div className="grid grid-cols-2 gap-3">

                <FormInput
                  label="Room number"
                  placeholder="Example: A-12"
                  value={newResident.room}
                  onChange={(v) =>
                    setNewResident({ ...newResident, room: v })
                  }
                />

                <FormInput
                  label="Bed number"
                  placeholder="Example: B-02"
                  value={newResident.bed}
                  onChange={(v) =>
                    setNewResident({ ...newResident, bed: v })
                  }
                />
              </div>

              <FormSelect
                label="Assistance needs"
                value={newResident.assistanceNeeds}
                options={[
                  { value: "None", label: "None" },
                  { value: "Medical assistance", label: "Medical assistance" },
                  { value: "Mobility support", label: "Mobility support" },
                  { value: "Food assistance", label: "Food assistance" },
                  { value: "Psychosocial support", label: "Psychosocial support" },
                ]}
                onChange={(v) =>
                  setNewResident({
                    ...newResident,
                    assistanceNeeds: v,
                  })
                }
              />

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setRegisterOpen(false)}
                  className="flex-1 border border-slate-200 rounded-lg py-3 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-[#1c638a] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#144665]"
                >
                  Register resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SUCCESS MESSAGE ================= */}

      {successMessage && (
        <div className="fixed bottom-5 right-5 z-[60] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">

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
  icon: React.ReactNode;
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

      <div className="min-w-0">
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
  labels,
  onChange,
}: {
  value: string;
  options: string[];
  labels?: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full xl:w-[125px] h-9 appearance-none bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-7 text-sm sm:text-[15px] outline-none focus:border-[#45b99b] cursor-pointer"
      >
        {options.map((option, index) => (
          <option key={option} value={option}>
            {labels?.[index] ?? option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
}

function ResidentStatusBadge({
  status,
}: {
  status: ResidentStatus;
}) {
  const styles: Record<ResidentStatus, string> = {
    Active: "bg-[#e5f8f1] text-[#269a77]",
    Assistance: "bg-[#edf2f5] text-[#56748a]",
    "Checked Out": "bg-[#fff3dc] text-[#ad7413]",
  };

  return (
    <span className={`inline-flex whitespace-nowrap px-2 py-1 rounded-md text-xs font-semibold ${styles[status]}`}>
      {status}
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
        min={type === "number" ? 1 : undefined}
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

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
      <div className="text-[#2785b7]">{icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold mt-1 break-words">{value}</p>
      </div>
    </div>
  );
}
