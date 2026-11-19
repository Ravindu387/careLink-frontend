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
  FileText,
  ChevronRight,
  ExternalLink,
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

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("All");

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

  // Read URL params (e.g. ?id=AI-9041 or ?requestId=REQ-2841)
  const currentIdParam = searchParams.get("id");
  const currentRequestIdParam = searchParams.get("requestId");

  const priorityOptions: { value: Priority; description: string; color: string }[] = [
    { value: "Critical", description: "Immediate threat to life & safety", color: "text-red-700 bg-red-50 border-red-200" },
    { value: "High", description: "Urgent response required within hours", color: "text-amber-700 bg-amber-50 border-amber-200" },
    { value: "Medium", description: "Standard prioritisation & queueing", color: "text-blue-700 bg-blue-50 border-blue-200" },
    { value: "Low", description: "Scheduled or secondary support", color: "text-slate-700 bg-slate-50 border-slate-200" },
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
  const loadDetail = useCallback(
    async (idOrRequestId: string, isRequestId = false) => {
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

        // Keep URL in sync
        setSearchParams({ id: detail.id });
      } catch (err: any) {
        console.error("Failed to load recommendation detail:", err);
        setActionError(err.message || "Could not retrieve recommendation details.");
      } finally {
        setIsLoading(false);
      }
    },
    [setSearchParams]
  );

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      const list = await loadListAndMetrics();
      if (!isMounted) return;

      if (currentRequestIdParam) {
        await loadDetail(currentRequestIdParam, true);
      } else if (currentIdParam) {
        await loadDetail(currentIdParam, false);
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
  }, [loadListAndMetrics, loadDetail, currentRequestIdParam, currentIdParam]);

  // Handle auto-clear success toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Handle switch recommendation from dropdown/list
  const handleSelectRecommendation = (id: string) => {
    loadDetail(id, false);
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
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">Approved</span>;
      case "Modified":
        return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Modified by Human</span>;
      case "Deferred":
        return <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">Deferred</span>;
      default:
        return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">Awaiting Review</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-xs font-medium text-white shadow-lg animate-bounce">
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="ml-2 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Administration</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#123B5C]">AI Recommendation Review</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#123B5C]">
            AI Recommendation Review
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Human-in-the-loop validation for triage priority assessments and resource allocations.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadListAndMetrics();
              if (currentDetail) loadDetail(currentDetail.id, false);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate("/admin/assistance-requests")}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <ExternalLink size={13} />
            <span>Assistance Requests</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-[10px] font-medium text-slate-500">Total Cases</p>
            <p className="mt-1 text-xl font-bold text-[#123B5C]">{metrics.totalRecommendations}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 shadow-sm">
            <p className="text-[10px] font-medium text-amber-700">Awaiting Review</p>
            <p className="mt-1 text-xl font-bold text-amber-900">{metrics.awaitingReviewCount}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 shadow-sm">
            <p className="text-[10px] font-medium text-emerald-700">Approved</p>
            <p className="mt-1 text-xl font-bold text-emerald-900">{metrics.approvedCount}</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 shadow-sm">
            <p className="text-[10px] font-medium text-blue-700">Modified</p>
            <p className="mt-1 text-xl font-bold text-blue-900">{metrics.modifiedCount}</p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3 shadow-sm">
            <p className="text-[10px] font-medium text-purple-700">Deferred</p>
            <p className="mt-1 text-xl font-bold text-purple-900">{metrics.deferredCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-[10px] font-medium text-slate-500">Avg Confidence</p>
            <p className="mt-1 text-xl font-bold text-[#123B5C]">{metrics.averageConfidence}%</p>
          </div>
        </div>
      )}

      {/* Case Selector Switcher */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Select Case:</span>
            <div className="flex flex-wrap gap-1.5">
              {recommendations.slice(0, 8).map((rec) => {
                const isSelected = currentDetail?.id === rec.id;
                return (
                  <button
                    key={rec.id}
                    onClick={() => handleSelectRecommendation(rec.id)}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      isSelected
                        ? "bg-[#123B5C] text-white shadow-sm"
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
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#123B5C] focus:outline-none"
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

      {actionError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold">Action Alert</p>
            <p className="mt-0.5">{actionError}</p>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700">
            <X size={14} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 size={24} className="animate-spin text-[#123B5C]" />
            <p className="text-xs">Loading recommendation details...</p>
          </div>
        </div>
      ) : !currentDetail ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <Sparkles size={32} className="text-slate-400" />
          <h3 className="mt-2 text-sm font-semibold text-slate-700">No recommendation selected</h3>
          <p className="mt-1 text-xs text-slate-500">
            Select a recommendation from the switcher above to evaluate AI triage outputs.
          </p>
        </div>
      ) : (
        <>
          {/* Active Case Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
              <div className="text-right text-xs text-slate-500">
                <p>Reviewed by: <strong className="text-slate-700">{currentDetail.reviewedBy}</strong></p>
                <p className="text-[10px] text-slate-400">{currentDetail.reviewedAt}</p>
              </div>
            )}
          </div>

          {/* Main 2-Column Evaluation Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* LEFT COLUMN: Assistance Request Context */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#123B5C] flex items-center gap-2">
                    <FileText size={16} className="text-[#2784B5]" />
                    Assistance Request Context
                  </h3>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {currentDetail.verificationStatus}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Request Description
                    </label>
                    <p className="mt-1 text-xs text-slate-700 leading-relaxed bg-[#EFF6F7]/50 p-3 rounded-lg border border-slate-100">
                      {currentDetail.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                      <span className="text-[10px] text-slate-400 font-medium">Category</span>
                      <p className="text-xs font-semibold text-slate-700">{currentDetail.requestCategory}</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                      <span className="text-[10px] text-slate-400 font-medium">Reported Urgency</span>
                      <p className="text-xs font-semibold text-slate-700">{currentDetail.reportedUrgency}</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                      <span className="text-[10px] text-slate-400 font-medium">Location</span>
                      <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <MapPin size={11} className="text-red-500 shrink-0" />
                        <span className="truncate">{currentDetail.location}</span>
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                      <span className="text-[10px] text-slate-400 font-medium">Affected People</span>
                      <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Users size={11} className="text-slate-500 shrink-0" />
                        <span>{currentDetail.affectedPeople} individuals</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Vulnerability Factors
                    </label>
                    <p className="mt-1 text-xs font-medium text-amber-800 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                      {currentDetail.vulnerabilityFactors}
                    </p>
                  </div>

                  {currentDetail.evidenceNote && (
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Field Verification Note
                      </label>
                      <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        {currentDetail.evidenceNote}
                      </p>
                    </div>
                  )}

                  {currentDetail.relevantInformation && currentDetail.relevantInformation.length > 0 && (
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Verified Geospatial & Situational Signals
                      </label>
                      <ul className="mt-1.5 space-y-1.5">
                        {currentDetail.relevantInformation.map((info, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2 rounded border border-slate-200/80"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#208D70] shrink-0" />
                            <span>{info}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: AI Recommendation & Human Decision Form */}
            <div className="space-y-4">
              {/* AI Recommendation Card */}
              <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#2784B5]" />
                    <h3 className="text-sm font-bold text-[#123B5C]">AI Model Evaluation</h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {currentDetail.modelName} · {currentDetail.modelTimestamp}
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {/* Priority & Confidence Row */}
                  <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-white p-3.5 shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        AI Recommended Priority
                      </span>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                            currentDetail.recommendedPriority === "Critical"
                              ? "bg-red-100 text-red-800"
                              : currentDetail.recommendedPriority === "High"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {currentDetail.recommendedPriority}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Model Confidence
                      </span>
                      <p className="mt-0.5 text-base font-extrabold text-[#123B5C]">
                        {currentDetail.confidence}%
                      </p>
                    </div>
                  </div>

                  {/* Confidence Progress */}
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-[#208D70] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${currentDetail.confidence}%` }}
                    />
                  </div>

                  {/* AI Explanation */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Reasoning & Causal Factors
                    </label>
                    <p className="mt-1 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {currentDetail.explanation}
                    </p>
                  </div>

                  {/* Recommended Action */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Recommended Operational Action
                    </label>
                    <p className="mt-1 text-xs font-medium text-[#123B5C] bg-[#EFF6F7] p-2.5 rounded-lg border border-[#64C9AD]/40">
                      {currentDetail.recommendedAction}
                    </p>
                  </div>

                  {/* Alternative Predictions */}
                  {currentDetail.alternatives && currentDetail.alternatives.length > 0 && (
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Alternative Predicted Classifications
                      </label>
                      <div className="mt-1.5 grid grid-cols-2 gap-2">
                        {currentDetail.alternatives.map((alt, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-xs"
                          >
                            <span className="font-medium text-slate-700">{alt.priority}</span>
                            <span className="font-bold text-slate-500">{alt.likelihoodPercentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Policy Oversight Warning */}
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-700" />
                    <p>{currentDetail.warningMessage}</p>
                  </div>
                </div>
              </div>

              {/* Human Decision Form Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#123B5C] flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#208D70]" />
                    Human Review Decision
                  </h3>
                  {currentDetail.isDecisionRecorded && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isSubmitting}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#123B5C]"
                    >
                      <RotateCcw size={12} />
                      Reset State
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-4">
                  {/* Priority Selector Options */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Assigned Operational Priority
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {priorityOptions.map((opt) => {
                        const isSelected = selectedPriority === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSelectedPriority(opt.value)}
                            className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition ${
                              isSelected
                                ? "border-[#123B5C] bg-[#EFF6F7] ring-1 ring-[#123B5C]"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold text-slate-800">{opt.value}</span>
                              {isSelected && <Check size={14} className="text-[#123B5C]" />}
                            </div>
                            <span className="mt-0.5 text-[10px] text-slate-500">
                              {opt.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Decision Rationale */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Administrative Decision Rationale (Mandatory)</span>
                      <span className="text-slate-400 font-normal">Audit-logged</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                      placeholder="Provide specific operational justification for this decision..."
                      className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-700 outline-none transition focus:border-[#123B5C] focus:ring-1 focus:ring-[#123B5C]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isSubmitting || !rationale.trim()}
                      onClick={() => setShowConfirmModal(true)}
                      className={`flex-1 flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition ${
                        isModified
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-[#123B5C] hover:bg-[#1D5F8A]"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      <span>
                        {isModified ? `Modify Priority to ${selectedPriority}` : "Approve AI Recommendation"}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowDeferModal(true)}
                      className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
                    >
                      Defer Evaluation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && currentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#123B5C] flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#208D70]" />
                Confirm Triage Decision
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <p>
                You are recording a binding humanitarian response decision for case{" "}
                <strong className="text-slate-800">{currentDetail.id}</strong>:
              </p>

              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">AI Recommendation:</span>
                  <span className="font-bold text-slate-700">{currentDetail.recommendedPriority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Priority:</span>
                  <span className="font-bold text-[#123B5C]">{selectedPriority}</span>
                </div>
                <div className="pt-1 text-[11px] text-slate-500">
                  <span className="font-semibold">Rationale:</span> {rationale}
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                This action is cryptographically tracked in the immutable CareLink Crisis Audit Trail.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDecision}
                className="flex items-center gap-1.5 rounded-lg bg-[#123B5C] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1D5F8A]"
              >
                {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                Confirm & Log Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Defer Modal */}
      {showDeferModal && currentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                <Clock size={18} className="text-purple-600" />
                Defer Recommendation
              </h3>
              <button onClick={() => setShowDeferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <p>
                Deferring recommendation <strong className="text-slate-800">{currentDetail.id}</strong> places it
                into the secondary evaluation queue for additional ground data verification.
              </p>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Reason for Deferral (Optional)
                </label>
                <textarea
                  rows={2}
                  value={deferReason}
                  onChange={(e) => setDeferReason(e.target.value)}
                  placeholder="e.g. Awaiting GIS satellite flood update or medical team arrival..."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeferModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDefer}
                className="flex items-center gap-1.5 rounded-lg bg-purple-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-800"
              >
                {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                Confirm Deferral
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

