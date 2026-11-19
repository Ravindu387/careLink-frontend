import { useState } from "react";
import type { ReactNode } from "react";

import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  Sparkles,
  Check,
  X,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Award,
  Activity,
} from "lucide-react";

// TYPES

type TaskPriority = "Critical" | "High" | "Medium";

type CandidateStatus =
  | "Available now"
  | "Available 14:00"
  | "Pending verification";

interface Task {
  id: string;
  title: string;
  location: string;
  skills: string[];
  priority: TaskPriority;
}

interface Candidate {
  id: string;
  name: string;
  initials: string;
  skills: string[];
  distance: string;
  availability: CandidateStatus;
  score: number;
  verified: boolean;
  experience: string;
  completedTasks: number;
  checks: string[];
  warning?: string;
}

type Decision = "Approved" | "Rejected" | "Deferred";

interface DecisionRecord {
  taskId: string;
  candidateId: string;
  decision: Decision;
  rationale: string;
  date: string;
}

// DEMO TASK DATA

const initialTasks: Task[] = [
  {
    id: "TASK-782",
    title: "Evacuation transport support",
    location: "North Ward",
    skills: ["Driving", "Rescue"],
    priority: "Critical",
  },
  {
    id: "TASK-779",
    title: "Medical point registration",
    location: "Central Clinic",
    skills: ["First Aid", "Admin"],
    priority: "High",
  },
  {
    id: "TASK-774",
    title: "Food pack distribution",
    location: "Eastbank Hub",
    skills: ["Logistics"],
    priority: "High",
  },
  {
    id: "TASK-768",
    title: "Shelter childcare support",
    location: "Riverton School",
    skills: ["Childcare"],
    priority: "Medium",
  },
];

// DEMO CANDIDATES

const candidates: Candidate[] = [
  {
    id: "VOL-1048",
    name: "Elena Rossi",
    initials: "ER",
    skills: ["First Aid", "Logistics"],
    distance: "0.8 km",
    availability: "Available now",
    score: 96,
    verified: true,
    experience: "Experienced in evacuation support.",
    completedTasks: 8,
    checks: [
      "Required skills verified",
      "Available during full task window",
      "Within recommended travel range",
      "Completed 8 similar tasks",
      "No conflicting assignments",
    ],
  },
  {
    id: "VOL-1172",
    name: "Musa Bello",
    initials: "MB",
    skills: ["Driving", "Rescue"],
    distance: "1.4 km",
    availability: "Available 14:00",
    score: 93,
    verified: true,
    experience: "Experienced rescue and driving volunteer.",
    completedTasks: 12,
    checks: [
      "Driving and rescue skills verified",
      "Availability confirmed from 14:00",
      "Within recommended travel range",
      "Completed 12 similar tasks",
      "No conflicting assignments",
    ],
  },
  {
    id: "VOL-0934",
    name: "Lin Wei",
    initials: "LW",
    skills: ["Translation", "Medical"],
    distance: "2.1 km",
    availability: "Available now",
    score: 87,
    verified: true,
    experience: "Medical and multilingual support experience.",
    completedTasks: 6,
    checks: [
      "Medical skills verified",
      "Available during task window",
      "Within recommended travel range",
      "Completed 6 similar tasks",
      "No conflicting assignments",
    ],
  },
  {
    id: "VOL-1288",
    name: "Sara Khan",
    initials: "SK",
    skills: ["Shelter Support", "Childcare"],
    distance: "1.1 km",
    availability: "Pending verification",
    score: 72,
    verified: false,
    experience: "Shelter and childcare support experience.",
    completedTasks: 4,
    checks: [
      "Skills submitted for verification",
      "Availability requires confirmation",
      "Within recommended travel range",
      "Completed 4 similar tasks",
    ],
    warning:
      "Volunteer verification is pending. Approval is not recommended until verification is completed.",
  },
];

// COMPONENT

export default function AIVolunteerMatchingPage() {
  const [tasks] = useState<Task[]>(initialTasks);

  const [selectedTask, setSelectedTask] = useState<Task>(
    initialTasks[0]
  );

  const [selectedCandidate, setSelectedCandidate] =
    useState<Candidate>(candidates[0]);

  const [rationale, setRationale] = useState(
    "Candidate has verified skills, confirmed availability, and relevant evacuation support experience."
  );

  const [notification, setNotification] = useState("");

  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "info"
  >("success");

  const [decisionHistory, setDecisionHistory] = useState<
    DecisionRecord[]
  >([]);

  const [search, setSearch] = useState("");

  const [showHistory, setShowHistory] = useState(false);

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // NOTIFICATION

  const notify = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setNotification(message);
    setNotificationType(type);

    window.setTimeout(() => {
      setNotification("");
    }, 3500);
  };

  // FILTER CANDIDATES BY TASK

  const filteredCandidates = candidates
    .filter((candidate) => {
      const searchMatch = [
        candidate.name,
        candidate.id,
        candidate.skills.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      return searchMatch;
    })
    .sort((a, b) => b.score - a.score);

  // PRIORITY STYLE

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case "Critical":
        return "bg-[#fdebec] text-[#d64550]";

      case "High":
        return "bg-[#fff3df] text-[#b87813]";

      default:
        return "bg-[#fff3df] text-[#b87813]";
    }
  };

  // HANDLE CANDIDATE SELECTION

  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);

    setRationale(
      `${candidate.name} has ${
        candidate.verified
          ? "verified"
          : "unverified"
      } skills, ${
        candidate.availability
      } availability, and ${candidate.experience.toLowerCase()}`
    );
  };

  // HANDLE DECISION

  const handleDecision = (decision: Decision) => {
    if (!rationale.trim()) {
      notify("Please provide a decision rationale.", "error");
      return;
    }

    if (
      decision === "Approved" &&
      !selectedCandidate.verified
    ) {
      notify(
        "Cannot approve an unverified volunteer. Complete verification first.",
        "error"
      );
      return;
    }

    const record: DecisionRecord = {
      taskId: selectedTask.id,
      candidateId: selectedCandidate.id,
      decision,
      rationale,
      date: new Date().toLocaleString(),
    };

    setDecisionHistory((prev) => [record, ...prev]);

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
  };

  // REUSABLE CHECK ITEM

  const CheckItem = ({
    children,
  }: {
    children: ReactNode;
  }) => (
    <div className="flex items-start gap-3">

      <Check
        size={17}
        className="text-[#269d80] shrink-0"
      />

      <span className="text-[10px] leading-5">
        {children}
      </span>

    </div>
  );

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">

      {/* TOP NAVIGATION */}



      {showMobileMenu && (
        <div className="md:hidden bg-white border-b p-4 text-xs">
          Greater Riverton · Nadia O. · Coordinator
        </div>
      )}

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-8">

          <span className="text-[#8296aa]">
            Operations
          </span>

          <ChevronRight size={12} />

          <span className="text-[#8296aa]">
            Volunteer Coordination
          </span>

          <ChevronRight size={12} />

          <span className="font-semibold">
            AI-Assisted Volunteer Matching
          </span>

        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div>

            <h1 className="text-[27px] md:text-[28px] font-normal">
              AI-Assisted Volunteer Matching
            </h1>

            <p className="text-[12px] text-[#718ba0] mt-2">
              Review explainable candidate recommendations and record authorised human decisions.
            </p>

          </div>

          <span className="bg-[#f2edfb] text-[#7953c7] rounded-md px-3 py-1.5 text-[9px] font-semibold whitespace-nowrap">
            {candidates.filter((c) => c.verified).length} verified candidates
          </span>

        </div>

        {/* AI APPROVAL ALERT */}

        <div className="bg-[#f5f0fc] border border-[#ddcef5] border-l-[3px] border-l-[#7953c7] rounded-lg p-4 flex items-center gap-4 mb-4">

          <Sparkles
            size={21}
            className="text-[#7953c7] shrink-0"
          />

          <div>

            <h3 className="text-[11px] font-semibold text-[#6743a9]">
              AI suggestions require human approval
            </h3>

            <p className="text-[10px] text-[#7953c7] mt-1">
              Matching considers verified skills, availability, location, experience, and task suitability. It never assigns volunteers automatically.
            </p>

          </div>

        </div>

        {/* MAIN GRID */}

        <section className="grid grid-cols-1 lg:grid-cols-[293px_minmax(0,1fr)_349px] gap-3 items-stretch">

          {/* LEFT: TASK SELECTION */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden min-h-[560px]">

            <div className="px-4 py-4 border-b border-[#d5e3e9]">

              <h2 className="text-[13px] font-medium">
                Select task
              </h2>

              <p className="text-[9px] text-[#8296aa] mt-2">
                Open tasks requiring volunteers
              </p>

            </div>

            {/* TASK LIST */}

            <div>

              {tasks.map((task) => (

                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`w-full text-left px-4 py-3.5 border-b border-[#d5e3e9] transition-colors ${
                    selectedTask.id === task.id
                      ? "bg-[#eff6f8] border-l-[3px] border-l-[#287fa9]"
                      : "hover:bg-[#f7fafb]"
                  }`}
                >

                  <div className="flex items-start justify-between gap-2">

                    <div className="min-w-0">

                      <p className="text-[9px] font-semibold leading-4">
                        {task.id} · {task.title}
                      </p>

                      <p className="text-[8px] text-[#8296aa] mt-1">
                        {task.location} · {task.skills.join(" · ")}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 px-2 py-1.5 rounded-md text-[8px] font-semibold ${getPriorityStyle(task.priority)}`}
                    >
                      {task.priority}
                    </span>

                  </div>

                </button>

              ))}

            </div>

          </div>

          {/* CENTER: RECOMMENDED CANDIDATES */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden min-h-[560px]">

            <div className="px-4 py-4 border-b border-[#d5e3e9] flex items-center justify-between">

              <div>

                <h2 className="text-[13px] font-medium">
                  Recommended candidates
                </h2>

                <p className="text-[9px] text-[#8296aa] mt-2">
                  Ranked by suitability for {selectedTask.id}
                </p>

              </div>

              <span className="bg-[#f2edfb] text-[#7953c7] rounded-md px-2 py-1.5 text-[8px] font-semibold">
                Model v2.4
              </span>

            </div>

            {/* CANDIDATE LIST */}

            <div>

              {filteredCandidates.map((candidate) => (

                <button
                  key={candidate.id}
                  onClick={() => handleCandidateSelect(candidate)}
                  className={`w-full flex items-center gap-3 px-4 py-5 border-b border-[#d5e3e9] text-left transition-colors ${
                    selectedCandidate.id === candidate.id
                      ? "bg-[#f3f8fa] border-l-[3px] border-l-[#287fa9]"
                      : "hover:bg-[#f8fbfc]"
                  }`}
                >

                  {/* RADIO */}

                  <div className="shrink-0">

                    <div
                      className={`w-[15px] h-[15px] rounded-full border flex items-center justify-center ${
                        selectedCandidate.id === candidate.id
                          ? "border-[#287fa9]"
                          : "border-[#a5bac8]"
                      }`}
                    >

                      {selectedCandidate.id === candidate.id && (
                        <div className="w-[7px] h-[7px] bg-[#287fa9] rounded-full" />
                      )}

                    </div>

                  </div>

                  {/* AVATAR */}

                  <div className="w-10 h-10 rounded-full bg-[#e8f1f6] text-[#287fa9] flex items-center justify-center text-[10px] font-semibold shrink-0">

                    {candidate.initials}

                  </div>

                  {/* DETAILS */}

                  <div className="flex-1 min-w-0">

                    <p className="text-[10px] font-semibold">
                      {candidate.name}
                    </p>

                    <p className="text-[8px] text-[#8296aa] mt-1">
                      {candidate.skills.join(" · ")} · {candidate.distance}
                    </p>

                    <p
                      className={`text-[8px] mt-1 ${
                        candidate.verified
                          ? "text-[#239879]"
                          : "text-[#d18a20]"
                      }`}
                    >
                      {candidate.availability}
                    </p>

                  </div>

                  {/* MATCH SCORE */}

                  <div className="text-right shrink-0">

                    <p className="text-[18px] font-semibold text-[#7953c7]">
                      {candidate.score}
                    </p>

                    <p className="text-[8px] text-[#8296aa]">
                      % match
                    </p>

                  </div>

                </button>

              ))}

              {filteredCandidates.length === 0 && (
                <div className="py-12 text-center text-xs text-gray-400">
                  No matching candidates found.
                </div>
              )}

            </div>

          </div>

          {/* RIGHT: MATCH EXPLANATION */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] p-4 min-h-[560px]">

            {/* SUITABILITY SCORE */}

            <div className="bg-[#f2edfb] rounded-lg p-4 mb-5">

              <div className="flex items-center gap-3">

                <Sparkles
                  size={19}
                  className="text-[#7953c7]"
                />

                <div>

                  <p className="text-[8px] text-[#7953c7] uppercase">
                    Suitability score
                  </p>

                  <h2 className="text-[29px] leading-tight font-semibold text-[#7953c7]">
                    {selectedCandidate.score}%
                  </h2>

                </div>

              </div>

            </div>

            {/* EXPLANATION */}

            <div className="mb-5">

              <h3 className="text-[11px] font-medium mb-3">
                Why this candidate?
              </h3>

              <div className="space-y-2.5">

                {selectedCandidate.checks.map((check, index) => (

                  <CheckItem key={index}>
                    {check}
                  </CheckItem>

                ))}

              </div>

            </div>

            {/* CANDIDATE EXPERIENCE */}

            <div className="mb-5">

              <h3 className="text-[11px] font-medium mb-3">
                Candidate experience
              </h3>

              <div className="grid grid-cols-2 gap-2">

                <div className="bg-[#f5f8f9] rounded-lg p-3">

                  <div className="flex items-center gap-2 text-[#287fa9]">
                    <Award size={14} />
                    <span className="text-[8px]">
                      Similar tasks
                    </span>
                  </div>

                  <p className="text-[17px] font-semibold mt-1">
                    {selectedCandidate.completedTasks}
                  </p>

                </div>

                <div className="bg-[#f5f8f9] rounded-lg p-3">

                  <div className="flex items-center gap-2 text-[#287fa9]">
                    <MapPin size={14} />
                    <span className="text-[8px]">
                      Distance
                    </span>
                  </div>

                  <p className="text-[17px] font-semibold mt-1">
                    {selectedCandidate.distance}
                  </p>

                </div>

              </div>

            </div>

            {/* VERIFICATION WARNING */}

            <div className="mb-5">

              <h3 className="text-[11px] font-medium mb-3">
                Constraints reviewed
              </h3>

              {selectedCandidate.warning ? (

                <div className="bg-[#fff5df] rounded-lg p-3 flex gap-2">

                  <AlertTriangle
                    size={15}
                    className="text-[#a46b16] shrink-0"
                  />

                  <p className="text-[9px] text-[#946015] leading-4">
                    {selectedCandidate.warning}
                  </p>

                </div>

              ) : (

                <div className="bg-[#fff5df] rounded-lg p-3 flex gap-2">

                  <AlertTriangle
                    size={15}
                    className="text-[#a46b16] shrink-0"
                  />

                  <p className="text-[9px] text-[#946015] leading-4">
                    High-stress field task. Confirm the volunteer accepts safety conditions before assignment.
                  </p>

                </div>

              )}

            </div>

            {/* DECISION RATIONALE */}

            <div className="mb-3">

              <label className="text-[10px] font-medium block mb-2">
                Decision rationale
              </label>

              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={4}
                placeholder="Explain why you approve, reject, or defer this match..."
                className="w-full border border-[#d5e3e9] rounded-lg p-3 text-[9px] leading-4 outline-none resize-y focus:border-[#287fa9]"
              />

            </div>

            {/* DECISION BUTTONS */}

            <div className="grid grid-cols-3 gap-2">

              <button
                onClick={() => handleDecision("Deferred")}
                className="h-[41px] border border-[#b9d0dc] rounded-lg text-[9px] text-[#287fa9] hover:bg-[#f3f8fa] font-medium"
              >
                Defer
              </button>

              <button
                onClick={() => handleDecision("Rejected")}
                className="h-[41px] bg-[#bf2026] hover:bg-[#a8181e] text-white rounded-lg text-[9px] font-semibold"
              >
                Reject
              </button>

              <button
                onClick={() => handleDecision("Approved")}
                disabled={!selectedCandidate.verified}
                className="h-[41px] bg-[#287fa9] hover:bg-[#17678e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-[9px] font-semibold"
              >
                Approve match
              </button>

            </div>

            {!selectedCandidate.verified && (
              <p className="text-[9px] text-red-600 mt-2">
                Verification required before approval.
              </p>
            )}

          </div>

        </section>

        {/* DECISION HISTORY */}

        <section className="mt-5 bg-white border border-[#d5e3e9] rounded-xl overflow-hidden">

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#f7fafb]"
          >

            <div className="flex items-center gap-2">

              <ShieldCheck
                size={17}
                className="text-[#287fa9]"
              />

              <div className="text-left">

                <h3 className="text-[11px] font-semibold">
                  Human decision history
                </h3>

                <p className="text-[9px] text-[#8296aa] mt-1">
                  {decisionHistory.length} recorded decisions
                </p>

              </div>

            </div>

            <ChevronRight
              size={17}
              className={`transition-transform ${
                showHistory ? "rotate-90" : ""
              }`}
            />

          </button>

          {showHistory && (

            <div className="border-t border-[#d5e3e9]">

              {decisionHistory.length === 0 ? (

                <p className="p-5 text-[10px] text-gray-400 text-center">
                  No decisions recorded yet.
                </p>

              ) : (

                decisionHistory.map((record, index) => (

                  <div
                    key={index}
                    className="p-4 border-b border-[#e1eaf0] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >

                    <div>

                      <p className="text-[10px] font-semibold">
                        {record.taskId} · {record.candidateId}
                      </p>

                      <p className="text-[9px] text-[#8296aa] mt-1">
                        {record.rationale}
                      </p>

                      <p className="text-[8px] text-gray-400 mt-1">
                        {record.date}
                      </p>

                    </div>

                    <span
                      className={`text-[9px] font-semibold px-3 py-1.5 rounded-md ${
                        record.decision === "Approved"
                          ? "bg-[#e5f5ef] text-[#239879]"
                          : record.decision === "Rejected"
                          ? "bg-[#fdebec] text-[#d64550]"
                          : "bg-[#fff3df] text-[#b87813]"
                      }`}
                    >
                      {record.decision}
                    </span>

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
          className={`fixed top-5 right-5 z-[100] rounded-lg px-5 py-3 shadow-xl text-white text-xs flex items-center gap-2 ${
            notificationType === "error"
              ? "bg-[#bf2026]"
              : notificationType === "info"
              ? "bg-[#7953c7]"
              : "bg-[#123c5b]"
          }`}
        >

          {notificationType === "error" ? (
            <XCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}

          {notification}

        </div>

      )}

      {/* HELP BUTTON */}

      <button className="fixed bottom-4 right-4 w-10 h-10 bg-[#282828] hover:bg-black text-white rounded-full flex items-center justify-center shadow-lg">

        <HelpCircle size={21} />

      </button>

    </div>
  );
}