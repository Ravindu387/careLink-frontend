
import { useState } from "react";
import {
  Heart, Search, Globe, Accessibility, Bell, Home, Plus,
  ClipboardList, Map, House, TriangleAlert, Users, FileText,
  MessageSquare, Phone, ChevronRight, Menu, X, MapPin,
  Share2, Clock, Droplet, CloudRain, ShieldAlert, Info,
  CheckCircle, Navigation, ShieldCheck, Megaphone
} from "lucide-react";

interface SafetyUpdate {
  id: number;
  type: string;
  title: string;
  description: string;
  location: string;
  time: string;
  level: "Emergency alert" | "Warning" | "Service update";
}

const updates: SafetyUpdate[] = [
  {
    id: 1,
    type: "Emergency alert",
    title: "Evacuate Riverside blocks A–D",
    description:
      "Flood water is rising. Move to North Community Hall using Market Road. Do not use Riverside Bridge.",
    location: "Riverside · North Ward",
    time: "12 minutes ago",
    level: "Emergency alert",
  },
  {
    id: 2,
    type: "Warning",
    title: "Heavy rainfall expected until 18:00",
    description:
      "Avoid low-lying roads and keep essential medicines and documents ready.",
    location: "Greater Riverton",
    time: "38 minutes ago",
    level: "Warning",
  },
  {
    id: 3,
    type: "Service update",
    title: "Drinking water point opened",
    description:
      "Safe drinking water is available at North Community Support Centre. Bring clean containers if possible.",
    location: "North Ward",
    time: "1 hour ago",
    level: "Service update",
  },
];

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

export default function SafetyUpdatesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUpdate, setSelectedUpdate] =
    useState<SafetyUpdate | null>(null);
  const [activeArea, setActiveArea] = useState("North Ward");
  const [savedAreas, setSavedAreas] = useState([
    "North Ward",
    "Greater Riverton",
  ]);

  const filteredUpdates = updates.filter((update) => {
    const query = search.toLowerCase();

    return (
      update.title.toLowerCase().includes(query) ||
      update.description.toLowerCase().includes(query) ||
      update.location.toLowerCase().includes(query)
    );
  });

  const shareUpdate = async (update: SafetyUpdate) => {
    const text = `${update.title}\n${update.description}\n${update.location}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: update.title,
          text,
        });
      } catch {
        // Sharing cancelled
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      alert("Update copied to clipboard!");
    }
  };

  const getUpdateStyle = (level: string) => {
    switch (level) {
      case "Emergency alert":
        return {
          icon: TriangleAlert,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-l-red-500",
          badge: "bg-red-50 text-red-600",
        };

      case "Warning":
        return {
          icon: CloudRain,
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-l-amber-500",
          badge: "bg-amber-50 text-amber-700",
        };

      default:
        return {
          icon: Droplet,
          color: "text-sky-600",
          bg: "bg-sky-50",
          border: "border-l-sky-600",
          badge: "bg-sky-50 text-sky-700",
        };
    }
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
            const active = item.name === "Safety Updates";

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
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px]">
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

        {/* PAGE */}
        <div className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-6">

          {/* PAGE TITLE */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                Safety updates
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Verified emergency alerts and service information for your saved areas.
              </p>
            </div>

            <button
              onClick={() => {
                const area = prompt("Enter an area to monitor:");

                if (area?.trim()) {
                  setSavedAreas((previous) =>
                    [...new Set([...previous, area.trim()])]
                  );
                }
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-semibold text-[#287da6] hover:bg-sky-50"
            >
              Manage areas
            </button>
          </section>

          {/* LOCATION UPDATES */}
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">

            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-slate-500" />

              <div>
                <p className="text-[9px] font-semibold uppercase text-slate-400">
                  Showing updates for
                </p>

                <select
                  value={activeArea}
                  onChange={(e) => setActiveArea(e.target.value)}
                  className="mt-1 bg-transparent text-[10px] font-semibold outline-none"
                >
                  {savedAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-[9px] font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live updates on
            </div>
          </section>

          {/* SEARCH */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search safety updates..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none focus:border-[#287da6]"
            />
          </div>

          {/* SAFETY UPDATE CARDS */}
          <section className="space-y-3">

            {filteredUpdates.map((update) => {
              const style = getUpdateStyle(update.level);
              const Icon = style.icon;

              return (
                <article
                  key={update.id}
                  className={`rounded-xl border border-slate-200 border-l-[3px] ${style.border} bg-white p-4 shadow-sm transition hover:shadow-md`}
                >
                  <div className="flex flex-wrap items-start gap-3">

                    {/* ICON */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                      <Icon size={21} className={style.color} />
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">

                      <div className="mb-2">
                        <span className={`rounded-md px-2 py-1 text-[9px] font-bold ${style.badge}`}>
                          {update.level}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#173d5b]">
                        {update.title}
                      </h3>

                      <p className="mt-2 max-w-3xl text-[11px] leading-5 text-slate-500">
                        {update.description}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] text-slate-400">

                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {update.location}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {update.time}
                        </span>

                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:flex-col sm:items-end">

                      <button
                        onClick={() => shareUpdate(update)}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-[#287da6] hover:bg-sky-50"
                      >
                        <Share2 size={13} />
                        Share
                      </button>

                      <button
                        onClick={() => setSelectedUpdate(update)}
                        className="rounded-lg bg-[#287da6] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#1e668e]"
                      >
                        Read full update
                      </button>

                    </div>
                  </div>
                </article>
              );
            })}

            {filteredUpdates.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <Search className="mx-auto text-slate-400" size={25} />
                <p className="mt-3 text-sm font-semibold">
                  No updates found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try searching with another keyword.
                </p>
              </div>
            )}
          </section>

          {/* FULL UPDATE MODAL */}
          {selectedUpdate && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">

                <div className="flex items-center justify-between">
                  <span className={`rounded-md px-2 py-1 text-[9px] font-bold ${getUpdateStyle(selectedUpdate.level).badge}`}>
                    {selectedUpdate.level}
                  </span>

                  <button
                    onClick={() => setSelectedUpdate(null)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h3 className="mt-4 text-lg font-bold">
                  {selectedUpdate.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {selectedUpdate.description}
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  <p>Location: {selectedUpdate.location}</p>
                  <p>Published: {selectedUpdate.time}</p>
                </div>

                <button
                  onClick={() => shareUpdate(selectedUpdate)}
                  className="mt-5 flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-[#287da6]"
                >
                  <Share2 size={15} />
                  Share update
                </button>

              </div>
            </div>
          )}

          {/* SAFETY TIPS */}
          <section className="grid grid-cols-1 gap-3 md:grid-cols-3">

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle size={16} />
              </div>

              <h4 className="mt-3 text-xs font-bold">
                Keep a go-bag ready
              </h4>

              <p className="mt-2 text-[10px] leading-5 text-slate-500">
                Documents, medicines, water, and phone chargers.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <Navigation size={16} />
              </div>

              <h4 className="mt-3 text-xs font-bold">
                Use verified routes
              </h4>

              <p className="mt-2 text-[10px] leading-5 text-slate-500">
                Follow official evacuation directions and avoid flood water.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <ShieldCheck size={16} />
              </div>

              <h4 className="mt-3 text-xs font-bold">
                Check on others safely
              </h4>

              <p className="mt-2 text-[10px] leading-5 text-slate-500">
                Contact neighbours who may need extra assistance.
              </p>
            </div>

          </section>

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support</p>
            <p>Stay safe. Stay informed.</p>
          </footer>

        </div>
      </main>
    </div>
  );
}
