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
  Package,
  Home,
  Bot,
  Layers,
  AlertOctagon,
  Building,
  CheckSquare,
  XCircle,
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
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedCaseId, setSelectedCaseId] = useState<string>(() => searchParams.get("id") || "");

  // Form & Modals
  const [selectedPriority, setSelectedPriority] = useState<Priority>("Critical");
  const [rationale, setRationale] = useState("");
  const [deferReason, setDeferReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");

  // AI Generator Modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCrisisId, setGenerateCrisisId] = useState("CR-2025-018");
  const [generateActionType, setGenerateActionType] = useState<"analysis" | "resources" | "shelters" | "volunteers" | "plan">("analysis");
  const [generateContext, setGenerateContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeferModal, setShowDeferModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

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
          category: categoryFilter !== "All" ? categoryFilter : undefined,
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
  }, [statusFilter, categoryFilter]);

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

  // Reject Recommendation
  const handleReject = async () => {
    if (!currentDetail) return;
    if (!rejectionReason.trim()) {
      setActionError("Please state a clear rejection reason.");
      return;
    }
    setIsSubmitting(true);
    setActionError(null);
    try {
      const updated = await aiRecommendationService.rejectRecommendation(currentDetail.id, {
        rejectionReason: rejectionReason.trim(),
        notes: rejectionNotes.trim() || undefined,
      });
      setCurrentDetail(updated);
      setShowRejectModal(false);
      setSuccessToast(`Recommendation ${updated.id} rejected.`);
      await loadListAndMetrics();
    } catch (err: any) {
      setActionError(err.message || "Failed to reject recommendation.");
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

  // Trigger Gemini AI Generation
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setActionError(null);
    try {
      let created: AiRecommendationDetail;
      const crisisName = generateCrisisId === "CR-2025-018" ? "Monsoon Floods 2025" : "North Ridge Landslide";

      switch (generateActionType) {
        case "resources":
          created = await aiRecommendationService.generateResourceRecommendations(generateCrisisId, {
            crisisId: generateCrisisId,
            crisisName,
            additionalContext: generateContext.trim() || undefined,
          });
          break;
        case "shelters":
          created = await aiRecommendationService.generateShelterRecommendations(generateCrisisId, {
            crisisId: generateCrisisId,
            crisisName,
            additionalContext: generateContext.trim() || undefined,
          });
          break;
        case "volunteers":
          created = await aiRecommendationService.generateVolunteerRecommendations(generateCrisisId, {
            crisisId: generateCrisisId,
            crisisName,
            additionalContext: generateContext.trim() || undefined,
          });
          break;
        case "plan":
          created = await aiRecommendationService.generateResponsePlan(generateCrisisId, {
            crisisId: generateCrisisId,
            crisisName,
            operationalContext: generateContext.trim() || undefined,
          });
          break;
        case "analysis":
        default:
          created = await aiRecommendationService.generateCrisisAnalysis(generateCrisisId, {
            crisisId: generateCrisisId,
            crisisName,
            additionalContext: generateContext.trim() || undefined,
          });
          break;
      }

      setShowGenerateModal(false);
      setCurrentDetail(created);
      setSelectedCaseId(created.id);
      setSearchParams({ id: created.id });
      setSuccessToast(`AI Recommendation ${created.id} generated successfully via ${created.modelName}.`);
      await loadListAndMetrics();
    } catch (err: any) {
      setActionError(err.message || "Failed to generate AI recommendation.");
    } finally {
      setIsGenerating(false);
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
      case "Rejected":
        return <span className="rounded-md bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-700 border border-red-200">Rejected</span>;
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
          Live Google Gemini decision engine connected
        </span>
      </div>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-[1700px] px-4 py-6 md:px-7 lg:px-8">
        {/* PAGE HEADER */}
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[9px] font-bold tracking-wider text-[#123B5C]">
              HUMAN-IN-THE-LOOP CRISIS INTELLIGENCE
            </p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight text-[#123B5C]">
              AI recommendation review
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Validate triage priority assessments, causal factors, resource allocations, shelters, and volunteer deployments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-1.5 rounded-md bg-[#123B5C] px-3.5 py-2 text-[10px] font-semibold text-white shadow-sm hover:bg-[#1D5F8A] transition cursor-pointer"
            >
              <Sparkles size={13} className="text-[#64C9AD]" />
              <span>Generate AI Analysis</span>
            </button>

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

        {/* ACTION / ERROR BANNER */}
        {actionError && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700">
              <X size={14} />
            </button>
          </div>
        )}

        {/* CASE SELECTOR & FILTERS BAR */}
        <div className="mb-4 rounded-xl border border-[#64C9AD] bg-white p-3.5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500">Select Case:</span>
              <div className="flex flex-wrap gap-1.5">
                {recommendations.slice(0, 12).map((rec) => {
                  const isSelected = selectedCaseId === rec.id || currentDetail?.id === rec.id;
                  return (
                    <button
                      key={rec.id}
                      onClick={() => handleSelectRecommendation(rec.id)}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-semibold transition cursor-pointer ${
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
                            : rec.reviewState === "Rejected"
                            ? "bg-red-400"
                            : "bg-blue-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STATUS & CATEGORY FILTERS */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-semibold text-slate-400">CATEGORY:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 outline-none focus:border-[#2785B2]"
                >
                  <option value="All">All Categories</option>
                  <option value="CrisisAnalysis">Crisis Analysis</option>
                  <option value="ResourceAllocation">Resource Allocation</option>
                  <option value="ShelterMatching">Shelter Matching</option>
                  <option value="VolunteerAssignment">Volunteer Assignment</option>
                  <option value="ResponsePlan">Response Plan</option>
                  <option value="AssistanceTriage">Assistance Triage</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-semibold text-slate-400">STATUS:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 outline-none focus:border-[#2785B2]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Awaiting Review">Awaiting Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Modified">Modified</option>
                  <option value="Deferred">Deferred</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN PANEL CONTENT */}
        {isLoading ? (
          <div className="flex h-72 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 size={20} className="animate-spin text-[#2785B2]" />
              <p className="text-xs">Loading recommendation details...</p>
            </div>
          </div>
        ) : !currentDetail ? (
          <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <Sparkles size={32} className="text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-700">No recommendation selected</h3>
            <p className="mt-1 text-xs text-slate-500">
              Select a recommendation case from the switcher above or click "Generate AI Analysis" to evaluate live crisis context.
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
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-[#123B5C]">{currentDetail.id}</h2>
                    {currentDetail.requestId && (
                      <>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-semibold text-slate-600">
                          Request {currentDetail.requestId}
                        </span>
                      </>
                    )}
                    {currentDetail.crisisName && (
                      <span className="rounded bg-sky-50 px-2 py-0.5 text-[9px] font-semibold text-sky-800 border border-sky-200">
                        {currentDetail.crisisName}
                      </span>
                    )}
                    {getStatusBadge(currentDetail.reviewState)}
                    {currentDetail.isLiveAiGenerated ? (
                      <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[8px] font-bold text-emerald-700 border border-emerald-200">
                        <Bot size={10} /> Google Gemini Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-[8px] font-semibold text-slate-600 border border-slate-200">
                        <ShieldCheck size={10} /> Grounded Decision Engine
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentDetail.title || currentDetail.requestCategory} · {currentDetail.location} {currentDetail.affectedPeople ? `· ${currentDetail.affectedPeople} affected individuals` : ""}
                  </p>
                </div>
              </div>

              {currentDetail.reviewedBy && (
                <div className="flex items-center gap-3">
                  <div className="text-right text-[10px] text-slate-500">
                    <p>Reviewed by: <strong className="text-slate-700">{currentDetail.reviewedBy}</strong></p>
                    <p className="text-[9px] text-slate-400">{currentDetail.reviewedAt ? new Date(currentDetail.reviewedAt).toLocaleString() : ""}</p>
                    {currentDetail.rejectionReason && (
                      <p className="text-[9px] text-red-600 font-medium">Reason: {currentDetail.rejectionReason}</p>
                    )}
                  </div>
                  <button
                    onClick={handleReset}
                    disabled={isSubmitting}
                    title="Reset decision"
                    className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[9px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <RotateCcw size={10} />
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* THREE COLUMN HARMONIOUS LAYOUT */}
            <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-3">
              {/* COLUMN 1 - ASSISTANCE & CRISIS CONTEXT */}
              <section className="flex flex-col justify-between rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                      Operational Context
                    </p>
                    <span className="rounded-md bg-red-50 px-2 py-0.5 text-[8px] font-bold text-red-600">
                      {currentDetail.reportedUrgency}
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-semibold text-[#123B5C]">
                    {currentDetail.title || `${currentDetail.requestId} · ${currentDetail.requestCategory}`}
                  </h2>

                  <p className="mt-2 text-[10px] leading-5 text-slate-600">
                    {currentDetail.summary || currentDetail.description}
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
                        {currentDetail.vulnerabilityFactors || "Evacuation & Resource Vulnerability"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                        EVIDENCE STATUS
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-emerald-700">
                        {currentDetail.verificationStatus || "Database Verified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                        SUBMISSION
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-[#123B5C]">
                        {currentDetail.submittedTime || "Logged in system"}
                      </p>
                    </div>
                  </div>

                  {/* RELEVANT FACTS */}
                  {currentDetail.relevantInformation && currentDetail.relevantInformation.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400 mb-1.5">
                        VERIFIED INCIDENT INDICATORS
                      </p>
                      <ul className="space-y-1 text-[9px] text-slate-600">
                        {currentDetail.relevantInformation.map((info, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#2785B2]">•</span>
                            <span>{info}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-lg bg-[#EFF6F7] p-2.5">
                  <p className="text-[9px] text-slate-600">
                    <strong className="text-[#123B5C]">Grounding Policy:</strong> Analysis strictly references verified database telemetry. No AI hallucinations permitted.
                  </p>
                </div>
              </section>

              {/* COLUMN 2 - AI MODEL EVALUATION & EXPLANATION */}
              <section className="flex flex-col justify-between rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                      AI MODEL EVALUATION
                    </p>
                    <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[8px] font-bold text-purple-700 border border-purple-200">
                      {currentDetail.modelName} · {currentDetail.modelTimestamp || "08:30 UTC"}
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-semibold text-[#123B5C]">
                    Triage assessment & scoring
                  </h2>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Automated priority assessment and verified confidence index.
                  </p>

                  <div className="mt-3.5 rounded-xl border border-slate-100 bg-[#F9FBFC] p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                          RECOMMENDED PRIORITY
                        </p>
                        <p className="mt-0.5 text-base font-bold text-red-600">
                          {currentDetail.recommendedPriority}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                          MODEL CONFIDENCE
                        </p>
                        <p className="mt-0.5 text-base font-bold text-[#123B5C]">
                          {currentDetail.confidence}%
                        </p>
                      </div>
                    </div>

                    {/* CONFIDENCE BAR */}
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#208D70] transition-all duration-500"
                        style={{ width: `${currentDetail.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* EXPLANATION */}
                  <div className="mt-3.5">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      REASONING & CAUSAL FACTORS
                    </p>
                    <div className="mt-1 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                      <p className="text-[10px] leading-relaxed text-slate-700">
                        {currentDetail.explanation}
                      </p>
                    </div>
                  </div>

                  {/* RECOMMENDED ACTION */}
                  <div className="mt-3.5">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      RECOMMENDED ACTION
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50 p-2.5 text-[10px] font-semibold text-emerald-900">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>{currentDetail.recommendedAction}</span>
                    </div>
                  </div>
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
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                      YOUR DECISION
                    </p>
                    <span className="rounded-md bg-[#EFF6F7] px-2 py-0.5 text-[8px] font-semibold text-[#2785B2]">
                      Authorised reviewer
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-semibold text-[#123B5C]">
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
                    <div className="space-y-1.5">
                      {priorityOptions.map((option) => {
                        const selected = selectedPriority === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2 transition ${
                              selected
                                ? "border-[#123B5C] bg-[#EFF6F7] ring-1 ring-[#123B5C]"
                                : "border-slate-200 bg-white hover:bg-[#F7FBFA]"
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
                              <p className="text-[8px] text-slate-500">
                                {option.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* RATIONALE */}
                    <div className="mt-3.5">
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
                        rows={3}
                        value={rationale}
                        onChange={(e) => setRationale(e.target.value)}
                        placeholder="Explain why you approved or changed the AI recommendation..."
                        className="mt-1.5 w-full resize-y rounded-lg border border-[#64C9AD] bg-white p-2.5 text-[10px] leading-5 text-[#123B5C] outline-none transition placeholder:text-slate-400 focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRejectModal(true)}
                        disabled={isSubmitting}
                        className="rounded-lg border border-red-300 bg-white px-3 py-2 text-[10px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDeferModal(true)}
                        disabled={isSubmitting}
                        className="rounded-lg border border-[#2785B2] bg-white px-3 py-2 text-[10px] font-semibold text-[#2785B2] transition hover:bg-sky-50 disabled:opacity-50 cursor-pointer"
                      >
                        Defer
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || !rationale.trim()}
                        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[10px] font-semibold text-white shadow-md transition cursor-pointer ${
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
                            : "Approve decision"}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>

            {/* STRUCTURED PLANNING & OPERATIONAL SECTIONS */}
            {(currentDetail.immediatePriorities?.length ||
              currentDetail.resourceRecommendations?.length ||
              currentDetail.shelterRecommendations?.length ||
              currentDetail.volunteerRecommendations?.length ||
              currentDetail.risks?.length) && (
              <div className="mt-6 space-y-4">
                {/* 1. IMMEDIATE PRIORITIES & RISKS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentDetail.immediatePriorities && currentDetail.immediatePriorities.length > 0 && (
                    <div className="rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-[#123B5C]">
                        <CheckSquare size={16} className="text-[#208D70]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                          Immediate Strategic Priorities
                        </h3>
                      </div>
                      <ul className="space-y-1.5 mt-2">
                        {currentDetail.immediatePriorities.map((pri, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EFF6F7] text-[9px] font-bold text-[#123B5C]">
                              {idx + 1}
                            </span>
                            <span>{pri}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentDetail.risks && currentDetail.risks.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-amber-900">
                        <AlertOctagon size={16} className="text-amber-600" />
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                          Operational Risks & Mitigation
                        </h3>
                      </div>
                      <ul className="space-y-1.5 mt-2">
                        {currentDetail.risks.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] text-amber-900">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 2. RESOURCE ALLOCATION PLAN */}
                {currentDetail.resourceRecommendations && currentDetail.resourceRecommendations.length > 0 && (
                  <div className="rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-[#123B5C]">
                        <Package size={17} className="text-[#2785B2]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                          Recommended Resource Allocation Plan
                        </h3>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400">
                        Verified Depot Stock Protection
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="border-b border-slate-200 bg-slate-50 text-[9px] font-bold uppercase text-slate-500">
                          <tr>
                            <th className="px-3 py-2">Resource</th>
                            <th className="px-3 py-2">Category</th>
                            <th className="px-3 py-2 text-right">Recommended Qty</th>
                            <th className="px-3 py-2 text-right">Depot Stock</th>
                            <th className="px-3 py-2">Shortage Status</th>
                            <th className="px-3 py-2">Target Hub</th>
                            <th className="px-3 py-2">Rationale</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentDetail.resourceRecommendations.map((r, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="px-3 py-2 font-semibold text-[#123B5C]">{r.resourceName}</td>
                              <td className="px-3 py-2 text-slate-500">{r.category}</td>
                              <td className="px-3 py-2 text-right font-bold text-[#123B5C]">{r.recommendedQuantity.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right text-slate-600">{r.availableQuantity.toLocaleString()}</td>
                              <td className="px-3 py-2">
                                {r.isShortage ? (
                                  <span className="rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700">
                                    Shortage: {r.shortageQuantity} needed
                                  </span>
                                ) : (
                                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-800">
                                    In Stock
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-slate-700">{r.targetCrisisLocation}</td>
                              <td className="px-3 py-2 text-slate-500 text-[10px]">{r.rationale}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. SHELTER MATCHING & CAPACITY */}
                {currentDetail.shelterRecommendations && currentDetail.shelterRecommendations.length > 0 && (
                  <div className="rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-[#123B5C]">
                      <Home size={17} className="text-[#208D70]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Intelligent Shelter Capacity Matching
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentDetail.shelterRecommendations.map((s, idx) => {
                        const pct = Math.round((s.currentOccupancy / s.capacity) * 100);
                        return (
                          <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-xs text-[#123B5C]">{s.shelterName}</h4>
                              <span className="text-[9px] text-slate-500 font-medium">{s.location}</span>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-[10px]">
                              <span className="text-slate-500">Occupancy: {s.currentOccupancy} / {s.capacity}</span>
                              <span className="font-bold text-[#208D70]">{s.remainingCapacity} remaining beds</span>
                            </div>

                            <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${pct > 90 ? "bg-red-500" : pct > 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>

                            <p className="mt-2 text-[10px] text-slate-600 leading-4">
                              <strong>Suitability:</strong> {s.suitabilityReason}
                            </p>
                            <p className="mt-1 text-[9px] text-slate-500">
                              {s.safetyAndAccessibilityNotes}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. VOLUNTEER SQUAD ALLOCATION */}
                {currentDetail.volunteerRecommendations && currentDetail.volunteerRecommendations.length > 0 && (
                  <div className="rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-[#123B5C]">
                      <Users size={17} className="text-[#2785B2]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Volunteer Skill Alignment & Squad Tasks
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {currentDetail.volunteerRecommendations.map((v, idx) => (
                        <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-xs text-[#123B5C]">{v.skillGroup}</h4>
                            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[8px] font-bold text-sky-800">
                              {v.priority}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs font-bold text-[#123B5C]">
                            {v.recommendedCount} Volunteers Recommended
                          </p>
                          <p className="mt-1 text-[10px] text-slate-600">
                            <strong>Task:</strong> {v.suggestedTask}
                          </p>
                          <p className="mt-1 text-[9px] text-slate-400">
                            {v.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HUMAN REVIEW NOTICE */}
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-sky-100 bg-white p-3">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#2785B2]" />
              <p className="text-[9px] leading-5 text-slate-500">
                Human oversight is mandatory. AI recommendations are provided as decision-support information only.
                Final prioritisation remains the responsibility of an authorised reviewer and is cryptographically tracked in the audit trail.
                Resource inventories and volunteer assignments will NOT be automatically altered without explicit separate confirmation.
              </p>
            </div>
          </>
        )}
      </main>

      {/* GENERATE AI RECOMMENDATION MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-[#123B5C] flex items-center gap-2">
                <Sparkles size={16} className="text-[#208D70]" />
                Generate AI Crisis Recommendations
              </h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <p className="mt-2 text-[10px] text-slate-500">
              Select a crisis event and decision-support module. CareLink will evaluate real telemetry through Google Gemini.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[9px] font-bold text-slate-600 uppercase">Target Crisis Event</label>
                <select
                  value={generateCrisisId}
                  onChange={(e) => setGenerateCrisisId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#123B5C]"
                >
                  <option value="CR-2025-018">Monsoon Floods 2025 · Greater Riverton (Level 4)</option>
                  <option value="CR-2025-014">North Ridge Landslide · North District (Level 3)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-600 uppercase">Analysis Module</label>
                <select
                  value={generateActionType}
                  onChange={(e) => setGenerateActionType(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#123B5C]"
                >
                  <option value="analysis">Situational Crisis Assessment & Vulnerability Triage</option>
                  <option value="resources">Resource Allocation & Stock Shortage Optimization</option>
                  <option value="shelters">Shelter Capacity & Occupancy Matching</option>
                  <option value="volunteers">Volunteer Skill Mobilization & Tasking</option>
                  <option value="plan">Comprehensive Combined Crisis Response Plan</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-600 uppercase">Operational Context / Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={generateContext}
                  onChange={(e) => setGenerateContext(e.target.value)}
                  placeholder="e.g. Focus on Riverside evacuation route accessibility..."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#123B5C]"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateAI}
                className="flex items-center gap-1.5 rounded-lg bg-[#123B5C] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1D5F8A] cursor-pointer"
              >
                {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} className="text-[#64C9AD]" />}
                <span>{isGenerating ? "Evaluating with Gemini..." : "Run AI Analysis"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION / APPROVE MODAL */}
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
              Your binding decision for case <strong className="text-slate-700">{currentDetail.id}</strong> ({currentDetail.requestId || currentDetail.category}) will be recorded.
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
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDecision}
                className="flex items-center gap-1.5 rounded-lg bg-[#123B5C] px-3.5 py-1.5 text-[10px] font-semibold text-white shadow-sm hover:bg-[#1D5F8A] cursor-pointer"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && currentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                <XCircle size={15} className="text-red-600" />
                Reject AI Recommendation
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={15} />
              </button>
            </div>

            <p className="mt-2.5 text-[10px] leading-4 text-slate-500">
              Rejecting this recommendation requires an administrative rationale for compliance and training.
            </p>

            <div className="mt-3 space-y-2">
              <div>
                <label className="text-[9px] font-semibold text-slate-600">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Field team already resolved the incident"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-[10px] outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold text-slate-600">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Optional context for the response coordinator..."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-[10px] outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || !rejectionReason.trim()}
                onClick={handleReject}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-[10px] font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Confirm Rejection
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
              <button onClick={() => setShowDeferModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDefer}
                className="flex items-center gap-1.5 rounded-lg bg-purple-700 px-3.5 py-1.5 text-[10px] font-semibold text-white shadow-sm hover:bg-purple-800 cursor-pointer"
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
