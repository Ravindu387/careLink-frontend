import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  X,
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  SlidersHorizontal,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  User,
} from "lucide-react";

// TYPES

type Priority = "Standard" | "High" | "Urgent";
type VerificationStatus = "Pending" | "Approved" | "Rejected";

interface Application {
  id: string;
  applicant: string;
  skills: string[];
  location: string;
  documents: string[];
  submitted: string;
  priority: Priority;
  documentState: string;
  status: VerificationStatus;
  email: string;
  phone: string;
}

// DEMO DATA

const initialApplications: Application[] = [
  {
    id: "VER-218",
    applicant: "Sara Khan",
    skills: ["Shelter Support", "Childcare"],
    location: "Central Ward",
    documents: ["ID", "First Aid Certificate"],
    submitted: "2 hours ago",
    priority: "Standard",
    documentState: "Complete",
    status: "Pending",
    email: "sara@example.com",
    phone: "+94 71 234 5678",
  },
  {
    id: "VER-215",
    applicant: "Abdul Rahman",
    skills: ["Heavy Vehicle", "Logistics"],
    location: "North Ward",
    documents: ["ID", "Driving Licence"],
    submitted: "5 hours ago",
    priority: "High",
    documentState: "Complete",
    status: "Pending",
    email: "abdul@example.com",
    phone: "+94 72 345 6789",
  },
  {
    id: "VER-209",
    applicant: "Maya Fernando",
    skills: ["Nursing", "First Aid"],
    location: "Central Ward",
    documents: ["ID", "Nursing Registration"],
    submitted: "Yesterday",
    priority: "High",
    documentState: "Complete",
    status: "Pending",
    email: "maya@example.com",
    phone: "+94 76 456 7890",
  },
  {
    id: "VER-204",
    applicant: "Theo Martin",
    skills: ["Search & Rescue"],
    location: "West District",
    documents: ["ID", "Rescue Certificate"],
    submitted: "Yesterday",
    priority: "Standard",
    documentState: "Complete",
    status: "Pending",
    email: "theo@example.com",
    phone: "+94 77 567 8901",
  },
  {
    id: "VER-198",
    applicant: "Daniel Okafor",
    skills: ["Logistics", "Warehousing"],
    location: "Eastbank",
    documents: ["ID"],
    submitted: "2 days ago",
    priority: "Urgent",
    documentState: "Incomplete",
    status: "Pending",
    email: "daniel@example.com",
    phone: "+94 75 678 9012",
  },
  {
    id: "VER-192",
    applicant: "Amara Silva",
    skills: ["Medical", "First Aid"],
    location: "South Ward",
    documents: ["ID", "Medical Certificate"],
    submitted: "3 days ago",
    priority: "Standard",
    documentState: "Complete",
    status: "Pending",
    email: "amara@example.com",
    phone: "+94 70 789 0123",
  },
  {
    id: "VER-185",
    applicant: "James Carter",
    skills: ["Driving", "Rescue"],
    location: "North Ward",
    documents: ["ID", "Driving Licence"],
    submitted: "3 days ago",
    priority: "High",
    documentState: "Complete",
    status: "Pending",
    email: "james@example.com",
    phone: "+94 78 890 1234",
  },
  {
    id: "VER-178",
    applicant: "Priya Perera",
    skills: ["Childcare", "Shelter Support"],
    location: "Central Ward",
    documents: ["ID"],
    submitted: "4 days ago",
    priority: "Standard",
    documentState: "Incomplete",
    status: "Pending",
    email: "priya@example.com",
    phone: "+94 74 901 2345",
  },
];

// API CONFIGURATION

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function PendingVerification() {
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("All priorities");

  const [skillFilter, setSkillFilter] =
    useState("All skill groups");

  const [documentFilter, setDocumentFilter] =
    useState("All document states");

  const [dateFilter, setDateFilter] =
    useState("Date submitted");

  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [notification, setNotification] = useState("");

  const [processing, setProcessing] = useState(false);

  const pageSize = 4;

  // FETCH APPLICATIONS FROM API

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/volunteer-verifications/pending`
        );

        if (!response.ok) {
          throw new Error("Unable to load verification applications.");
        }

        const data: Application[] = await response.json();

        setApplications(data);
        setApiError("");
      } catch (error) {
        console.error("API Error:", error);

        // Use demo data if backend is unavailable
        setApiError(
          "Backend unavailable. Showing demonstration data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // FILTER APPLICATIONS

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchMatch =
        application.id.toLowerCase().includes(search.toLowerCase()) ||
        application.applicant.toLowerCase().includes(search.toLowerCase()) ||
        application.skills
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

      const priorityMatch =
        priorityFilter === "All priorities" ||
        application.priority === priorityFilter;

      const skillMatch =
        skillFilter === "All skill groups" ||
        application.skills.some(
          (skill) =>
            skill.toLowerCase() === skillFilter.toLowerCase()
        );

      const documentMatch =
        documentFilter === "All document states" ||
        application.documentState === documentFilter;

      let dateMatch = true;

      if (dateFilter === "Today") {
        dateMatch =
          application.submitted.includes("hour");
      } else if (dateFilter === "Last 2 days") {
        dateMatch =
          application.submitted.includes("hour") ||
          application.submitted === "Yesterday" ||
          application.submitted === "2 days ago";
      }

      return (
        searchMatch &&
        priorityMatch &&
        skillMatch &&
        documentMatch &&
        dateMatch &&
        application.status === "Pending"
      );
    });
  }, [
    applications,
    search,
    priorityFilter,
    skillFilter,
    documentFilter,
    dateFilter,
  ]);

  // PAGINATION

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / pageSize)
  );

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // NOTIFICATION

  const showNotification = (message: string) => {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  // APPROVE APPLICATION

  const handleApprove = async (id: string) => {
    setProcessing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/volunteer-verifications/${id}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Approval failed");
      }

      setApplications((prev) =>
        prev.map((application) =>
          application.id === id
            ? { ...application, status: "Approved" }
            : application
        )
      );

      setSelectedApplication(null);

      showNotification("Application approved successfully!");
    } catch (error) {
      console.error(error);
      showNotification("Unable to approve. Check backend connection.");
    } finally {
      setProcessing(false);
    }
  };

  // REJECT APPLICATION

  const handleReject = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this application?"
    );

    if (!confirmed) return;

    setProcessing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/volunteer-verifications/${id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Rejection failed");
      }

      setApplications((prev) =>
        prev.map((application) =>
          application.id === id
            ? { ...application, status: "Rejected" }
            : application
        )
      );

      setSelectedApplication(null);

      showNotification("Application rejected successfully!");
    } catch (error) {
      console.error(error);
      showNotification("Unable to reject. Check backend connection.");
    } finally {
      setProcessing(false);
    }
  };

  // RESET FILTERS

  const resetFilters = () => {
    setSearch("");
    setPriorityFilter("All priorities");
    setSkillFilter("All skill groups");
    setDocumentFilter("All document states");
    setDateFilter("Date submitted");
    setCurrentPage(1);
  };

  // PRIORITY BADGE

  const priorityStyle = (priority: Priority) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700";

      case "High":
        return "bg-[#fff3dc] text-[#b87813]";

      default:
        return "bg-[#e8f1f6] text-[#287fa9]";
    }
  };

  const pendingCount = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  const urgentCount = applications.filter(
    (application) =>
      application.status === "Pending" &&
      application.priority === "Urgent"
  ).length;

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">

      {/* TOP NAVIGATION */}


      {/* MOBILE NAV */}

      {showMobileMenu && (
        <div className="lg:hidden bg-white p-4 border-b flex gap-4 text-xs">
          <span>Greater Riverton</span>
          <span>EN</span>
          <span>Notifications (9)</span>
          <span>Nadia O.</span>
        </div>
      )}

      {/* NOTIFICATION */}

      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-5 py-3 shadow-xl text-xs">
          {notification}
        </div>
      )}

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 lg:px-[38px] pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[10px] mb-9">

          <span className="text-[#8296aa]">Operations</span>

          <ChevronRight size={13} />

          <span className="text-[#8296aa]">
            Volunteer Coordination
          </span>

          <ChevronRight size={13} />

          <span className="font-semibold text-[#123c5b]">
            Pending Verification
          </span>

        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">

          <div>
            <h1 className="text-[27px] md:text-[29px] font-normal">
              Pending Verification
            </h1>

            <p className="text-[12px] text-[#718ba0] mt-2">
              Review identity, qualifications, safeguarding, and
              eligibility before activation.
            </p>
          </div>

          <button className="h-[45px] px-4 bg-white border border-[#b9d0dc] hover:bg-[#f5fafc] rounded-lg text-[11px] font-medium text-[#17648e]">
            Verification policy
          </button>

        </div>

        {/* AWAITING REVIEW ALERT */}

        <section className="bg-[#fff8e9] border border-[#f4d18b] border-l-[3px] border-l-[#f4a62a] rounded-xl px-4 py-3.5 mb-4">

          <div className="flex flex-col md:flex-row items-center gap-4">

            <ShieldCheck
              size={22}
              className="text-[#946000] shrink-0"
            />

            <div className="flex-1">

              <h3 className="text-[11px] font-bold text-[#825300]">
                {pendingCount === 18
                  ? "18 applications awaiting review"
                  : `${pendingCount} applications awaiting review`}
              </h3>

              <p className="text-[10px] text-[#946b2d] mt-1">
                {urgentCount} include priority qualifications needed
                in the active response.
              </p>

            </div>

            <div className="bg-[#fff3dc] rounded-lg px-3 py-2 w-full md:w-[50%]">

              <p className="text-[9px] font-semibold text-[#a46a09]">
                Oldest: 2 days
              </p>

            </div>

          </div>

        </section>

        {/* FILTER SECTION */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_124px_135px_160px_139px_97px] gap-3 mb-4">

          {/* SEARCH */}

          <div className="h-[45px] bg-white border border-[#d3e2e9] rounded-lg flex items-center px-3 gap-3">

            <Search size={18} className="text-[#718ba0]" />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search applicant or verification ID..."
              className="w-full outline-none text-[10px] placeholder:text-[#a1b1c0]"
            />

          </div>

          {/* PRIORITY */}

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[45px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none"
          >
            <option>All priorities</option>
            <option>Standard</option>
            <option>High</option>
            <option>Urgent</option>
          </select>

          {/* SKILLS */}

          <select
            value={skillFilter}
            onChange={(e) => {
              setSkillFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[45px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none"
          >
            <option>All skill groups</option>
            <option>First Aid</option>
            <option>Medical</option>
            <option>Logistics</option>
            <option>Driving</option>
            <option>Rescue</option>
            <option>Childcare</option>
            <option>Shelter Support</option>
          </select>

          {/* DOCUMENT STATE */}

          <select
            value={documentFilter}
            onChange={(e) => {
              setDocumentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[45px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none"
          >
            <option>All document states</option>
            <option>Complete</option>
            <option>Incomplete</option>
          </select>

          {/* DATE */}

          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[45px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[10px] outline-none"
          >
            <option>Date submitted</option>
            <option>Today</option>
            <option>Last 2 days</option>
          </select>

          {/* MORE FILTERS */}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="h-[45px] bg-white border border-[#b9d0dc] rounded-lg flex items-center justify-center gap-2 text-[10px] hover:bg-[#f5fafc]"
          >
            <SlidersHorizontal size={14} />
            More filters
          </button>

        </section>

        {/* MORE FILTERS */}

        {showFilters && (
          <div className="bg-white border border-[#d3e2e9] rounded-lg p-4 mb-4 flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold">
                Advanced filters
              </p>

              <p className="text-[10px] text-gray-400 mt-1">
                Clear all applied filters.
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="text-xs text-[#287fa9] font-semibold"
            >
              Reset filters
            </button>

          </div>
        )}

        {/* VERIFICATION TABLE */}

        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_8px_20px_rgba(30,70,90,0.06)] overflow-hidden">

          {/* TABLE HEADER */}

          <div className="bg-[#f5f8f9] border-b border-[#d5e3e9] px-4 py-3">

            <h2 className="text-[11px] font-medium text-[#315c79]">
              Verification Applications
            </h2>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-left">

              <thead className="bg-[#f5f8f9] border-b border-[#d5e3e9]">

                <tr className="text-[9px] text-[#718ba0]">

                  <th className="px-3.5 py-3 font-medium">
                    Verification ID
                  </th>

                  <th className="px-3.5 py-3 font-medium">
                    Applicant
                  </th>

                  <th className="px-3.5 py-3 font-medium">
                    Declared Skills
                  </th>

                  <th className="px-3.5 py-3 font-medium">
                    Location
                  </th>

                  <th className="px-3.5 py-3 font-medium">
                    Documents
                  </th>

                  <th className="px-3.5 py-3 font-medium">
                    Submitted
                  </th>

                  <th className="px-3.5 py-3 font-medium">
                    Review Priority
                  </th>

                  <th className="px-3 py-3"></th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-12 text-sm text-gray-400"
                    >
                      Loading applications...
                    </td>
                  </tr>

                ) : paginatedApplications.length > 0 ? (

                  paginatedApplications.map((application) => (

                    <tr
                      key={application.id}
                      onClick={() => setSelectedApplication(application)}
                      className="border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer transition-colors"
                    >

                      <td className="px-3.5 py-[16px] text-[10px] font-semibold whitespace-nowrap">
                        {application.id}
                      </td>

                      <td className="px-3.5 py-[16px] text-[10px] whitespace-nowrap">
                        {application.applicant}
                      </td>

                      <td className="px-3.5 py-[16px] text-[10px] whitespace-nowrap">
                        {application.skills.join(" · ")}
                      </td>

                      <td className="px-3.5 py-[16px] text-[10px] whitespace-nowrap">
                        {application.location}
                      </td>

                      <td className="px-3.5 py-[16px] text-[10px] whitespace-nowrap">
                        {application.documents.join(" · ")}
                      </td>

                      <td className="px-3.5 py-[16px] text-[10px] whitespace-nowrap">
                        {application.submitted}
                      </td>

                      <td className="px-3.5 py-[16px]">

                        <span className={`inline-flex px-2 py-1.5 rounded-md text-[9px] font-semibold ${priorityStyle(application.priority)}`}>
                          {application.priority}
                        </span>

                      </td>

                      <td className="px-3 py-[16px]">

                        <ChevronRight
                          size={17}
                          className="text-[#718ba0]"
                        />

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-12 text-xs text-gray-400"
                    >
                      No pending verification applications found.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          <div className="px-4 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3">

            <p className="text-[10px] text-[#8296aa]">

              Showing{" "}
              {filteredApplications.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –
              {Math.min(
                currentPage * pageSize,
                filteredApplications.length
              )}
              {" "}of {filteredApplications.length}

            </p>

            <div className="flex items-center gap-2">

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="border border-[#d5e2e9] rounded-lg px-4 py-2.5 text-[10px] text-[#287fa9] disabled:opacity-40"
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
                      : "border-[#d5e2e9] hover:bg-[#f0f7fa]"
                  }`}
                >
                  {page}
                </button>

              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="border border-[#b9d0dc] rounded-lg px-4 py-2.5 text-[10px] text-[#287fa9] disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>

        </section>

        {/* API STATUS */}

        {apiError && (
          <p className="mt-3 text-[10px] text-amber-700">
            <AlertTriangle size={12} className="inline mr-1" />
            {apiError}
          </p>
        )}

      </main>

      {/* APPLICATION DETAILS MODAL */}

      {selectedApplication && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[520px] overflow-hidden">

            {/* MODAL HEADER */}

            <div className="p-5 border-b flex justify-between items-center">

              <div>
                <h2 className="text-[17px] font-semibold">
                  Verification Review
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  Application ID: {selectedApplication.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedApplication(null)}
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="p-5 space-y-4">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-full bg-[#e7f1f6] flex items-center justify-center">
                  <User size={22} className="text-[#287fa9]" />
                </div>

                <div>
                  <h3 className="font-semibold text-sm">
                    {selectedApplication.applicant}
                  </h3>

                  <p className="text-[10px] text-gray-400">
                    Volunteer Applicant
                  </p>
                </div>

                <span className={`ml-auto rounded-md px-3 py-1.5 text-[9px] ${priorityStyle(selectedApplication.priority)}`}>
                  {selectedApplication.priority} Priority
                </span>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-[#f5f8fa] p-3 rounded-lg">
                  <p className="text-[10px] text-gray-400">
                    Location
                  </p>

                  <p className="text-xs font-semibold mt-1">
                    {selectedApplication.location}
                  </p>
                </div>

                <div className="bg-[#f5f8fa] p-3 rounded-lg">
                  <p className="text-[10px] text-gray-400">
                    Submitted
                  </p>

                  <p className="text-xs font-semibold mt-1">
                    {selectedApplication.submitted}
                  </p>
                </div>

                <div className="bg-[#f5f8fa] p-3 rounded-lg">
                  <p className="text-[10px] text-gray-400">
                    Email
                  </p>

                  <p className="text-xs font-semibold mt-1 break-all">
                    {selectedApplication.email}
                  </p>
                </div>

                <div className="bg-[#f5f8fa] p-3 rounded-lg">
                  <p className="text-[10px] text-gray-400">
                    Phone
                  </p>

                  <p className="text-xs font-semibold mt-1">
                    {selectedApplication.phone}
                  </p>
                </div>

              </div>

              {/* SKILLS */}

              <div>
                <p className="text-[11px] font-semibold mb-2">
                  Declared Skills
                </p>

                <div className="flex flex-wrap gap-2">

                  {selectedApplication.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-[#e8f1f6] text-[#287fa9] rounded-md px-3 py-2 text-[10px]"
                    >
                      {skill}
                    </span>
                  ))}

                </div>
              </div>

              {/* DOCUMENTS */}

              <div>
                <p className="text-[11px] font-semibold mb-2">
                  Submitted Documents
                </p>

                {selectedApplication.documents.map((document) => (

                  <div
                    key={document}
                    className="flex items-center justify-between border border-[#d5e2e9] rounded-lg p-3 mb-2"
                  >

                    <div className="flex items-center gap-2">
                      <FileText size={17} className="text-[#287fa9]" />

                      <span className="text-[11px]">
                        {document}
                      </span>
                    </div>

                    <CheckCircle2
                      size={16}
                      className="text-[#16a085]"
                    />

                  </div>

                ))}

                <p className="text-[10px] text-gray-400 mt-2">
                  Document state: {selectedApplication.documentState}
                </p>

              </div>

              {/* WARNING */}

              <div className="bg-[#fff8e9] border border-[#f4d18b] rounded-lg p-3 flex gap-2">

                <AlertTriangle
                  size={16}
                  className="text-[#b87813] shrink-0"
                />

                <p className="text-[10px] text-[#946000]">
                  Please verify the applicant's identity and
                  qualifications before approving this application.
                </p>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="border-t p-4 flex flex-col sm:flex-row justify-end gap-2">

              <button
                disabled={processing}
                onClick={() =>
                  handleReject(selectedApplication.id)
                }
                className="border border-red-200 text-red-600 hover:bg-red-50 rounded-lg px-4 py-3 text-[11px] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle size={15} />
                Reject
              </button>

              <button
                disabled={processing}
                onClick={() =>
                  handleApprove(selectedApplication.id)
                }
                className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-4 py-3 text-[11px] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={15} />
                {processing ? "Processing..." : "Approve application"}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* HELP BUTTON */}

      <button className="fixed bottom-5 right-4 w-10 h-10 bg-[#282828] hover:bg-black text-white rounded-full flex items-center justify-center shadow-lg">
        <HelpCircle size={22} />
      </button>

    </div>
  );
}