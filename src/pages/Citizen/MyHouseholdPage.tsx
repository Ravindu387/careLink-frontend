
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
  Menu,
  X,
  MapPin,
  User,
  CheckCircle,
  Pencil,
  ShieldCheck,
  Upload,
} from "lucide-react";

interface HouseholdMember {
  id: number;
  initials: string;
  name: string;
  role: string;
  support: string;
}

const initialMembers: HouseholdMember[] = [
  {
    id: 1,
    initials: "SK",
    name: "Samira Khan",
    role: "You · Primary contact",
    support: "No support needs",
  },
  {
    id: 2,
    initials: "AK",
    name: "Amir Khan",
    role: "Household member",
    support: "Limited mobility",
  },
  {
    id: 3,
    initials: "LK",
    name: "Layla Khan",
    role: "Household member",
    support: "Asthma inhaler",
  },
  {
    id: 4,
    initials: "MK",
    name: "Mariam Khan",
    role: "Household member",
    support: "Daily medication",
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

export default function MyHouseholdPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [members, setMembers] =
    useState<HouseholdMember[]>(initialMembers);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const [selectedMember, setSelectedMember] =
    useState<HouseholdMember | null>(null);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Household member");
  const [newSupport, setNewSupport] = useState("No support needs");

  const [address, setAddress] = useState(
    "54 Riverside Lane, North Ward, Greater Riverton"
  );

  const [contact, setContact] = useState("Rashid Khan");
  const [phone, setPhone] = useState("+94 77 455 0182");

  const [readiness, setReadiness] = useState([
    true,
    true,
    true,
    false,
  ]);

  const completedCount = readiness.filter(Boolean).length;
  const progress = Math.round((completedCount / 4) * 100);

  const addMember = () => {
    if (!newName.trim()) {
      alert("Please enter a household member name.");
      return;
    }

    const initials = newName
      .trim()
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    setMembers((previous) => [
      ...previous,
      {
        id: Date.now(),
        initials,
        name: newName,
        role: newRole,
        support: newSupport,
      },
    ]);

    setNewName("");
    setNewRole("Household member");
    setNewSupport("No support needs");
    setShowAddModal(false);
  };

  const saveMember = () => {
    if (!selectedMember) return;

    setMembers((previous) =>
      previous.map((member) =>
        member.id === selectedMember.id
          ? selectedMember
          : member
      )
    );

    setSelectedMember(null);
  };

  const readinessItems = [
    "Household members added",
    "Support needs reviewed",
    "Emergency contact added",
    "Important documents uploaded",
  ];

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
            const active = item.name === "My Household";

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

        {/* USER PROFILE */}
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

      {/* MAIN */}
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

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-6">

          {/* TITLE */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                My household
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Keep essential household information ready for faster, safer support.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1e668e]"
            >
              <Plus size={14} />
              Add person
            </button>
          </section>

          {/* PRIVACY NOTICE */}
          <section className="flex items-center justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={17}
                className="shrink-0 text-[#287da6]"
              />

              <div>
                <p className="text-[10px] font-bold">
                  You control this information
                </p>

                <p className="mt-1 text-[9px] text-slate-500">
                  Household details are only shared with authorised teams when needed to respond to your request.
                </p>
              </div>
            </div>

            <span className="hidden text-[9px] text-[#287da6] sm:block">
              Learn more
            </span>
          </section>

          {/* HOUSEHOLD MEMBERS AND CONTACTS */}
          <section className="grid grid-cols-1 gap-3 xl:grid-cols-[2fr_0.9fr]">

            {/* MEMBERS */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-xs font-semibold">
                  Household members
                </h3>

                <p className="mt-1 text-[9px] text-slate-400">
                  {members.length} people at your saved address
                </p>
              </div>

              <div>
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember({ ...member })}
                    className="flex w-full items-center gap-3 border-b border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 last:border-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#287da6] text-[10px] font-bold text-white">
                      {member.initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold">
                        {member.name}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        {member.role}
                      </p>
                    </div>

                    <span className="hidden rounded-md bg-amber-50 px-2 py-1 text-[8px] font-semibold text-amber-700 sm:block">
                      {member.support}
                    </span>

                    <span className="sm:hidden text-[8px] text-slate-500">
                      {member.support}
                    </span>

                    <ChevronRight
                      size={15}
                      className="shrink-0 text-slate-400"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE CARDS */}
            <div className="space-y-3">

              {/* ADDRESS */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <House size={17} />
                </div>

                <p className="mt-2 text-[9px] font-semibold text-slate-500">
                  Saved address
                </p>

                <p className="mt-1 text-[10px] font-semibold">
                  {address}
                </p>

                <button
                  onClick={() => setShowAddressModal(true)}
                  className="mt-3 flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-[9px] font-semibold text-[#287da6] hover:bg-sky-50"
                >
                  <Pencil size={11} />
                  Update address
                </button>
              </div>

              {/* EMERGENCY CONTACT */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Phone size={17} />
                </div>

                <p className="mt-2 text-[9px] font-semibold text-slate-500">
                  Emergency contact
                </p>

                <p className="mt-1 text-[10px] font-semibold">
                  {contact}
                </p>

                <p className="mt-1 text-[9px] text-slate-500">
                  {phone}
                </p>

                <button
                  onClick={() => setShowContactModal(true)}
                  className="mt-3 flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-[9px] font-semibold text-[#287da6] hover:bg-sky-50"
                >
                  <Pencil size={11} />
                  Update contact
                </button>
              </div>
            </div>
          </section>

          {/* HOUSEHOLD READINESS */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <h3 className="text-xs font-semibold">
                  Household readiness
                </h3>

                <p className="mt-1 text-[9px] text-slate-400">
                  Completing these helps response teams support you.
                </p>
              </div>

              <span className="text-[10px] font-bold text-emerald-600">
                {progress}% complete
              </span>
            </div>

            {/* PROGRESS BAR */}
            <div className="h-1.5 w-full bg-slate-100">
              <div
                className="h-full bg-[#61b6a2] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* CHECKLIST */}
            <div>
              {readinessItems.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 last:border-0"
                >
                  <button
                    onClick={() =>
                      setReadiness((previous) =>
                        previous.map((value, i) =>
                          i === index ? !value : value
                        )
                      )
                    }
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      readiness[index]
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {readiness[index] ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Upload size={12} />
                    )}
                  </button>

                  <p className="flex-1 text-[9px] font-semibold">
                    {item}
                  </p>

                  <button
                    onClick={() =>
                      setReadiness((previous) =>
                        previous.map((value, i) =>
                          i === index ? !value : value
                        )
                      )
                    }
                    className={`rounded-full px-2 py-1 text-[8px] font-semibold ${
                      readiness[index]
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {readiness[index] ? "Complete" : "Add now"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support</p>
            <p>Stay safe. Stay informed.</p>
          </footer>
        </div>
      </main>

      {/* ADD MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Add household member
              </h3>

              <button onClick={() => setShowAddModal(false)}>
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-xs font-semibold">
                Full name

                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter full name"
                  className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-xs outline-none focus:border-[#287da6]"
                />
              </label>

              <label className="block text-xs font-semibold">
                Relationship

                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-xs outline-none"
                >
                  <option>Household member</option>
                  <option>Spouse</option>
                  <option>Child</option>
                  <option>Parent</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="block text-xs font-semibold">
                Support needs

                <select
                  value={newSupport}
                  onChange={(e) => setNewSupport(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-xs outline-none"
                >
                  <option>No support needs</option>
                  <option>Limited mobility</option>
                  <option>Daily medication</option>
                  <option>Medical condition</option>
                  <option>Other assistance</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs"
              >
                Cancel
              </button>

              <button
                onClick={addMember}
                className="rounded-lg bg-[#287da6] px-4 py-2 text-xs font-semibold text-white"
              >
                Add person
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Household member details
              </h3>

              <button onClick={() => setSelectedMember(null)}>
                <X size={19} />
              </button>
            </div>

            <label className="mt-5 block text-xs font-semibold">
              Full name

              <input
                value={selectedMember.name}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    name: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-xs outline-none"
              />
            </label>

            <label className="mt-4 block text-xs font-semibold">
              Support needs

              <select
                value={selectedMember.support}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    support: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-xs outline-none"
              >
                <option>No support needs</option>
                <option>Limited mobility</option>
                <option>Asthma inhaler</option>
                <option>Daily medication</option>
                <option>Medical condition</option>
                <option>Other assistance</option>
              </select>
            </label>

            <button
              onClick={saveMember}
              className="mt-5 w-full rounded-lg bg-[#287da6] p-3 text-xs font-semibold text-white"
            >
              Save changes
            </button>
          </div>
        </div>
      )}

      {/* UPDATE ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Update address</h3>

              <button onClick={() => setShowAddressModal(false)}>
                <X size={19} />
              </button>
            </div>

            <label className="mt-5 block text-xs font-semibold">
              Saved household address

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-xs outline-none focus:border-[#287da6]"
              />
            </label>

            <button
              onClick={() => setShowAddressModal(false)}
              className="mt-5 w-full rounded-lg bg-[#287da6] p-3 text-xs font-semibold text-white"
            >
              Save address
            </button>
          </div>
        </div>
      )}

      {/* UPDATE CONTACT MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Update emergency contact
              </h3>

              <button onClick={() => setShowContactModal(false)}>
                <X size={19} />
              </button>
            </div>

            <label className="mt-5 block text-xs font-semibold">
              Contact name

              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-xs outline-none"
              />
            </label>

            <label className="mt-4 block text-xs font-semibold">
              Phone number

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-xs outline-none"
              />
            </label>

            <button
              onClick={() => setShowContactModal(false)}
              className="mt-5 w-full rounded-lg bg-[#287da6] p-3 text-xs font-semibold text-white"
            >
              Save contact
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
