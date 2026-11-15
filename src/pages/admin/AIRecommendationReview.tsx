
import { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Check,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Priority = "Critical" | "High" | "Medium";

export default function AIRecommendationReview() {
  const navigate = useNavigate();

  const [selectedPriority, setSelectedPriority] =
    useState<Priority>("Critical");

  const [rationale, setRationale] = useState(
    "AI recommendation approved. Verified vulnerability indicators and active flood boundary support immediate evacuation response."
  );

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeferConfirmation, setShowDeferConfirmation] = useState(false);

  const [decisionRecorded, setDecisionRecorded] = useState(false);

  const priorityOptions: {
    value: Priority;
    description: string;
  }[] = [
    {
      value: "Critical",
      description: "Immediate threat to life",
    },
    {
      value: "High",
      description: "Urgent response required",
    },
    {
      value: "Medium",
      description: "Standard prioritisation",
    },
  ];

  const handleApprove = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!rationale.trim()) {
      return;
    }

    setDecisionRecorded(true);
    setShowConfirmation(true);
  };

  const handleDefer = () => {
    setShowDeferConfirmation(true);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-[#EFF6F7]">

      {/* BREADCRUMB */}

      <div className="flex h-8 items-center gap-2 border-b border-[#64C9AD] bg-white px-6 text-[9px] text-slate-500">
        <span>Operations</span>

        <span className="text-slate-300">›</span>

        <span className="font-semibold text-[#123B5C]">
          AI Review
        </span>

        <span className="ml-auto hidden items-center gap-1 text-[9px] text-emerald-600 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live data · Updated just now
        </span>
      </div>

      {/* MAIN CONTENT */}

      <main className="mx-auto max-w-[1700px] px-4 py-7 md:px-7 lg:px-8">

        {/* PAGE HEADER */}

        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

          <div>
            <p className="text-[9px] font-bold tracking-wider text-[#123B5C]">
              HUMAN REVIEW REQUIRED
            </p>

            <h1 className="mt-3 text-2xl font-medium tracking-tight text-[#123B5C]">
              AI recommendation review
            </h1>

            <p className="mt-2 text-xs text-slate-600">
              Compare decision-support output with verified case evidence.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-semibold text-[#123B5C]">
            <Clock size={13} className="text-[#2785B2]" />
            8 awaiting review
          </div>

        </div>

        {/* THREE COLUMN LAYOUT */}

        <div className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-3">

          {/* LEFT CARD - ASSOCIATED REQUEST */}

          <section className="rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">

            <div className="flex items-center justify-between gap-2">

              <p className="text-[9px] font-medium tracking-wide text-slate-400">
                ASSOCIATED REQUEST
              </p>

              <span className="rounded-md bg-red-50 px-2 py-1 text-[8px] font-bold text-red-600">
                Reported urgent
              </span>

            </div>

            <h2 className="mt-3 text-base font-medium text-[#123B5C]">
              REQ-2841 · Emergency shelter
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-slate-600">
              Household of six requires evacuation as flood water enters their residence.
            </p>

            {/* DETAILS GRID */}

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">

              <div>
                <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                  LOCATION
                </p>

                <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#123B5C]">
                  <MapPin size={12} />
                  Riverside, North Ward
                </p>
              </div>

              <div>
                <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                  VULNERABILITY
                </p>

                <p className="mt-2 text-[10px] font-semibold text-[#123B5C]">
                  Children, limited mobility
                </p>
              </div>

              <div>
                <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                  SUBMITTED
                </p>

                <p className="mt-2 text-[10px] font-semibold text-[#123B5C]">
                  12 minutes ago
                </p>
              </div>

              <div>
                <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                  VERIFICATION
                </p>

                <p className="mt-2 text-[10px] font-semibold text-[#123B5C]">
                  Contact verified
                </p>
              </div>

            </div>

            <div className="my-4 border-t border-[#64C9AD]" />

            {/* EVIDENCE NOTE */}

            <div className="flex gap-2 rounded-lg bg-[#EFF6F7] p-3">

              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-[#2785B2]"
              />

              <div>
                <p className="text-[9px] font-bold text-[#123B5C]">
                  Evidence note
                </p>

                <p className="mt-1 text-[9px] leading-4 text-slate-600">
                  Citizen description and location boundary are verified.
                  Image evidence is pending manual review.
                </p>
              </div>

            </div>

            {/* RELEVANT INPUT INFORMATION */}

            <div className="mt-4">

              <h3 className="text-[10px] font-semibold text-[#123B5C]">
                Relevant input information
              </h3>

              <div className="mt-3 space-y-3">

                {[
                  "Flood water reported inside residence",
                  "6 affected people, including 2 children",
                  "1 household member needs mobility support",
                  "1.4 km from active evacuation zone",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2"
                  >
                    <Check
                      size={12}
                      className="mt-0.5 shrink-0 text-[#2785B2]"
                    />

                    <p className="text-[9px] leading-4 text-slate-600">
                      {item}
                    </p>
                  </div>
                ))}

              </div>
            </div>

          </section>

          {/* MIDDLE CARD - AI RECOMMENDATION */}

          <section className="rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">

            {/* MODEL HEADER */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6F7] text-[#2785B2]">
                  <Sparkles size={18} />
                </div>

                <div>
                  <p className="text-[9px] font-medium text-slate-400">
                    RECOMMENDATION MODEL
                  </p>

                  <p className="mt-1 text-[10px] font-bold text-[#123B5C]">
                    Priority Assist v2.4
                  </p>
                </div>

              </div>

              <span className="text-[8px] text-slate-500">
                13:01 UTC
              </span>

            </div>

            {/* RECOMMENDED PRIORITY */}

            <div className="mt-4 rounded-lg border border-red-200 bg-[#FDEBEC] p-4">

              <div className="flex items-center justify-between">

                <p className="text-[8px] font-medium text-[#123B5C]">
                  RECOMMENDED PRIORITY
                </p>

                <span className="text-[8px] font-bold text-red-600">
                  CRITICAL
                </span>

              </div>

              <div className="py-4 text-center">

                <h2 className="text-4xl font-bold tracking-tight text-red-700">
                  94<span className="text-xl">%</span>
                </h2>

                <p className="mt-2 text-[9px] text-slate-600">
                  Confidence score
                </p>

              </div>

            </div>

            {/* SUPPORTING EXPLANATION */}

            <div className="mt-4">

              <h3 className="text-[10px] font-medium text-[#123B5C]">
                Supporting explanation
              </h3>

              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                Immediate risk to life is indicated by active inundation
                combined with vulnerable household members and limited
                self-evacuation capability.
              </p>

            </div>

            {/* ALTERNATIVES */}

            <div className="mt-3 rounded-lg bg-[#EFF6F7] p-3">

              <p className="text-[8px] font-medium tracking-wide text-slate-500">
                ALTERNATIVES CONSIDERED
              </p>

              <div className="mt-3 space-y-2">

                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-semibold text-[#123B5C]">
                    High priority
                  </p>

                  <span className="text-[9px] text-slate-500">
                    5% likelihood
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-semibold text-[#123B5C]">
                    Medium priority
                  </p>

                  <span className="text-[9px] text-slate-500">
                    1% likelihood
                  </span>
                </div>

              </div>

            </div>

            {/* WARNING */}

            <div className="mt-3 flex gap-2 rounded-lg bg-[#FFF5DF] p-3">

              <AlertTriangle
                size={15}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <p className="text-[9px] leading-4 text-amber-800">
                This is decision support, not an automated decision.
                An authorised coordinator must approve or modify it.
              </p>

            </div>

          </section>

          {/* RIGHT CARD - HUMAN DECISION */}

          <section className="rounded-xl border border-[#64C9AD] bg-white p-4 shadow-sm">

            <div className="flex items-center justify-between gap-2">

              <p className="text-[9px] font-medium tracking-wide text-slate-400">
                YOUR DECISION
              </p>

              <span className="rounded-md bg-[#EFF6F7] px-2 py-1 text-[8px] font-semibold text-[#2785B2]">
                Authorised reviewer
              </span>

            </div>

            <h2 className="mt-3 text-base font-medium text-[#123B5C]">
              Record human decision
            </h2>

            <p className="mt-2 text-[10px] text-slate-600">
              Select a final priority and provide an auditable rationale.
            </p>

            <form
              onSubmit={handleApprove}
              className="mt-4"
            >

              {/* PRIORITY OPTIONS */}

              <div className="space-y-2">

                {priorityOptions.map((option) => {
                  const selected =
                    selectedPriority === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
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
                        onChange={() =>
                          setSelectedPriority(option.value)
                        }
                        className="h-3.5 w-3.5 accent-[#123B5C]"
                      />

                      <div>
                        <p className="text-[10px] font-semibold text-[#123B5C]">
                          {option.value}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-600">
                          {option.description}
                        </p>
                      </div>

                    </label>
                  );
                })}

              </div>

              {/* RATIONALE */}

              <div className="mt-5">

                <label
                  htmlFor="decisionRationale"
                  className="text-[9px] font-semibold text-[#123B5C]"
                >
                  Decision rationale{" "}
                  <span className="text-red-600">Required</span>
                </label>

                <textarea
                  id="decisionRationale"
                  required
                  minLength={10}
                  rows={5}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Explain why you approved or changed the AI recommendation..."
                  className="mt-2 w-full resize-y rounded-lg border border-[#64C9AD] bg-white p-3 text-[10px] leading-5 text-[#123B5C] outline-none transition placeholder:text-slate-400 focus:border-[#2785B2] focus:ring-2 focus:ring-sky-100"
                />

                <p className="mt-1 text-right text-[8px] text-slate-400">
                  {rationale.length} characters
                </p>

              </div>

              {/* BUTTONS */}

              <div className="mt-4 flex flex-wrap justify-end gap-2">

                <button
                  type="button"
                  onClick={handleDefer}
                  disabled={decisionRecorded}
                  className="rounded-lg border border-[#2785B2] bg-white px-4 py-2.5 text-[10px] font-semibold text-[#2785B2] transition hover:bg-sky-50 disabled:opacity-50"
                >
                  Defer
                </button>

                <button
                  type="submit"
                  disabled={decisionRecorded || !rationale.trim()}
                  className="flex items-center gap-2 rounded-lg bg-[#123B5C] px-4 py-2.5 text-[10px] font-semibold text-white shadow-md transition hover:bg-[#1D5F8A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={13} />
                  {decisionRecorded
                    ? "Decision recorded"
                    : "Approve & record decision"}
                </button>

              </div>

            </form>

          </section>

        </div>

        {/* HUMAN REVIEW NOTICE */}

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-sky-100 bg-white p-3">
          <ShieldCheck
            size={15}
            className="mt-0.5 shrink-0 text-[#2785B2]"
          />

          <p className="text-[9px] leading-5 text-slate-500">
            Human oversight is mandatory. AI recommendations are provided
            as decision-support information only. Final prioritisation
            remains the responsibility of an authorised reviewer.
          </p>
        </div>

      </main>

      {/* APPROVAL CONFIRMATION */}

      {showConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={25} />
            </div>

            <h2 className="mt-4 text-base font-bold text-[#123B5C]">
              Decision recorded
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-slate-500">
              Your human review decision for REQ-2841 has been recorded
              in this demonstration interface.
            </p>

            <div className="mt-4 rounded-lg bg-[#EFF6F7] p-3 text-left">
              <p className="text-[9px] text-slate-500">
                APPROVED PRIORITY
              </p>

              <p className="mt-1 text-sm font-bold text-[#123B5C]">
                {selectedPriority}
              </p>

              <p className="mt-3 text-[9px] text-slate-500">
                DECISION RATIONALE
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-700">
                {rationale}
              </p>
            </div>

            <button
              onClick={closeConfirmation}
              className="mt-5 w-full rounded-lg bg-[#123B5C] py-3 text-xs font-semibold text-white hover:bg-[#1D5F8A]"
            >
              Done
            </button>

          </div>

        </div>
      )}

      {/* DEFER CONFIRMATION */}

      {showDeferConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">

            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#123B5C]">
                Defer AI review?
              </h2>

              <button
                onClick={() => setShowDeferConfirmation(false)}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <p className="mt-3 text-[10px] leading-5 text-slate-500">
              This request will remain pending for another authorised
              reviewer to review. No final priority decision will be recorded.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowDeferConfirmation(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[10px] font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowDeferConfirmation(false);
                  navigate("/admin/requests");
                }}
                className="rounded-lg bg-[#123B5C] px-4 py-2 text-[10px] font-semibold text-white"
              >
                Confirm defer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
