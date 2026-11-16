
import { useState } from "react";
import {
  Heart,
  Search,
  Globe,
  Accessibility,
  Bell,
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
  MapPin,
  Utensils,
  Cross,
  Truck,
  Package,
  Clock,
  CheckCircle,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
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

const categories = [
  {
    title: "Emergency shelter",
    description: "Find a safe place to stay",
    icon: House,
  },
  {
    title: "Food and water",
    description: "Request essential supplies",
    icon: Utensils,
  },
  {
    title: "Medical support",
    description: "Get urgent health assistance",
    icon: Cross,
  },
  {
    title: "Safe transport",
    description: "Ask for evacuation or accessible travel",
    icon: Truck,
  },
  {
    title: "Family support",
    description: "Help for children, older adults, or disability",
    icon: Users,
  },
  {
    title: "Other essential help",
    description: "Tell us what you need",
    icon: Package,
  },
];

const requests = [
  {
    id: "REQ-2841",
    title: "Emergency shelter",
    description: "A case worker is checking your information.",
    status: "Under review",
    time: "8 minutes ago",
    icon: House,
    color: "blue",
  },
  {
    id: "REQ-2794",
    title: "Food and drinking water",
    description: "Delivery DSP-1092 is expected by 14:20.",
    status: "Help on the way",
    time: "Today · 11:40",
    icon: Utensils,
    color: "green",
  },
];

const locations = [
  {
    name: "North Community Support Centre",
    distance: "0.8 km",
    hours: "Open until 20:00",
    status: "Open",
    icon: MapPin,
  },
  {
    name: "Riverton High School",
    distance: "1.4 km",
    hours: "Open 24 hours",
    status: "Space available",
    icon: MapPin,
  },
  {
    name: "Eastbank Mobile Clinic",
    distance: "2.1 km",
    hours: "Open until 18:00",
    status: "Open",
    icon: Cross,
  },
];

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategory = (category: string) => {
    setSelectedCategory(category);
    setShowRequest(true);
  };

  const handleRequestSubmit = async () => {
    try {
      // Connect with your backend API.
      // await fetch("/api/citizen/requests", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ category: selectedCategory })
      // });

      alert("Request submitted successfully!");
      setShowRequest(false);
      setSelectedCategory("");
    } catch (error) {
      console.error("Request submission failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#173d5b]">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[295px] flex-col bg-[#153e5e] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* LOGO */}
        <div className="flex h-[74px] items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#65b9aa]">
              <Heart size={23} className="text-[#153e5e]" />
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

        {/* ACTIVE OPERATION */}
        <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/10 p-4">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Local Response
          </p>

          <h3 className="mt-2 text-xs font-bold">
            Greater Riverton Floods
          </h3>

          <p className="mt-1 text-[10px] text-sky-200">
            Help centres and shelters are open
          </p>
        </div>

        {/* MENU */}
        <div className="mt-5 px-4">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Your Support
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeMenu === item.name;

            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveMenu(item.name);
                  setSidebarOpen(false);

                  if (item.name === "Request Help") {
                    setShowRequest(true);
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-left text-xs transition ${
                  active
                    ? "border-[#65b9aa] bg-[#287da6] font-semibold text-white"
                    : "border-transparent text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />

                <span className="flex-1">{item.name}</span>

                {"count" in item && item.count && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* EMERGENCY HELPLINE */}
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

        {/* USER */}
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
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[295px]">

        {/* TOP NAVIGATION */}
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

        {/* PAGE */}
        <div className="space-y-6 p-4 sm:p-6">

          {/* WELCOME BANNER */}
          <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#164768] to-[#287da6] p-6 text-white shadow-lg sm:p-8">

            <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">

              <div className="max-w-[580px]">
                <p className="text-xs text-sky-100">
                  Good afternoon, Samira
                </p>

                <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">
                  How can we support you today?
                </h2>

                <p className="mt-3 text-xs text-sky-100">
                  Request help, check your applications, and find trusted services near you.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">

                  <button
                    onClick={() => setShowRequest(true)}
                    className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-3 text-xs font-semibold text-white hover:bg-[#20698e]"
                  >
                    <Plus size={16} />
                    Request help now
                  </button>

                  <button
                    onClick={() => setActiveMenu("Nearby Support")}
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-xs font-semibold text-[#173d5b] hover:bg-slate-100"
                  >
                    <Map size={16} />
                    Find nearby support
                  </button>

                </div>
              </div>

              {/* ACTIVE ALERT */}
              <div className="flex max-w-[370px] items-center gap-3 rounded-xl bg-white p-4 text-[#173d5b]">

                <div className="rounded-lg bg-red-50 p-3 text-red-500">
                  <TriangleAlert size={22} />
                </div>

                <div className="rounded-md bg-red-50 px-2 py-3 text-[9px] font-bold text-red-600">
                  ACTIVE ALERT
                </div>

                <div className="flex-1">
                  <p className="text-[11px] font-bold">
                    Evacuation notice for Riverside blocks A-D
                  </p>

                  <p className="mt-1 text-[9px] text-slate-500">
                    Use Market Road to reach North Community Hall. Do not use Riverside Bridge.
                  </p>
                </div>

                <button
                  onClick={() => setActiveMenu("Safety Updates")}
                  className="text-[10px] font-semibold text-[#287da6]"
                >
                  Read safety update
                  <ArrowRight size={13} className="ml-1 inline" />
                </button>
              </div>
            </div>
          </section>

          {/* HELP CATEGORIES */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-semibold">
                What do you need help with?
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Choose a category to start a simple request.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <button
                    key={category.title}
                    onClick={() => handleCategory(category.title)}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#65b9aa] hover:shadow-md"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#e8f5f1] text-[#268b79]">
                      <Icon size={21} />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-bold">
                        {category.title}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {category.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-500 transition group-hover:translate-x-1"
                    />

                  </button>
                );
              })}

            </div>
          </section>

          {/* REQUESTS AND NEARBY SUPPORT */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">

            {/* ACTIVE REQUESTS */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Your active requests
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    We will show every change here.
                  </p>
                </div>

                <button
                  onClick={() => setActiveMenu("My Requests")}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#287da6]"
                >
                  View all
                  <ChevronRight size={15} />
                </button>
              </div>

              {requests.map((request) => {
                const Icon = request.icon;

                return (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 border-b border-slate-100 p-4 transition hover:bg-slate-50"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e8f5f1] text-[#287da6]">
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] text-slate-400">
                        {request.id}
                      </p>

                      <p className="mt-1 text-xs font-bold">
                        {request.title}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {request.description}
                      </p>
                    </div>

                    <div className="hidden text-right sm:block">
                      <span
                        className={`rounded-md px-2 py-1 text-[9px] font-semibold ${
                          request.color === "blue"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        {request.status}
                      </span>

                      <p className="mt-2 text-[9px] text-slate-400">
                        {request.time}
                      </p>
                    </div>

                    <ChevronRight size={17} className="shrink-0 text-slate-500" />

                  </div>
                );
              })}

            </div>

            {/* NEARBY HELP */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Closest help
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Based on North Ward
                  </p>
                </div>

                <button
                  onClick={() => setActiveMenu("Nearby Support")}
                  className="text-[10px] font-semibold text-[#287da6]"
                >
                  View map
                </button>
              </div>

              {locations.map((location) => {
                const Icon = location.icon;

                return (
                  <div
                    key={location.name}
                    className="flex items-center gap-3 border-b border-slate-100 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f5f1] text-[#287da6]">
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold">
                        {location.name}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-500">
                        {location.distance} · {location.hours}
                      </p>
                    </div>

                    <span className="rounded-md bg-[#e5f5ef] px-2 py-2 text-[9px] font-semibold text-[#23866f]">
                      {location.status}
                    </span>
                  </div>
                );
              })}

            </div>
          </section>

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-5 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support</p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={13} />
              Your information is protected
            </p>
          </footer>

        </div>
      </main>

      {/* REQUEST HELP MODAL */}
      {showRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Request Help
              </h3>

              <button onClick={() => setShowRequest(false)}>
                <X size={20} />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Select the type of assistance you need.
            </p>

            <label className="mt-5 block text-xs font-semibold">
              Help category
            </label>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-xs outline-none focus:border-sky-500"
            >
              <option value="">Select a category</option>

              {categories.map(category => (
                <option key={category.title} value={category.title}>
                  {category.title}
                </option>
              ))}
            </select>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowRequest(false)}
                className="rounded-lg border border-slate-200 px-4 py-3 text-xs"
              >
                Cancel
              </button>

              <button
                disabled={!selectedCategory}
                onClick={handleRequestSubmit}
                className="rounded-lg bg-[#287da6] px-5 py-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit Request
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
