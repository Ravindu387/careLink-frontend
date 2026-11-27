import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Search,
  Globe,
  Bell,
  Accessibility,
  Plus,
  Users,
  FileText,
  Phone,
  ChevronRight,
  Menu,
  X,
  House,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Info,
  Clock,
  Activity,
  User,
  HeartHandshake,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import {
  householdService,
  MOCK_HOUSEHOLD,
} from "../../services/householdService";
import type {
  HouseholdMember,
  ReadinessItem,
  HouseholdSummary,
  HouseholdProfile,
  CreateHouseholdMemberPayload,
  UpdateHouseholdMemberPayload,
} from "../../types/household";

const SUPPORT_OPTIONS = [
  "No support needs",
  "Limited mobility",
  "Daily medication",
  "Asthma inhaler",
  "Medical condition",
  "Elderly care support",
  "Infant / Child care",
  "Other assistance",
];

const ROLE_OPTIONS = [
  "Household member",
  "Spouse",
  "Child",
  "Parent",
  "Elderly dependent",
  "Primary contact",
  "Other",
];

export default function MyHouseholdPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile and Members State
  const [profile, setProfile] = useState<HouseholdProfile>(MOCK_HOUSEHOLD);
  const [members, setMembers] = useState<HouseholdMember[]>(MOCK_HOUSEHOLD.members);
  const [readiness, setReadiness] = useState<ReadinessItem[]>(MOCK_HOUSEHOLD.readinessChecklist);
  const [summary, setSummary] = useState<HouseholdSummary>(MOCK_HOUSEHOLD.summary);

  // Address and Contact State
  const [address, setAddress] = useState(MOCK_HOUSEHOLD.address);
  const [ward, setWard] = useState(MOCK_HOUSEHOLD.ward);
  const [city, setCity] = useState(MOCK_HOUSEHOLD.city);
  const [contactName, setContactName] = useState(MOCK_HOUSEHOLD.emergencyContactName);
  const [contactPhone, setContactPhone] = useState(MOCK_HOUSEHOLD.emergencyContactPhone);
  const [contactRelation, setContactRelation] = useState(MOCK_HOUSEHOLD.emergencyContactRelationship);

  // UI, Loading and Backend State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Search & Filter
  const [memberSearch, setMemberSearch] = useState("");
  const [supportFilter, setSupportFilter] = useState<"All" | "Needs Support" | "No Support">("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<HouseholdMember | null>(null);
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<HouseholdMember | null>(null);

  // Add Member Form
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Household member");
  const [newSupport, setNewSupport] = useState("No support needs");
  const [newAge, setNewAge] = useState<string>("");
  const [newNotes, setNewNotes] = useState("");
  const [isSavingMember, setIsSavingMember] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => setFeedbackToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  // Load Household Profile
  const fetchHousehold = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const citizen = user?.fullName || "Samira Khan";
      const data = await householdService.getProfile(citizen);

      setProfile(data);
      setMembers(data.members || []);
      setReadiness(data.readinessChecklist || []);
      setSummary(data.summary);
      setAddress(data.address);
      setWard(data.ward);
      setCity(data.city);
      setContactName(data.emergencyContactName);
      setContactPhone(data.emergencyContactPhone);
      setContactRelation(data.emergencyContactRelationship);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Backend API offline, falling back to local household data:", err);
      setIsBackendConnected(false);
      setProfile(MOCK_HOUSEHOLD);
      setMembers(MOCK_HOUSEHOLD.members);
      setReadiness(MOCK_HOUSEHOLD.readinessChecklist);
      setSummary(MOCK_HOUSEHOLD.summary);
      setAddress(MOCK_HOUSEHOLD.address);
      setContactName(MOCK_HOUSEHOLD.emergencyContactName);
      setContactPhone(MOCK_HOUSEHOLD.emergencyContactPhone);
      setContactRelation(MOCK_HOUSEHOLD.emergencyContactRelationship);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.fullName]);

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  // Readiness calculations
  const completedCount = readiness.filter((r) => r.isCompleted).length;
  const totalReadiness = readiness.length || 4;
  const progressPercent = Math.round((completedCount / totalReadiness) * 100);

  // Helper for Initials
  const getInitials = (fullName: string) => {
    if (!fullName.trim()) return "HM";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Add Member
  const handleAddMember = async () => {
    if (!newName.trim()) {
      setFeedbackToast({ type: "error", message: "Please enter a household member name." });
      return;
    }

    setIsSavingMember(true);
    const initials = getInitials(newName);
    const parsedAge = newAge.trim() ? parseInt(newAge, 10) : undefined;

    const payload: CreateHouseholdMemberPayload = {
      name: newName.trim(),
      role: newRole,
      support: newSupport,
      age: isNaN(parsedAge as any) ? undefined : parsedAge,
      medicalNotes: newNotes.trim() || undefined,
    };

    try {
      if (isBackendConnected) {
        const added = await householdService.addMember(payload, user?.fullName || "Samira Khan");
        setMembers((prev) => [...prev, added]);
      } else {
        const newMember: HouseholdMember = {
          id: `LOCAL-${Date.now()}`,
          initials,
          name: newName.trim(),
          role: newRole,
          support: newSupport,
          age: parsedAge,
          medicalNotes: newNotes.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
        setMembers((prev) => [...prev, newMember]);
      }

      // Update readiness checklist locally
      setReadiness((prev) =>
        prev.map((r) => (r.key === "members_added" ? { ...r, isCompleted: true } : r))
      );

      setSummary((prev) => ({
        ...prev,
        totalMembers: prev.totalMembers + 1,
        supportNeededCount:
          newSupport !== "No support needs"
            ? prev.supportNeededCount + 1
            : prev.supportNeededCount,
      }));

      setFeedbackToast({
        type: "success",
        message: `${newName.trim()} was added to your household.`,
      });

      // Reset form
      setNewName("");
      setNewRole("Household member");
      setNewSupport("No support needs");
      setNewAge("");
      setNewNotes("");
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Failed to add household member:", err);
      setFeedbackToast({
        type: "error",
        message: err.message || "Failed to add household member.",
      });
    } finally {
      setIsSavingMember(false);
    }
  };

  // Save Member Changes
  const handleSaveMember = async () => {
    if (!selectedMember) return;
    if (!selectedMember.name.trim()) {
      setFeedbackToast({ type: "error", message: "Name cannot be empty." });
      return;
    }

    setIsSavingMember(true);
    const payload: UpdateHouseholdMemberPayload = {
      name: selectedMember.name.trim(),
      role: selectedMember.role,
      support: selectedMember.support,
      age: selectedMember.age,
      medicalNotes: selectedMember.medicalNotes,
    };

    try {
      if (isBackendConnected) {
        const updated = await householdService.updateMember(
          selectedMember.id,
          payload,
          user?.fullName || "Samira Khan"
        );
        setMembers((prev) =>
          prev.map((m) => (m.id === selectedMember.id ? updated : m))
        );
      } else {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === selectedMember.id
              ? {
                  ...selectedMember,
                  initials: getInitials(selectedMember.name),
                }
              : m
          )
        );
      }

      setFeedbackToast({
        type: "success",
        message: `Details updated for ${selectedMember.name}.`,
      });
      setSelectedMember(null);
    } catch (err: any) {
      console.error("Failed to update member:", err);
      setFeedbackToast({
        type: "error",
        message: err.message || "Failed to update member details.",
      });
    } finally {
      setIsSavingMember(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async (member: HouseholdMember) => {
    try {
      if (isBackendConnected) {
        await householdService.deleteMember(member.id, user?.fullName || "Samira Khan");
      }

      setMembers((prev) => prev.filter((m) => m.id !== member.id));

      setSummary((prev) => ({
        ...prev,
        totalMembers: Math.max(0, prev.totalMembers - 1),
        supportNeededCount:
          member.support !== "No support needs"
            ? Math.max(0, prev.supportNeededCount - 1)
            : prev.supportNeededCount,
      }));

      setFeedbackToast({
        type: "success",
        message: `${member.name} removed from household.`,
      });
      setDeleteMemberTarget(null);
      if (selectedMember?.id === member.id) {
        setSelectedMember(null);
      }
    } catch (err: any) {
      console.error("Failed to delete member:", err);
      setFeedbackToast({
        type: "error",
        message: err.message || "Failed to remove member.",
      });
    }
  };

  // Update Address
  const handleSaveAddress = async () => {
    if (!address.trim()) {
      setFeedbackToast({ type: "error", message: "Address cannot be empty." });
      return;
    }

    try {
      if (isBackendConnected) {
        await householdService.updateAddress(
          { address: address.trim(), ward: ward.trim(), city: city.trim() },
          user?.fullName || "Samira Khan"
        );
      }

      setFeedbackToast({
        type: "success",
        message: "Household address updated successfully.",
      });
      setShowAddressModal(false);
    } catch (err: any) {
      console.error("Failed to update address:", err);
      setFeedbackToast({
        type: "error",
        message: err.message || "Failed to update address.",
      });
    }
  };

  // Update Emergency Contact
  const handleSaveContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      setFeedbackToast({
        type: "error",
        message: "Please provide both contact name and phone number.",
      });
      return;
    }

    try {
      if (isBackendConnected) {
        await householdService.updateEmergencyContact(
          {
            contactName: contactName.trim(),
            contactPhone: contactPhone.trim(),
            relationship: contactRelation.trim(),
          },
          user?.fullName || "Samira Khan"
        );
      }

      // Mark emergency contact readiness item as complete
      setReadiness((prev) =>
        prev.map((r) =>
          r.key === "emergency_contact" ? { ...r, isCompleted: true } : r
        )
      );

      setFeedbackToast({
        type: "success",
        message: "Emergency contact updated successfully.",
      });
      setShowContactModal(false);
    } catch (err: any) {
      console.error("Failed to update emergency contact:", err);
      setFeedbackToast({
        type: "error",
        message: err.message || "Failed to update emergency contact.",
      });
    }
  };

  // Toggle Readiness Item
  const handleToggleReadiness = async (key: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Optimistic UI update
    setReadiness((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, isCompleted: newStatus } : item
      )
    );

    try {
      if (isBackendConnected) {
        const updatedList = await householdService.toggleReadiness(
          { key, isCompleted: newStatus },
          user?.fullName || "Samira Khan"
        );
        if (updatedList && updatedList.length > 0) {
          setReadiness(updatedList);
        }
      }
    } catch (err: any) {
      console.warn("Could not sync readiness status with server:", err);
    }
  };

  // Filtered members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      member.role.toLowerCase().includes(memberSearch.toLowerCase()) ||
      member.support.toLowerCase().includes(memberSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (supportFilter === "Needs Support") {
      return member.support.toLowerCase() !== "no support needs";
    }
    if (supportFilter === "No Support") {
      return member.support.toLowerCase() === "no support needs";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="My Household"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="min-h-screen lg:ml-[295px]">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT CONTAINER */}
        <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6">
          {/* TOAST FEEDBACK NOTIFICATION */}
          {feedbackToast && (
            <div
              className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-semibold shadow-md transition-all ${
                feedbackToast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : feedbackToast.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackToast.type === "success" ? (
                  <CheckCircle size={16} className="text-emerald-600" />
                ) : feedbackToast.type === "error" ? (
                  <AlertCircle size={16} className="text-red-600" />
                ) : (
                  <Info size={16} className="text-sky-600" />
                )}
                <span>{feedbackToast.message}</span>
              </div>
              <button
                onClick={() => setFeedbackToast(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* PAGE HEADER & CONTROLS */}
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight">
                  My Household
                </h2>

                {/* BACKEND STATUS BADGE */}
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-xs">
                  {isBackendConnected === true ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Wifi size={11} /> Backend API Online
                      </span>
                    </>
                  ) : isBackendConnected === false ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="font-semibold text-amber-700 flex items-center gap-1">
                        <WifiOff size={11} /> Local Fallback Mode
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">Connecting...</span>
                  )}
                </div>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Keep essential household information ready for faster, tailored emergency support.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchHousehold()}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition"
                title="Refresh household data"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin text-[#287da6]" : "text-slate-500"}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#1e668e] transition"
              >
                <Plus size={14} />
                Add Person
              </button>
            </div>
          </section>

          {/* SUMMARY KPI CARDS */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-slate-500">
                  Total Members
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-[#287da6]">
                  <Users size={14} />
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-[#173d5b]">
                {members.length}
              </p>
              <p className="text-xs text-slate-400">Registered at address</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-700">
                  Special Support
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Activity size={14} />
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-amber-700">
                {members.filter((m) => m.support !== "No support needs").length}
              </p>
              <p className="text-xs text-slate-400">Mobility or medical needs</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-700">
                  Readiness Score
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={14} />
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-emerald-700">
                {progressPercent}%
              </p>
              <p className="text-xs text-slate-400">{completedCount} of {totalReadiness} steps ready</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#287da6]">
                  Emergency Contact
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-[#287da6]">
                  <Phone size={14} />
                </span>
              </div>
              <p className="mt-2 truncate text-sm font-bold text-[#173d5b]">
                {contactName}
              </p>
              <p className="text-xs text-slate-400 truncate">{contactPhone}</p>
            </div>
          </section>

          {/* PRIVACY & SECURITY ADVISORY */}
          <section className="flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={18}
                className="shrink-0 text-[#287da6]"
              />

              <div>
                <p className="text-sm font-bold text-[#173d5b]">
                  You control this household information
                </p>

                <p className="mt-0.5 text-sm text-slate-600">
                  Household details and medical requirements are shared strictly with verified disaster response teams to provide accurate rations and shelter accommodations.
                </p>
              </div>
            </div>

            <span className="hidden text-sm font-semibold text-[#287da6] sm:block">
              Privacy Protected
            </span>
          </section>

          {/* MAIN CONTENT GRID: MEMBERS & SIDE CARDS */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">

            {/* MEMBERS LIST */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              {/* LIST HEADER WITH SEARCH & FILTERS */}
              <div className="border-b border-slate-100 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#173d5b]">
                      Household Members ({members.length})
                    </h3>
                    <p className="mt-0.5 text-[13px] text-slate-400">
                      People residing at your registered address
                    </p>
                  </div>

                  {/* FILTER BUTTONS */}
                  <div className="flex items-center gap-1.5">
                    {(["All", "Needs Support", "No Support"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSupportFilter(filter)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          supportFilter === filter
                            ? "bg-[#287da6] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SEARCH INPUT */}
                <div className="relative mt-3">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search member by name, role or support needs..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-sm sm:text-[15px] outline-none focus:border-[#287da6] focus:bg-white"
                  />
                  {memberSearch && (
                    <button
                      onClick={() => setMemberSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* MEMBERS LIST BODY */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <RefreshCw size={24} className="animate-spin text-[#287da6]" />
                  <p className="mt-2 text-xs text-slate-500">Loading household members...</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Users size={28} className="text-slate-300" />
                  <p className="mt-2 text-sm font-semibold">No household members match your filter.</p>
                  <button
                    onClick={() => {
                      setMemberSearch("");
                      setSupportFilter("All");
                    }}
                    className="mt-2 text-sm text-[#287da6] underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => {
                    const hasSpecialSupport = member.support !== "No support needs";

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3.5 p-4 transition hover:bg-slate-50/70"
                      >
                        {/* INITIALS AVATAR */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold text-white shadow-xs">
                          {member.initials || getInitials(member.name)}
                        </div>

                        {/* NAME AND DETAILS */}
                        <div
                          onClick={() => setSelectedMember({ ...member })}
                          className="min-w-0 flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[#173d5b] hover:text-[#287da6] transition">
                              {member.name}
                            </p>
                            {member.age && (
                              <span className="text-[13px] text-slate-400">
                                ({member.age} yrs)
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 text-[13px] text-slate-500">
                            {member.role}
                          </p>

                          {member.medicalNotes && (
                            <p className="mt-1 line-clamp-1 text-xs text-slate-400 italic">
                              Note: {member.medicalNotes}
                            </p>
                          )}
                        </div>

                        {/* SUPPORT BADGE */}
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                            hasSpecialSupport
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {member.support}
                        </span>

                        {/* EDIT / VIEW ACTION */}
                        <button
                          onClick={() => setSelectedMember({ ...member })}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#287da6] transition"
                          title="View or edit details"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* DELETE ACTION */}
                        <button
                          onClick={() => setDeleteMemberTarget(member)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Remove member"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT SIDE CARDS: ADDRESS & EMERGENCY CONTACT */}
            <div className="space-y-4">

              {/* SAVED ADDRESS CARD */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <House size={18} />
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    Active Residence
                  </span>
                </div>

                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Saved Address
                </p>

                <p className="mt-1 text-sm font-bold text-[#173d5b]">
                  {address}
                </p>

                <p className="mt-1 text-[13px] text-slate-500">
                  {ward} · {city}
                </p>

                <button
                  onClick={() => setShowAddressModal(true)}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-[#287da6] hover:bg-sky-50 transition"
                >
                  <Pencil size={12} />
                  Update Address
                </button>
              </div>

              {/* EMERGENCY CONTACT CARD */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Phone size={18} />
                  </div>

                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-[#287da6]">
                    Primary Contact
                  </span>
                </div>

                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Emergency Contact
                </p>

                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm font-bold text-[#173d5b]">
                    {contactName}
                  </p>
                  <span className="text-[13px] text-slate-500">
                    ({contactRelation})
                  </span>
                </div>

                <p className="mt-0.5 text-sm font-mono text-slate-600">
                  {contactPhone}
                </p>

                <button
                  onClick={() => setShowContactModal(true)}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-[#287da6] hover:bg-sky-50 transition"
                >
                  <Pencil size={12} />
                  Update Contact
                </button>
              </div>
            </div>
          </section>

          {/* HOUSEHOLD READINESS CHECKLIST */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between p-4 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#173d5b]">
                  Household Readiness Checklist
                </h3>

                <p className="mt-0.5 text-[13px] text-slate-400">
                  Completing these steps helps local response teams deploy targeted aid without delay.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600">
                  {progressPercent}% Complete
                </span>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="h-2 w-full bg-slate-100">
              <div
                className="h-full bg-[#61b6a2] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* CHECKLIST ITEMS */}
            <div className="divide-y divide-slate-100">
              {readiness.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 p-4 transition hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleReadiness(item.key, item.isCompleted)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
                        item.isCompleted
                          ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      }`}
                      title={item.isCompleted ? "Mark incomplete" : "Mark complete"}
                    >
                      {item.isCompleted ? (
                        <CheckCircle size={15} />
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-slate-400" />
                      )}
                    </button>

                    <div>
                      <p className={`text-sm font-semibold ${item.isCompleted ? "text-[#173d5b]" : "text-slate-600"}`}>
                        {item.title}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleReadiness(item.key, item.isCompleted)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      item.isCompleted
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    {item.isCompleted ? "Completed" : "Mark Done"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[13px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support · Household Vault</p>
            <p>Stay safe. Stay informed.</p>
          </footer>
        </div>
      </main>

      {/* ADD MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-[#287da6]">
                  <Plus size={16} />
                </div>
                <h3 className="text-base font-bold text-[#173d5b]">
                  Add Household Member
                </h3>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Amir Khan, Layla Khan"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Relationship
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="e.g. 12"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Support Needs
                </label>
                <select
                  value={newSupport}
                  onChange={(e) => setNewSupport(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                >
                  {SUPPORT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Medical or Care Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Wheelchair access needed, daily medication"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={isSavingMember}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddMember}
                disabled={isSavingMember}
                className="flex items-center gap-1.5 rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e668e] disabled:opacity-50 transition"
              >
                {isSavingMember ? "Adding..." : "Add Person"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / MEMBER DETAILS MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold text-white">
                  {selectedMember.initials || getInitials(selectedMember.name)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#173d5b]">
                    {selectedMember.name}
                  </h3>
                  <p className="text-[13px] text-slate-400">
                    Edit member details
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={selectedMember.name}
                  onChange={(e) =>
                    setSelectedMember({ ...selectedMember, name: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Role
                  </label>
                  <select
                    value={selectedMember.role}
                    onChange={(e) =>
                      setSelectedMember({ ...selectedMember, role: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Age
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={selectedMember.age ?? ""}
                    onChange={(e) =>
                      setSelectedMember({
                        ...selectedMember,
                        age: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Support Needs
                </label>
                <select
                  value={selectedMember.support}
                  onChange={(e) =>
                    setSelectedMember({ ...selectedMember, support: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                >
                  {SUPPORT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Medical Notes
                </label>
                <input
                  type="text"
                  value={selectedMember.medicalNotes ?? ""}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      medicalNotes: e.target.value,
                    })
                  }
                  placeholder="e.g. Asthma, allergies, limited mobility"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteMemberTarget(selectedMember);
                }}
                className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 size={13} />
                Remove
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  disabled={isSavingMember}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveMember}
                  disabled={isSavingMember}
                  className="rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e668e] transition"
                >
                  {isSavingMember ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <House size={16} />
                </div>
                <h3 className="text-base font-bold text-[#173d5b]">Update Saved Address</h3>
              </div>

              <button
                onClick={() => setShowAddressModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Street Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                  placeholder="Street and house number"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Ward / Sector
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                    placeholder="e.g. North Ward"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    City / Region
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                    placeholder="e.g. Greater Riverton"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAddress}
                className="rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e668e] transition"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE CONTACT MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Phone size={16} />
                </div>
                <h3 className="text-base font-bold text-[#173d5b]">
                  Update Emergency Contact
                </h3>
              </div>

              <button
                onClick={() => setShowContactModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Contact Full Name
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                  placeholder="e.g. Rashid Khan"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                  placeholder="+94 77 455 0182"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Relationship
                </label>
                <input
                  type="text"
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                  placeholder="e.g. Brother, Spouse, Neighbor"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveContact}
                className="rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e668e] transition"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MEMBER CONFIRMATION MODAL */}
      {deleteMemberTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <Trash2 size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Remove Household Member?
              </h3>
            </div>

            <p className="mt-3 text-sm text-slate-600">
              Are you sure you want to remove{" "}
              <span className="font-bold text-[#173d5b]">
                "{deleteMemberTarget.name}"
              </span>{" "}
              from your registered household members list?
            </p>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setDeleteMemberTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDeleteMember(deleteMemberTarget)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
