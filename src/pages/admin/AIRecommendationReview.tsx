import { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Check,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  RefreshCw,
  Loader2,
  RotateCcw,
  Users,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { aiRecommendationService } from "../../services/aiRecommendationService";
import type {
  AiRecommendationDetail,
  AiRecommendationMetrics,
  AiRecommendationSummary,
} from "../../types/aiRecommendation";

type Priority = "Critical" | "High" | "Medium" | "Low";

export default function AIRecommendationReview() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected item and state
  const [recommendations, setRecommendations] = useState<AiRecommendationSummary[]>([]);
  const [currentDetail, setCurrentDetail] = useState<AiRecommendationDetail | null>(null);
  const [metrics, setMetrics] = useState<AiRecommendationMetrics | null>(null);

  // Filters & Selection
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCaseId, setSelectedCaseId] = useState<string>(() => searchParams.get("id") || "");

  // Form & Modals
  const [selectedPriority, setSelectedPriority] = useState<Priority>("Critical");
  const [rationale, setRationale] = useState("");
  const [deferReason, setDeferReason] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeferModal, setShowDeferModal] = useState(false);

  const priorityOptions: { value: Priority; description: string }[] = [
    { value: "Critical", description: "Immediate threat to life & safety" },
    { value: "High", description: "Urgent response required within hours" },
    { value: "Medium", description: "Standard prioritisation & queueing" },
    { value: "Low", description: "Scheduled or secondary support" },
  ];

  // Load recommendations list & metrics
  const loadListAndMetrics = useCallback(async () => {
    try {
      const [list, m] = await Promise.all([
        aiRecommendationService.getRecommendations({
          status: statusFilter !== "All" ? statusFilter : undefined,
        }),
        aiRecommendationService.getMetrics(),
      ]);
      setRecommendations(list);
      setMetrics(m);
      return list;
    } catch (err: any) {
      console.error("Failed to load recommendations or metrics:", err);
      setActionError(err.message || "Failed to load AI recommendations.");
      return [];
    }
  }, [statusFilter]);

  // Load specific recommendation detail
  const loadDetail = useCallback(async (idOrRequestId: string, isRequestId = false) => {
    setIsLoading(true);
    setActionError(null);
    try {
      let detail: AiRecommendationDetail;
      if (isRequestId) {
        detail = await aiRecommendationService.getRecommendationByRequestId(idOrRequestId);
      } else {
        detail = await aiRecommendationService.getRecommendationById(idOrRequestId);
      }
      setCurrentDetail(detail);
      setSelectedCaseId(detail.id);

      // Prepopulate decision controls
      const activePriority = (detail.decidedPriority || detail.recommendedPriority || "Critical") as Priority;
      setSelectedPriority(activePriority);
      if (detail.decisionRationale) {
        setRationale(detail.decisionRationale);
      } else {
        setRationale(
          `AI recommendation approved. Verified vulnerability indicators and active situational context support ${activePriority.toLowerCase()} response prioritization.`
        );
      }
    } catch (err: any) {
      console.error("Failed to load recommendation detail:", err);
      setActionError(err.message || "Could not retrieve recommendation details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      const list = await loadListAndMetrics();
      if (!isMounted) return;

      const reqIdParam = searchParams.get("requestId");
      const idParam = searchParams.get("id");

      if (reqIdParam) {
        await loadDetail(reqIdParam, true);
      } else if (idParam) {
        await loadDetail(idParam, false);
      } else if (list.length > 0) {
        await loadDetail(list[0].id, false);
      } else {
        setIsLoading(false);
      }
    };
    initialize();

    return () => {
      isMounted = false;
    };
  }, [loadListAndMetrics, loadDetail, searchParams]);

  // Handle auto-clear success toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Switch recommendation
  const handleSelectRecommendation = (id: string) => {
    setSelectedCaseId(id);
    setSearchParams({ id });
  };

  // Record Decision (Approve or Modified)
  const handleConfirmDecision = async () => {
    if (!currentDetail) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const updated = await aiRecommendationService.recordDecision(currentDetail.id, {
        priority: selectedPriority,
        rationale: rationale.trim(),
      });
      setCurrentDetail(updated);
      setShowConfirmModal(false);
      const isModified = selectedPriority !== updated.recommendedPriority;
      setSuccessToast(
        isModified
          ? `Priority modified to ${selectedPriority} and decision logged successfully.`
          : `AI Recommendation ${updated.id} approved successfully.`
      );
      await loadListAndMetrics();
    } catch (err: any) {
      setActionError(err.message || "Failed to record decision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Defer Recommendation
  const handleDefer = async () => {
    if (!currentDetail) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const updated = await aiRecommendationService.deferRecommendation(currentDetail.id, {
        reason: deferReason.trim() || "Deferred for secondary multidisciplinary review.",
      });
      setCurrentDetail(updated);
      setShowDeferModal(false);
      setSuccessToast(`Recommendation ${updated.id} deferred for secondary evaluation.`);
      await loadListAndMetrics();
    } catch (err: any) {
      setActionError(err.message || "Failed to defer recommendation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Recommendation (Back to Awaiting Review)
  const handleReset = async () => {
    if (!currentDetail) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const updated = await aiRecommendationService.resetRecommendation(currentDetail.id);
      setCurrentDetail(updated);
      setSelectedPriority((updated.recommendedPriority || "Critical") as Priority);
      setRationale(
        `AI recommendation approved. Verified vulnerability indicators and active situational context support ${updated.recommendedPriority.toLowerCase()} response prioritization.`
      );
      setSuccessToast(`Recommendation ${updated.id} reset back to Awaiting Review.`);
      await loadListAndMetrics();
    } catch (err: any) {
      setActionError(err.message || "Failed to reset recommendation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isModified =
    currentDetail &&
    selectedPriority.toLowerCase() !== currentDetail.recommendedPriority.toLowerCase();

  const getStatusBadge = (state: string) => {
    switch (state) {
      case "Approved":
        return <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">Approved</span>;
      case "Modified":
        return <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200">Modified by Human</span>;
      case "Deferred":
        return <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[9px] font-bold text-purple-700 border border-purple-200">Deferred</span>;
      default:
        return <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-[#2785B2] border border-blue-200">Awaiting Review</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF6F7] font-sans text-[#123B5C]">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-xs font-medium text-white shadow-xl animate-bounce">
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="ml-2 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="flex h-8 items-center gap-2 border-b border-[#64C9AD] bg-white px-6 text-[9px] text-slate-500">
        <span>Administration</span>
        <ChevronRight size={11} />
        <span className="font-semibold text-[#123B5C]">AI Recommendation Review</span>
        <span className="ml-auto hidden items-center gap-1 text-[9px] text-emerald-600 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live data · Real-time pipeline
        </span>
      </div>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-[1700px] px-4 py-6 md:px-7 lg:px-8">
        {/* PAGE HEADER */}
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[9px] font-bold tracking-wider text-[#123B5C]">
              HUMAN-IN-THE-LOOP VALIDATION
            </p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight text-[#123B5C]">
              AI recommendation review
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Validate triage priority assessments, causal factors, and operational resource allocations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadListAndMetrics();
                if (currentDetail) loadDetail(currentDetail.id, false);
              }}
              className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-[#123B5C] hover:bg-slate-50 shadow-sm transition"
            >
              <RefreshCw size={12} className={isLoading ? "animate-spin text-[#2785B2]" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate("/admin/requests")}
              className="flex items-center gap-1.5 rounded-md border border-[#2785B2] bg-white px-3 py-2 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50 shadow-sm transition"
            >
              <ExternalLink size={12} />
              <span>Assistance Requests</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        {metrics && (
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-[9px] font-medium text-slate-400">Total Cases</p>
              <p className="mt-1 text-xl font-bold text-[#123B5C]">{metrics.totalRecommendations}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 shadow-sm">
              <p className="text-[9px] font-medium text-amber-700">Awaiting Review</p>
              <p className="mt-1 text-xl font-bold text-amber-900">{metrics.awaitingReviewCount}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 shadow-sm">
              <p className="text-[9px] font-medium text-emerald-700">Approved</p>
              <p className="mt-1 text-xl font-bold text-emerald-900">{metrics.approvedCount}</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 shadow-sm">
              <p className="text-[9px] font-medium text-[#2785B2]">Modified</p>
              <p className="mt-1 text-xl font-bold text-[#123B5C]">{metrics.modifiedCount}</p>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3 shadow-sm">
              <p className="text-[9px] font-medium text-purple-700">Deferred</p>
              <p className="mt-1 text-xl font-bold text-purple-900">{metrics.deferredCount}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-[9px] font-medium text-slate-400">Avg Confidence</p>
              <p className="mt-1 text-xl font-bold text-[#123B5C]">{metrics.averageConfidence}%</p>
            </div>
          </div>
        )}

        {/* CASE SELECTOR BAR */}
        <div className="mb-4 rounded-xl border border-[#64C9AD] bg-white p-3.5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500">Select Case:</span>
              <div className="flex flex-wrap gap-1.5">
                {recommendations.slice(0, 10).map((rec) => {
                  const isSelected = selectedCaseId === rec.id || currentDetail?.id === rec.id;
                  return (
                    <button
                      key={rec.id}
                      onClick={() => handleSelectRecommendation(rec.id)}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${
                        isSelected
                          ? "bg-[#123B5C] text-white shadow-sm ring-1 ring-[#123B5C]"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{rec.id}</span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          rec.reviewState === "Approved"
                            ? "bg-emerald-400"
                            : rec.reviewState === "Modified"
                            ? "bg-amber-400"
                            : rec.reviewState === "Deferred"
                            ? "bg-purple-400"
                            : "bg-blue-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-[10px] text-slate-700 focus:border-[#123B5C] focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Awaiting Review">Awaiting Review</option>
                <option value="Approved">Approved</option>
                <option value="Modified">Modified</option>
                <option value="Deferred">Deferred</option>
              </select>
            </div>
          </div>
        </div>

        {/* ACTION ERROR ALERT */}
        {actionError && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold">Action Notification</p>
              <p className="mt-0.5">{actionError}</p>
            </div>
            <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700">
              <X size={14} />
            </button>
          </div>
        )}

        {/* LOADING & EMPTY STATES */}
        {isLoading ? (
          <div className="flex h-72 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Loader2 size={24} className="animate-spin text-[#123B5C]" />
              <p className="text-xs">Loading recommendation details...</p>
            </div>
          </div>
        ) : !currentDetail ? (
          <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <Sparkles size={32} className="text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-700">No recommendation selected</h3>
            <p className="mt-1 text-xs text-slate-500">
              Select a recommendation case from the switcher above to evaluate triage outputs.
            </p>
          </div>
        ) : (
          <>
            {/* ACTIVE CASE SUMMARY BANNER */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6F7] text-[#123B5C]">
                  <Sparkles size={20} className="text-[#208D70]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#123B5C]">{currentDetail.id}</h2>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-600">
                      Request {currentDetail.requestId}
                    </span>
                    {getStatusBadge(currentDetail.reviewState)}
                  </div>
                  <p className="text-xs text-slate-500">
                    {currentDetail.requestCategory} · {currentDetail.location} · {currentDetail.affectedPeople} individuals affected
                  </p>
                </div>
              </div>

              {currentDetail.reviewedBy && (
                <div className="flex items-center gap-3">
                  <div className="text-right text-[10px] text-slate-500">
                    <p>Reviewed by: <strong className="text-slate-700">{currentDetail.reviewedBy}</strong></p>
                    <p className="text-[9px] text-slate-400">{currentDetail.reviewedAt}</p>
                  </div>
                  <button
                    onClick={handleReset}
                    disabled={isSubmitting}
                    title="Reset decision"
                    className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[9px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <RotateCcw size={10} />
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* THREE COLUMN HARMONIOUS LAYOUT */}
            <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-3">
              {/* COLUMN 1 - ASSISTANCE REQUEST CONTEXT */}
              <section className="flex flex-col justify-between rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-medium tracking-wide text-slate-400 uppercase">
                      Associated Request
                    </p>
                    <span className="rounded-md bg-red-50 px-2 py-1 text-[8px] font-bold text-red-600">
                      {currentDetail.reportedUrgency}
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-medium text-[#123B5C]">
                    {currentDetail.requestId} · {currentDetail.requestCategory}
                  </h2>

                  <p className="mt-2 text-[10px] leading-5 text-slate-600">
                    {currentDetail.description}
                  </p>

                  {/* DETAILS GRID */}
                  <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
                    <div>
                      <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                        LOCATION
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#123B5C]">
                        <MapPin size={11} className="text-red-500 shrink-0" />
                        <span className="truncate">{currentDetail.location}</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                        VULNERABILITY
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-[#123B5C]">
                        {currentDetail.vulnerabilityFactors}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                        SUBMITTED
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-[#123B5C]">
                        {currentDetail.submittedTime || "12 minutes ago"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                        VERIFICATION
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-[#123B5C]">
                        {currentDetail.verificationStatus}
                      </p>
                    </div>
                  </div>

                  <div className="my-4 border-t border-[#64C9AD]" />

                  {/* EVIDENCE NOTE */}
                  {currentDetail.evidenceNote && (
                    <div className="flex gap-2 rounded-lg bg-[#EFF6F7] p-3">
                      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#2785B2]" />
                      <div>
                        <p className="text-[9px] font-bold text-[#123B5C]">Evidence note</p>
                        <p className="mt-1 text-[9px] leading-4 text-slate-600">
                          {currentDetail.evidenceNote}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* RELEVANT INPUT INFORMATION */}
                  {currentDetail.relevantInformation && currentDetail.relevantInformation.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-[10px] font-semibold text-[#123B5C]">
                        Relevant input information
                      </h3>
                      <div className="mt-2.5 space-y-2">
                        {currentDetail.relevantInformation.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check size={12} className="mt-0.5 shrink-0 text-[#2785B2]" />
                            <p className="text-[9px] leading-4 text-slate-600">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* COLUMN 2 - AI MODEL EVALUATION */}
              <section className="flex flex-col justify-between rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">
                <div>
                  {/* MODEL HEADER */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6F7] text-[#2785B2]">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <p className="text-[8px] font-medium text-slate-400 uppercase">
                          RECOMMENDATION MODEL
                        </p>
                        <p className="text-[10px] font-bold text-[#123B5C]">
                          {currentDetail.modelName}
                        </p>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-500 font-mono">
                      {currentDetail.modelTimestamp}
                    </span>
                  </div>

                  {/* RECOMMENDED PRIORITY */}
                  <div
                    className={`mt-4 rounded-lg border p-3.5 ${
                      currentDetail.recommendedPriority === "Critical"
                        ? "border-red-200 bg-[#FDEBEC]"
                        : currentDetail.recommendedPriority === "High"
                        ? "border-amber-200 bg-amber-50"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[8px] font-medium text-[#123B5C] uppercase">
                        RECOMMENDED PRIORITY
                      </p>
                      <span
                        className={`text-[8px] font-bold uppercase ${
                          currentDetail.recommendedPriority === "Critical"
                            ? "text-red-600"
                            : currentDetail.recommendedPriority === "High"
                            ? "text-amber-700"
                            : "text-[#2785B2]"
                        }`}
                      >
                        {currentDetail.recommendedPriority}
                      </span>
                    </div>

                    <div className="py-2.5 text-center">
                      <h2
                        className={`text-4xl font-bold tracking-tight ${
                          currentDetail.recommendedPriority === "Critical"
                            ? "text-red-700"
                            : currentDetail.recommendedPriority === "High"
                            ? "text-amber-800"
                            : "text-[#123B5C]"
                        }`}
                      >
                        {currentDetail.confidence}<span className="text-xl">%</span>
                      </h2>
                      <p className="mt-1 text-[9px] text-slate-600">Model confidence</p>
                    </div>
                  </div>

                  {/* SUPPORTING EXPLANATION */}
                  <div className="mt-4">
                    <h3 className="text-[10px] font-medium text-[#123B5C]">
                      Supporting explanation
                    </h3>
                    <p className="mt-1.5 text-[10px] leading-5 text-slate-600">
                      {currentDetail.explanation}
                    </p>
                  </div>

                  {/* RECOMMENDED ACTION */}
                  {currentDetail.recommendedAction && (
                    <div className="mt-3 rounded-lg bg-[#EFF6F7] p-2.5">
                      <p className="text-[8px] font-medium tracking-wide text-slate-500 uppercase">
                        RECOMMENDED OPERATIONAL ACTION
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-[#123B5C]">
                        {currentDetail.recommendedAction}
                      </p>
                    </div>
                  )}

                  {/* ALTERNATIVES */}
                  {currentDetail.alternatives && currentDetail.alternatives.length > 0 && (
                    <div className="mt-3 rounded-lg bg-[#EFF6F7] p-2.5">
                      <p className="text-[8px] font-medium tracking-wide text-slate-500 uppercase">
                        ALTERNATIVES CONSIDERED
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {currentDetail.alternatives.map((alt, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <p className="text-[9px] font-semibold text-[#123B5C]">
                              {alt.priority} priority
                            </p>
                            <span className="text-[9px] text-slate-500">
                              {alt.likelihoodPercentage}% likelihood
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* WARNING */}
                <div className="mt-3 flex gap-2 rounded-lg bg-[#FFF5DF] p-2.5">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-700" />
                  <p className="text-[9px] leading-4 text-amber-800">
                    {currentDetail.warningMessage || "This is decision support, not an automated decision. An authorised coordinator must approve or modify it."}
                  </p>
                </div>
              </section>

              {/* COLUMN 3 - HUMAN DECISION & ACTIONS */}
              <section className="flex flex-col justify-between rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-medium tracking-wide text-slate-400 uppercase">
                      YOUR DECISION
                    </p>
                    <span className="rounded-md bg-[#EFF6F7] px-2 py-1 text-[8px] font-semibold text-[#2785B2]">
                      Authorised reviewer
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-medium text-[#123B5C]">
                    Record human decision
                  </h2>

                  <p className="mt-1.5 text-[10px] text-slate-600">
                    Select a final priority and provide an auditable rationale.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setShowConfirmModal(true);
                    }}
                    className="mt-4"
                  >
                    {/* PRIORITY RADIO OPTIONS */}
                    <div className="space-y-2">
                      {priorityOptions.map((option) => {
                        const selected = selectedPriority === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition ${
                              selected
                                ? "border-[#123B5C] bg-[#EFF6F7] ring-1 ring-[#123B5C]"
                                : "border-[#64C9AD] bg-white hover:bg-[#F7FBFA]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="priority"
                              value={option.value}
                              checked={selected}
                              onChange={() => setSelectedPriority(option.value)}
                              className="h-3.5 w-3.5 accent-[#123B5C]"
                            />
                            <div>
                              <p className="text-[10px] font-semibold text-[#123B5C]">
                                {option.value}
                              </p>
                              <p className="mt-0.5 text-[9px] text-slate-500">
                                {option.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* RATIONALE */}
                    <div className="mt-4">
                      <label
                        htmlFor="decisionRationale"
                        className="text-[9px] font-semibold text-[#123B5C] flex items-center justify-between"
                      >
                        <span>
                          Decision rationale <span className="text-red-600">*</span>
                        </span>
                        <span className="text-[8px] text-slate-400">Audit-logged</span>
                      </label>

                      <textarea
                        id="decisionRationale"
                        required
                        rows={4}
                        value={rationale}
                        onChange={(e) => setRationale(e.target.value)}
                        placeholder="Explain why you approved or changed the AI recommendation..."
                        className="mt-1.5 w-full resize-y rounded-lg border border-[#64C9AD] bg-white p-2.5 text-[10px] leading-5 text-[#123B5C] outline-none transition placeholder:text-slate-400 focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                      />

                      <p className="mt-0.5 text-right text-[8px] text-slate-400">
                        {rationale.length} characters
                      </p>
                    </div>

                    {/* BUTTONS */}
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDeferModal(true)}
                        disabled={isSubmitting}
                        className="rounded-lg border border-[#2785B2] bg-white px-3.5 py-2 text-[10px] font-semibold text-[#2785B2] transition hover:bg-sky-50 disabled:opacity-50"
                      >
                        Defer
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || !rationale.trim()}
                        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[10px] font-semibold text-white shadow-md transition ${
                          isModified
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-[#123B5C] hover:bg-[#1D5F8A]"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {isSubmitting ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        <span>
                          {isModified
                            ? `Modify to ${selectedPriority}`
                            : "Approve & record decision"}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>

            {/* HUMAN REVIEW NOTICE */}
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-sky-100 bg-white p-3">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#2785B2]" />
              <p className="text-[9px] leading-5 text-slate-500">
                Human oversight is mandatory. AI recommendations are provided as decision-support information only.
                Final prioritisation remains the responsibility of an authorised reviewer and is cryptographically tracked in the audit trail.
              </p>
            </div>
          </>
        )}
      </main>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && currentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl animate-scaleIn">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>

            <h2 className="mt-3 text-center text-sm font-bold text-[#123B5C]">
              Confirm Triage Decision
            </h2>

            <p className="mt-1 text-center text-[10px] text-slate-500">
              Your binding decision for case <strong className="text-slate-700">{currentDetail.id}</strong> ({currentDetail.requestId}) will be recorded.
            </p>

            <div className="mt-3.5 rounded-lg bg-[#EFF6F7] p-3 text-left space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">AI Recommendation:</span>
                <span className="font-semibold text-slate-700">{currentDetail.recommendedPriority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Priority:</span>
                <span className="font-bold text-[#123B5C]">{selectedPriority}</span>
              </div>
              <div className="pt-1 border-t border-slate-200/60">
                <p className="text-[9px] text-slate-400 uppercase font-semibold">Rationale</p>
                <p className="mt-0.5 text-slate-600 leading-4">{rationale}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDecision}
                className="flex items-center gap-1.5 rounded-lg bg-[#123B5C] px-3.5 py-1.5 text-[10px] font-semibold text-white shadow-sm hover:bg-[#1D5F8A]"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEFER MODAL */}
      {showDeferModal && currentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-[#123B5C] flex items-center gap-1.5">
                <Clock size={15} className="text-purple-600" />
                Defer AI Review?
              </h3>
              <button onClick={() => setShowDeferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={15} />
              </button>
            </div>

            <p className="mt-2.5 text-[10px] leading-4 text-slate-500">
              This request will remain pending for another authorised reviewer to verify.
            </p>

            <div className="mt-3">
              <label className="text-[9px] font-semibold text-slate-600">
                Reason for deferral (Optional)
              </label>
              <textarea
                rows={2}
                value={deferReason}
                onChange={(e) => setDeferReason(e.target.value)}
                placeholder="e.g. Awaiting GIS satellite update..."
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-[10px] outline-none focus:border-[#123B5C]"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeferModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDefer}
                className="flex items-center gap-1.5 rounded-lg bg-purple-700 px-3.5 py-1.5 text-[10px] font-semibold text-white shadow-sm hover:bg-purple-800"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Confirm Deferral
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
