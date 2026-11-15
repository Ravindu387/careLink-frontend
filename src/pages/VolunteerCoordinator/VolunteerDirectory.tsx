import { useState } from "react";
import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  Plus,
  ChevronRight,
  ChevronDown,
  Download,
  List,
  LayoutGrid,
  MoreHorizontal,
  Menu,
  X,
  Star,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  location: string;
  availability: string;
  verification: "Verified" | "Pending" | "Rejected";
  assignment: string;
  rating: string;
}

const initialVolunteers: Volunteer[] = [
  {
    id: "VOL-1048",
    name: "Elena Rossi",
    skills: ["First Aid", "Logistics"],
    location: "Central Ward",
    availability: "Available now",
    verification: "Verified",
    assignment: "Evacuation Support",
    rating: "4.9",
  },
  {
    id: "VOL-1172",
    name: "Musa Bello",
    skills: ["Driving", "Rescue"],
    location: "North Ward",
    availability: "Available 14:00",
    verification: "Verified",
    assignment: "Unassigned",
    rating: "4.8",
  },
  {
    id: "VOL-0934",
    name: "Lin Wei",
    skills: ["Translation", "Medical"],
    location: "Eastbank",
    availability: "Available now",
    verification: "Verified",
    assignment: "Clinic Support",
    rating: "4.9",
  },
  {
    id: "VOL-1288",
    name: "Sara Khan",
    skills: ["Shelter Support", "Childcare"],
    location: "Central Ward",
    availability: "Available 16:00",
    verification: "Pending",
    assignment: "Unassigned",
    rating: "—",
  },
  {
    id: "VOL-0812",
    name: "Daniel Okafor",
    skills: ["Logistics", "Warehousing"],
    location: "West District",
    availability: "Unavailable",
    verification: "Verified",
    assignment: "Supply Dispatch",
    rating: "4.7",
  },
  {
    id: "VOL-1350",
    name: "Amara Silva",
    skills: ["First Aid", "Medical"],
    location: "South Ward",
    availability: "Available now",
    verification: "Verified",
    assignment: "Unassigned",
    rating: "4.8",
  },
  {
    id: "VOL-1420",
    name: "James Carter",
    skills: ["Driving", "Logistics"],
    location: "North Ward",
    availability: "Unavailable",
    verification: "Pending",
    assignment: "Unassigned",
    rating: "—",
  },
];

export default function VolunteerDirectory() {
  const [volunteers, setVolunteers] = useState(initialVolunteers);

  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("All skills");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [availabilityFilter, setAvailabilityFilter] =
    useState("Any availability");
  const [verificationFilter, setVerificationFilter] =
    useState("All verification states");

  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] =
    useState<Volunteer | null>(null);

  const [newVolunteer, setNewVolunteer] = useState({
    name: "",
    location: "",
    skills: "",
  });

  const pageSize = 5;

  // FILTER VOLUNTEERS

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const searchMatch =
      volunteer.id.toLowerCase().includes(search.toLowerCase()) ||
      volunteer.name.toLowerCase().includes(search.toLowerCase()) ||
      volunteer.skills.join(" ").toLowerCase().includes(search.toLowerCase());

    const skillMatch =
      skillFilter === "All skills" ||
      volunteer.skills.some(
        (skill) => skill.toLowerCase() === skillFilter.toLowerCase()
      );

    const locationMatch =
      locationFilter === "All locations" ||
      volunteer.location === locationFilter;

    const availabilityMatch =
      availabilityFilter === "Any availability" ||
      (availabilityFilter === "Available now"
        ? volunteer.availability === "Available now"
        : volunteer.availability === "Unavailable");

    const verificationMatch =
      verificationFilter === "All verification states" ||
      volunteer.verification === verificationFilter;

    return (
      searchMatch &&
      skillMatch &&
      locationMatch &&
      availabilityMatch &&
      verificationMatch
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVolunteers.length / pageSize)
  );

  const paginatedVolunteers = filteredVolunteers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ADD VOLUNTEER

  const handleAddVolunteer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newVolunteer.name.trim() || !newVolunteer.location.trim()) {
      return;
    }

    const volunteer: Volunteer = {
      id: `VOL-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newVolunteer.name,
      skills: newVolunteer.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      location: newVolunteer.location,
      availability: "Available now",
      verification: "Pending",
      assignment: "Unassigned",
      rating: "—",
    };

    setVolunteers((prev) => [volunteer, ...prev]);
    setNewVolunteer({ name: "", location: "", skills: "" });
    setCurrentPage(1);
    setShowAddModal(false);
  };

  // EXPORT CSV

  const handleExport = () => {
    const headers = [
      "Volunteer ID",
      "Name",
      "Skills",
      "Location",
      "Availability",
      "Verification",
      "Assignment",
      "Rating",
    ];

    const rows = filteredVolunteers.map((v) => [
      v.id,
      v.name,
      v.skills.join(" / "),
      v.location,
      v.availability,
      v.verification,
      v.assignment,
      v.rating,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
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
    link.download = "volunteer-directory.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setSkillFilter("All skills");
    setLocationFilter("All locations");
    setAvailabilityFilter("Any availability");
    setVerificationFilter("All verification states");
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const verificationStyle = (status: string) => {
    if (status === "Verified") {
      return "bg-[#e2f5ef] text-[#00866d]";
    }

    if (status === "Pending") {
      return "bg-[#fff3dc] text-[#b87813]";
    }

    return "bg-red-100 text-red-600";
  };

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">

      {/* TOP NAVBAR */}

  

      {/* MOBILE NAVIGATION */}

      {showMobileMenu && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex flex-wrap gap-4 text-xs">
          <span>Greater Riverton</span>
          <span>Language: EN</span>
          <span>Notifications: 9</span>
          <span>Nadia O. · Coordinator</span>
        </div>
      )}

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 lg:px-[33px] pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[10px] mb-9">

          <span className="text-[#7890a4]">Operations</span>

          <ChevronRight size={13} className="text-[#7890a4]" />

          <span className="text-[#7890a4]">
            Volunteer Coordination
          </span>

          <ChevronRight size={13} className="text-[#7890a4]" />

          <span className="font-semibold text-[#123c5b]">
            Volunteer Directory
          </span>

        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">

          <div>
            <h1 className="text-[27px] md:text-[29px] font-normal tracking-tight">
              Volunteer Directory
            </h1>

            <p className="text-[12px] text-[#718ba0] mt-2">
              Search verified volunteer profiles, skills, availability,
              and assignment history.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={handleExport}
              className="h-[45px] px-4 border border-[#b9d0dc] bg-white hover:bg-[#f5fafc] rounded-lg flex items-center gap-2 text-[11px] text-[#17648e]"
            >
              <Download size={17} />
              Export
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="h-[45px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-[11px] font-semibold shadow-sm"
            >
              <Plus size={17} />
              Add volunteer
            </button>

          </div>

        </div>

        {/* STATISTICS BAR */}

        <section className="bg-white border border-[#d3e2e9] rounded-xl py-3.5 mb-4 grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#d5e2e9]">

          {[
            { value: "2,418", label: "Total registered" },
            { value: "2,184", label: "Verified" },
            { value: "642", label: "Available now" },
            { value: "387", label: "Assigned" },
          ].map((stat) => (

            <div
              key={stat.label}
              className="flex items-center justify-center gap-2 py-2"
            >

              <span className="text-[16px] font-bold text-[#123c5b]">
                {stat.value}
              </span>

              <span className="text-[10px] text-[#8296aa]">
                {stat.label}
              </span>

            </div>

          ))}

        </section>

        {/* FILTER BAR */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_105px_125px_138px_167px_97px] gap-3 mb-4">

          {/* SEARCH */}

          <div className="h-[45px] bg-white border border-[#d3e2e9] rounded-lg flex items-center px-3 gap-3">

            <Search size={19} className="text-[#7791a5]" />

            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search volunteer ID, name, or skill..."
              className="w-full text-[10px] outline-none placeholder:text-[#a2b2c1]"
            />

          </div>

          {/* SKILL FILTER */}

          <select
            value={skillFilter}
            onChange={(e) => {
              setSkillFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[45px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none cursor-pointer"
          >
            <option>All skills</option>
            <option>First Aid</option>
            <option>Logistics</option>
            <option>Driving</option>
            <option>Rescue</option>
            <option>Translation</option>
            <option>Medical</option>
            <option>Shelter Support</option>
            <option>Childcare</option>
            <option>Warehousing</option>
          </select>

          {/* LOCATION FILTER */}

          <select
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[45px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none cursor-pointer"
          >
            <option>All locations</option>
            <option>Central Ward</option>
            <option>North Ward</option>
            <option>Eastbank</option>
            <option>West District</option>
            <option>South Ward</option>
          </select>

          {/* AVAILABILITY */}

          <select
            value={availabilityFilter}
            onChange={(e) => {
              setAvailabilityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[45px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none cursor-pointer"
          >
            <option>Any availability</option>
            <option>Available now</option>
            <option>Unavailable</option>
          </select>

          {/* VERIFICATION */}

          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[45px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none cursor-pointer"
          >
            <option>All verification states</option>
            <option>Verified</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>

          {/* MORE FILTERS */}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="h-[45px] bg-white border border-[#b9d0dc] hover:bg-[#f5fafc] rounded-lg text-[11px] flex items-center justify-center gap-2"
          >
            <SlidersHorizontal size={14} />
            More filters
          </button>

        </section>

        {/* EXTRA FILTERS */}

        {showFilters && (
          <div className="bg-white border border-[#d3e2e9] rounded-lg p-4 mb-4 flex flex-wrap justify-between items-center gap-3">

            <p className="text-xs font-semibold">
              Advanced filters
            </p>

            <button
              onClick={resetFilters}
              className="text-xs text-[#287fa9] hover:underline"
            >
              Clear all filters
            </button>

          </div>
        )}

        {/* VOLUNTEER RECORDS */}

        <section className="bg-white border border-[#d3e2e9] rounded-xl shadow-[0_8px_20px_rgba(30,70,90,0.06)] overflow-hidden">

          {/* TABLE HEADER */}

          <div className="px-5 py-4 flex items-center justify-between border-b border-[#d5e2e9]">

            <div>
              <h2 className="text-[14px] font-medium">
                Volunteer records
              </h2>

              <p className="text-[10px] text-[#8296aa] mt-1">
                2,418 demonstration profiles
              </p>
            </div>

            {/* VIEW SWITCH */}

            <div className="flex items-center border border-[#d3e2e9] rounded-lg p-1 gap-1">

              <button
                onClick={() => setViewMode("list")}
                className={`w-[33px] h-[33px] flex items-center justify-center rounded-md ${
                  viewMode === "list"
                    ? "bg-[#e7f1f6] text-[#287fa9]"
                    : "text-[#8096a9]"
                }`}
              >
                <List size={20} />
              </button>

              <button
                onClick={() => setViewMode("grid")}
                className={`w-[33px] h-[33px] flex items-center justify-center rounded-md ${
                  viewMode === "grid"
                    ? "bg-[#e7f1f6] text-[#287fa9]"
                    : "text-[#8096a9]"
                }`}
              >
                <LayoutGrid size={19} />
              </button>

            </div>

          </div>

          {/* LIST VIEW */}

          {viewMode === "list" ? (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] text-left">

                <thead className="bg-[#f5f8f9] border-b border-[#d5e2e9]">

                  <tr className="text-[9px] text-[#718ba0]">

                    <th className="px-3.5 py-3 font-medium">Volunteer ID</th>

                    <th className="px-3.5 py-3 font-medium">Name</th>

                    <th className="px-3.5 py-3 font-medium">Skills</th>

                    <th className="px-3.5 py-3 font-medium">Location</th>

                    <th className="px-3.5 py-3 font-medium">Availability</th>

                    <th className="px-3.5 py-3 font-medium">Verification</th>

                    <th className="px-3.5 py-3 font-medium">Current Assignment</th>

                    <th className="px-3.5 py-3 font-medium">Rating</th>

                    <th className="px-3 py-3"></th>

                  </tr>

                </thead>

                <tbody>

                  {paginatedVolunteers.map((volunteer) => (

                    <tr
                      key={volunteer.id}
                      onClick={() => setSelectedVolunteer(volunteer)}
                      className={`border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer transition ${
                        selectedVolunteer?.id === volunteer.id
                          ? "bg-[#f1f8fb]"
                          : ""
                      }`}
                    >

                      <td className="px-3.5 py-[15px] text-[10px] font-semibold whitespace-nowrap">
                        {volunteer.id}
                      </td>

                      <td className="px-3.5 py-[15px] text-[10px] whitespace-nowrap">
                        {volunteer.name}
                      </td>

                      <td className="px-3.5 py-[15px] text-[10px] whitespace-nowrap">
                        {volunteer.skills.join(" · ")}
                      </td>

                      <td className="px-3.5 py-[15px] text-[10px] whitespace-nowrap">
                        {volunteer.location}
                      </td>

                      <td className="px-3.5 py-[15px] text-[10px] whitespace-nowrap">
                        {volunteer.availability}
                      </td>

                      <td className="px-3.5 py-[15px]">

                        <span className={`inline-flex rounded-md px-2 py-1.5 text-[9px] font-semibold ${verificationStyle(volunteer.verification)}`}>
                          {volunteer.verification}
                        </span>

                      </td>

                      <td className="px-3.5 py-[15px] text-[10px] whitespace-nowrap">
                        {volunteer.assignment}
                      </td>

                      <td className="px-3.5 py-[15px]">

                        <span className="inline-flex items-center gap-1 bg-[#e8f1f5] text-[#287fa9] rounded-md px-2 py-1.5 text-[9px] font-semibold">
                          {volunteer.rating !== "—" && (
                            <Star size={10} />
                          )}
                          {volunteer.rating}
                        </span>

                      </td>

                      <td className="px-3 py-[15px]">

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVolunteer(volunteer);
                          }}
                          className="text-[#718ba0] hover:text-[#287fa9]"
                        >
                          <ChevronRight size={17} />
                        </button>

                      </td>

                    </tr>

                  ))}

                  {paginatedVolunteers.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-sm text-gray-400">
                        No volunteers found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            /* GRID VIEW */

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">

              {paginatedVolunteers.map((volunteer) => (

                <div
                  key={volunteer.id}
                  onClick={() => setSelectedVolunteer(volunteer)}
                  className="border border-[#d5e2e9] rounded-lg p-4 hover:shadow-md cursor-pointer transition"
                >

                  <div className="flex items-center justify-between">

                    <div className="w-10 h-10 bg-[#e7f1f6] rounded-full flex items-center justify-center">
                      <UserRound size={20} className="text-[#287fa9]" />
                    </div>

                    <span className={`rounded-md px-2 py-1 text-[9px] ${verificationStyle(volunteer.verification)}`}>
                      {volunteer.verification}
                    </span>

                  </div>

                  <h3 className="font-semibold text-sm mt-3">
                    {volunteer.name}
                  </h3>

                  <p className="text-[10px] text-gray-400 mt-1">
                    {volunteer.id}
                  </p>

                  <p className="text-[11px] mt-3">
                    {volunteer.skills.join(" · ")}
                  </p>

                  <p className="text-[10px] text-gray-500 mt-2">
                    {volunteer.location}
                  </p>

                  <div className="border-t mt-3 pt-3 flex justify-between text-[10px]">
                    <span>{volunteer.availability}</span>
                    <span className="text-[#287fa9] font-semibold">
                      ★ {volunteer.rating}
                    </span>
                  </div>

                </div>

              ))}

            </div>

          )}

          {/* PAGINATION */}

          <div className="border-t border-[#d5e2e9] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-[10px] text-[#8296aa]">

              Showing{" "}
              {filteredVolunteers.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –
              {Math.min(currentPage * pageSize, filteredVolunteers.length)}
              {" "}of {filteredVolunteers.length}

            </p>

            <div className="flex items-center gap-2">

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="border border-[#d3e2e9] rounded-lg px-3 py-2 text-[10px] text-[#287fa9] disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from(
                { length: Math.min(totalPages, 3) },
                (_, i) => i + 1
              ).map((page) => (

                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[35px] h-[35px] rounded-lg border text-[10px] ${
                    currentPage === page
                      ? "bg-[#287fa9] border-[#287fa9] text-white"
                      : "border-[#d3e2e9] text-[#123c5b] hover:bg-[#edf5f8]"
                  }`}
                >
                  {page}
                </button>

              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="border border-[#b9d0dc] rounded-lg px-3 py-2 text-[10px] text-[#287fa9] disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>

        </section>

      </main>

      {/* ADD VOLUNTEER MODAL */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl w-full max-w-[450px] shadow-2xl">

            <div className="flex items-center justify-between p-5 border-b">

              <div>
                <h2 className="text-lg font-semibold">
                  Add new volunteer
                </h2>

                <p className="text-[11px] text-gray-400 mt-1">
                  Register a new volunteer profile.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-black"
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleAddVolunteer} className="p-5 space-y-4">

              <div>
                <label className="text-xs font-medium">
                  Full name
                </label>

                <input
                  required
                  value={newVolunteer.name}
                  onChange={(e) =>
                    setNewVolunteer({
                      ...newVolunteer,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter volunteer name"
                  className="w-full mt-2 border border-gray-200 rounded-lg p-3 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-xs font-medium">
                  Location
                </label>

                <input
                  required
                  value={newVolunteer.location}
                  onChange={(e) =>
                    setNewVolunteer({
                      ...newVolunteer,
                      location: e.target.value,
                    })
                  }
                  placeholder="Enter location"
                  className="w-full mt-2 border border-gray-200 rounded-lg p-3 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-xs font-medium">
                  Skills
                </label>

                <input
                  value={newVolunteer.skills}
                  onChange={(e) =>
                    setNewVolunteer({
                      ...newVolunteer,
                      skills: e.target.value,
                    })
                  }
                  placeholder="First Aid, Logistics, Driving"
                  className="w-full mt-2 border border-gray-200 rounded-lg p-3 text-xs outline-none focus:border-[#287fa9]"
                />

                <p className="text-[10px] text-gray-400 mt-1">
                  Separate multiple skills using commas.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3">

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-gray-200 rounded-lg px-4 py-2 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#287fa9] text-white rounded-lg px-4 py-2 text-xs"
                >
                  Add volunteer
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* VOLUNTEER DETAILS MODAL */}

      {selectedVolunteer && (

        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl p-6 w-full max-w-[400px] shadow-2xl">

            <div className="flex justify-between items-center">

              <h2 className="font-semibold text-lg">
                Volunteer details
              </h2>

              <button
                onClick={() => setSelectedVolunteer(null)}
              >
                <X size={20} />
              </button>

            </div>

            <div className="mt-5 space-y-4 text-xs">

              <div>
                <p className="text-gray-400">Volunteer ID</p>
                <p className="font-semibold mt-1">
                  {selectedVolunteer.id}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Full name</p>
                <p className="font-semibold mt-1">
                  {selectedVolunteer.name}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Skills</p>
                <p className="font-semibold mt-1">
                  {selectedVolunteer.skills.join(", ")}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Location</p>
                <p className="font-semibold mt-1">
                  {selectedVolunteer.location}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Availability</p>
                <p className="font-semibold mt-1">
                  {selectedVolunteer.availability}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Current assignment</p>
                <p className="font-semibold mt-1">
                  {selectedVolunteer.assignment}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Verification status</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-md ${verificationStyle(selectedVolunteer.verification)}`}>
                  {selectedVolunteer.verification}
                </span>
              </div>

            </div>

            <button
              onClick={() => setSelectedVolunteer(null)}
              className="w-full mt-6 bg-[#287fa9] text-white rounded-lg py-3 text-xs"
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* HELP BUTTON */}

      <button className="fixed bottom-5 right-4 w-10 h-10 rounded-full bg-[#282828] text-white flex items-center justify-center shadow-lg hover:bg-black z-30">
        <HelpCircle size={22} />
      </button>

    </div>
  );
}