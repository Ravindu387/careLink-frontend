
import { useState } from "react";
import {
  Heart,
  Search,
  Globe,
  Bell,
  Accessibility,
  Home,
  Plus,
  ClipboardList,
  Map,
  House,
  TriangleAlert,
  Users,
  FileText,
  MessageSquare,
  Phone,
  ChevronRight,
  Star,
  Menu,
  X,
  CheckCircle,
  Send,
} from "lucide-react";

const navigation = [
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
  { name: "Profile & Settings", icon: Accessibility },
];

export default function FeedbackPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("Using the citizen portal");
  const [feedback, setFeedback] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConcern, setShowConcern] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !feedback.trim()) {
      alert("Please select a rating and enter your feedback.");
      return;
    }

    setSubmitted(true);
  };

  const resetForm = () => {
    setRating(0);
    setFeedback("");
    setCategory("Using the citizen portal");
    setAnonymous(false);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">

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
              <p className="text-[10px] text-sky-200">
                Citizen Support
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* ACTIVE RESPONSE */}
        <div className="mx-3 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Local Response
          </p>

          <p className="mt-2 text-xs font-bold">
            Greater Riverton Floods
          </p>

          <p className="mt-1 text-[10px] text-sky-200">
            Help centres and shelters are open
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="px-5 pb-2 pt-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Your Support
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.name === "Feedback";

            return (
              <button
                key={item.name}
                onClick={() => setSidebarOpen(false)}
                className={`flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-left text-xs ${
                  active
                    ? "border-[#65b9aa] bg-[#287da6] font-semibold text-white"
                    : "border-transparent text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />

                <span className="flex-1">{item.name}</span>

                {item.count && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* EMERGENCY CONTACT */}
        <div className="mx-3 mb-3 rounded-xl bg-white p-3 text-[#173d5b]">
          <div className="flex items-center gap-3">
            <Phone size={20} />

            <div>
              <p className="text-[10px] font-semibold">
                Emergency help line
              </p>

              <a
                href="tel:112"
                className="text-sm font-bold text-red-600"
              >
                Call 112
              </a>
            </div>
          </div>
        </div>

        {/* PROFILE */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold">
            SK
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold">Samira Khan</p>
            <p className="text-[10px] text-sky-200">
              Citizen account
            </p>
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

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">

          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
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
              <p className="text-[9px] text-slate-400">
                North Ward
              </p>
            </div>

            <ChevronRight size={17} />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1200px] p-4 sm:p-6">

          {/* PAGE TITLE */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold">
              Feedback
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Tell us what worked and what should improve. Feedback does not affect your requests.
            </p>
          </section>

          {/* FORM AND SIDE CARDS */}
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">

            {/* FEEDBACK FORM */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

              {!submitted ? (
                <form onSubmit={handleSubmit}>

                  <h3 className="text-sm font-semibold">
                    Share your experience
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Your feedback helps make support clearer, safer, and more accessible.
                  </p>

                  <div className="my-4 border-t border-slate-200" />

                  {/* CATEGORY */}
                  <div className="mb-5">
                    <label className="mb-2 block text-[10px] font-semibold">
                      What would you like to comment on?
                    </label>

                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-xs outline-none focus:border-[#287da6]"
                    >
                      <option>Using the citizen portal</option>
                      <option>Requesting help</option>
                      <option>Finding nearby support</option>
                      <option>Shelter services</option>
                      <option>Safety updates</option>
                      <option>Communication and support</option>
                      <option>Accessibility</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* STAR RATING */}
                  <div className="mb-5">
                    <label className="mb-2 block text-[10px] font-semibold">
                      How was your experience?
                    </label>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="rounded-md border border-slate-200 p-2 transition hover:border-amber-400"
                          aria-label={`${star} stars`}
                        >
                          <Star
                            size={17}
                            className={
                              star <= (hoverRating || rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }
                          />
                        </button>
                      ))}
                    </div>

                    <p className="mt-2 text-[9px] text-slate-400">
                      {rating === 0
                        ? "Select a rating from 1 to 5 stars"
                        : `${rating} out of 5 stars selected`}
                    </p>
                  </div>

                  {/* FEEDBACK TEXT */}
                  <div className="mb-4">
                    <label className="mb-2 block text-[10px] font-semibold">
                      Tell us more
                    </label>

                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="What went well? What could be clearer or easier?"
                      rows={5}
                      required
                      className="w-full resize-y rounded-lg border border-slate-300 p-3 text-xs outline-none placeholder:text-slate-400 focus:border-[#287da6]"
                    />
                  </div>

                  {/* ANONYMOUS CHECKBOX */}
                  <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="mt-0.5 accent-[#287da6]"
                    />

                    <div>
                      <p className="text-[10px] font-semibold">
                        Send anonymously
                      </p>

                      <p className="mt-1 text-[9px] text-slate-500">
                        Your name will not be attached to this feedback.
                      </p>
                    </div>
                  </label>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-3 text-[10px] font-semibold text-white hover:bg-[#1c6388]"
                  >
                    <Send size={14} />
                    Send feedback
                  </button>

                </form>
              ) : (
                /* SUCCESS MESSAGE */
                <div className="flex flex-col items-center py-12 text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle
                      size={36}
                      className="text-emerald-600"
                    />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold">
                    Thank you for your feedback!
                  </h3>

                  <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">
                    Your feedback has been submitted successfully.
                    We appreciate your help in improving ReliefOS.
                  </p>

                  <button
                    onClick={resetForm}
                    className="mt-6 rounded-lg bg-[#287da6] px-5 py-3 text-xs font-semibold text-white hover:bg-[#1c6388]"
                  >
                    Submit another feedback
                  </button>
                </div>
              )}
            </section>

            {/* RIGHT SIDE CARDS */}
            <div className="space-y-4">

              {/* REPORT CONCERN */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                  <TriangleAlert
                    size={19}
                    className="text-sky-600"
                  />
                </div>

                <h3 className="text-xs font-semibold">
                  Need to report a safety concern?
                </h3>

                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  For urgent safety issues or misleading information, use the dedicated reporting channel.
                </p>

                <button
                  onClick={() => setShowConcern(!showConcern)}
                  className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-[10px] font-semibold text-[#287da6] hover:bg-sky-50"
                >
                  {showConcern ? "Close" : "Report a concern"}
                </button>

                {showConcern && (
                  <div className="mt-3 rounded-lg bg-sky-50 p-3">
                    <p className="text-[10px] font-semibold">
                      Safety reporting
                    </p>
                    <p className="mt-2 text-[10px] leading-5 text-slate-600">
                      Please contact the emergency response team for immediate danger.
                    </p>
                    <a
                      href="tel:112"
                      className="mt-2 inline-block text-xs font-bold text-red-600"
                    >
                      Call 112
                    </a>
                  </div>
                )}
              </div>

              {/* EMERGENCY CONTACT */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                  <Phone
                    size={18}
                    className="text-sky-600"
                  />
                </div>

                <h3 className="text-xs font-semibold">
                  Prefer to speak with someone?
                </h3>

                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  Citizen support is available if you need assistance.
                </p>

                <a
                  href="tel:112"
                  className="mt-3 inline-block text-xs font-bold text-[#287da6] hover:underline"
                >
                  Call 112
                </a>
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <footer className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support</p>
            <p>Stay safe. Stay informed.</p>
          </footer>

        </div>
      </main>
    </div>
  );
}
