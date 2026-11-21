import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  House,
  Utensils,
  Cross,
  Truck,
  Users,
  Package,
  MapPin,
  TriangleAlert,
  Plus,
  Map,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  X,
  Loader2,
  AlertCircle,
  Phone,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import { citizenHomeService } from "../../services/citizenHomeService";
import type {
  CitizenHomeOverview,
  CitizenRequest,
  NearbyFacility,
  CrisisOperation,
} from "../../types/citizenHome";

const iconMap: Record<string, any> = {
  House,
  Utensils,
  Cross,
  Truck,
  Users,
  Package,
  MapPin,
};

const defaultCategories = [
  {
    title: "Emergency shelter",
    description: "Find a safe place to stay",
    icon: House,
  },
  {
    title: "Food and water",
    description: "Request essential supplies",
    icon: Utensils,
  },
  {
    title: "Medical support",
    description: "Get urgent health assistance",
    icon: Cross,
  },
  {
    title: "Safe transport",
    description: "Ask for evacuation or accessible travel",
    icon: Truck,
  },
  {
    title: "Family support",
    description: "Help for children, older adults, or disability",
    icon: Users,
  },
  {
    title: "Other essential help",
    description: "Tell us what you need",
    icon: Package,
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live Backend Data
  const [overview, setOverview] = useState<CitizenHomeOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Requests & Facilities state
  const [requests, setRequests] = useState<CitizenRequest[]>([]);
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [operation, setOperation] = useState<CrisisOperation | null>(null);

  // Search filter
  const [search, setSearch] = useState("");

  // Request Help Modal state
  const [showRequest, setShowRequest] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Emergency shelter");
  const [requestDescription, setRequestDescription] = useState("");
  const [requestPriority, setRequestPriority] = useState("Normal");
  const [requestAddress, setRequestAddress] = useState("North Ward, Greater Riverton");
  const [requestPhone, setRequestPhone] = useState("+94 77 123 4567");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch citizen home overview from backend
  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await citizenHomeService.getHomeOverview(user?.fullName);
      setOverview(data);
      setRequests(data.activeRequests);
      setFacilities(data.nearbyFacilities);
      setOperation(data.operation);
    } catch (err: any) {
      console.error("Failed to load citizen home overview:", err);
      setError(err.message || "Failed to load active relief data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, [user]);

  const handleCategoryClick = (categoryTitle: string) => {
    setSelectedCategory(categoryTitle);
    setSubmitSuccess(false);
    setSubmitError(null);
    setShowRequest(true);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      setSubmitError("Please select a help category.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const citizenName = user?.fullName || "Samira Khan";
      const created = await citizenHomeService.createRequest({
        category: selectedCategory,
        description: requestDescription.trim() || undefined,
        priority: requestPriority,
        address: requestAddress.trim() || undefined,
        contactPhone: requestPhone.trim() || undefined,
        citizenName,
      });

      // Prepend to requests list immediately
      setRequests((prev) => [created, ...prev]);
      setSubmitSuccess(true);
      setRequestDescription("");

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowRequest(false);
      }, 1800);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter requests & facilities by search keyword
  const filteredRequests = requests.filter((r) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      r.id.toLowerCase().includes(s) ||
      r.title.toLowerCase().includes(s) ||
      r.category.toLowerCase().includes(s) ||
      r.description.toLowerCase().includes(s) ||
      r.status.toLowerCase().includes(s)
    );
  });

  const filteredFacilities = facilities.filter((f) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      f.name.toLowerCase().includes(s) ||
      f.category.toLowerCase().includes(s) ||
      f.status.toLowerCase().includes(s)
    );
  });

  const getCategoryIcon = (categoryTitle: string) => {
    const found = defaultCategories.find(
      (c) => c.title.toLowerCase() === categoryTitle.toLowerCase()
    );
    return found?.icon || Package;
  };

  const citizenDisplayName = user?.fullName || "Samira Khan";

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="Home"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[295px]">
        {/* TOP NAVIGATION */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <div className="space-y-6 p-4 sm:p-6">
          {/* WELCOME & ACTIVE CRISIS HERO */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#164768] via-[#1b587f] to-[#287da6] p-6 text-white shadow-lg sm:p-8">
            <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
              <div className="max-w-[580px]">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs font-medium text-sky-100">
                    Good afternoon, {citizenDisplayName}
                  </p>
                </div>

                <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                  How can we support you today?
                </h2>

                <p className="mt-2.5 text-xs text-sky-100/90 leading-relaxed">
                  Request immediate supplies, monitor application updates, and find verified emergency centres near North Ward.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedCategory("Emergency shelter");
                      setShowRequest(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                  >
                    <Plus size={16} />
                    Request help now
                  </button>

                  <button
                    onClick={() => navigate("/citizen/nearby-support")}
                    className="flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-xs font-semibold text-[#173d5b] shadow-sm transition hover:bg-white"
                  >
                    <Map size={16} />
                    Find nearby support
                  </button>
                </div>
              </div>

              {/* ACTIVE ALERT CARD */}
              <div className="flex max-w-[420px] items-start gap-3 rounded-xl bg-white p-4 text-[#173d5b] shadow-md">
                <div className="rounded-lg bg-red-100 p-2.5 text-red-600 shrink-0">
                  <TriangleAlert size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700">
                      ACTIVE ALERT
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {operation?.region || "Greater Riverton"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-bold text-[#173d5b]">
                    {operation?.activeAlertTitle || "Evacuation notice for Riverside blocks A-D"}
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    {operation?.activeAlertDescription ||
                      "Use Market Road to reach North Community Hall. Do not use Riverside Bridge."}
                  </p>

                  <button
                    onClick={() => navigate("/citizen/safety-updates")}
                    className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-[#287da6] hover:underline"
                  >
                    Read safety update
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* HELP CATEGORIES */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#173d5b]">
                  What do you need help with?
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Select a category to submit a fast, tracked request for relief aid.
                </p>
              </div>

              <span className="hidden text-xs font-semibold text-[#287da6] sm:inline">
                Direct Dispatch Integration
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {defaultCategories.map((category) => {
                const Icon = category.icon;

                return (
                  <button
                    key={category.title}
                    onClick={() => handleCategoryClick(category.title)}
                    className="group flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#65b9aa] hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e8f5f1] text-[#268b79] transition group-hover:bg-[#287da6] group-hover:text-white">
                      <Icon size={21} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#173d5b] group-hover:text-[#287da6] transition">
                        {category.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500 truncate">
                        {category.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#287da6]"
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {/* TWO COLUMN GRID: ACTIVE REQUESTS & CLOSEST HELP */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
            {/* ACTIVE REQUESTS CARD */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#173d5b]">
                      Your active requests
                    </h3>
                    {requests.length > 0 && (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-[#287da6]">
                        {requests.length} Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Real-time status updates from the field dispatch team.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/citizen/my-requests")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#287da6] hover:underline"
                >
                  View all
                  <ChevronRight size={14} />
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 size={24} className="animate-spin text-[#287da6]" />
                  <span className="ml-2 text-xs">Loading active requests...</span>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                  <Package size={28} className="text-slate-300" />
                  <p className="mt-2 text-xs font-semibold text-slate-600">No active requests</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    You currently have no open assistance requests.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("Food and water");
                      setShowRequest(true);
                    }}
                    className="mt-3 text-xs font-semibold text-[#287da6] hover:underline"
                  >
                    Submit a new request
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredRequests.map((request) => {
                    const Icon = getCategoryIcon(request.category);

                    return (
                      <div
                        key={request.id}
                        onClick={() => navigate("/citizen/my-requests")}
                        className="flex cursor-pointer items-center gap-3.5 p-4 transition hover:bg-slate-50"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e8f5f1] text-[#287da6]">
                          <Icon size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] font-bold text-slate-400">
                              {request.id}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-semibold text-slate-600">
                              {request.category}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-bold text-[#173d5b]">
                            {request.title}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-500 line-clamp-1">
                            {request.description}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block rounded-md px-2 py-1 text-[9px] font-bold border ${
                              request.status === "Help on the way"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : request.status === "Under review"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-sky-50 text-sky-700 border-sky-200"
                            }`}
                          >
                            {request.status}
                          </span>

                          <p className="mt-1.5 text-[9px] text-slate-400">
                            {request.timeAgo}
                          </p>
                        </div>

                        <ChevronRight size={16} className="shrink-0 text-slate-400" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* NEARBY SUPPORT FACILITIES CARD */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-sm font-bold text-[#173d5b]">
                    Closest help centres
                  </h3>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Based on North Ward radius
                  </p>
                </div>

                <button
                  onClick={() => navigate("/citizen/nearby-support")}
                  className="text-[11px] font-semibold text-[#287da6] hover:underline"
                >
                  View map
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 size={24} className="animate-spin text-[#287da6]" />
                  <span className="ml-2 text-xs">Loading nearby centres...</span>
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                  <MapPin size={24} className="text-slate-300" />
                  <p className="mt-2 text-xs font-semibold text-slate-600">No facilities nearby</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredFacilities.map((facility) => (
                    <div
                      key={facility.id}
                      className="flex items-center gap-3 p-3.5 transition hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f5f1] text-[#287da6]">
                        <MapPin size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#173d5b] truncate">
                          {facility.name}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {facility.distance} · {facility.hours}
                        </p>
                      </div>

                      <span
                        className={`rounded-md px-2 py-1 text-[9px] font-semibold border ${
                          facility.status.toLowerCase().includes("space")
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-sky-50 text-[#23866f] border-sky-100"
                        }`}
                      >
                        {facility.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* HELPLINE CALLOUT */}
              <div className="border-t border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#173d5b]">
                    <Phone size={15} className="text-red-500" />
                    <span className="font-semibold">24/7 Crisis Hotline</span>
                  </div>
                  <a
                    href="tel:112"
                    className="rounded bg-red-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-red-700"
                  >
                    Call 112
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support · Powered by CareLink</p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              Verified secure citizen portal
            </p>
          </footer>
        </div>
      </main>

      {/* REQUEST HELP MODAL */}
      {showRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#173d5b]">
                  Request Emergency Help
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Relief dispatchers review requests in real-time.
                </p>
              </div>

              <button
                onClick={() => setShowRequest(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle size={32} />
                </div>
                <h4 className="mt-3 text-base font-bold text-[#173d5b]">
                  Request Submitted!
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Your request has been saved and assigned to the North Ward response team.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="mt-4 space-y-4">
                {submitError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* CATEGORY SELECTOR */}
                <div>
                  <label className="block text-xs font-semibold text-[#173d5b]">
                    Assistance Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-[#173d5b] outline-none focus:border-[#287da6]"
                  >
                    {defaultCategories.map((cat) => (
                      <option key={cat.title} value={cat.title}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SITUATION DETAILS */}
                <div>
                  <label className="block text-xs font-semibold text-[#173d5b]">
                    Describe your situation
                  </label>
                  <textarea
                    value={requestDescription}
                    onChange={(e) => setRequestDescription(e.target.value)}
                    placeholder="Tell us what you need, number of people affected, or special requirements..."
                    rows={3}
                    className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 p-2.5 text-xs text-[#173d5b] outline-none placeholder:text-slate-400 focus:border-[#287da6]"
                  />
                </div>

                {/* PRIORITY & CONTACT IN TWO COLUMNS */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#173d5b]">
                      Urgency Level
                    </label>
                    <select
                      value={requestPriority}
                      onChange={(e) => setRequestPriority(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs outline-none focus:border-[#287da6]"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent / Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#173d5b]">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={requestPhone}
                      onChange={(e) => setRequestPhone(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-[#287da6]"
                    />
                  </div>
                </div>

                {/* ADDRESS */}
                <div>
                  <label className="block text-xs font-semibold text-[#173d5b]">
                    Delivery / Current Location
                  </label>
                  <input
                    type="text"
                    value={requestAddress}
                    onChange={(e) => setRequestAddress(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-[#287da6]"
                  />
                </div>

                {/* ACTION BUTTONS */}
                <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRequest(false)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded-lg bg-[#287da6] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1c6388] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
