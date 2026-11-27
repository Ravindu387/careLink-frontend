import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import {
  Search,
  Plus,
  ChevronRight,
  Download,
  List,
  LayoutGrid,
  X,
  Star,
  SlidersHorizontal,
  UserRound,
  Server,
  RefreshCw,
  Loader2,
  Trash2,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  HelpCircle,
} from "lucide-react";

import { volunteerDirectoryService } from "../../services/volunteerDirectoryService";
import type {
  VolunteerItem,
  VolunteerDirectoryStats,
  VerificationStatus,
} from "../../types/volunteerDirectory";

export default function VolunteerDirectory() {
  // Connection and loading states
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // Data states
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);
  const [stats, setStats] = useState<VolunteerDirectoryStats>({
    totalRegistered: "2,418",
    verified: "2,184",
    availableNow: "642",
    assigned: "387",
  });

  const [availableLocations, setAvailableLocations] = useState<string[]>([
    "Central Ward",
    "North Ward",
    "Eastbank",
    "West District",
    "South Ward",
  ]);

  const [availableSkills, setAvailableSkills] = useState<string[]>([
    "First Aid",
    "Logistics",
    "Driving",
    "Rescue",
    "Translation",
    "Medical",
    "Shelter Support",
    "Childcare",
    "Warehousing",
  ]);

  // Filters & pagination
  const [search, setSearch] = useState<string>("");
  const [skillFilter, setSkillFilter] = useState<string>("All skills");
  const [locationFilter, setLocationFilter] = useState<string>("All locations");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("Any availability");
  const [verificationFilter, setVerificationFilter] = useState<string>("All verification states");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 5;

  // View and Modal states
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // New volunteer form
  const [newVolunteer, setNewVolunteer] = useState({
    name: "",
    location: "",
    skills: "",
    phone: "",
    email: "",
  });

  const notify = (message: string) => {
    setNotification(message);
    window.setTimeout(() => setNotification(""), 3500);
  };

  // LOAD VOLUNTEERS
  const loadDirectory = useCallback(
    async (page: number = currentPage, background: boolean = false) => {
      if (background) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await volunteerDirectoryService.getDirectory({
          search: search.trim() || undefined,
          skill: skillFilter !== "All skills" ? skillFilter : undefined,
          location: locationFilter !== "All locations" ? locationFilter : undefined,
          availability: availabilityFilter !== "Any availability" ? availabilityFilter : undefined,
          verification: verificationFilter !== "All verification states" ? verificationFilter : undefined,
          pageNumber: page,
          pageSize,
        });

        const data = result.data;
        setVolunteers(data.volunteers || []);
        setStats(data.stats);
        setTotalCount(data.totalCount ?? 0);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
        setCurrentPage(data.pageNumber || page);

        if (data.locations && data.locations.length > 0) {
          setAvailableLocations((prev) => Array.from(new Set([...prev, ...data.locations])));
        }

        if (data.skills && data.skills.length > 0) {
          setAvailableSkills((prev) => Array.from(new Set([...prev, ...data.skills])));
        }

        setIsLiveBackend(result.isLiveBackend);
      } catch (err: unknown) {
        console.error("Failed to load volunteer directory:", err);
        notify("Could not load latest volunteer data from backend.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [search, skillFilter, locationFilter, availabilityFilter, verificationFilter, currentPage]
  );

  useEffect(() => {
    loadDirectory(currentPage);
  }, [loadDirectory, currentPage]);

  const handleRefresh = () => {
    loadDirectory(currentPage, true);
  };

  // ADD VOLUNTEER
  const handleAddVolunteer = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newVolunteer.name.trim() || !newVolunteer.location.trim()) {
      notify("Please provide volunteer name and location.");
      return;
    }

    setIsSubmitting(true);
    try {
      const skillsArray = newVolunteer.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const result = await volunteerDirectoryService.createVolunteer({
        name: newVolunteer.name.trim(),
        location: newVolunteer.location.trim(),
        skills: skillsArray.length > 0 ? skillsArray : ["General Support"],
        phone: newVolunteer.phone.trim(),
        email: newVolunteer.email.trim(),
      });

      setIsLiveBackend(result.isLiveBackend);
      setNewVolunteer({ name: "", location: "", skills: "", phone: "", email: "" });
      setShowAddModal(false);
      notify("New volunteer registered successfully!");
      setCurrentPage(1);
      loadDirectory(1, true);
    } catch (err: unknown) {
      console.error("Create volunteer failed:", err);
      notify("Failed to register volunteer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE VERIFICATION STATUS
  const handleUpdateVerification = async (id: string, verification: VerificationStatus) => {
    try {
      const result = await volunteerDirectoryService.updateVerification(id, verification);
      setIsLiveBackend(result.isLiveBackend);
      setVolunteers((prev) => prev.map((v) => (v.id === id ? result.data : v)));
      if (selectedVolunteer && selectedVolunteer.id === id) {
        setSelectedVolunteer(result.data);
      }
      notify(`Verification updated to ${verification}.`);
      loadDirectory(currentPage, true);
    } catch (err: unknown) {
      console.error("Update verification failed:", err);
      notify("Failed to update verification status.");
    }
  };

  // UPDATE AVAILABILITY STATUS
  const handleUpdateAvailability = async (id: string, availability: string) => {
    try {
      const result = await volunteerDirectoryService.updateAvailability(id, availability);
      setIsLiveBackend(result.isLiveBackend);
      setVolunteers((prev) => prev.map((v) => (v.id === id ? result.data : v)));
      if (selectedVolunteer && selectedVolunteer.id === id) {
        setSelectedVolunteer(result.data);
      }
      notify(`Availability updated to ${availability}.`);
      loadDirectory(currentPage, true);
    } catch (err: unknown) {
      console.error("Update availability failed:", err);
      notify("Failed to update availability.");
    }
  };

  // DELETE VOLUNTEER
  const handleDeleteVolunteer = async (id: string) => {
    try {
      const result = await volunteerDirectoryService.deleteVolunteer(id);
      setIsLiveBackend(result.isLiveBackend);
      setVolunteers((prev) => prev.filter((v) => v.id !== id));
      if (selectedVolunteer && selectedVolunteer.id === id) {
        setSelectedVolunteer(null);
      }
      setConfirmDeleteId(null);
      notify("Volunteer removed from directory.");
      loadDirectory(currentPage, true);
    } catch (err: unknown) {
      console.error("Delete volunteer failed:", err);
      notify("Failed to remove volunteer.");
    }
  };

  // EXPORT CSV
  const handleExport = async () => {
    try {
      const blob = await volunteerDirectoryService.exportCsv({
        search: search.trim() || undefined,
        skill: skillFilter !== "All skills" ? skillFilter : undefined,
        location: locationFilter !== "All locations" ? locationFilter : undefined,
        availability: availabilityFilter !== "Any availability" ? availabilityFilter : undefined,
        verification: verificationFilter !== "All verification states" ? verificationFilter : undefined,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `volunteer-directory-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      notify("Volunteer directory exported!");
    } catch (err: unknown) {
      console.error("Export failed:", err);
      notify("Failed to export volunteer directory.");
    }
  };

  // RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setSkillFilter("All skills");
    setLocationFilter("All locations");
    setAvailabilityFilter("Any availability");
    setVerificationFilter("All verification states");
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
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 lg:px-[33px] pt-5 pb-10">
        {/* BREADCRUMB & BACKEND CONNECTION STATUS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#7890a4]">Operations</span>
            <ChevronRight size={13} className="text-[#7890a4]" />
            <span className="text-[#7890a4]">Volunteer Coordination</span>
            <ChevronRight size={13} className="text-[#7890a4]" />
            <span className="font-semibold text-[#123c5b]">Volunteer Directory</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                isLiveBackend
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <Server size={12} />
              <span>{isLiveBackend ? "Live Server (API)" : "Offline Demo"}</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh directory"
              className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-1 text-xs text-slate-700 hover:bg-[#f5fafc] disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={isRefreshing ? "animate-spin text-[#287fa9]" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight">
              Volunteer Directory
            </h1>
            <p className="text-[12px] text-[#718ba0] mt-1.5">
              Search verified volunteer profiles, skills, availability, and assignment history in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="h-[42px] px-4 border border-[#b9d0dc] bg-white hover:bg-[#f5fafc] rounded-lg flex items-center gap-2 text-sm text-[#17648e] transition-colors"
            >
              <Download size={15} />
              Export
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="h-[42px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-sm font-semibold shadow-xs transition-colors"
            >
              <Plus size={16} />
              Add volunteer
            </button>
          </div>
        </div>

        {/* STATISTICS BAR */}
        <section className="bg-white border border-[#d3e2e9] rounded-xl py-3.5 mb-4 grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#d5e2e9] shadow-xs">
          {[
            { value: stats.totalRegistered, label: "Total registered" },
            { value: stats.verified, label: "Verified" },
            { value: stats.availableNow, label: "Available now" },
            { value: stats.assigned, label: "Assigned" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-center gap-2 py-1.5">
              <span className="text-[16px] font-bold text-[#123c5b]">{stat.value}</span>
              <span className="text-[13px] text-[#8296aa]">{stat.label}</span>
            </div>
          ))}
        </section>

        {/* FILTER BAR */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_120px_130px_130px_140px_95px] gap-2.5 mb-4">
          {/* SEARCH */}
          <div className="h-[42px] bg-white border border-[#d3e2e9] rounded-lg flex items-center px-3 gap-2.5">
            <Search size={16} className="text-[#7791a5]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search volunteer ID, name, or skill..."
              className="w-full text-sm sm:text-[15px] outline-none placeholder:text-[#a2b2c1]"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* SKILL FILTER */}
          <select
            value={skillFilter}
            onChange={(e) => {
              setSkillFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[42px] bg-white border border-[#d3e2e9] rounded-lg px-2.5 text-sm sm:text-[15px] outline-none cursor-pointer"
          >
            <option>All skills</option>
            {availableSkills.map((sk) => (
              <option key={sk} value={sk}>
                {sk}
              </option>
            ))}
          </select>

          {/* LOCATION FILTER */}
          <select
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[42px] bg-white border border-[#d3e2e9] rounded-lg px-2.5 text-sm sm:text-[15px] outline-none cursor-pointer"
          >
            <option>All locations</option>
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* AVAILABILITY */}
          <select
            value={availabilityFilter}
            onChange={(e) => {
              setAvailabilityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[42px] bg-white border border-[#d3e2e9] rounded-lg px-2.5 text-sm sm:text-[15px] outline-none cursor-pointer"
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
            className="h-[42px] bg-white border border-[#d3e2e9] rounded-lg px-2.5 text-sm sm:text-[15px] outline-none cursor-pointer"
          >
            <option>All verification states</option>
            <option>Verified</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>

          {/* MORE FILTERS TOGGLE */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="h-[42px] bg-white border border-[#b9d0dc] hover:bg-[#f5fafc] rounded-lg text-sm flex items-center justify-center gap-1.5 text-[#17648e]"
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
          </button>
        </section>

        {/* EXTRA FILTERS PANEL */}
        {showFilters && (
          <div className="bg-white border border-[#d3e2e9] rounded-lg p-3.5 mb-4 flex flex-wrap justify-between items-center gap-3 shadow-2xs">
            <div>
              <p className="text-sm font-semibold text-[#123c5b]">Active Filter Controls</p>
              <p className="text-[13px] text-gray-400 mt-0.5">
                Reset all filters to view all volunteer records across Riverton.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="text-sm text-[#287fa9] hover:underline font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* VOLUNTEER RECORDS SECTION */}
        <section className="bg-white border border-[#d3e2e9] rounded-xl shadow-[0_8px_20px_rgba(30,70,90,0.06)] overflow-hidden">
          {/* HEADER & VIEW SWITCH */}
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#d5e2e9] bg-[#fafcfd]">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#123c5b]">Volunteer records</h2>
              <p className="text-xs text-[#8296aa] mt-0.5">
                {totalCount} matching volunteer profiles
              </p>
            </div>

            <div className="flex items-center border border-[#d3e2e9] rounded-lg p-0.5 gap-0.5 bg-white">
              <button
                onClick={() => setViewMode("list")}
                title="Table list view"
                className={`w-[30px] h-[30px] flex items-center justify-center rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-[#e7f1f6] text-[#287fa9]"
                    : "text-[#8096a9] hover:text-[#287fa9]"
                }`}
              >
                <List size={18} />
              </button>

              <button
                onClick={() => setViewMode("grid")}
                title="Grid card view"
                className={`w-[30px] h-[30px] flex items-center justify-center rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#e7f1f6] text-[#287fa9]"
                    : "text-[#8096a9] hover:text-[#287fa9]"
                }`}
              >
                <LayoutGrid size={17} />
              </button>
            </div>
          </div>

          {/* LIST VIEW */}
          {isLoading ? (
            <div className="py-16 text-center text-slate-500">
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 size={22} className="animate-spin text-[#287fa9]" />
                <span className="text-xs font-medium">Loading volunteer records...</span>
              </div>
            </div>
          ) : viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-[#f5f8f9] border-b border-[#d5e2e9]">
                  <tr className="text-sm text-[#718ba0]">
                    <th className="px-3.5 py-3 font-medium">Volunteer ID</th>
                    <th className="px-3.5 py-3 font-medium">Name</th>
                    <th className="px-3.5 py-3 font-medium">Skills</th>
                    <th className="px-3.5 py-3 font-medium">Location</th>
                    <th className="px-3.5 py-3 font-medium">Availability</th>
                    <th className="px-3.5 py-3 font-medium">Verification</th>
                    <th className="px-3.5 py-3 font-medium">Current Assignment</th>
                    <th className="px-3.5 py-3 font-medium">Rating</th>
                    <th className="px-3 py-3 w-6"></th>
                  </tr>
                </thead>

                <tbody>
                  {volunteers.map((volunteer) => (
                    <tr
                      key={volunteer.id}
                      onClick={() => setSelectedVolunteer(volunteer)}
                      className={`border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer transition ${
                        selectedVolunteer?.id === volunteer.id ? "bg-[#f1f8fb]" : ""
                      }`}
                    >
                      <td className="px-3.5 py-3.5 text-sm font-semibold text-[#17648e] whitespace-nowrap">
                        {volunteer.id}
                      </td>

                      <td className="px-3.5 py-3.5 text-sm font-medium text-[#123c5b] whitespace-nowrap">
                        {volunteer.name}
                      </td>

                      <td className="px-3.5 py-3.5 text-sm text-[#557086] whitespace-nowrap">
                        {volunteer.skills.join(" · ")}
                      </td>

                      <td className="px-3.5 py-3.5 text-sm text-[#557086] whitespace-nowrap">
                        {volunteer.location}
                      </td>

                      <td className="px-3.5 py-3.5 text-sm text-[#557086] whitespace-nowrap">
                        {volunteer.availability}
                      </td>

                      <td className="px-3.5 py-3.5">
                        <span
                          className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${verificationStyle(
                            volunteer.verification
                          )}`}
                        >
                          {volunteer.verification}
                        </span>
                      </td>

                      <td className="px-3.5 py-3.5 text-sm text-[#557086] whitespace-nowrap">
                        {volunteer.assignment}
                      </td>

                      <td className="px-3.5 py-3.5">
                        <span className="inline-flex items-center gap-1 bg-[#e8f1f5] text-[#287fa9] rounded-md px-2 py-1 text-xs font-semibold">
                          {volunteer.rating !== "—" && <Star size={9} />}
                          {volunteer.rating}
                        </span>
                      </td>

                      <td className="px-3 py-3.5 text-right">
                        <ChevronRight size={14} className="text-[#8296aa]" />
                      </td>
                    </tr>
                  ))}

                  {volunteers.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-sm text-gray-400">
                        No volunteer records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {volunteers.map((volunteer) => (
                <div
                  key={volunteer.id}
                  onClick={() => setSelectedVolunteer(volunteer)}
                  className="border border-[#d5e2e9] rounded-xl p-4 hover:shadow-md cursor-pointer transition bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 bg-[#e7f1f6] rounded-full flex items-center justify-center">
                      <UserRound size={18} className="text-[#287fa9]" />
                    </div>

                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${verificationStyle(
                        volunteer.verification
                      )}`}
                    >
                      {volunteer.verification}
                    </span>
                  </div>

                  <h3 className="font-semibold text-base text-[#123c5b] mt-2.5">{volunteer.name}</h3>
                  <p className="text-xs text-gray-400">{volunteer.id}</p>

                  <p className="text-sm text-[#557086] mt-2.5 truncate">
                    {volunteer.skills.join(" · ")}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">{volunteer.location}</p>

                  <div className="border-t border-[#e1eaf0] mt-3 pt-2.5 flex justify-between items-center text-xs">
                    <span className="text-[#557086] font-medium">{volunteer.availability}</span>
                    <span className="text-[#287fa9] font-bold">★ {volunteer.rating}</span>
                  </div>
                </div>
              ))}

              {volunteers.length === 0 && (
                <div className="col-span-3 text-center py-12 text-xs text-gray-400">
                  No volunteer records found.
                </div>
              )}
            </div>
          )}

          {/* PAGINATION */}
          <div className="border-t border-[#d5e2e9] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#fafcfd]">
            <p className="text-xs text-[#8296aa]">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} volunteers
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="border border-[#d3e2e9] bg-white rounded-lg px-3 py-1.5 text-sm text-[#287fa9] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#edf5f8]"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                )
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && page - prev > 1;

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && <span className="text-[13px] text-slate-400 px-0.5">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-[28px] h-[28px] rounded-lg border text-sm font-medium ${
                          currentPage === page
                            ? "bg-[#287fa9] border-[#287fa9] text-white"
                            : "border-[#d3e2e9] bg-white text-[#123c5b] hover:bg-[#edf5f8]"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              <button
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="border border-[#b9d0dc] bg-white rounded-lg px-3 py-1.5 text-sm text-[#287fa9] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#edf5f8]"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ADD VOLUNTEER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-[450px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-[#e1eaf0]">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#123c5b]">Add new volunteer</h2>
                <p className="text-[13px] text-gray-400 mt-0.5">Register a new volunteer profile.</p>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVolunteer} className="p-5 space-y-3.5">
              <div>
                <label className="text-sm font-semibold text-[#123c5b]">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={newVolunteer.name}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
                  placeholder="e.g. Maria Gonzalez"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#123c5b]">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={newVolunteer.location}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, location: e.target.value })}
                  placeholder="e.g. Central Ward"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#123c5b]">Skills</label>
                <input
                  value={newVolunteer.skills}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, skills: e.target.value })}
                  placeholder="First Aid, Logistics, Driving"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287fa9]"
                />
                <p className="text-xs text-gray-400 mt-1">Separate multiple skills using commas.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-[#123c5b]">Phone</label>
                  <input
                    value={newVolunteer.phone}
                    onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
                    placeholder="+94 77 123 4567"
                    className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287fa9]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#123c5b]">Email</label>
                  <input
                    type="email"
                    value={newVolunteer.email}
                    onChange={(e) => setNewVolunteer({ ...newVolunteer, email: e.target.value })}
                    placeholder="volunteer@example.org"
                    className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287fa9]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e1eaf0]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2 text-sm hover:bg-[#f0f7fa]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{isSubmitting ? "Adding..." : "Add volunteer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOLUNTEER DETAILS MODAL */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-[440px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-[#e1eaf0]">
              <div>
                <span className="text-xs font-bold text-[#17648e] bg-[#e8f1f6] px-2 py-0.5 rounded">
                  {selectedVolunteer.id}
                </span>
                <h2 className="font-semibold text-lg sm:text-xl text-[#123c5b] mt-1">Volunteer Profile</h2>
              </div>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <p className="text-[13px] text-gray-400">Full name</p>
                <p className="font-semibold text-sm text-[#123c5b]">{selectedVolunteer.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#f8fbfe] p-3 rounded-lg border border-[#e1eaf0]">
                <div>
                  <div className="text-[13px] text-gray-400 flex items-center gap-1">
                    <MapPin size={11} className="text-[#287fa9]" /> Location
                  </div>
                  <p className="font-semibold text-[#123c5b] mt-0.5">{selectedVolunteer.location}</p>
                </div>

                <div>
                  <div className="text-[13px] text-gray-400 flex items-center gap-1">
                    <Clock size={11} className="text-[#287fa9]" /> Availability
                  </div>
                  <p className="font-semibold text-[#123c5b] mt-0.5">{selectedVolunteer.availability}</p>
                </div>

                <div>
                  <div className="text-[13px] text-gray-400 flex items-center gap-1">
                    <Briefcase size={11} className="text-[#287fa9]" /> Assignment
                  </div>
                  <p className="font-semibold text-[#123c5b] mt-0.5">{selectedVolunteer.assignment}</p>
                </div>

                <div>
                  <div className="text-[13px] text-gray-400 flex items-center gap-1">
                    <Star size={11} className="text-[#287fa9]" /> Rating
                  </div>
                  <p className="font-semibold text-[#123c5b] mt-0.5">★ {selectedVolunteer.rating}</p>
                </div>
              </div>

              {selectedVolunteer.phone || selectedVolunteer.email ? (
                <div className="space-y-1.5 text-sm">
                  {selectedVolunteer.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={13} className="text-[#287fa9]" />
                      <span>{selectedVolunteer.phone}</span>
                    </div>
                  )}
                  {selectedVolunteer.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={13} className="text-[#287fa9]" />
                      <span>{selectedVolunteer.email}</span>
                    </div>
                  )}
                </div>
              ) : null}

              <div>
                <p className="text-[13px] text-gray-400 mb-1">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVolunteer.skills.map((s) => (
                    <span
                      key={s}
                      className="bg-[#e8f1f6] text-[#287fa9] px-2 py-0.5 rounded text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* QUICK VERIFICATION STATUS ACTION */}
              <div className="pt-2 border-t border-[#e1eaf0]">
                <p className="text-sm font-semibold text-[#123c5b] mb-1.5">
                  Verification Status:
                </p>
                <div className="flex gap-2">
                  {(["Verified", "Pending", "Rejected"] as VerificationStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateVerification(selectedVolunteer.id, st)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        selectedVolunteer.verification === st
                          ? "bg-[#287fa9] text-white"
                          : "border border-[#d5e2e9] bg-white text-[#123c5b] hover:bg-[#f0f7fa]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUICK AVAILABILITY ACTION */}
              <div className="pt-2 border-t border-[#e1eaf0]">
                <p className="text-sm font-semibold text-[#123c5b] mb-1.5">Quick Availability:</p>
                <div className="flex gap-2">
                  {["Available now", "Unavailable"].map((av) => (
                    <button
                      key={av}
                      onClick={() => handleUpdateAvailability(selectedVolunteer.id, av)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        selectedVolunteer.availability === av
                          ? "bg-[#62b9a0] text-white"
                          : "border border-[#d5e2e9] bg-white text-[#123c5b] hover:bg-[#f0f7fa]"
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {confirmDeleteId === selectedVolunteer.id && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                  <p className="text-sm font-semibold">Remove this volunteer?</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleDeleteVolunteer(selectedVolunteer.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#e1eaf0] flex justify-between items-center">
              <button
                onClick={() => setConfirmDeleteId(selectedVolunteer.id)}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setSelectedVolunteer(null)}
                className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-4 py-3 shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* FLOATING HELP BUTTON */}
      <button
        title="Help & Support"
        className="fixed bottom-5 right-4 w-10 h-10 rounded-full bg-[#282828] text-white flex items-center justify-center shadow-lg hover:bg-black z-30 transition-colors cursor-pointer"
      >
        <HelpCircle size={20} />
      </button>
    </div>
  );
}
