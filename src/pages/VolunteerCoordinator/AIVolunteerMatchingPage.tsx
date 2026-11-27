import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

import {
  Search,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Check,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  Server,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { aiVolunteerMatchingService } from "../../services/aiVolunteerMatchingService";
import type {
  Task,
  Candidate,
  Decision,
  DecisionRecord,
  TaskPriority,
  MatchingSummaryDto,
} from "../../types/aiVolunteerMatching";

export default function AIVolunteerMatchingPage() {
  // Live server state
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [summary, setSummary] = useState<MatchingSummaryDto>({
    totalOpenTasks: 4,
    totalVerifiedCandidates: 3,
    modelVersion: "Model v2.4",
    decisionsCount: 0,
  });

  const [rationale, setRationale] = useState<string>("");
  const [decisionHistory, setDecisionHistory] = useState<DecisionRecord[]>([]);
  const [search, setSearch] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Notification state
  const [notification, setNotification] = useState<string>("");
  const [notificationType, setNotificationType] = useState<"success" | "error" | "info">("success");

  const notify = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification(message);
    setNotificationType(type);

    window.setTimeout(() => {
      setNotification("");
    }, 3500);
  };

  // LOAD INITIAL DATA (TASKS & HISTORY & SUMMARY)
  const loadInitialData = useCallback(async () => {
    try {
      const [tasksRes, summaryRes, historyRes] = await Promise.all([
        aiVolunteerMatchingService.getTasks(),
        aiVolunteerMatchingService.getSummary(),
        aiVolunteerMatchingService.getDecisionHistory(),
      ]);

      setIsLiveBackend(tasksRes.isLiveBackend || summaryRes.isLiveBackend);
      setTasks(tasksRes.data);
      setSummary(summaryRes.data);
      setDecisionHistory(historyRes);

      if (tasksRes.data.length > 0 && !selectedTask) {
        setSelectedTask(tasksRes.data[0]);
      }
    } catch (err) {
      console.error("Failed to load initial matching data", err);
      notify("Using offline demonstration dataset.", "info");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedTask]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // LOAD CANDIDATES FOR SELECTED TASK
  const loadCandidates = useCallback(
    async (taskId: string, searchQuery?: string) => {
      try {
        const candRes = await aiVolunteerMatchingService.getCandidates(taskId, searchQuery);
        setCandidates(candRes.data);

        if (candRes.isLiveBackend) {
          setIsLiveBackend(true);
        }

        // Auto select first candidate if current selection not in list
        if (candRes.data.length > 0) {
          const first = candRes.data[0];
          setSelectedCandidate(first);
          setRationale(
            `${first.name} has ${
              first.verified ? "verified" : "unverified"
            } skills, ${first.availability.toLowerCase()} availability, and ${first.experience.toLowerCase()}`
          );
        } else {
          setSelectedCandidate(null);
          setRationale("");
        }
      } catch (err) {
        console.error("Failed to load candidates for task", taskId, err);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedTask) {
      loadCandidates(selectedTask.id, search);
    }
  }, [selectedTask, search, loadCandidates]);

  // REFRESH HANDLER
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    if (selectedTask) {
      await loadCandidates(selectedTask.id, search);
    }
    notify("AI matching recommendations refreshed.", "info");
  };

  // PRIORITY STYLE
  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case "Critical":
        return "bg-[#fdebec] text-[#d64550]";
      case "High":
        return "bg-[#fff3df] text-[#b87813]";
      default:
        return "bg-[#e8f1f6] text-[#287fa9]";
    }
  };

  // HANDLE CANDIDATE SELECTION
  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setRationale(
      `${candidate.name} has ${
        candidate.verified ? "verified" : "unverified"
      } skills, ${candidate.availability.toLowerCase()} availability, and ${candidate.experience.toLowerCase()}`
    );
  };

  // HANDLE DECISION
  const handleDecision = async (decision: Decision) => {
    if (!selectedTask || !selectedCandidate) return;

    if (!rationale.trim()) {
      notify("Please provide a decision rationale.", "error");
      return;
    }

    if (decision === "Approved" && !selectedCandidate.verified) {
      notify(
        "Cannot approve an unverified volunteer. Complete verification first.",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const record = await aiVolunteerMatchingService.recordDecision({
        taskId: selectedTask.id,
        candidateId: selectedCandidate.id,
        candidateName: selectedCandidate.name,
        decision,
        rationale: rationale.trim(),
      });

      setDecisionHistory((prev) => [record, ...prev.filter((d) => d.id !== record.id)]);
      setSummary((prev) => ({ ...prev, decisionsCount: prev.decisionsCount + 1 }));

      if (decision === "Approved") {
        notify(
          `${selectedCandidate.name} approved for ${selectedTask.id}.`,
          "success"
        );
      } else if (decision === "Rejected") {
        notify(
          `Match rejected for ${selectedCandidate.name}.`,
          "info"
        );
      } else {
        notify(
          `Match deferred for ${selectedCandidate.name}.`,
          "info"
        );
      }
    } catch (err) {
      console.error(err);
      notify("Failed to record decision.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE DECISION FROM HISTORY
  const handleDeleteDecision = async (id: string) => {
    try {
      await aiVolunteerMatchingService.deleteDecision(id);
      setDecisionHistory((prev) => prev.filter((d) => d.id !== id));
      setSummary((prev) => ({
        ...prev,
        decisionsCount: Math.max(0, prev.decisionsCount - 1),
      }));
      notify("Decision record removed from history.", "info");
    } catch (err) {
      console.error(err);
      notify("Failed to delete decision record.", "error");
    }
  };

  // REUSABLE CHECK ITEM
  const CheckItem = ({ children }: { children: ReactNode }) => (
    <div className="flex items-start gap-3">
      <Check size={16} className="text-[#269d80] shrink-0 mt-0.5" />
      <span className="text-sm leading-5 text-slate-700">{children}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">
        {/* BREADCRUMB & STATUS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm mb-6">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[#8296aa]">Operations</span>
            <ChevronRight size={12} />
            <span className="text-[#8296aa]">Volunteer Coordination</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#123c5b]">
              AI-Assisted Volunteer Matching
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
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
              title="Refresh recommendations"
              className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-1 text-xs text-slate-700 hover:bg-[#f5fafc] disabled:opacity-50 cursor-pointer"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-[#173e5b]">
              AI-Assisted Volunteer Matching
            </h1>
            <p className="text-[12px] text-[#718ba0] mt-1.5">
              Review explainable candidate recommendations and record authorised human decisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-[#f2edfb] text-[#7953c7] border border-[#ddcef5] rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap">
              {summary.totalVerifiedCandidates} verified candidates
            </span>
            <span className="bg-[#e8f1f6] text-[#287fa9] border border-sky-200 rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap">
              {summary.totalOpenTasks} open tasks
            </span>
          </div>
        </div>

        {/* AI APPROVAL ALERT */}
        <div className="bg-[#f5f0fc] border border-[#ddcef5] border-l-[3px] border-l-[#7953c7] rounded-lg p-4 flex items-center gap-4 mb-5 shadow-xs">
          <Sparkles size={21} className="text-[#7953c7] shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-[#6743a9]">
              AI suggestions require human approval
            </h3>
            <p className="text-sm text-[#7953c7] mt-0.5">
              Matching considers verified skills, availability, location, experience, and task suitability. It never assigns volunteers automatically.
            </p>
          </div>
        </div>

        {/* MAIN 3-COLUMN WORKSPACE */}
        <section className="grid grid-cols-1 lg:grid-cols-[293px_minmax(0,1fr)_349px] gap-4 items-stretch">
          {/* LEFT: TASK SELECTION */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-xs overflow-hidden flex flex-col min-h-[580px]">
            <div className="px-4 py-4 border-b border-[#d5e3e9]">
              <h2 className="text-base sm:text-lg font-semibold text-[#173e5b]">
                Select task
              </h2>
              <p className="text-xs text-[#8296aa] mt-1">
                Open tasks requiring volunteers ({tasks.length})
              </p>
            </div>

            {/* TASK LIST */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#e1eaf0]">
              {isLoading ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  <RefreshCw size={18} className="mx-auto mb-2 animate-spin text-[#287fa9]" />
                  Loading tasks...
                </div>
              ) : tasks.length > 0 ? (
                tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer ${
                      selectedTask?.id === task.id
                        ? "bg-[#eff6f8] border-l-[3px] border-l-[#287fa9]"
                        : "hover:bg-[#f7fafb]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-4 text-[#173e5b]">
                          {task.id} · {task.title}
                        </p>
                        <p className="text-xs text-[#8296aa] mt-1">
                          {task.location} · {task.skills.join(" · ")}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 px-2 py-1 rounded-md text-xs font-semibold ${getPriorityStyle(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No open tasks available.
                </div>
              )}
            </div>
          </div>

          {/* CENTER: RECOMMENDED CANDIDATES */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-xs overflow-hidden flex flex-col min-h-[580px]">
            <div className="px-4 py-3 border-b border-[#d5e3e9] flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#173e5b]">
                  Recommended candidates
                </h2>
                <p className="text-xs text-[#8296aa] mt-0.5">
                  Ranked by suitability for {selectedTask ? selectedTask.id : "task"}
                </p>
              </div>

              <span className="bg-[#f2edfb] text-[#7953c7] border border-[#ddcef5] rounded-md px-2 py-1 text-xs font-semibold">
                {summary.modelVersion}
              </span>
            </div>

            {/* SEARCH CANDIDATES */}
            <div className="px-4 py-2.5 border-b border-[#e1eaf0] bg-[#fbfdfe]">
              <div className="flex items-center gap-2 bg-white border border-[#d5e3e9] rounded-lg px-2.5 h-[32px]">
                <Search size={13} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by name, skills, or ID..."
                  className="bg-transparent outline-none text-sm sm:text-[15px] w-full placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* CANDIDATE LIST */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#e1eaf0]">
              {candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => handleCandidateSelect(candidate)}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-colors cursor-pointer ${
                      selectedCandidate?.id === candidate.id
                        ? "bg-[#f3f8fa] border-l-[3px] border-l-[#287fa9]"
                        : "hover:bg-[#f8fbfc]"
                    }`}
                  >
                    {/* RADIO INDICATOR */}
                    <div className="shrink-0">
                      <div
                        className={`w-[15px] h-[15px] rounded-full border flex items-center justify-center ${
                          selectedCandidate?.id === candidate.id
                            ? "border-[#287fa9]"
                            : "border-[#a5bac8]"
                        }`}
                      >
                        {selectedCandidate?.id === candidate.id && (
                          <div className="w-[7px] h-[7px] bg-[#287fa9] rounded-full" />
                        )}
                      </div>
                    </div>

                    {/* AVATAR */}
                    <div className="w-9 h-9 rounded-full bg-[#e8f1f6] text-[#287fa9] flex items-center justify-center text-sm font-bold shrink-0 border border-sky-100">
                      {candidate.initials}
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[#173e5b]">
                          {candidate.name}
                        </p>
                        <span className="text-xs text-slate-400 font-mono">
                          ({candidate.id})
                        </span>
                      </div>

                      <p className="text-xs text-[#8296aa] mt-0.5 truncate">
                        {candidate.skills.join(" · ")} · {candidate.distance}
                      </p>

                      <p
                        className={`text-xs font-medium mt-0.5 ${
                          candidate.verified ? "text-[#239879]" : "text-[#d18a20]"
                        }`}
                      >
                        {candidate.availability}
                      </p>
                    </div>

                    {/* MATCH SCORE */}
                    <div className="text-right shrink-0">
                      <p className="text-[19px] font-bold text-[#7953c7] leading-none">
                        {candidate.score}
                      </p>
                      <p className="text-xs text-[#8296aa] mt-0.5">% match</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-16 text-center text-xs text-slate-400">
                  No matching candidates found.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: MATCH EXPLANATION & DECISION */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-xs p-5 flex flex-col justify-between min-h-[580px]">
            {selectedCandidate ? (
              <div>
                {/* SUITABILITY SCORE BANNER */}
                <div className="bg-[#f2edfb] border border-[#e1d5f5] rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center text-[#7953c7] shadow-xs">
                      <Sparkles size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#7953c7]">
                        Suitability score
                      </p>
                      <h2 className="text-[28px] leading-tight font-bold text-[#7953c7]">
                        {selectedCandidate.score}%
                      </h2>
                    </div>
                  </div>
                </div>

                {/* EXPLANATION */}
                <div className="mb-4">
                  <h3 className="text-base font-bold text-[#173e5b] mb-2.5">
                    Why this candidate?
                  </h3>

                  <div className="space-y-2">
                    {selectedCandidate.checks.map((check, index) => (
                      <CheckItem key={index}>{check}</CheckItem>
                    ))}
                  </div>
                </div>

                {/* CANDIDATE EXPERIENCE */}
                <div className="mb-4">
                  <h3 className="text-base font-bold text-[#173e5b] mb-2">
                    Candidate experience
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#f5f8f9] rounded-lg p-2.5 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-[#287fa9]">
                        <Award size={13} />
                        <span className="text-xs font-medium">Similar tasks</span>
                      </div>
                      <p className="text-[16px] font-bold text-[#173e5b] mt-1">
                        {selectedCandidate.completedTasks}
                      </p>
                    </div>

                    <div className="bg-[#f5f8f9] rounded-lg p-2.5 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-[#287fa9]">
                        <MapPin size={13} />
                        <span className="text-xs font-medium">Distance</span>
                      </div>
                      <p className="text-[16px] font-bold text-[#173e5b] mt-1">
                        {selectedCandidate.distance}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONSTRAINTS REVIEWED */}
                <div className="mb-4">
                  <h3 className="text-base font-bold text-[#173e5b] mb-2">
                    Constraints reviewed
                  </h3>

                  {selectedCandidate.warning ? (
                    <div className="bg-[#fff5df] border border-amber-200 rounded-lg p-3 flex gap-2">
                      <AlertTriangle size={15} className="text-[#a46b16] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#946015] leading-4">
                        {selectedCandidate.warning}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#e5f5ef] border border-emerald-200 rounded-lg p-3 flex gap-2">
                      <ShieldCheck size={15} className="text-[#239879] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#239879] leading-4">
                        Candidate has full compliance verification and zero safety alert flags.
                      </p>
                    </div>
                  )}
                </div>

                {/* DECISION RATIONALE */}
                <div className="mb-4">
                  <label className="text-sm font-bold text-[#173e5b] block mb-1.5">
                    Decision rationale
                  </label>
                  <textarea
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    rows={3}
                    placeholder="Explain why you approve, reject, or defer this match..."
                    className="w-full border border-[#d5e3e9] rounded-lg p-2.5 text-sm sm:text-[15px] leading-4 outline-none resize-none focus:border-[#287fa9]"
                  />
                </div>

                {/* DECISION BUTTONS */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleDecision("Deferred")}
                    disabled={isSubmitting}
                    className="h-[38px] border border-[#b9d0dc] rounded-lg text-sm text-[#287fa9] hover:bg-[#f3f8fa] font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    Defer
                  </button>

                  <button
                    onClick={() => handleDecision("Rejected")}
                    disabled={isSubmitting}
                    className="h-[38px] bg-[#bf2026] hover:bg-[#a8181e] text-white rounded-lg text-sm font-semibold disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => handleDecision("Approved")}
                    disabled={!selectedCandidate.verified || isSubmitting}
                    className="h-[38px] bg-[#287fa9] hover:bg-[#17678e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold shadow-xs cursor-pointer"
                  >
                    Approve match
                  </button>
                </div>

                {!selectedCandidate.verified && (
                  <p className="text-xs text-red-600 font-medium mt-2">
                    Verification required before approval.
                  </p>
                )}
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-slate-400">
                Select a candidate to view suitability explanation.
              </div>
            )}
          </div>
        </section>

        {/* DECISION HISTORY */}
        <section className="mt-6 bg-white border border-[#d5e3e9] rounded-xl overflow-hidden shadow-xs">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#f7fafb] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[#287fa9]">
                <ShieldCheck size={18} />
              </div>

              <div className="text-left">
                <h3 className="text-base font-bold text-[#173e5b]">
                  Human decision history
                </h3>
                <p className="text-xs text-[#8296aa] mt-0.5">
                  {decisionHistory.length} recorded decisions
                </p>
              </div>
            </div>

            <ChevronRight
              size={17}
              className={`transition-transform text-slate-400 ${
                showHistory ? "rotate-90" : ""
              }`}
            />
          </button>

          {showHistory && (
            <div className="border-t border-[#d5e3e9] divide-y divide-[#e1eaf0]">
              {decisionHistory.length === 0 ? (
                <p className="p-6 text-[13px] text-slate-400 text-center">
                  No decisions recorded yet.
                </p>
              ) : (
                decisionHistory.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fbfdfe]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#173e5b]">
                          {record.taskId} {record.taskTitle ? `(${record.taskTitle})` : ""} ·{" "}
                          {record.candidateName || record.candidateId}
                        </p>
                        <span className="text-xs text-slate-400 font-mono">
                          [{record.id}]
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mt-1">
                        {record.rationale}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {record.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-md ${
                          record.decision === "Approved"
                            ? "bg-[#e5f5ef] text-[#239879] border border-emerald-200"
                            : record.decision === "Rejected"
                            ? "bg-[#fdebec] text-[#d64550] border border-rose-200"
                            : "bg-[#fff3df] text-[#b87813] border border-amber-200"
                        }`}
                      >
                        {record.decision}
                      </span>

                      <button
                        onClick={() => handleDeleteDecision(record.id)}
                        title="Delete decision"
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-[100] rounded-xl px-5 py-3 shadow-xl text-white text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border ${
            notificationType === "error"
              ? "bg-[#bf2026] border-red-700"
              : notificationType === "info"
              ? "bg-[#7953c7] border-purple-700"
              : "bg-[#123c5b] border-slate-700"
          }`}
        >
          {notificationType === "error" ? (
            <XCircle size={16} />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400" />
          )}
          <span>{notification}</span>
        </div>
      )}

      {/* HELP BUTTON */}
      <button
        onClick={() =>
          notify("AI Matching: Review and confirm skill/availability suitability before volunteer deployment.", "info")
        }
        className="fixed bottom-4 right-4 w-10 h-10 bg-[#173e5b] hover:bg-[#205175] text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        title="Help & Info"
      >
        <HelpCircle size={18} />
      </button>
    </div>
  );
}
