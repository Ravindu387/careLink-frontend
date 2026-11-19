import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Search,
  Globe,
  Accessibility,
  Bell,
  Home,
  Plus,
  ClipboardList,
  House,
  TriangleAlert,
  Users,
  FileText,
  MessageSquare,
  Phone,
  ChevronRight,
  MapPin,
  Utensils,
  Cross,
  Truck,
  Package,
  Menu,
  X,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  UserRound,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Copy,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import { citizenRequestService } from "../../services/citizenRequestService";
import { citizenProfileService } from "../../services/citizenProfileService";
import type {
  CitizenHelpRequest,
  CreateCitizenHelpRequestPayload,
} from "../../types/citizenRequest";

const helpTypes = [
  {
    name: "Emergency shelter",
    icon: House,
    desc: "Safe temporary housing, evacuation centres, or bedding",
  },
  {
    name: "Food and water",
    icon: Utensils,
    desc: "Dry rations, drinking water canisters, and baby food",
  },
  {
    name: "Medical support",
    icon: Cross,
    desc: "Prescription refills, first aid, or elder healthcare supplies",
  },
  {
    name: "Safe transport",
    icon: Truck,
    desc: "High-water boat evacuation or transport for elderly citizens",
  },
  {
    name: "Family support",
    icon: Users,
    desc: "Child welfare, tracing missing family, and household assistance",
  },
  {
    name: "Other help",
    icon: Package,
    desc: "Tarpaulins, power banks, hygiene kits, or special requests",
  },
];

const steps = [
  "Type of help",
  "Your situation",
  "Location & contact",
  "Review & send",
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-[#173d5b] outline-none transition focus:border-[#287da6] focus:ring-2 focus:ring-sky-100";

const DRAFT_KEY = "carelink-help-request-draft";

export default function RequestHelpPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const defaultCitizenName = user?.fullName || "Samira Khan";

  const [step, setStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Form Fields
  const [selectedHelp, setSelectedHelp] = useState("Emergency shelter");
  const [immediateThreat, setImmediateThreat] = useState(false);
  const [situation, setSituation] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [address, setAddress] = useState("54 Riverside Lane, North Ward, Greater Riverton");
  const [district, setDistrict] = useState("North Ward");
  const [phone, setPhone] = useState("+94 77 123 4567");
  const [contactName, setContactName] = useState(defaultCitizenName);

  // Submission & feedback states
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<CitizenHelpRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Check backend health & prefill verified profile info if empty
  const initializePageData = useCallback(async () => {
    try {
      const profile = await citizenProfileService.getProfile(defaultCitizenName);
      setIsOnline(true);
      if (profile) {
        if (!address && profile.address) setAddress(profile.address);
        if (!district && profile.district) setDistrict(profile.district);
        if (!phone && profile.phone) setPhone(profile.phone);
        if (!contactName && profile.fullName) setContactName(profile.fullName);
      }
    } catch {
      setIsOnline(false);
    }
  }, [defaultCitizenName, address, district, phone, contactName]);

  // Restore Draft on initial load
  useEffect(() => {
    initializePageData();

    try {
      const rawDraft = localStorage.getItem(DRAFT_KEY);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        if (parsed.selectedHelp) setSelectedHelp(parsed.selectedHelp);
        if (typeof parsed.immediateThreat === "boolean") setImmediateThreat(parsed.immediateThreat);
        if (parsed.situation) setSituation(parsed.situation);
        if (parsed.additionalInfo) setAdditionalInfo(parsed.additionalInfo);
        if (parsed.peopleCount) setPeopleCount(parsed.peopleCount);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.district) setDistrict(parsed.district);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.contactName) setContactName(parsed.contactName);
        if (parsed.step) setStep(parsed.step);
        setDraftRestored(true);
        setTimeout(() => setDraftRestored(false), 5000);
      }
    } catch (e) {
      console.warn("Failed to load draft:", e);
    }
  }, [initializePageData]);

  // Save draft locally
  const handleSaveDraft = () => {
    const draftData = {
      step,
      selectedHelp,
      immediateThreat,
      situation,
      additionalInfo,
      peopleCount,
      address,
      district,
      phone,
      contactName,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setSituation("");
    setAdditionalInfo("");
    setImmediateThreat(false);
    setPeopleCount(1);
    setStep(1);
    setDraftRestored(false);
  };

  // Step advancement validation
  const handleContinue = () => {
    setErrorMessage(null);

    if (step === 1 && !selectedHelp) {
      setErrorMessage("Please select a help category.");
      return;
    }

    if (step === 2 && !situation.trim()) {
      setErrorMessage("Please describe your situation so we know how to assist you.");
      return;
    }

    if (step === 3) {
      if (!address.trim()) {
        setErrorMessage("Please provide your current location or address.");
        return;
      }
      if (!phone.trim()) {
        setErrorMessage("Please enter a valid contact phone number.");
        return;
      }
      if (!contactName.trim()) {
        setErrorMessage("Please enter a contact name.");
        return;
      }
    }

    setStep((current) => Math.min(current + 1, 4));
  };

  // Submit Help Request to Backend API
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setErrorMessage(null);

      const payload: CreateCitizenHelpRequestPayload = {
        category: selectedHelp,
        title: selectedHelp,
        situation: situation.trim(),
        description: situation.trim(),
        immediateThreat,
        address: address.trim(),
        district: district.trim(),
        contactName: contactName.trim(),
        citizenName: contactName.trim(),
        phone: phone.trim(),
        contactPhone: phone.trim(),
        additionalInfo: additionalInfo.trim(),
        peopleCount,
        priority: immediateThreat ? "Urgent" : "Normal",
      };

      const result = await citizenRequestService.createRequest(payload);
      setSubmittedRequest(result);
      localStorage.removeItem(DRAFT_KEY);
    } catch (error: any) {
      console.error("Submission failed:", error);
      setErrorMessage(
        error.message || "Unable to submit request. Please verify connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Copy Reference ID
  const handleCopyRef = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const StepIcon = ({ index }: { index: number }) => {
    const complete = step > index + 1;
    const active = step === index + 1;

    return (
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition ${
          complete
            ? "border-[#65b9aa] bg-[#65b9aa] text-white"
            : active
            ? "border-[#287da6] bg-[#287da6] text-white shadow-sm"
            : "border-slate-200 bg-white text-slate-400"
        }`}
      >
        {complete ? <Check size={16} /> : index + 1}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="Request Help"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="min-h-screen transition-all duration-300 lg:ml-[295px]">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1300px] space-y-5 p-4 sm:p-6 lg:p-8">
          {/* HEADER / TITLE */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Request Help
                </h1>

                {/* API Status Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm ${
                    isOnline
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                  title={
                    isOnline
                      ? "Connected to CareLink Backend API"
                      : "Offline Fallback Store Active (requests will be saved locally)"
                  }
                >
                  {isOnline ? (
                    <Wifi size={13} className="text-emerald-600 animate-pulse" />
                  ) : (
                    <WifiOff size={13} className="text-amber-600" />
                  )}
                  <span>{isOnline ? "Backend API Online" : "Local Fallback Mode"}</span>
                </div>

                <button
                  onClick={initializePageData}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#287da6]"
                  title="Check API connectivity"
                >
                  <RefreshCw size={13} />
                </button>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Tell us what you need. Requests are routed directly to regional disaster coordination teams.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/citizen/my-requests")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#173d5b] shadow-sm hover:bg-slate-50"
              >
                <ClipboardList size={14} className="text-[#287da6]" />
                View My Requests
              </button>
            </div>
          </div>

          {/* DRAFT RESTORED NOTIFICATION */}
          {draftRestored && (
            <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#287da6] shrink-0" />
                <span>Restored an unsent draft from your previous session.</span>
              </div>
              <button
                onClick={handleClearDraft}
                className="font-semibold text-sky-700 underline hover:text-sky-900"
              >
                Discard draft
              </button>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* PRIVACY ASSURANCE NOTICE */}
          <div className="flex items-center gap-3 rounded-xl border border-[#cce4ed] border-l-4 border-l-[#287da6] bg-[#edf8fb] p-3.5 shadow-sm">
            <ShieldCheck size={22} className="text-[#287da6] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#173d5b]">
                Your information is protected and confidential
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600">
                Only authorised municipal dispatchers, certified healthcare teams, and verified relief drivers can access your details to fulfill this request.
              </p>
            </div>
          </div>

          {/* SUCCESS SCREEN */}
          {submittedRequest ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-md sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                <Check size={40} className="stroke-[2.5]" />
              </div>

              <h2 className="mt-6 text-xl font-bold text-[#173d5b] sm:text-2xl">
                Assistance Request Submitted!
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs text-slate-500">
                Your request has been logged and assigned to regional response coordinators in{" "}
                <span className="font-semibold text-[#173d5b]">{submittedRequest.district || "North Ward"}</span>.
              </p>

              {/* Reference ID Card */}
              <div className="mx-auto my-6 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Request Reference Number
                </p>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="font-mono text-lg font-bold text-[#287da6]">
                    {submittedRequest.id}
                  </span>
                  <button
                    onClick={() => handleCopyRef(submittedRequest.id)}
                    className="rounded p-1 text-slate-400 hover:text-slate-600"
                    title="Copy request reference ID"
                  >
                    {copiedId ? (
                      <Check size={16} className="text-emerald-600" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Quote this code if contacting support helpline 112.
                </p>
              </div>

              {/* Progress Stepper */}
              <div className="mx-auto max-w-lg rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white text-[11px] font-bold">
                      ✓
                    </div>
                    <span className="mt-1 text-[10px] font-semibold text-emerald-700">Sent</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-emerald-300 mx-2" />
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#287da6] text-white text-[11px] font-bold">
                      2
                    </div>
                    <span className="mt-1 text-[10px] font-semibold text-[#287da6]">Under Review</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-slate-200 mx-2" />
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-[11px] font-bold">
                      3
                    </div>
                    <span className="mt-1 text-[10px] text-slate-400">Dispatching</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-slate-200 mx-2" />
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-[11px] font-bold">
                      4
                    </div>
                    <span className="mt-1 text-[10px] text-slate-400">Completed</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/citizen/my-requests")}
                  className="flex items-center gap-2 rounded-xl bg-[#287da6] px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-[#1f6486] transition"
                >
                  <ClipboardList size={16} />
                  Track in My Requests
                </button>
                <button
                  onClick={() => {
                    setSubmittedRequest(null);
                    setStep(1);
                    setSituation("");
                    setAdditionalInfo("");
                    setImmediateThreat(false);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-semibold text-[#173d5b] hover:bg-slate-50 transition"
                >
                  Create another request
                </button>
              </div>
            </div>
          ) : (
            /* WIZARD FORM LAYOUT */
            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
              {/* STEP NAVIGATION RAIL */}
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Request Steps
                </div>
                <div className="space-y-1">
                  {steps.map((item, index) => {
                    const active = step === index + 1;
                    const complete = step > index + 1;

                    return (
                      <button
                        key={item}
                        onClick={() => {
                          if (complete) setStep(index + 1);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                          active
                            ? "bg-[#e8f3f7] font-semibold text-[#287da6]"
                            : complete
                            ? "text-[#173d5b] hover:bg-slate-50"
                            : "text-slate-400 cursor-not-allowed opacity-80"
                        }`}
                      >
                        <StepIcon index={index} />
                        <span className="text-xs font-medium">{item}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Save Draft in Rail */}
                <div className="mt-6 border-t border-slate-100 p-2">
                  <button
                    onClick={handleSaveDraft}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-[11px] font-medium text-[#287da6] hover:bg-sky-50 transition"
                  >
                    {saved ? <Check size={13} className="text-emerald-600" /> : <Save size={13} />}
                    <span>{saved ? "Draft Saved!" : "Save Draft"}</span>
                  </button>
                </div>
              </div>

              {/* ACTIVE STEP CARD */}
              <div className="min-h-[460px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                {/* Step Subheader */}
                <div className="mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#65b9aa]">
                      Step {step} of 4
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {Math.round((step / 4) * 100)}% Complete
                    </span>
                  </div>

                  <h2 className="mt-2 text-lg font-bold text-[#173d5b] sm:text-xl">
                    {step === 1 && "What kind of help do you need?"}
                    {step === 2 && "Tell us about your situation"}
                    {step === 3 && "Where can relief teams reach you?"}
                    {step === 4 && "Review and confirm your request"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {step === 1 && "Choose the primary category. You can add specific medical or dietary notes in the next step."}
                    {step === 2 && "Describe what happened and list any infants, elderly, or disabled members requiring assistance."}
                    {step === 3 && "Confirm current location, address landmarks, and phone contact for dispatcher verification."}
                    {step === 4 && "Check your information before submitting to regional emergency response teams."}
                  </p>
                </div>

                <div className="border-t border-slate-100" />

                {/* STEP 1: CATEGORY */}
                {step === 1 && (
                  <div className="pt-5 space-y-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {helpTypes.map((type) => {
                        const Icon = type.icon;
                        const selected = selectedHelp === type.name;

                        return (
                          <button
                            key={type.name}
                            type="button"
                            onClick={() => setSelectedHelp(type.name)}
                            className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition ${
                              selected
                                ? "border-2 border-[#287da6] bg-[#f1f8fb] shadow-sm"
                                : "border-slate-200 hover:border-[#65b9aa] hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                  selected
                                    ? "bg-[#287da6] text-white"
                                    : "bg-[#eaf5f1] text-[#398e7e] group-hover:bg-[#65b9aa] group-hover:text-white"
                                }`}
                              >
                                <Icon size={20} />
                              </div>

                              {selected && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#287da6] text-white">
                                  <Check size={13} />
                                </div>
                              )}
                            </div>

                            <div className="mt-4">
                              <h3 className="text-xs font-bold text-[#173d5b]">
                                {type.name}
                              </h3>
                              <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                                {type.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* IMMEDIATE THREAT TOGGLE */}
                    <div
                      className={`rounded-xl border p-4 transition ${
                        immediateThreat
                          ? "border-red-300 bg-red-50/60 shadow-sm"
                          : "border-slate-200 bg-slate-50/60"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={immediateThreat}
                          onChange={(e) => setImmediateThreat(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded accent-red-600 cursor-pointer"
                        />

                        <div>
                          <p className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                            <TriangleAlert size={15} />
                            This is an immediate, life-threatening emergency
                          </p>
                          <p className="mt-1 text-[11px] text-slate-600">
                            Rising flood water inside home, medical crisis, or severe trapping. Elevates priority to Urgent for emergency boat dispatch.
                          </p>
                        </div>
                      </label>

                      {immediateThreat && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-100/70 p-3 text-xs text-red-800">
                          <strong>CRITICAL WARNING:</strong> Submitting this online request does{" "}
                          <em>not</em> replace emergency rescue. If lives are currently in danger, call{" "}
                          <a href="tel:112" className="font-bold underline text-red-900">
                            112 immediately
                          </a>
                          .
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: SITUATION */}
                {step === 2 && (
                  <div className="pt-5 space-y-5">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold text-[#173d5b]">
                        Describe your current situation & needs *
                      </label>
                      <textarea
                        value={situation}
                        onChange={(e) => setSituation(e.target.value)}
                        rows={4}
                        placeholder="e.g. Ground floor flooded with 2 feet of water. Power cut off since morning. Need safe dry shelter and drinking water for 3 people."
                        className={inputClass + " resize-none text-xs leading-relaxed"}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-[#173d5b]">
                          Number of people needing assistance
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPeopleCount((p) => Math.max(1, p - 1))}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50"
                          >
                            -
                          </button>
                          <span className="w-12 text-center text-sm font-bold text-[#173d5b]">
                            {peopleCount} {peopleCount === 1 ? "person" : "people"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPeopleCount((p) => p + 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-[#173d5b]">
                          Special medical / dietary requirements (optional)
                        </label>
                        <input
                          type="text"
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                          placeholder="e.g. Elderly grandmother requires wheelchair, infant baby milk"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-600 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-[#287da6] shrink-0" />
                      <span>
                        Your situation summary will be matched against nearby active warehouses and shelters to speed up dispatch.
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 3: LOCATION & CONTACT */}
                {step === 3 && (
                  <div className="pt-5 space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold text-[#173d5b]">
                          Your current location / residential address *
                        </label>
                        <span className="text-[10px] text-slate-400">
                          Include street or nearest prominent landmark
                        </span>
                      </div>
                      <div className="relative">
                        <MapPin
                          size={16}
                          className="pointer-events-none absolute left-3 top-3 text-slate-400"
                        />
                        <input
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. 54 Riverside Lane, Near North Ward Bridge"
                          className={inputClass + " pl-9"}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-[#173d5b]">
                          District / Ward *
                        </label>
                        <input
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="e.g. North Ward"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-[#173d5b]">
                          Primary Contact Name *
                        </label>
                        <div className="relative">
                          <UserRound
                            size={16}
                            className="pointer-events-none absolute left-3 top-3 text-slate-400"
                          />
                          <input
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Full Name"
                            className={inputClass + " pl-9"}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-[#173d5b]">
                          Contact Phone Number *
                        </label>
                        <div className="relative">
                          <Phone
                            size={16}
                            className="pointer-events-none absolute left-3 top-3 text-slate-400"
                          />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+94 77 123 4567"
                            className={inputClass + " pl-9"}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-sky-50/60 p-4 text-[11px] text-sky-800">
                      <strong>Dispatcher Note:</strong> You may receive an SMS or phone call from a verified CareLink officer (+94 ...) to confirm safe delivery access before driver dispatch.
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW & CONFIRM */}
                {step === 4 && (
                  <div className="pt-5 space-y-4">
                    {/* Summary Tiles */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Selected Help Category
                        </span>
                        <p className="mt-1 text-sm font-bold text-[#173d5b]">
                          {selectedHelp}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              immediateThreat
                                ? "bg-red-100 text-red-700"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {immediateThreat ? "Urgent Priority" : "Normal Priority"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {peopleCount} {peopleCount === 1 ? "person" : "people"}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Contact & Destination
                        </span>
                        <p className="mt-1 text-xs font-bold text-[#173d5b]">
                          {contactName} ({phone})
                        </p>
                        <p className="mt-1 text-xs text-slate-600 truncate">
                          {address}
                        </p>
                        <p className="text-[10px] text-slate-400">{district}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Situation Details
                      </span>
                      <p className="mt-1 whitespace-pre-wrap text-xs text-[#173d5b] leading-relaxed">
                        {situation}
                      </p>
                      {additionalInfo && (
                        <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                          <strong>Special instructions:</strong> {additionalInfo}
                        </p>
                      )}
                    </div>

                    {immediateThreat && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
                        <TriangleAlert size={17} className="shrink-0" />
                        <span>Immediate life threat selected. Our dispatch team prioritises high-water rescue operations.</span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400">
                      By submitting, you confirm that this assistance request is accurate and required for current flood relief operations.
                    </p>
                  </div>
                )}

                {/* STEP CONTROLS / FOOTER */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div>
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => setStep((current) => current - 1)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <ArrowLeft size={14} />
                        Back
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="flex items-center gap-1.5 px-2 py-2 text-xs font-semibold text-[#287da6] hover:underline"
                      >
                        {saved ? <Check size={14} className="text-emerald-600" /> : <Save size={14} />}
                        <span>{saved ? "Draft saved successfully" : "Save and return later"}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {step < 4 ? (
                      <button
                        type="button"
                        onClick={handleContinue}
                        className="flex items-center gap-2 rounded-xl bg-[#287da6] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#1f6486] transition"
                      >
                        <span>Continue</span>
                        <ArrowRight size={15} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-[#287da6] px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-[#1f6486] transition disabled:opacity-60"
                      >
                        {submitting ? (
                          <RefreshCw size={15} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        <span>{submitting ? "Submitting Request..." : "Submit Help Request"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EMERGENCY FOOTER NOTICE */}
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-xs text-slate-500">
            <p>© 2026 CareLink Disaster Management System</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck size={14} className="text-emerald-600" />
                Verified Municipal Portal
              </span>
              <a
                href="tel:112"
                className="font-bold text-red-600 hover:underline"
              >
                Emergency: Call 112
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
