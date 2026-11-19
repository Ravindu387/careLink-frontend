import { useState, useEffect } from "react";
import {
  Star,
  CheckCircle,
  Send,
  Loader2,
  TriangleAlert,
  Phone,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Clock,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import { feedbackService } from "../../services/feedbackService";
import type { FeedbackItem, FeedbackSummary } from "../../types/feedback";

const categories = [
  "Using the citizen portal",
  "Requesting help",
  "Finding nearby support",
  "Shelter services",
  "Safety updates",
  "Communication and support",
  "Accessibility",
  "Other",
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  // Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("Using the citizen portal");
  const [feedback, setFeedback] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedFeedback, setSubmittedFeedback] = useState<FeedbackItem | null>(null);
  const [showConcern, setShowConcern] = useState(false);

  // Feedbacks List & Summary State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Load Feedbacks and Summary from backend
  const loadFeedbacksData = async () => {
    setIsLoadingFeedbacks(true);
    try {
      const [feedbacksData, summaryData] = await Promise.all([
        feedbackService.getFeedbacks({
          category: selectedCategoryFilter !== "all" ? selectedCategoryFilter : undefined,
          rating: selectedRatingFilter > 0 ? selectedRatingFilter : undefined,
          search: searchQuery.trim() || undefined,
        }),
        feedbackService.getSummary(),
      ]);
      setFeedbacks(feedbacksData);
      setSummary(summaryData);
    } catch (err: any) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    loadFeedbacksData();
  }, [selectedCategoryFilter, selectedRatingFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFeedbacksData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!rating) {
      setSubmitError("Please select a star rating from 1 to 5.");
      return;
    }

    if (!feedback.trim()) {
      setSubmitError("Please enter your comments or suggestions.");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitterName = anonymous
        ? "Anonymous Citizen"
        : user?.fullName || "Samira Khan";

      const created = await feedbackService.createFeedback({
        category,
        rating,
        comment: feedback.trim(),
        anonymous,
        submittedBy: submitterName,
      });

      setSubmittedFeedback(created);
      // Refresh feedbacks list & summary
      loadFeedbacksData();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit feedback. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setFeedback("");
    setCategory("Using the citizen portal");
    setAnonymous(false);
    setSubmitError(null);
    setSubmittedFeedback(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "acknowledged":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "under review":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="Feedback"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="min-h-screen lg:ml-[295px]">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1200px] p-4 sm:p-6">
          {/* PAGE TITLE & TABS HEADER */}
          <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#173d5b]">Feedback</h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Citizen Voice
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Tell us what worked and what should improve. Feedback does not affect your relief requests.
              </p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === "form"
                    ? "bg-[#287da6] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#173d5b]"
                }`}
              >
                <Send size={13} />
                Share Feedback
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === "history"
                    ? "bg-[#287da6] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#173d5b]"
                }`}
              >
                <MessageSquare size={13} />
                Recent Feedback
                {feedbacks.length > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      activeTab === "history"
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {feedbacks.length}
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* COMMUNITY SATISFACTION SUMMARY BANNER */}
          {summary && summary.totalCount > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Average Rating
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#173d5b]">
                    {summary.averageRating.toFixed(1)}
                  </span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          s <= Math.round(summary.averageRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-500">out of 5 stars</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Total Reviews
                </p>
                <p className="mt-1 text-2xl font-bold text-[#173d5b]">
                  {summary.totalCount}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">Citizen submissions</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  5-Star Ratings
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {summary.fiveStarCount}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {Math.round((summary.fiveStarCount / summary.totalCount) * 100)}% highest marks
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Response Status
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#287da6]">
                  <Sparkles size={14} />
                  <span>Actively Monitored</span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-500">Reviewed by city ops</p>
              </div>
            </div>
          )}

          {/* MAIN GRID: FORM OR HISTORY + SIDE CARDS */}
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            {/* LEFT COLUMN: ACTIVE TAB */}
            {activeTab === "form" ? (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                {!submittedFeedback ? (
                  <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#173d5b]">
                          Share your experience
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Your feedback helps make emergency support clearer, safer, and more accessible.
                        </p>
                      </div>
                      <span className="hidden rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-[#287da6] sm:inline-block">
                        Quick & Anonymous option
                      </span>
                    </div>

                    <div className="my-4 border-t border-slate-100" />

                    {submitError && (
                      <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* CATEGORY */}
                    <div className="mb-5">
                      <label className="mb-2 block text-xs font-semibold text-[#173d5b]">
                        What would you like to comment on?
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-[#173d5b] outline-none transition focus:border-[#287da6] focus:ring-1 focus:ring-[#287da6]"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* STAR RATING */}
                    <div className="mb-5">
                      <label className="mb-2 block text-xs font-semibold text-[#173d5b]">
                        How was your experience? <span className="text-red-500">*</span>
                      </label>

                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="rounded-lg border border-slate-200 p-2.5 transition hover:border-amber-400 hover:bg-amber-50/50"
                            aria-label={`${star} stars`}
                          >
                            <Star
                              size={20}
                              className={
                                star <= (hoverRating || rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300"
                              }
                            />
                          </button>
                        ))}
                      </div>

                      <p className="mt-2 text-[11px] text-slate-500">
                        {rating === 0
                          ? "Select a rating from 1 to 5 stars"
                          : `${rating} out of 5 stars selected - ${
                              rating === 5
                                ? "Excellent"
                                : rating === 4
                                ? "Good"
                                : rating === 3
                                ? "Average"
                                : rating === 2
                                ? "Needs Improvement"
                                : "Poor"
                            }`}
                      </p>
                    </div>

                    {/* FEEDBACK TEXT */}
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#173d5b]">
                          Tell us more <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400">
                          {feedback.length} characters
                        </span>
                      </div>

                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What went well? What could be clearer, faster, or easier?"
                        rows={5}
                        required
                        className="w-full resize-y rounded-lg border border-slate-300 p-3 text-xs text-[#173d5b] outline-none placeholder:text-slate-400 transition focus:border-[#287da6] focus:ring-1 focus:ring-[#287da6]"
                      />
                    </div>

                    {/* ANONYMOUS CHECKBOX */}
                    <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5 transition hover:bg-slate-100/60">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#287da6]"
                      />

                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#173d5b]">
                          Send anonymously
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {anonymous
                            ? "Your name will be hidden. Recorded as 'Anonymous Citizen'."
                            : `Submitting as: ${user?.fullName || "Samira Khan"}`}
                        </p>
                      </div>
                    </label>

                    {/* SUBMIT BUTTON */}
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 rounded-lg bg-[#287da6] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1c6388] disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Submitting feedback...
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            Send feedback
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={resetForm}
                        disabled={isSubmitting}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Clear
                      </button>
                    </div>
                  </form>
                ) : (
                  /* SUCCESS CONFIRMATION SCREEN */
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle size={36} />
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-[#173d5b]">
                      Thank you for your feedback!
                    </h3>

                    <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                      Your response has been saved directly to the CareLink Citizen Support system.
                      Reference ID:{" "}
                      <span className="font-mono font-semibold text-[#287da6]">
                        {submittedFeedback.id}
                      </span>
                    </p>

                    <div className="mt-4 w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-600">Category:</span>
                        <span className="font-medium text-[#173d5b]">{submittedFeedback.category}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold text-slate-600">Rating:</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <span>{submittedFeedback.rating}</span>
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold text-slate-600">Status:</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${getStatusBadge(
                            submittedFeedback.status
                          )}`}
                        >
                          {submittedFeedback.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold text-slate-600">Submitted as:</span>
                        <span className="text-slate-600">
                          {submittedFeedback.anonymous ? "Anonymous" : submittedFeedback.submittedBy}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={resetForm}
                        className="rounded-lg bg-[#287da6] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1c6388]"
                      >
                        Submit another feedback
                      </button>

                      <button
                        onClick={() => setActiveTab("history")}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-[#287da6] transition hover:bg-slate-50"
                      >
                        <MessageSquare size={14} />
                        View in feedback list
                      </button>
                    </div>
                  </div>
                )}
              </section>
            ) : (
              /* TAB 2: RECENT FEEDBACK LIST & HISTORY */
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-sm font-bold text-[#173d5b]">
                      Citizen Feedback & Reviews
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Community feedback helps relief teams identify bottlenecks and improve service quality.
                    </p>
                  </div>

                  <button
                    onClick={loadFeedbacksData}
                    className="flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:self-auto"
                  >
                    <RotateCcw size={13} />
                    Refresh
                  </button>
                </div>

                {/* FILTERS & SEARCH BAR */}
                <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3">
                  <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs">
                    <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search feedback comments..."
                        className="w-full bg-transparent outline-none placeholder:text-slate-400 text-xs"
                      />
                    </form>
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#287da6]"
                  >
                    <option value="all">All categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {/* Rating Filter */}
                  <select
                    value={selectedRatingFilter}
                    onChange={(e) => setSelectedRatingFilter(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#287da6]"
                  >
                    <option value={0}>All ratings</option>
                    <option value={5}>5 Stars only</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>

                {/* LIST OF FEEDBACK ITEMS */}
                {isLoadingFeedbacks ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Loader2 size={24} className="animate-spin text-[#287da6]" />
                    <p className="mt-2 text-xs">Loading feedbacks...</p>
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-12 text-center">
                    <MessageSquare size={32} className="text-slate-300" />
                    <p className="mt-2 text-xs font-semibold text-slate-600">No feedback found</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      No feedback matches your filter criteria. Be the first to leave one!
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategoryFilter("all");
                        setSelectedRatingFilter(0);
                        setSearchQuery("");
                      }}
                      className="mt-3 text-xs font-semibold text-[#287da6] hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#287da6]/40 hover:shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-semibold text-slate-400">
                              {fb.id}
                            </span>
                            <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-[#287da6]">
                              {fb.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Stars */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={13}
                                  className={
                                    s <= fb.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }
                                />
                              ))}
                            </div>

                            {/* Status */}
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${getStatusBadge(
                                fb.status
                              )}`}
                            >
                              {fb.status}
                            </span>
                          </div>
                        </div>

                        {/* Comment text */}
                        <p className="mt-2.5 text-xs leading-relaxed text-[#173d5b]">
                          {fb.comment}
                        </p>

                        {/* Footer info: author & date */}
                        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <UserIcon size={12} className="text-slate-400" />
                            <span>
                              {fb.anonymous ? "Anonymous Citizen" : fb.submittedBy}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            <span>{formatDate(fb.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* RIGHT SIDEBAR / ACTION CARDS */}
            <div className="space-y-4">
              {/* SAFETY REPORTING CARD */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-[#287da6]">
                  <TriangleAlert size={19} />
                </div>

                <h3 className="text-xs font-bold text-[#173d5b]">
                  Need to report a safety concern?
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  For urgent safety issues, physical hazard or misleading news, use the dedicated emergency reporting channel.
                </p>

                <button
                  type="button"
                  onClick={() => setShowConcern(!showConcern)}
                  className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-[11px] font-semibold text-[#287da6] transition hover:bg-sky-50"
                >
                  {showConcern ? "Close" : "Report a concern"}
                </button>

                {showConcern && (
                  <div className="mt-3 rounded-lg bg-sky-50 p-3">
                    <p className="text-[11px] font-bold text-[#173d5b]">
                      Emergency Operations
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-600">
                      Emergency hotlines are available 24/7 for life-threatening events.
                    </p>
                    <a
                      href="tel:112"
                      className="mt-2 inline-block text-xs font-bold text-red-600 hover:underline"
                    >
                      Call 112
                    </a>
                  </div>
                )}
              </div>

              {/* SPEAK WITH SOMEONE */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-[#287da6]">
                  <Phone size={18} />
                </div>

                <h3 className="text-xs font-bold text-[#173d5b]">
                  Prefer to speak with someone?
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Citizen support helpline is available if you need human assistance or language translation.
                </p>

                <a
                  href="tel:112"
                  className="mt-3 inline-block rounded-lg bg-[#153e5e] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1c4d74]"
                >
                  Call 112 Support
                </a>
              </div>

              {/* DATA TRANSPARENCY NOTICE */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs">
                <h4 className="font-bold text-[#173d5b]">Citizen Privacy</h4>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  Anonymous submissions do not store your user ID or contact information. Your feedback is exclusively used to improve relief workflows.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support · Powered by CareLink</p>
            <p>Stay safe. Stay informed.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
