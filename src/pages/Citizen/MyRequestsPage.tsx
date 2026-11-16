
import { useState } from "react";
import {
  Heart, Search, Globe, Accessibility, Bell, Home, Plus,
  ClipboardList, Map, House, TriangleAlert, Users, FileText,
  MessageSquare, Phone, ChevronRight, Utensils, Cross, Truck,
  Package, Menu, X, MapPin, Check, Clock, Eye
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

const requests = [
  {
    id: "REQ-2841",
    date: "Submitted 22 Jun 2025 · 13:28",
    title: "Emergency shelter",
    description: "A case worker is checking your information.",
    icon: House,
    status: "Under review",
    updated: "8 minutes ago",
    progress: 2,
    color: "amber",
    message: true,
  },
  {
    id: "REQ-2794",
    date: "Submitted 20 Jun 2025 · 09:16",
    title: "Food and drinking water",
    description: "Delivery DSP-1092 is expected by 14:20.",
    icon: Utensils,
    status: "Help on the way",
    updated: "Today · 11:40",
    progress: 3,
    color: "blue",
    message: true,
  },
  {
    id: "REQ-2812",
    date: "Submitted 17 Jun 2025 · 15:42",
    title: "Medical support",
    description: "Support was delivered and confirmed.",
    icon: Cross,
    status: "Completed",
    updated: "18 Jun · 13:14",
    progress: 4,
    color: "green",
    message: false,
  },
];

const stages = ["Sent", "Under review", "Help arranged", "Completed"];

type Request = (typeof requests)[number];

export default function MyRequestsPage() {
  const [activeTab, setActiveTab] = useState("All requests");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const tabs = [
    { name: "All requests", count: 3 },
    { name: "Active", count: 2 },
    { name: "Completed" },
    { name: "Saved drafts" },
  ];

  const filteredRequests = requests.filter((request) => {
    if (activeTab === "Active") return request.progress < 4;
    if (activeTab === "Completed") return request.progress === 4;
    if (activeTab === "Saved drafts") return false;
    return true;
  });

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
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.name === "My Requests";

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
                {item.count && (
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
              <p className="text-[10px] font-semibold">
                Emergency help line
              </p>
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

      {/* MAIN */}
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
              <p className="text-[9px] text-slate-400">North Ward</p>
            </div>
            <ChevronRight size={17} />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6">

          {/* TITLE */}
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">My requests</h2>
              <p className="mt-2 text-xs text-slate-500">
                Track your help requests and see every update from response teams.
              </p>
            </div>

            <button
              onClick={() => {
                window.location.href = "/request-help";
              }}
              className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1d688e]"
            >
              <Plus size={15} />
              New request
            </button>
          </section>

          {/* TABS */}
          <section className="flex flex-wrap items-center gap-6 border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setSelectedRequest(null);
                }}
                className={`flex items-center gap-2 border-b-2 pb-3 text-[10px] transition ${
                  activeTab === tab.name
                    ? "border-[#287da6] font-bold text-[#287da6]"
                    : "border-transparent text-slate-500 hover:text-[#287da6]"
                }`}
              >
                {tab.name}
                {tab.count !== undefined && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px]">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </section>

          {/* REQUEST CARDS */}
          {activeTab === "Saved drafts" ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <FileText size={35} className="mx-auto text-slate-300" />
              <p className="mt-4 text-sm font-semibold">No saved drafts</p>
              <p className="mt-2 text-xs text-slate-500">
                Your unfinished requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const Icon = request.icon;

                const statusStyle =
                  request.color === "amber"
                    ? "bg-amber-100 text-amber-700"
                    : request.color === "blue"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-emerald-100 text-emerald-700";

                return (
                  <article
                    key={request.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    {/* REQUEST HEADER */}
                    <div className="flex flex-wrap items-start justify-between gap-3 bg-slate-50/80 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e7f2f7] text-[#287da6]">
                          <Icon size={19} />
                        </div>

                        <div>
                          <p className="text-[9px] text-slate-400">
                            {request.id} · {request.date}
                          </p>
                          <h3 className="mt-1 text-xs font-bold">
                            {request.title}
                          </h3>
                          <p className="mt-2 text-[10px] text-slate-500">
                            {request.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-md px-2 py-1 text-[9px] font-semibold ${statusStyle}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    {/* PROGRESS TRACKER */}
                    <div className="px-4 py-5 sm:px-6">
                      <div className="relative flex items-start justify-between">

                        {/* PROGRESS LINE */}
                        <div className="absolute left-[12%] right-[12%] top-[7px] h-[2px] bg-slate-200">
                          <div
                            className="h-full bg-[#58b39d] transition-all"
                            style={{
                              width: `${((request.progress - 1) / 3) * 100}%`,
                            }}
                          />
                        </div>

                        {/* STAGES */}
                        {stages.map((stage, index) => {
                          const completed = index < request.progress;

                          return (
                            <div
                              key={stage}
                              className="relative z-10 flex w-1/4 flex-col items-center"
                            >
                              <div
                                className={`flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 ${
                                  completed
                                    ? "border-[#58b39d] bg-[#58b39d] text-white"
                                    : "border-slate-200 bg-white text-slate-300"
                                }`}
                              >
                                {completed && <Check size={10} />}
                              </div>

                              <span
                                className={`mt-2 text-center text-[8px] sm:text-[9px] ${
                                  completed
                                    ? "font-semibold text-[#438f80]"
                                    : "text-slate-400"
                                }`}
                              >
                                {stage}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CARD FOOTER */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
                      <p className="text-[9px] text-slate-400">
                        Last updated: {request.updated}
                      </p>

                      <div className="flex items-center gap-2">
                        {request.message && (
                          <button
                            onClick={() =>
                              alert("Connect this button to your Messages page.")
                            }
                            className="flex items-center gap-1 rounded-md border border-[#287da6] px-3 py-2 text-[9px] font-semibold text-[#287da6] hover:bg-sky-50"
                          >
                            <MessageSquare size={12} />
                            Message support
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="flex items-center gap-1 rounded-md bg-[#287da6] px-3 py-2 text-[9px] font-semibold text-white hover:bg-[#1d688e]"
                        >
                          <Eye size={12} />
                          View details
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {filteredRequests.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                  <ClipboardList
                    size={35}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-3 text-sm font-semibold">
                    No requests found
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    There are no requests in this category.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support</p>
            <p className="flex items-center gap-2">
              <Heart size={13} />
              Supporting communities together
            </p>
          </footer>
        </div>
      </main>

      {/* REQUEST DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">

            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Request details</h3>
              <button onClick={() => setSelectedRequest(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <p className="text-[10px] text-slate-400">
                REQUEST ID
              </p>
              <p className="mt-1 text-sm font-bold">
                {selectedRequest.id}
              </p>

              <p className="mt-4 text-[10px] text-slate-400">
                HELP CATEGORY
              </p>
              <p className="mt-1 text-xs font-semibold">
                {selectedRequest.title}
              </p>

              <p className="mt-4 text-[10px] text-slate-400">
                CURRENT STATUS
              </p>
              <p className="mt-1 text-xs font-semibold">
                {selectedRequest.status}
              </p>

              <p className="mt-4 text-[10px] text-slate-400">
                DESCRIPTION
              </p>
              <p className="mt-1 text-xs">
                {selectedRequest.description}
              </p>

              <p className="mt-4 text-[10px] text-slate-400">
                LAST UPDATED
              </p>
              <p className="mt-1 text-xs">
                {selectedRequest.updated}
              </p>
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="mt-5 w-full rounded-lg bg-[#287da6] py-3 text-xs font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
