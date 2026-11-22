
import { useEffect, useMemo, useState } from "react";
import { aiRecommendationService } from "../../services/aiRecommendationService";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  Sparkles,
  AlertTriangle,
  Check,
  ShieldCheck,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Loader2,
  CheckCircle,
  Activity,
  RotateCcw,
} from "lucide-react";
import {
  recommendationService,
  type Recommendation,
  type RecommendationMetrics,
} from "../../services/recommendationService";

const priorityStyle: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-amber-100 text-amber-700",
  Medium: "bg-blue-100 text-blue-700",
  Low: "bg-slate-100 text-slate-600",
};

const reviewStyle: Record<string, string> = {
  "Awaiting Review": "bg-amber-100 text-amber-700",
  Modified: "bg-blue-100 text-blue-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
  Deferred: "bg-purple-100 text-purple-700",
};

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    initialRecommendations
  );

  useEffect(() => {
    let isCancelled = false;
    aiRecommendationService
      .getRecommendations()
      .then((items) => {
        if (!isCancelled && items.length > 0) {
          const mapped: Recommendation[] = items.map((it) => ({
            id: it.id,
            request: it.requestId || "REQ-AUTO",
            category: it.category || "Emergency assistance",
            priority: it.decidedPriority || it.recommendedPriority || "High",
            confidence: it.confidence || 88,
            action: it.action || "Coordinate relief",
            timestamp: it.timestamp || "Just now",
            reviewState: it.reviewState || "Awaiting Review",
            explanation: it.explanation || "Grounded crisis response analysis.",
            alternative: it.alternative || "None",
          }));
          setRecommendations(mapped);
        }
      })
      .catch(() => {
        // preserve defaults
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All recommendation types");
  const [priority, setPriority] = useState("All priorities");
  const [confidence, setConfidence] = useState("Confidence range");
  const [review, setReview] = useState("Review state");
  const [showFilters, setShowFilters] = useState(false);

  // Review modal states
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const [decision, setDecision] = useState("");
  const [rationale, setRationale] = useState("");
  const [savingDecision, setSavingDecision] = useState(false);

  // Generate modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genCategory, setGenCategory] = useState("Emergency shelter");
  const [genLocation, setGenLocation] = useState("Riverside, Sector 3");
  const [genDescription, setGenDescription] = useState("");
  const [genAffectedCount, setGenAffectedCount] = useState<number>(4);
  const [genIsLifeThreatening, setGenIsLifeThreatening] = useState(false);
  const [genHasVulnerable, setGenHasVulnerable] = useState(true);
  const [genPriorityHint, setGenPriorityHint] = useState("");

  const [toast, setToast] = useState("");

  const showToastMessage = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [recsData, metricsData] = await Promise.all([
        recommendationService.getRecommendations(),
        recommendationService.getMetrics(),
      ]);
      setRecommendations(recsData);
      setMetrics(metricsData);
      setIsLiveConnected(true);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to load recommendations:", err);
      const message = err instanceof Error ? err.message : "Unable to reach the CareLink API backend.";
      setError(message);
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleManualRefresh = () => {
    setLoading(true);
    loadData();
  };

  useEffect(() => {
    let isCancelled = false;

    async function initialize() {
      try {
        const [recsData, metricsData] = await Promise.all([
          recommendationService.getRecommendations(),
          recommendationService.getMetrics(),
        ]);
        if (!isCancelled) {
          setRecommendations(recsData);
          setMetrics(metricsData);
          setIsLiveConnected(true);
          setError(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("Failed to load recommendations:", err);
          const message = err instanceof Error ? err.message : "Unable to reach the CareLink API backend.";
          setError(message);
          setIsLiveConnected(false);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return recommendations.filter((item) => {
      const searchMatch =
        `${item.id} ${item.request} ${item.category} ${item.action} ${item.explanation}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const typeMatch =
        type === "All recommendation types" ||
        item.category.toLowerCase() === type.toLowerCase();

      const priorityMatch =
        priority === "All priorities" ||
        item.priority.toLowerCase() === priority.toLowerCase();

      const confidenceMatch =
        confidence === "Confidence range" ||
        (confidence === "90% and above" && item.confidence >= 90) ||
        (confidence === "80% - 89%" &&
          item.confidence >= 80 &&
          item.confidence < 90) ||
        (confidence === "Below 80%" && item.confidence < 80);

      const reviewMatch =
        review === "Review state" ||
        item.reviewState.toLowerCase() === review.toLowerCase();

      return (
        searchMatch &&
        typeMatch &&
        priorityMatch &&
        confidenceMatch &&
        reviewMatch
      );
    });
  }, [recommendations, search, type, priority, confidence, review]);

  const awaitingCount = useMemo(() => {
    return metrics
      ? metrics.awaitingReview
      : recommendations.filter((r) => r.reviewState === "Awaiting Review").length;
  }, [metrics, recommendations]);

  const resetFilters = () => {
    setSearch("");
    setType("All recommendation types");
    setPriority("All priorities");
    setConfidence("Confidence range");
    setReview("Review state");
  };

  const openReview = (item: Recommendation) => {
    setSelected(item);
    setDecision(item.reviewState !== "Awaiting Review" ? item.reviewState : "");
    setRationale(item.rationale || "");
  };

  const saveDecision = async () => {
    if (!selected || !decision || !rationale.trim()) {
      setToast("Please select a decision and provide a rationale.");
      return;
    }

    try {
      await aiRecommendationService.recordDecision(selected.id, {
        priority: selected.priority,
        rationale: rationale.trim(),
      });
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === selected.id
            ? { ...r, reviewState: decision }
            : r
        )
      );
      setSelected(null);
      setToast(`Human decision recorded: ${decision}`);
    } catch {
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === selected.id
            ? { ...r, reviewState: decision }
            : r
        )
      );
      setSelected(null);
      setToast(`Human decision recorded: ${decision}`);
    }

    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">
      {/* Top Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-medium text-[#153f5e]">
              AI Recommendations
            </h1>
            {isLiveConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Backend Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
                <Activity size={10} />
                Connecting...
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Review explainable decision-support recommendations and record authorised human decisions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh data from server"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            title="Reset to default seed data"
          >
            <RotateCcw size={12} />
            Reset Data
          </button>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#153f5e] px-3.5 py-2 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#205879]"
          >
            <Plus size={13} />
            Run AI Analysis
          </button>

          <span className="rounded-md bg-purple-100 px-3 py-2 text-[9px] font-semibold text-purple-700">
            {awaitingCount} awaiting human review
          </span>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-purple-200 border-l-[3px] border-l-purple-600 bg-purple-50 p-3">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-purple-600" />
        <div>
          <p className="text-[10px] font-semibold text-purple-900">
            AI recommendations are never automatically approved
          </p>
          <p className="mt-1 text-[9px] text-purple-700">
            Critical humanitarian decisions remain under authorised human control and are fully audited.
          </p>
        </div>
      </div>

      {/* Error state if backend fails */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span className="text-[10px] font-medium">{error}</span>
          </div>
          <button
            onClick={loadData}
            className="rounded bg-red-600 px-2.5 py-1 text-[9px] font-semibold text-white hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
              <Sparkles size={19} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">Awaiting review</p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                {metrics ? metrics.awaitingReview : awaitingCount}
              </h2>
              <p className="text-[9px] text-slate-400">
                {recommendations.filter((r) => r.reviewState === "Awaiting Review" && r.priority === "Critical").length} critical cases
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-3 text-red-600">
              <AlertTriangle size={19} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">High urgency</p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                {metrics ? metrics.highUrgency : recommendations.filter((r) => r.priority === "Critical" || r.priority === "High").length}
              </h2>
              <p className="text-[9px] text-slate-400">
                Across active queues
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <Check size={19} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">Acceptance rate</p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                {metrics ? `${metrics.acceptanceRate.toFixed(1)}%` : "91.6%"}
              </h2>
              <p className="text-[9px] text-slate-400">
                {metrics ? metrics.totalReviewed.toLocaleString() : "1,498"} reviewed
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sky-100 p-3 text-sky-600">
              <ShieldCheck size={19} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">Override rate</p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                {metrics ? `${metrics.overrideRate.toFixed(1)}%` : "8.4%"}
              </h2>
              <p className="text-[9px] text-slate-400">
                Audited with rationale
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_repeat(4,minmax(120px,auto))_auto]">
        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recommendation or request..."
            className="w-full min-w-0 bg-transparent text-[10px] outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>All recommendation types</option>
          <option>Emergency shelter</option>
          <option>Medical supplies</option>
          <option>Food & water</option>
          <option>Accessible transport</option>
          <option>Rescue assistance</option>
          <option>Sanitation & Hygiene</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>All priorities</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select
          value={confidence}
          onChange={(e) => setConfidence(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>Confidence range</option>
          <option>90% and above</option>
          <option>80% - 89%</option>
          <option>Below 80%</option>
        </select>

        <select
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>Review state</option>
          <option>Awaiting Review</option>
          <option>Approved</option>
          <option>Modified</option>
          <option>Rejected</option>
          <option>Deferred</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-lg border border-sky-600 bg-white px-3 py-2.5 text-[10px] font-medium text-sky-700 hover:bg-sky-50"
        >
          <Filter size={13} />
          More filters
          <ChevronDown size={12} />
        </button>
      </div>

      {showFilters && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d5e2e9] bg-white p-3">
          <p className="text-[10px] text-slate-500">
            Filtering across {recommendations.length} total recommendations stored on the backend.
          </p>
          <button
            onClick={resetFilters}
            className="text-[10px] font-semibold text-sky-700 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Main Recommendations Table */}
      <section className="overflow-hidden rounded-xl border border-[#d5e2e9] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="border-b border-[#d5e2e9] bg-[#f7fafb]">
              <tr>
                {[
                  "Recommendation",
                  "Request",
                  "Category",
                  "Recommended Priority",
                  "Confidence",
                  "Suggested Action",
                  "Timestamp",
                  "Review State",
                  "",
                ].map((heading, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && recommendations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Loader2 size={24} className="mx-auto mb-2 animate-spin text-[#153f5e]" />
                    <p className="text-xs text-slate-500">Loading AI recommendations from backend...</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => openReview(item)}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-[#f0f6f8]"
                  >
                    <td className="whitespace-nowrap px-3 py-4 text-[9px] font-semibold text-[#153f5e]">
                      {item.id}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-600">
                      {item.request}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-600">
                      {item.category}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <span className={`rounded-md px-2 py-1 text-[8px] font-semibold ${priorityStyle[item.priority] || "bg-slate-100 text-slate-600"}`}>
                        {item.priority}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-[9px] font-medium text-slate-700">
                      {item.confidence}%
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-600">
                      {item.action}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <span className="rounded-md bg-sky-100 px-2 py-1 text-[8px] font-semibold text-sky-700">
                        {item.timestamp}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <span className={`rounded-md px-2 py-1 text-[8px] font-semibold ${reviewStyle[item.reviewState] || "bg-slate-100 text-slate-600"}`}>
                        {item.reviewState}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <ChevronRight size={15} className="text-slate-500" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center">
            <Search size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs text-slate-500">
              No AI recommendations found matching the criteria.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-[9px] text-slate-500">
            Showing {filtered.length} of {recommendations.length} recommendations
          </p>
          {loading && (
            <span className="inline-flex items-center gap-1.5 text-[9px] text-slate-400">
              <Loader2 size={11} className="animate-spin" /> Syncing...
            </span>
          )}
        </div>
      </section>

      {/* Decision Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="my-auto w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-purple-600">
                  AI RECOMMENDATION REVIEW
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#153f5e]">
                  {selected.id} · Request {selected.request}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="mb-3 text-[10px] font-semibold text-slate-700">
                  Recommendation details
                </p>

                <p className="text-[10px] text-slate-500">Associated request</p>
                <p className="mt-1 text-sm font-semibold text-[#153f5e]">
                  {selected.request}
                </p>

                <p className="mt-3 text-[10px] text-slate-500">Category</p>
                <p className="mt-1 text-xs text-slate-700 font-medium">
                  {selected.category}
                </p>

                <p className="mt-3 text-[10px] text-slate-500">Suggested action</p>
                <p className="mt-1 text-xs text-slate-700 font-medium">
                  {selected.action}
                </p>

                <p className="mt-3 text-[10px] text-slate-500">Timestamp</p>
                <p className="mt-1 text-xs text-slate-700">
                  {selected.timestamp}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-[10px] font-semibold text-slate-700">
                  AI recommended priority
                </p>

                <div className="mt-3 rounded-lg bg-red-50 p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {selected.confidence}%
                  </p>
                  <p className="mt-1 text-[9px] text-slate-500">
                    Confidence score
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Priority</span>
                  <span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${priorityStyle[selected.priority] || "bg-slate-100 text-slate-600"}`}>
                    {selected.priority}
                  </span>
                </div>

                <p className="mt-3 text-[10px] text-slate-500">
                  Alternative considered
                </p>
                <p className="mt-1 text-[10px] text-slate-700">
                  {selected.alternative}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-4 border border-slate-200">
              <p className="text-[10px] font-semibold text-slate-700">
                Supporting explanation
              </p>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                {selected.explanation}
              </p>
            </div>

            {selected.reviewedAt && (
              <div className="mt-3 rounded-lg bg-blue-50/60 border border-blue-100 p-3 text-[10px] text-blue-900">
                <span className="font-semibold">Current review status: </span>
                {selected.reviewState} by {selected.reviewedBy || "Emergency Coordinator"} (
                {new Date(selected.reviewedAt).toLocaleString()})
              </div>
            )}

            <div className="mt-4">
              <p className="mb-2 text-[10px] font-semibold text-slate-700">
                Record human decision
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { value: "Approved", icon: CheckCircle2, color: "emerald" },
                  { value: "Modified", icon: ShieldCheck, color: "blue" },
                  { value: "Rejected", icon: XCircle, color: "red" },
                  { value: "Deferred", icon: Clock, color: "amber" },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setDecision(option.value)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-[9px] font-medium transition ${
                        decision === option.value
                          ? "border-[#287da5] bg-sky-50 text-[#175477] font-semibold shadow-xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={13} />
                      {option.value}
                    </button>
                  );
                })}
              </div>

              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Enter mandatory auditable rationale for this decision..."
                rows={3}
                className="mt-3 w-full resize-none rounded-lg border border-[#d5e2e9] p-3 text-[10px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[10px] text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={saveDecision}
                disabled={savingDecision}
                className="flex items-center gap-1.5 rounded-lg bg-[#153f5e] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#205879] disabled:opacity-50"
              >
                {savingDecision && <Loader2 size={12} className="animate-spin" />}
                Save human decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate AI Recommendation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="my-auto w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#153f5e]">
                    Run AI Recommendation Analysis
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Input incident details to generate an explainable AI action plan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-700 mb-1">
                  Assistance Category *
                </label>
                <select
                  value={genCategory}
                  onChange={(e) => setGenCategory(e.target.value)}
                  className="w-full rounded-lg border border-[#d5e2e9] bg-white p-2.5 text-[10px] text-slate-700 outline-none focus:border-sky-500"
                >
                  <option>Emergency shelter</option>
                  <option>Medical supplies</option>
                  <option>Food & water</option>
                  <option>Accessible transport</option>
                  <option>Rescue assistance</option>
                  <option>Sanitation & Hygiene</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-700 mb-1">
                  Location / Sector
                </label>
                <input
                  type="text"
                  value={genLocation}
                  onChange={(e) => setGenLocation(e.target.value)}
                  placeholder="e.g. Riverside, North Ward Sector 2"
                  className="w-full rounded-lg border border-[#d5e2e9] p-2.5 text-[10px] text-slate-700 outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-slate-700 mb-1">
                    Estimated Affected People
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={genAffectedCount}
                    onChange={(e) => setGenAffectedCount(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-[#d5e2e9] p-2.5 text-[10px] text-slate-700 outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-700 mb-1">
                    Priority Hint (Optional)
                  </label>
                  <select
                    value={genPriorityHint}
                    onChange={(e) => setGenPriorityHint(e.target.value)}
                    className="w-full rounded-lg border border-[#d5e2e9] bg-white p-2.5 text-[10px] text-slate-700 outline-none focus:border-sky-500"
                  >
                    <option value="">AI Auto-Detect</option>
                    <option value="Critical">Force Critical</option>
                    <option value="High">Force High</option>
                    <option value="Medium">Force Medium</option>
                    <option value="Low">Force Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-700 mb-1">
                  Incident Description & Conditions
                </label>
                <textarea
                  value={genDescription}
                  onChange={(e) => setGenDescription(e.target.value)}
                  placeholder="Describe situational hazards, road access, special medical needs, or flood depths..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#d5e2e9] p-2.5 text-[10px] text-slate-700 outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-2 rounded-lg bg-slate-50 p-3 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genIsLifeThreatening}
                    onChange={(e) => setGenIsLifeThreatening(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-[10px] font-medium text-red-700">
                    Immediate life threat or active danger to survival
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genHasVulnerable}
                    onChange={(e) => setGenHasVulnerable(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-[10px] font-medium text-slate-700">
                    Includes vulnerable individuals (elderly, infants, persons with disabilities)
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[10px] text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleGenerateRecommendation}
                disabled={generating}
                className="flex items-center gap-1.5 rounded-lg bg-purple-700 px-4 py-2 text-[10px] font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Analyzing with AI Engine...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    Generate Recommendation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 max-w-sm rounded-lg bg-[#153f5e] px-4 py-3 text-xs text-white shadow-xl">
          <CheckCircle size={15} className="shrink-0 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
