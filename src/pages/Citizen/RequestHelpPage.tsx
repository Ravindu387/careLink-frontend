
import { useState } from "react";
import {
  Heart, Search, Globe, Accessibility, Bell, Home, Plus,
  ClipboardList, Map, House, TriangleAlert, Users, FileText,
  MessageSquare, Phone, ChevronRight, MapPin, Utensils,
  Cross, Truck, Package, Menu, X, ShieldCheck, ArrowLeft,
  ArrowRight, Check, Save, UserRound
} from "lucide-react";

const sidebarItems = [
  { name: "Home", icon: Home },
  { name: "Request Help", icon: Plus },
  { name: "My Requests", icon: ClipboardList, count: 2 },
  { name: "Nearby Support", icon: Map },
  { name: "Shelters", icon: House },
  { name: "Safety Updates", icon: TriangleAlert, count: 3 },
  { name: "My Household", icon: Users },
  { name: "My Documents", icon: FileText },
  { name: "Messages", icon: MessageSquare, count: 2 },
  { name: "Notifications", icon: Bell, count: 4 },
  { name: "Feedback", icon: Heart },
];

const helpTypes = [
  { name: "Emergency shelter", icon: House },
  { name: "Food and water", icon: Utensils },
  { name: "Medical support", icon: Cross },
  { name: "Safe transport", icon: Truck },
  { name: "Family support", icon: Users },
  { name: "Other help", icon: Package },
];

const steps = [
  "Type of help",
  "Your situation",
  "Location & contact",
  "Review & send",
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs text-[#173d5b] outline-none focus:border-[#287da6] focus:ring-2 focus:ring-sky-100";

export default function RequestHelpPage() {
  const [step, setStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedHelp, setSelectedHelp] = useState("Emergency shelter");
  const [immediateThreat, setImmediateThreat] = useState(false);
  const [situation, setSituation] = useState("");
  const [address, setAddress] = useState("North Ward, Greater Riverton");
  const [phone, setPhone] = useState("+94 77 123 4567");
  const [contactName, setContactName] = useState("Samira Khan");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSave = () => {
    const data = {
      step,
      selectedHelp,
      immediateThreat,
      situation,
      address,
      phone,
      contactName,
      additionalInfo,
    };

    localStorage.setItem("reliefos-help-draft", JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleContinue = () => {
    if (step === 1 && !selectedHelp) {
      alert("Please select a help category.");
      return;
    }

    if (step === 2 && !situation.trim()) {
      alert("Please describe your situation.");
      return;
    }

    if (step === 3 && (!address.trim() || !phone.trim())) {
      alert("Please enter your location and contact number.");
      return;
    }

    setStep((current) => Math.min(current + 1, 4));
  };

  const handleSubmit = async () => {
    const requestData = {
      category: selectedHelp,
      situation,
      immediateThreat,
      address,
      phone,
      contactName,
      additionalInfo,
    };

    try {
      // Connect to your backend API here.
      // const response = await fetch("/api/citizen/requests", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(requestData),
      // });
      //
      // if (!response.ok) throw new Error("Request failed");

      console.log("Help request:", requestData);

      setSubmitted(true);
      localStorage.removeItem("reliefos-help-draft");
    } catch (error) {
      console.error(error);
      alert("Unable to submit request. Please try again.");
    }
  };

  const StepIcon = ({ index }: { index: number }) => {
    const complete = step > index + 1;
    const active = step === index + 1;

    return (
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs ${
          complete
            ? "border-[#65b9aa] bg-[#65b9aa] text-white"
            : active
            ? "border-[#287da6] bg-[#287da6] text-white"
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
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[295px] flex-col bg-[#153e5e] text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-[74px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#65b9aa] text-[#153e5e]">
              <Heart size={23} />
            </div>
            <div>
              <h1 className="text-xl font-bold">ReliefOS</h1>
              <p className="text-[10px] text-sky-200">Citizen Support</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* ACTIVE RESPONSE */}
        <div className="mx-3 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Local Response
          </p>
          <p className="mt-2 text-xs font-bold">Greater Riverton Floods</p>
          <p className="mt-1 text-[10px] text-sky-200">
            Help centres and shelters are open
          </p>
        </div>

        <div className="mt-5 px-5">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Your Support
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = item.name === "Request Help";

            return (
              <button
                key={item.name}
                onClick={() => setSidebarOpen(false)}
                className={`flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-left text-xs transition ${
                  active
                    ? "border-[#65b9aa] bg-[#287da6] font-semibold text-white"
                    : "border-transparent text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />
                <span className="flex-1">{item.name}</span>
                {"count" in item && item.count && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* EMERGENCY */}
        <div className="mx-3 mb-3 rounded-xl bg-white p-3 text-[#173d5b]">
          <div className="flex items-center gap-3">
            <Phone size={20} />
            <div>
              <p className="text-[10px] font-semibold">Emergency help line</p>
              <a href="tel:112" className="text-sm font-bold text-red-600">
                Call 112
              </a>
            </div>
          </div>
        </div>

        {/* USER */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold">
            SK
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold">Samira Khan</p>
            <p className="text-[10px] text-sky-200">Citizen account</p>
          </div>
          <ChevronRight size={17} />
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[295px]">

        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">

          <div className="flex flex-1 items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu size={22} />
            </button>

            <div className="flex max-w-[520px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
              <Search size={17} className="text-slate-400" />
              <input
                placeholder="Search help, shelters, services..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:flex">
              <Globe size={15} />
              English
            </button>

            <button className="hidden rounded-lg border border-slate-200 p-2 sm:block">
              <Accessibility size={18} />
            </button>

            <button className="relative rounded-lg border border-slate-200 p-2">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">
                4
              </span>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold text-white">
              SK
            </div>

            <div className="hidden sm:block">
              <p className="text-[10px] font-bold">Samira</p>
              <p className="text-[9px] text-slate-400">North Ward</p>
            </div>
            <ChevronRight size={17} />
          </div>
        </header>

        {/* CONTENT */}
        <div className="space-y-4 p-4 sm:p-6">

          {/* PAGE TITLE */}
          <section>
            <h2 className="text-xl font-semibold">Request help</h2>
            <p className="mt-2 text-xs text-slate-500">
              Tell us what you need. You can save and return at any time.
            </p>
          </section>

          {/* PRIVACY NOTICE */}
          <div className="flex items-center gap-3 rounded-lg border border-[#cce4ed] border-l-[3px] bg-[#edf8fb] p-3">
            <ShieldCheck size={20} className="text-[#287da6]" />
            <div>
              <p className="text-[10px] font-bold">Your information is protected</p>
              <p className="mt-1 text-[9px] text-slate-500">
                Only authorised response teams can view details needed to support this request.
              </p>
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check size={32} />
              </div>
              <h3 className="mt-5 text-lg font-bold">Request submitted!</h3>
              <p className="mt-2 text-xs text-slate-500">
                Your help request has been prepared successfully.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setStep(1);
                }}
                className="mt-6 rounded-lg bg-[#287da6] px-5 py-3 text-xs font-semibold text-white"
              >
                Create another request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[176px_minmax(0,1fr)]">

              {/* STEP INDICATOR */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                {steps.map((item, index) => {
                  const active = step === index + 1;
                  const complete = step > index + 1;

                  return (
                    <button
                      key={item}
                      onClick={() => {
                        if (complete) setStep(index + 1);
                      }}
                      className={`mb-2 flex w-full items-center gap-3 rounded-lg p-3 text-left last:mb-0 ${
                        active ? "bg-[#e8f3f7]" : "bg-white"
                      }`}
                    >
                      <StepIcon index={index} />
                      <span
                        className={`text-[10px] ${
                          active
                            ? "font-bold text-[#287da6]"
                            : "text-slate-500"
                        }`}
                      >
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* FORM CARD */}
              <div className="min-h-[440px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

                <div className="mb-5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#65b9aa]">
                    Step {step} of 4
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    {step === 1 && "What kind of help do you need?"}
                    {step === 2 && "Tell us about your situation"}
                    {step === 3 && "Where can we reach you?"}
                    {step === 4 && "Review your request"}
                  </h3>

                  <p className="mt-2 text-[10px] text-slate-500">
                    {step === 1 && "Choose the closest option. You can add more details next."}
                    {step === 2 && "Describe your current situation so we can understand how to help."}
                    {step === 3 && "Provide your location and contact details."}
                    {step === 4 && "Check your information before sending your request."}
                  </p>
                </div>

                <div className="border-t border-slate-200" />

                {/* STEP 1 */}
                {step === 1 && (
                  <div className="pt-4">

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {helpTypes.map((type) => {
                        const Icon = type.icon;
                        const selected = selectedHelp === type.name;

                        return (
                          <button
                            key={type.name}
                            onClick={() => setSelectedHelp(type.name)}
                            className={`relative flex min-h-[72px] items-center gap-3 rounded-lg border p-3 text-left transition ${
                              selected
                                ? "border-2 border-[#287da6] bg-[#f1f8fb]"
                                : "border-slate-200 hover:border-[#65b9aa]"
                            }`}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf5f1] text-[#398e7e]">
                              <Icon size={19} />
                            </div>

                            <span className="text-[10px] font-semibold">
                              {type.name}
                            </span>

                            {selected && (
                              <Check
                                size={15}
                                className="absolute right-3 top-3 text-[#287da6]"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* IMMEDIATE THREAT */}
                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <input
                        type="checkbox"
                        checked={immediateThreat}
                        onChange={(e) => setImmediateThreat(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-[#287da6]"
                      />

                      <div>
                        <p className="text-[10px] font-semibold">
                          This is an immediate threat to life
                        </p>
                        <p className="mt-1 text-[9px] text-slate-500">
                          If someone is in immediate danger, call 112 now.
                        </p>
                      </div>
                    </label>

                    {immediateThreat && (
                      <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                        <TriangleAlert size={15} className="mr-2 inline" />
                        For immediate danger, call{" "}
                        <a href="tel:112" className="font-bold underline">
                          112
                        </a>
                        . Submitting this form does not replace emergency services.
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="space-y-5 pt-5">
                    <div>
                      <label className="mb-2 block text-[10px] font-semibold">
                        Describe your situation *
                      </label>
                      <textarea
                        value={situation}
                        onChange={(e) => setSituation(e.target.value)}
                        rows={5}
                        placeholder="Please explain what happened and what assistance you need..."
                        className={inputClass + " resize-none"}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-semibold">
                        Additional information (optional)
                      </label>
                      <textarea
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        rows={3}
                        placeholder="Any other details that may help our response team..."
                        className={inputClass + " resize-none"}
                      />
                    </div>

                    <div className="rounded-lg bg-[#edf8fb] p-3 text-[10px] text-slate-600">
                      <ShieldCheck size={16} className="mr-2 inline text-[#287da6]" />
                      Your information will only be shared with authorised support teams.
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div className="space-y-4 pt-5">

                    <div>
                      <label className="mb-2 block text-[10px] font-semibold">
                        Your location *
                      </label>
                      <div className="relative">
                        <MapPin
                          size={16}
                          className="absolute left-3 top-3.5 text-slate-400"
                        />
                        <input
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter your address or location"
                          className={inputClass + " pl-9"}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-semibold">
                        Contact name *
                      </label>
                      <div className="relative">
                        <UserRound
                          size={16}
                          className="absolute left-3 top-3.5 text-slate-400"
                        />
                        <input
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className={inputClass + " pl-9"}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-semibold">
                        Contact number *
                      </label>
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-3 top-3.5 text-slate-400"
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={inputClass + " pl-9"}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#edf8fb] p-3 text-[10px] text-slate-500">
                      Our response team may contact you using these details.
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <div className="space-y-3 pt-5">

                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-[10px] font-bold text-slate-400">
                        HELP CATEGORY
                      </p>
                      <p className="mt-2 text-sm font-semibold">
                        {selectedHelp}
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-[10px] font-bold text-slate-400">
                        YOUR SITUATION
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-xs">
                        {situation}
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-[10px] font-bold text-slate-400">
                        LOCATION & CONTACT
                      </p>
                      <p className="mt-2 text-xs font-semibold">
                        {contactName}
                      </p>
                      <p className="mt-1 text-xs">{address}</p>
                      <p className="mt-1 text-xs">{phone}</p>
                    </div>

                    {immediateThreat && (
                      <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600">
                        <TriangleAlert size={15} className="mr-2 inline" />
                        Immediate threat to life selected.
                      </div>
                    )}

                    <p className="text-[10px] text-slate-500">
                      Please ensure all information is correct before submitting.
                    </p>
                  </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">

                  <div>
                    {step > 1 ? (
                      <button
                        onClick={() => setStep((current) => current - 1)}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <ArrowLeft size={14} />
                        Back
                      </button>
                    ) : (
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-3 py-2 text-[10px] font-semibold text-[#287da6] hover:underline"
                      >
                        {saved ? <Check size={14} /> : <Save size={14} />}
                        {saved ? "Saved successfully" : "Save and finish later"}
                      </button>
                    )}
                  </div>

                  {step < 4 ? (
                    <button
                      onClick={handleContinue}
                      className="flex items-center gap-2 rounded-lg bg-[#287da6] px-5 py-3 text-xs font-semibold text-white hover:bg-[#1e688e]"
                    >
                      Continue
                      <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 rounded-lg bg-[#287da6] px-5 py-3 text-xs font-semibold text-white hover:bg-[#1e688e]"
                    >
                      <Check size={15} />
                      Submit request
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support</p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={13} />
              Your information is protected
            </p>
          </footer>

        </div>
      </main>
    </div>
  );
}
