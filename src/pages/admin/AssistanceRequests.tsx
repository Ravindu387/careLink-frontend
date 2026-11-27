
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Search,
  X,
  ChevronRight,
  ChevronDown,
  MapPin,
  Plus,
  Filter,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { assistanceRequestService } from "../../services/assistanceRequestService";
import type {
  AssistanceRequestStats,
} from "../../types/assistanceRequest";

type Priority = "Critical" | "High" | "Medium";

type RequestStatus =
  | "Awaiting review"
  | "Verified"
  | "Assigned"
  | "In progress"
  | "Completed";

type Request = {
  id: string;
  time: string;
  category: string;
  location: string;
  reported: Priority;
  recommendation: string;
  confidence: string;
  assignedTo: string;
  status: RequestStatus;
  affectedPeople: number;
  contact: string;
  description: string;
};

const initialRequests: Request[] = [
  {
    id: "REQ-2841",
    time: "12 min ago",
    category: "Emergency shelter",
    location: "Riverside, North Ward",
    reported: "Critical",
    recommendation: "Critical priority",
    confidence: "94%",
    assignedTo: "Unassigned",
    status: "Awaiting review",
    affectedPeople: 6,
    contact: "Verified · ending 0198",
    description:
      "Water has reached our ground floor and is rising. We have two young children and my mother cannot walk without assistance.",
  },
  {
    id: "REQ-2839",
    time: "26 min ago",
    category: "Medical supplies",
    location: "Old Town, Sector 4",
    reported: "High",
    recommendation: "High priority",
    confidence: "91%",
    assignedTo: "Medical Team 3",
    status: "Verified",
    affectedPeople: 3,
    contact: "Verified · ending 0284",
    description:
      "We need urgent medical supplies for people affected by flooding.",
  },
  {
    id: "REQ-2836",
    time: "41 min ago",
    category: "Food & water",
    location: "Eastbank, Sector 2",
    reported: "High",
    recommendation: "High priority",
    confidence: "87%",
    assignedTo: "Unassigned",
    status: "Assigned",
    affectedPeople: 4,
    contact: "Verified · ending 0345",
    description:
      "Our family needs clean drinking water and emergency food supplies.",
  },
  {
    id: "REQ-2828",
    time: "1 hr ago",
    category: "Accessible transport",
    location: "Central Ward",
    reported: "Medium",
    recommendation: "Medium priority",
    confidence: "82%",
    assignedTo: "Medical Team 3",
    status: "In progress",
    affectedPeople: 2,
    contact: "Verified · ending 0456",
    description:
      "We need transport assistance to reach the nearest safe shelter.",
  },
  {
    id: "REQ-2741",
    time: "12 min ago",
    category: "Emergency shelter",
    location: "Riverside, North Ward",
    reported: "Critical",
    recommendation: "Critical priority",
    confidence: "94%",
    assignedTo: "Unassigned",
    status: "Awaiting review",
    affectedPeople: 6,
    contact: "Verified · ending 0198",
    description:
      "Flood water is entering our home. We need emergency shelter.",
  },
  {
    id: "REQ-2739",
    time: "26 min ago",
    category: "Medical supplies",
    location: "Old Town, Sector 4",
    reported: "High",
    recommendation: "High priority",
    confidence: "91%",
    assignedTo: "Medical Team 3",
    status: "Verified",
    affectedPeople: 3,
    contact: "Verified · ending 0284",
    description:
      "Urgent medical supplies are required for our community.",
  },
  {
    id: "REQ-2736",
    time: "41 min ago",
    category: "Food & water",
    location: "Eastbank, Sector 2",
    reported: "High",
    recommendation: "High priority",
    confidence: "87%",
    assignedTo: "Unassigned",
    status: "Assigned",
    affectedPeople: 4,
    contact: "Verified · ending 0345",
    description:
      "We need clean water and food assistance.",
  },
  {
    id: "REQ-2728",
    time: "1 hr ago",
    category: "Accessible transport",
    location: "Central Ward",
    reported: "Medium",
    recommendation: "Medium priority",
    confidence: "82%",
    assignedTo: "Medical Team 3",
    status: "In progress",
    affectedPeople: 2,
    contact: "Verified · ending 0456",
    description:
      "Please provide transport to the nearest safe location.",
  },
];


const tabs = [
  { label: "All requests", count: "1,284" },
  { label: "Unassigned", count: "63" },
  { label: "Overdue", count: "12" },
  { label: "Potential duplicates", count: "9" },
];

// PRIORITY BADGE

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    Critical: "bg-red-100 text-red-600",
    High: "bg-orange-100 text-orange-700",
    Medium: "bg-sky-50 text-sky-700",
  };

  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

// STATUS BADGE

function StatusBadge({ status }: { status: RequestStatus }) {
  const styles: Record<RequestStatus, string> = {
    "Awaiting review": "bg-orange-50 text-orange-700",
    Verified: "bg-sky-50 text-sky-700",
    Assigned: "bg-sky-50 text-sky-700",
    "In progress": "bg-sky-50 text-sky-700",
    Completed: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// REQUEST DETAILS DRAWER

function RequestDrawer({
  request,
  onClose,
  onVerify,
  onAssign,
  onUpdateStatus,
}: {
  request: Request;
  onClose: () => void;
  onVerify: () => void;
  onAssign: () => void;
  onUpdateStatus: (status: RequestStatus) => void;
}) {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[70]">

      {/* Overlay */}
      <button
        aria-label="Close request details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[540px] flex-col bg-white shadow-2xl">

        {/* Header */}
        <div className="border-b border-[#64C9AD] px-5 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#2785B2]">
                REQUEST {request.id}
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#123B5C]">
                {request.category} needed
              </h2>

              <p className="mt-2 text-[13px] text-slate-500">
                Submitted {request.time} · Citizen mobile portal
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100"
              aria-label="Close"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">

          {/* Critical Alert */}
          <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-bold text-red-800">
                {request.reported} priority recommended
              </p>

              <p className="mt-1 text-sm leading-5 text-red-700">
                Flood water is entering the home. Household includes
                vulnerable members who may require urgent assistance.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onVerify}
              disabled={request.status === "Verified"}
              className="flex items-center gap-2 rounded-md bg-[#123B5C] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D5F8A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check size={14} />
              {request.status === "Verified"
                ? "Verified"
                : "Verify request"}
            </button>

            <button
              onClick={onAssign}
              className="rounded-md border border-[#2785B2] bg-white px-3 py-2.5 text-sm font-medium text-[#2785B2] hover:bg-sky-50"
            >
              Assign team
            </button>

            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="rounded-md border border-[#2785B2] bg-white px-3 py-2.5 text-sm font-medium text-[#2785B2] hover:bg-sky-50"
            >
              More
              <ChevronDown size={12} className="ml-1 inline" />
            </button>
          </div>

          {/* More Actions */}
          {showMoreActions && (
            <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
              <button
                onClick={() => {
                  onUpdateStatus("Completed");
                  setShowMoreActions(false);
                }}
                className="block w-full rounded px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                Mark as completed
              </button>

              <button
                onClick={() => {
                  onUpdateStatus("In progress");
                  setShowMoreActions(false);
                }}
                className="block w-full rounded px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                Mark as in progress
              </button>

              <button
                onClick={() => setShowMoreActions(false)}
                className="block w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Cancel action
              </button>
            </div>
          )}

          {/* Citizen Information */}
          <section className="rounded-lg border border-[#64C9AD] bg-white p-4">
            <h3 className="mb-4 text-base font-semibold text-[#123B5C]">
              Citizen-submitted information
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Category
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {request.category}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Affected people
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {request.affectedPeople} people
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Location
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                  <MapPin size={12} />
                  {request.location}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Contact
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {request.contact}
                </p>
              </div>
            </div>

            <blockquote className="mt-4 border-l-2 border-slate-400 bg-slate-50 p-3 text-sm leading-5 text-slate-600">
              "{request.description}"
            </blockquote>
          </section>

          {/* AI Decision Support */}
          <section className="rounded-lg border border-purple-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <Sparkles size={17} />
                </div>

                <div>
                  <h3 className="text-base font-bold">
                    AI decision support
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Recommendation ready for human review
                  </p>
                </div>
              </div>

              <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-600">
                {request.confidence} confidence
              </span>
            </div>

            <div className="mt-3 rounded-lg border border-purple-100 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Recommended priority
              </p>

              <p className="mt-2 text-sm font-bold text-[#123B5C]">
                {request.reported} · Immediate assistance support
              </p>

              <p className="mt-2 text-sm leading-5 text-slate-600">
                Recommendation based on reported urgency, affected
                household members and reported location.
              </p>
            </div>

            <button
              onClick={() => navigate(`/admin/ai-review?requestId=${request.id}`)}
              className="mt-3 flex items-center gap-2 rounded-md border border-[#2785B2] px-3 py-2 text-sm font-semibold text-[#2785B2] hover:bg-sky-50 transition active:scale-95"
            >
              Review recommendation
              <ArrowRight size={13} />
            </button>
          </section>

          {/* Case Timeline */}
          <section className="rounded-lg border border-[#64C9AD] bg-white p-4">
            <h3 className="mb-4 text-base font-semibold">
              Case timeline
            </h3>

            <div className="relative ml-1 space-y-5 border-l border-slate-300 pl-4">
              <div className="relative">
                <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#63BDA6] ring-1 ring-[#63BDA6]" />

                <p className="text-sm font-semibold">
                  Request received
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  12:58 · Mobile portal
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#63BDA6] ring-1 ring-[#63BDA6]" />

                <p className="text-sm font-semibold">
                  Identity and contact verified
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  13:00 · Automated check
                </p>
              </div>

              <div className="relative">
                <span
                  className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white ring-1 ${
                    request.status === "Awaiting review"
                      ? "bg-white ring-slate-300"
                      : "bg-[#63BDA6] ring-[#63BDA6]"
                  }`}
                />

                <p className="text-sm font-semibold">
                  {request.status === "Awaiting review"
                    ? "Awaiting coordinator review"
                    : "Request verified"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {request.status === "Awaiting review"
                    ? "Human decision required"
                    : "Human verification completed"}
                </p>
              </div>

              {request.assignedTo !== "Unassigned" && (
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#63BDA6] ring-1 ring-[#63BDA6]" />

                  <p className="text-sm font-semibold">
                    Team assigned
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Assigned to {request.assignedTo}
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-200 bg-white px-5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Request ID: {request.id}
            </p>

            <button
              onClick={onClose}
              className="rounded-md bg-[#123B5C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D5F8A]"
            >
              Close details
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

// MAIN PAGE

export default function AssistanceRequests() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("All requests");
  const [search, setSearch] = useState(() => searchParams.get("search") || "");

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  const [priority, setPriority] = useState("Any priority");
  const [category, setCategory] = useState("Any category");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(
    () => searchParams.get("create") === "true"
  );
  const [showFilters, setShowFilters] = useState(false);

  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [stats, setStats] = useState<AssistanceRequestStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Request Form state
  const [formCategory, setFormCategory] = useState("Food & water");
  const [formLocation, setFormLocation] = useState("Central Ward");
  const [formPriority, setFormPriority] = useState<Priority>("Medium");
  const [formPeople, setFormPeople] = useState("3");
  const [formContact, setFormContact] = useState("Verified resident");
  const [formDescription, setFormDescription] = useState(
    "Emergency food and drinking water needed for families cut off by road closures."
  );

  const fetchLiveRequests = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [data, statsData] = await Promise.all([
        assistanceRequestService.getRequests(),
        assistanceRequestService.getStats(),
      ]);

      if (data?.items && data.items.length > 0) {
        const mapped: Request[] = data.items.map((item) => ({
          id: item.id,
          time: item.timeAgo || "Just now",
          category: item.category,
          location: item.location,
          reported: (item.reportedPriority || "Medium") as Priority,
          recommendation: item.recommendation || `${item.reportedPriority || "Medium"} priority`,
          confidence: item.confidence || "85%",
          assignedTo: item.assignedTo || "Unassigned",
          status: item.status as RequestStatus,
          affectedPeople: item.affectedPeople || 1,
          contact: item.contact || "Verified contact",
          description: item.description,
        }));
        setRequests(mapped);
      }
      if (statsData) {
        setStats(statsData);
      }
    } catch (err: any) {
      console.warn("Using offline demo requests:", err.message);
      // Keep initialRequests as fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveRequests();
  }, [fetchLiveRequests]);

  // Dynamic Tabs with live counts
  const dynamicTabs = useMemo(() => {
    const total = stats?.totalRequests ?? requests.length;
    const unassigned = requests.filter((r) => r.assignedTo === "Unassigned").length;
    const awaitingReview = stats?.awaitingReviewCount ?? requests.filter((r) => r.status === "Awaiting review").length;
    return [
      { label: "All requests", count: total.toLocaleString() },
      { label: "Unassigned", count: unassigned.toString() },
      { label: "Overdue", count: awaitingReview.toString() },
      { label: "Potential duplicates", count: "2" },
    ];
  }, [stats, requests]);

  // FILTER REQUESTS

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchMatch =
        `${request.id} ${request.category} ${request.location} ${request.assignedTo}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const priorityMatch =
        priority === "Any priority" ||
        request.reported === priority;

      const categoryMatch =
        category === "Any category" ||
        request.category === category;

      const statusMatch =
        status === "All statuses" ||
        request.status === status;

      const tabMatch =
        activeTab === "All requests" ||
        (activeTab === "Unassigned" &&
          request.assignedTo === "Unassigned") ||
        (activeTab === "Overdue" &&
          request.status === "Awaiting review") ||
        (activeTab === "Potential duplicates" &&
          (request.id === "REQ-2741" || request.id.endsWith("1")));

      return (
        searchMatch &&
        priorityMatch &&
        categoryMatch &&
        statusMatch &&
        tabMatch
      );
    });
  }, [requests, search, priority, category, status, activeTab]);

  const pageSize = 8;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / pageSize)
  );

  const displayedRequests = filteredRequests.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // VERIFY REQUEST

  const handleVerify = async () => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    try {
      await assistanceRequestService.updateStatus(selectedRequest.id, "Verified");
    } catch {
      // offline fallback
    } finally {
      setIsActionLoading(false);
    }

    const updatedRequest: Request = {
      ...selectedRequest,
      status: "Verified",
    };

    setRequests((previous) =>
      previous.map((request) =>
        request.id === selectedRequest.id
          ? updatedRequest
          : request
      )
    );

    setSelectedRequest(updatedRequest);
  };

  // ASSIGN TEAM

  const handleAssign = async () => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    try {
      await assistanceRequestService.assignRequest(selectedRequest.id, "Response Team 1");
    } catch {
      // offline fallback
    } finally {
      setIsActionLoading(false);
    }

    const updatedRequest: Request = {
      ...selectedRequest,
      assignedTo: "Response Team 1",
      status: "Assigned",
    };

    setRequests((previous) =>
      previous.map((request) =>
        request.id === selectedRequest.id
          ? updatedRequest
          : request
      )
    );

    setSelectedRequest(updatedRequest);
  };

  // UPDATE STATUS

  const handleUpdateStatus = async (newStatus: RequestStatus) => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    try {
      await assistanceRequestService.updateStatus(selectedRequest.id, newStatus);
    } catch {
      // offline fallback
    } finally {
      setIsActionLoading(false);
    }

    const updatedRequest: Request = {
      ...selectedRequest,
      status: newStatus,
    };

    setRequests((previous) =>
      previous.map((request) =>
        request.id === selectedRequest.id
          ? updatedRequest
          : request
      )
    );

    setSelectedRequest(updatedRequest);
  };

  // CREATE REAL / DEMO REQUEST

  const createRequest = async () => {
    setIsActionLoading(true);
    let createdId = `REQ-${Math.floor(3000 + Math.random() * 6000)}`;
    try {
      const res = await assistanceRequestService.createRequest({
        category: formCategory,
        location: formLocation,
        description: formDescription,
        reportedPriority: formPriority,
        affectedPeople: parseInt(formPeople, 10) || 1,
        contact: formContact,
      });
      if (res?.id) createdId = res.id;
    } catch {
      // fallback
    } finally {
      setIsActionLoading(false);
    }

    const newRequest: Request = {
      id: createdId,
      time: "Just now",
      category: formCategory,
      location: formLocation,
      reported: formPriority,
      recommendation: `${formPriority} priority`,
      confidence: "88%",
      assignedTo: "Unassigned",
      status: "Awaiting review",
      affectedPeople: parseInt(formPeople, 10) || 1,
      contact: formContact,
      description: formDescription,
    };

    setRequests((previous) => [
      newRequest,
      ...previous,
    ]);

    setActiveTab("All requests");
    setSearch("");
    setPage(1);
    setShowCreateForm(false);
  };

  return (
    <div className="font-sans text-[#123B5C]">

        {/* BREADCRUMB */}

        <div className="flex h-8 items-center gap-2 border-b border-[#64C9AD] bg-white px-6 text-[13px] text-slate-500">
          <span>Operations</span>
          <ChevronRight size={11} />

          <span className="font-semibold text-[#123B5C]">
            Requests
          </span>

          <span className="ml-auto hidden items-center gap-1 text-xs text-emerald-600 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live data · Updated just now
          </span>
        </div>

        {/* MAIN CONTENT */}

        <main className="mx-auto max-w-[1700px] px-4 py-6 md:px-7 lg:px-8">

          {/* PAGE HEADING */}

          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight text-[#123B5C]">
                Assistance requests
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Verify, prioritise and coordinate humanitarian assistance cases.
              </p>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center justify-center gap-2 rounded-md bg-[#123B5C] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1D5F8A]"
            >
              <Plus size={15} />
              Create request
            </button>
          </div>

          {/* SEARCH AND FILTERS */}

          <div className="mb-3 flex flex-col gap-2 xl:flex-row">
            <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#64C9AD] bg-white px-3">
              <Search size={16} className="shrink-0 text-slate-400" />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by ID, person or location"
                className="w-full bg-transparent text-sm sm:text-[15px] outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">

              <select
                className="h-10 rounded-lg border border-[#64C9AD] bg-white px-3 text-sm sm:text-[15px] outline-none"
                defaultValue="All crises"
              >
                <option>All crises</option>
                <option>Monsoon Floods 2025</option>
              </select>

              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-[#64C9AD] bg-white px-3 text-sm sm:text-[15px] outline-none"
              >
                <option>Any priority</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
              </select>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-[#64C9AD] bg-white px-3 text-sm sm:text-[15px] outline-none"
              >
                <option>Any category</option>
                <option>Emergency shelter</option>
                <option>Medical supplies</option>
                <option>Food & water</option>
                <option>Accessible transport</option>
              </select>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-[#64C9AD] bg-white px-3 text-sm sm:text-[15px] outline-none"
              >
                <option>All statuses</option>
                <option>Awaiting review</option>
                <option>Verified</option>
                <option>Assigned</option>
                <option>In progress</option>
                <option>Completed</option>
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#2785B2] bg-white px-4 text-sm font-medium text-[#2785B2] hover:bg-sky-50"
            >
              <Filter size={14} />
              More filters
            </button>
          </div>

          {/* MORE FILTERS */}

          {showFilters && (
            <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-[#64C9AD] bg-white p-4">
              <span className="text-xs font-semibold">
                Additional filters
              </span>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-[#123B5C]"
                />
                Include completed requests
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-[#123B5C]"
                />
                Show unassigned only
              </label>

              <button
                onClick={() => {
                  setSearch("");
                  setPriority("Any priority");
                  setCategory("Any category");
                  setStatus("All statuses");
                  setActiveTab("All requests");
                  setPage(1);
                }}
                className="ml-auto text-sm font-semibold text-sky-700"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* REQUEST TABLE */}

          <section className="overflow-hidden rounded-xl border border-[#64C9AD] bg-white shadow-sm">

            {/* TABS */}

            <div className="flex gap-5 overflow-x-auto border-b border-[#64C9AD] px-4 pt-1">
              {dynamicTabs.map((tab) => {
                const active = activeTab === tab.label;

                return (
                  <button
                    key={tab.label}
                    onClick={() => {
                      setActiveTab(tab.label);
                      setPage(1);
                    }}
                    className={`flex shrink-0 items-center gap-1.5 border-b-2 px-0 py-4 text-sm transition ${
                      active
                        ? "border-[#2785B2] font-bold text-[#123B5C]"
                        : "border-transparent text-slate-500 hover:text-[#123B5C]"
                    }`}
                  >
                    {tab.label}

                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b border-[#64C9AD] bg-[#F0F6F7] text-sm font-bold text-[#123B5C]">
                    <th className="px-3 py-3">Request</th>
                    <th className="px-3 py-3">Category & location</th>
                    <th className="px-3 py-3">Reported</th>
                    <th className="px-3 py-3">AI recommendation</th>
                    <th className="px-3 py-3">Assigned to</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>

                <tbody>
                  {displayedRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-slate-100 text-sm transition hover:bg-[#F8FBFC]"
                    >
                      <td className="px-3 py-3">
                        <p className="font-bold text-[#123B5C]">
                          {request.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {request.time}
                        </p>
                      </td>

                      <td className="px-3 py-3">
                        <p className="font-semibold">
                          {request.category}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {request.location}
                        </p>
                      </td>

                      <td className="px-3 py-3">
                        <PriorityBadge priority={request.reported} />
                      </td>

                      <td className="px-3 py-3">
                        <p className="font-semibold">
                          {request.recommendation}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {request.confidence} confidence
                        </p>
                      </td>

                      <td className="px-3 py-3">
                        {request.assignedTo}
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge status={request.status} />
                      </td>

                      <td className="px-3 py-3">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          aria-label={`View ${request.id}`}
                          className="rounded p-1 hover:bg-slate-100"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {displayedRequests.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-sm text-slate-500"
                      >
                        No requests found. Try changing your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row">
              <p className="text-sm text-slate-600">
                Showing{" "}
                {filteredRequests.length === 0
                  ? 0
                  : (page - 1) * pageSize + 1}
                –
                {Math.min(
                  page * pageSize,
                  filteredRequests.length
                )}{" "}
                of {filteredRequests.length} sample requests
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))
                  }
                  disabled={page === 1}
                  className="flex items-center gap-1 rounded-lg border border-[#2785B2] px-3 py-2 text-sm font-medium text-[#2785B2] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={12} />
                  Previous
                </button>

                <span className="text-[13px] text-slate-500">
                  {page} / {totalPages}
                </span>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page === totalPages}
                  className="flex items-center gap-1 rounded-lg border border-[#2785B2] px-3 py-2 text-sm font-medium text-[#2785B2] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </section>

          <footer className="flex flex-col justify-between gap-2 pb-3 pt-4 text-xs text-slate-400 sm:flex-row">
            <p>© 2026 Humanitarian Aid Platform · CareLink</p>
            <p>Secure operations environment</p>
          </footer>
        </main>

      {/* REQUEST DETAILS DRAWER */}

      {selectedRequest && (
        <RequestDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onVerify={handleVerify}
          onAssign={handleAssign}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* CREATE REQUEST MODAL */}

      {showCreateForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-sky-600">
                  NEW ASSISTANCE CASE
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Create request
                </h2>
              </div>

              <button
                onClick={() => setShowCreateForm(false)}
                aria-label="Close create request"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Create a demonstration assistance request.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createRequest();
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                >
                  <option>Food & water</option>
                  <option>Emergency shelter</option>
                  <option>Medical supplies</option>
                  <option>Accessible transport</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Location</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Affected People</label>
                  <input
                    type="number"
                    min="1"
                    value={formPeople}
                    onChange={(e) => setFormPeople(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Contact</label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#2785B2]"
                />
              </div>

              <button
                type="submit"
                disabled={isActionLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#123B5C] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D5F8A] disabled:opacity-60"
              >
                {isActionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Submit Assistance Case
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
