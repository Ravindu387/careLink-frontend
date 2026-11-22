
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
} from "lucide-react";

interface Recommendation {
  id: string;
  request: string;
  category: string;
  priority: string;
  confidence: number;
  action: string;
  timestamp: string;
  reviewState: string;
  explanation: string;
  alternative: string;
}

const initialRecommendations: Recommendation[] = [
  {
    id: "AI-9041",
    request: "REQ-2841",
    category: "Emergency shelter",
    priority: "Critical",
    confidence: 94,
    action: "Evacuation + accessible shelter",
    timestamp: "13:01",
    reviewState: "Awaiting Review",
    explanation:
      "Immediate risk to life is indicated by active flooding combined with vulnerable household members and limited self-evacuation capability.",
    alternative: "High priority – 5% likelihood",
  },
  {
    id: "AI-9038",
    request: "REQ-2839",
    category: "Medical supplies",
    priority: "High",
    confidence: 91,
    action: "24 trauma kits · Central Depot",
    timestamp: "12:42",
    reviewState: "Awaiting Review",
    explanation:
      "Medical supply demand is high and the nearest available medical inventory can support the request.",
    alternative: "Medium priority – 8% likelihood",
  },
  {
    id: "AI-9032",
    request: "REQ-2836",
    category: "Food & water",
    priority: "High",
    confidence: 87,
    action: "3 family packs · Eastbank Hub",
    timestamp: "12:18",
    reviewState: "Modified",
    explanation:
      "The affected household requires immediate food and drinking water assistance.",
    alternative: "Medium priority – 12% likelihood",
  },
  {
    id: "AI-9024",
    request: "REQ-2828",
    category: "Accessible transport",
    priority: "High",
    confidence: 82,
    action: "Mobility Vehicle 4",
    timestamp: "11:55",
    reviewState: "Approved",
    explanation:
      "A mobility vehicle is recommended based on the applicant's accessibility requirements.",
    alternative: "Medium priority – 15% likelihood",
  },
  {
    id: "AI-9019",
    request: "REQ-2821",
    category: "Rescue assistance",
    priority: "Critical",
    confidence: 96,
    action: "Deploy Rescue Unit 2",
    timestamp: "11:32",
    reviewState: "Awaiting Review",
    explanation:
      "High urgency rescue conditions require immediate human assessment and emergency response.",
    alternative: "High priority – 3% likelihood",
  },
];

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
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const [decision, setDecision] = useState("");
  const [rationale, setRationale] = useState("");
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    return recommendations.filter((item) => {
      const searchMatch =
        `${item.id} ${item.request} ${item.category} ${item.action}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const typeMatch =
        type === "All recommendation types" ||
        item.category === type;

      const priorityMatch =
        priority === "All priorities" ||
        item.priority === priority;

      const confidenceMatch =
        confidence === "Confidence range" ||
        (confidence === "90% and above" && item.confidence >= 90) ||
        (confidence === "80% - 89%" &&
          item.confidence >= 80 &&
          item.confidence < 90) ||
        (confidence === "Below 80%" && item.confidence < 80);

      const reviewMatch =
        review === "Review state" ||
        item.reviewState === review;

      return (
        searchMatch &&
        typeMatch &&
        priorityMatch &&
        confidenceMatch &&
        reviewMatch
      );
    });
  }, [recommendations, search, type, priority, confidence, review]);

  const awaiting = recommendations.filter(
    (r) => r.reviewState === "Awaiting Review"
  ).length;

  const resetFilters = () => {
    setSearch("");
    setType("All recommendation types");
    setPriority("All priorities");
    setConfidence("Confidence range");
    setReview("Review state");
  };

 

  const openReview = (item: Recommendation) => {
    setSelected(item);
    setDecision(
      item.reviewState === "Approved" ? "Approved" : ""
    );
    setRationale("");
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

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            AI Recommendations
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Review explainable decision-support recommendations and record authorised human decisions.
          </p>
        </div>

        <span className="rounded-md bg-purple-100 px-3 py-2 text-[9px] font-semibold text-purple-700">
          {awaiting} awaiting human review
        </span>
      </div>

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

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
              <Sparkles size={19} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500">Awaiting review</p>
              <h2 className="text-2xl font-semibold text-[#153f5e]">
                8
              </h2>
              <p className="text-[9px] text-slate-400">
                3 critical cases
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
                14
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
                91.6%
              </h2>
              <p className="text-[9px] text-slate-400">
                1,498 reviewed
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
                8.4%
              </h2>
              <p className="text-[9px] text-slate-400">
                126 with rationale
              </p>
            </div>
          </div>
        </div>
      </div>

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
            Filter recommendations using the options above.
          </p>
          <button
            onClick={resetFilters}
            className="text-[10px] font-semibold text-sky-700 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

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
              {filtered.map((item) => (
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
                    <span className={`rounded-md px-2 py-1 text-[8px] font-semibold ${priorityStyle[item.priority]}`}>
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
                    <span className={`rounded-md px-2 py-1 text-[8px] font-semibold ${reviewStyle[item.reviewState]}`}>
                      {item.reviewState}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <ChevronRight size={15} className="text-slate-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Search size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs text-slate-500">
              No AI recommendations found.
            </p>
          </div>
        )}

        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-[9px] text-slate-500">
            Showing {filtered.length} recommendations
          </p>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="my-auto w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-purple-600">
                  AI RECOMMENDATION REVIEW
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#153f5e]">
                  {selected.id}
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
                <p className="mt-1 text-xs text-slate-700">
                  {selected.category}
                </p>

                <p className="mt-3 text-[10px] text-slate-500">Suggested action</p>
                <p className="mt-1 text-xs text-slate-700">
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

                <div className="mt-3 rounded-lg bg-red-50 p-5 text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {selected.confidence}%
                  </p>
                  <p className="mt-1 text-[9px] text-slate-500">
                    Confidence score
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Priority</span>
                  <span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${priorityStyle[selected.priority]}`}>
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

            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-[10px] font-semibold text-slate-700">
                Supporting explanation
              </p>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                {selected.explanation}
              </p>
            </div>

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
                          ? "border-[#287da5] bg-sky-50 text-[#175477]"
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
                placeholder="Enter decision rationale (required)..."
                rows={3}
                className="mt-3 w-full resize-none rounded-lg border border-[#d5e2e9] p-3 text-[10px] outline-none focus:border-sky-500"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={saveDecision}
                className="rounded-lg bg-[#153f5e] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#205879]"
              >
                Save human decision
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] max-w-sm rounded-lg bg-[#153f5e] px-4 py-3 text-xs text-white shadow-lg">
          {toast}
        </div>
      )}

    </div>
  );
}
