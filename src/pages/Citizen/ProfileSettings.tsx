import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Search,
  Globe,
  Bell,
  Accessibility,
  Plus,
  ClipboardList,
  House,
  TriangleAlert,
  Users,
  FileText,
  MessageSquare,
  ChevronRight,
  Menu,
  X,
  User,
  MapPin,
  Languages,
  Shield,
  Lock,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Smartphone,
  Laptop,
  KeyRound,
  Download,
  RotateCcw,
  Check,
  Sliders,
  Volume2,
  EyeIcon,
  ShieldCheck,
  Copy,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import {
  citizenProfileService,
  DEFAULT_CITIZEN_PROFILE,
} from "../../services/citizenProfileService";
import type {
  CitizenProfileSettings,
  UpdateFullProfilePayload,
  ChangePasswordPayload,
} from "../../types/citizenProfile";

const settingsTabs = [
  { name: "Personal details", icon: User, description: "Manage basic identification details and name" },
  { name: "Contact & location", icon: MapPin, description: "Update residential address and contact phone" },
  { name: "Language & accessibility", icon: Languages, description: "Preferred language, contrast, and font scale" },
  { name: "Notifications", icon: Bell, description: "Configure emergency SMS, email, and push notices" },
  { name: "Privacy & data", icon: Lock, description: "Data sharing consents and export options" },
  { name: "Security", icon: Shield, description: "Password updates and two-factor authentication" },
];

export default function ProfileSettings() {
  const { user } = useAuth();
  const citizenName = user?.fullName || "Samira Khan";

  const [activeTab, setActiveTab] = useState("Personal details");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Form profile state
  const [profile, setProfile] = useState<CitizenProfileSettings>(DEFAULT_CITIZEN_PROFILE);

  // Password change state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordPayload>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Load Profile from Backend
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await citizenProfileService.getProfile(citizenName);
      setProfile(data);
      setIsOnline(true);
      setHasChanges(false);
    } catch (err: any) {
      console.warn("Could not fetch profile from backend API, using local state:", err);
      setIsOnline(false);
      // Fallback
      setProfile((prev) => prev || DEFAULT_CITIZEN_PROFILE);
    } finally {
      setLoading(false);
    }
  }, [citizenName]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Update helper
  const updateField = <K extends keyof CitizenProfileSettings>(
    field: K,
    value: CitizenProfileSettings[K]
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  // Save changes handler
  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);

      const payload: UpdateFullProfilePayload = {
        fullName: profile.fullName,
        preferredName: profile.preferredName,
        dateOfBirth: profile.dateOfBirth,
        nationalId: profile.nationalId,
        gender: profile.gender,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        district: profile.district,
        city: profile.city,
        postalCode: profile.postalCode,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        emergencyContactRelation: profile.emergencyContactRelation,
        language: profile.language,
        accessibility: profile.accessibility,
        highContrast: profile.highContrast,
        largeText: profile.largeText,
        screenReaderSupport: profile.screenReaderSupport,
        audioAssistance: profile.audioAssistance,
        emergencyAlerts: profile.emergencyAlerts,
        requestStatusUpdates: profile.requestStatusUpdates,
        safetyNotifications: profile.safetyNotifications,
        messagesFromSupportTeams: profile.messagesFromSupportTeams,
        shelterAvailabilityUpdates: profile.shelterAvailabilityUpdates,
        smsAlerts: profile.smsAlerts,
        emailAlerts: profile.emailAlerts,
        shareLocationDuringDisaster: profile.shareLocationDuringDisaster,
        shareMedicalWithRescuers: profile.shareMedicalWithRescuers,
        allowVolunteersContact: profile.allowVolunteersContact,
        dataRetentionConsent: profile.dataRetentionConsent,
      };

      if (isOnline) {
        const updated = await citizenProfileService.updateFullProfile(payload, citizenName);
        setProfile(updated);
      }

      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!passwordForm.newPassword) {
      setPasswordError("New password cannot be empty.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setPasswordSaving(true);
      if (isOnline) {
        await citizenProfileService.changePassword(passwordForm, citizenName);
      }
      setPasswordSuccess("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Toggle Two-Factor
  const handleToggle2FA = async () => {
    try {
      const nextState = !profile.twoFactorEnabled;
      updateField("twoFactorEnabled", nextState);
      if (isOnline) {
        await citizenProfileService.toggleTwoFactor(nextState, citizenName);
      }
    } catch (err: any) {
      console.error("Failed to toggle 2FA:", err);
    }
  };

  // Reset to Demo Defaults
  const handleResetProfile = async () => {
    if (confirm("Reset profile settings to default demo values?")) {
      try {
        setLoading(true);
        if (isOnline) {
          const reset = await citizenProfileService.resetProfile(citizenName);
          setProfile(reset);
        } else {
          setProfile(DEFAULT_CITIZEN_PROFILE);
        }
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err: any) {
        setErrorMsg("Failed to reset profile.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Export Data JSON
  const handleExportData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `carelink_profile_${profile.citizenReference || "export"}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy citizen reference
  const handleCopyRef = () => {
    navigator.clipboard.writeText(profile.citizenReference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Toggle All Notifications
  const handleToggleAllNotifications = (enable: boolean) => {
    setProfile((prev) => ({
      ...prev,
      emergencyAlerts: enable,
      requestStatusUpdates: enable,
      safetyNotifications: enable,
      messagesFromSupportTeams: enable,
      shelterAvailabilityUpdates: enable,
      smsAlerts: enable,
      emailAlerts: enable,
    }));
    setHasChanges(true);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:text-[15px] text-[#173d5b] outline-none transition focus:border-[#287da6] focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-500";

  const labelClass =
    "mb-1.5 block text-[13px] font-semibold text-[#173d5b]";

  // Calculate profile completeness
  const completenessItems = [
    Boolean(profile.fullName),
    Boolean(profile.email),
    Boolean(profile.phone),
    Boolean(profile.address),
    Boolean(profile.emergencyContactName),
    Boolean(profile.emergencyContactPhone),
    Boolean(profile.nationalId),
  ];
  const completedCount = completenessItems.filter(Boolean).length;
  const completenessPercent = Math.round((completedCount / completenessItems.length) * 100);

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="Profile & Settings"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN LAYOUT */}
      <main className="min-h-screen transition-all duration-300 lg:ml-[295px]">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {/* TOP BAR / HEADER */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight">
                  Profile & Settings
                </h1>

                {/* API Status Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${
                    isOnline
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                  title={
                    isOnline
                      ? "Connected to CareLink Backend API"
                      : "Offline Fallback Mode (Local edits preserved)"
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
                  onClick={loadProfile}
                  disabled={loading}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#287da6] disabled:opacity-50"
                  title="Reload profile from server"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Manage your identification, verified contact information, accessibility preferences, and data privacy.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {hasChanges && (
                <span className="hidden text-xs font-medium text-amber-700 sm:inline-block">
                  ● Unsaved changes
                </span>
              )}

              <button
                onClick={handleSave}
                disabled={saving || loading}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                  saved
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-[#287da6] hover:bg-[#1f6486]"
                } disabled:opacity-60`}
              >
                {saving ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : saved ? (
                  <CheckCircle size={15} />
                ) : (
                  <Save size={15} />
                )}
                <span>
                  {saving ? "Saving..." : saved ? "Changes Saved!" : "Save changes"}
                </span>
              </button>
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* PROFILE SUMMARY HERO CARD */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              {/* Left: Avatar & Basic Info */}
              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#287da6] to-[#153e5e] text-xl font-bold text-white shadow-md">
                  {profile.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("") || "SK"}
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                    <Check size={11} className="text-white" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-[#173d5b]">
                      {profile.fullName || "Citizen User"}
                    </h2>
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-[#287da6]">
                      Citizen Portal
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <ShieldCheck size={12} /> Verified Identity
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail size={13} className="text-slate-400" />
                      {profile.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-slate-400" />
                      {profile.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {profile.district || profile.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Reference pill & Completeness */}
              <div className="flex flex-col items-start gap-2 border-t border-slate-100 pt-4 sm:items-end sm:border-t-0 sm:pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-slate-400">Citizen Ref:</span>
                  <button
                    onClick={handleCopyRef}
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono font-semibold text-[#173d5b] transition hover:bg-slate-100"
                    title="Click to copy citizen reference"
                  >
                    <span>{profile.citizenReference}</span>
                    {copiedRef ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <Copy size={12} className="text-slate-400 group-hover:text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Completeness Bar */}
                <div className="w-full sm:w-48">
                  <div className="flex justify-between text-[13px] text-slate-500">
                    <span>Profile Completeness</span>
                    <span className="font-semibold text-[#287da6]">{completenessPercent}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#65b9aa] to-[#287da6] transition-all duration-500"
                      style={{ width: `${completenessPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN SETTINGS GRID */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            {/* SETTINGS SIDE MENU */}
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Settings Sections
              </div>
              <div className="space-y-1">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.name;

                  return (
                    <button
                      key={tab.name}
                      onClick={() => {
                        setActiveTab(tab.name);
                        setSaved(false);
                      }}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left text-sm transition ${
                        active
                          ? "bg-[#e8f2f7] font-semibold text-[#287da6] shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#173d5b]"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                          active
                            ? "bg-[#287da6] text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                        }`}
                      >
                        <Icon size={16} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold">{tab.name}</p>
                        <p className="truncate text-[13px] text-slate-400 font-normal">
                          {tab.description}
                        </p>
                      </div>

                      <ChevronRight
                        size={15}
                        className={`transition ${
                          active ? "text-[#287da6]" : "text-slate-300 group-hover:text-slate-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Reset to defaults helper */}
              <div className="mt-4 border-t border-slate-100 p-2">
                <button
                  onClick={handleResetProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                >
                  <RotateCcw size={12} />
                  Reset to Demo Values
                </button>
              </div>
            </div>

            {/* TAB CONTENT PANEL */}
            <section className="min-h-[460px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              {/* 1. PERSONAL DETAILS TAB */}
              {activeTab === "Personal details" && (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#173d5b]">Personal details</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Update your official identification names and birth information.
                      </p>
                    </div>
                    <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-medium text-[#287da6]">
                      Identity
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Full name (as in NIC / Passport)</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={profile.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        placeholder="e.g. Samira Khan"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Preferred / Known name</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={profile.preferredName}
                        onChange={(e) => updateField("preferredName", e.target.value)}
                        placeholder="e.g. Samira"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Date of birth</label>
                      <div className="relative">
                        <input
                          type="date"
                          className={inputClass}
                          value={profile.dateOfBirth}
                          onChange={(e) => updateField("dateOfBirth", e.target.value)}
                        />
                        <Calendar
                          size={15}
                          className="pointer-events-none absolute right-3 top-3 text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Citizen Reference ID</label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`${inputClass} bg-slate-50 text-slate-600 font-mono`}
                          value={profile.citizenReference}
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={handleCopyRef}
                          className="absolute right-2.5 top-2.5 rounded p-1 text-slate-400 hover:text-slate-600"
                          title="Copy reference ID"
                        >
                          {copiedRef ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="mt-1 text-[13px] text-slate-400">
                        Assigned by CareLink Registry for relief dispatch and verification.
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>National Identity Card (NIC) / ID Number</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={profile.nationalId || ""}
                        onChange={(e) => updateField("nationalId", e.target.value)}
                        placeholder="e.g. 199084501234"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Gender</label>
                      <select
                        className={inputClass}
                        value={profile.gender || "Female"}
                        onChange={(e) => updateField("gender", e.target.value)}
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CONTACT & LOCATION TAB */}
              {activeTab === "Contact & location" && (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#173d5b]">Contact & location</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Primary communication channels and residential dispatch address.
                      </p>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Location
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Email address</label>
                      <div className="relative">
                        <input
                          type="email"
                          className={inputClass}
                          value={profile.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="name@email.com"
                        />
                        <Mail
                          size={15}
                          className="pointer-events-none absolute right-3 top-3 text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Primary contact number</label>
                      <div className="relative">
                        <input
                          type="tel"
                          className={inputClass}
                          value={profile.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="+94 77 412 8088"
                        />
                        <Phone
                          size={15}
                          className="pointer-events-none absolute right-3 top-3 text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>Saved residential address</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={profile.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="Street, Building No, Area"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Grama Niladhari / District / Ward</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={profile.district}
                        onChange={(e) => updateField("district", e.target.value)}
                        placeholder="e.g. North Ward"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>City / Region</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={profile.city || "Greater Riverton"}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="e.g. Greater Riverton"
                      />
                    </div>
                  </div>

                  {/* EMERGENCY CONTACT SUB-CARD */}
                  <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600">
                        <Heart size={14} />
                      </div>
                      <h4 className="text-sm font-bold text-[#173d5b]">
                        Designated Emergency Contact
                      </h4>
                    </div>
                    <p className="mb-4 text-[13px] text-slate-500">
                      Authorized person reached during search and rescue or sudden medical evacuations.
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className={labelClass}>Contact Person Name</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={profile.emergencyContactName || ""}
                          onChange={(e) => updateField("emergencyContactName", e.target.value)}
                          placeholder="e.g. Rashid Khan"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Emergency Phone</label>
                        <input
                          type="tel"
                          className={inputClass}
                          value={profile.emergencyContactPhone || ""}
                          onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
                          placeholder="+94 77 455 0182"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Relationship</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={profile.emergencyContactRelation || ""}
                          onChange={(e) => updateField("emergencyContactRelation", e.target.value)}
                          placeholder="e.g. Brother, Spouse"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. LANGUAGE & ACCESSIBILITY TAB */}
              {activeTab === "Language & accessibility" && (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#173d5b]">Language & accessibility</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Customise typography, high contrast, and spoken text readability options.
                      </p>
                    </div>
                    <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                      Accessibility
                    </span>
                  </div>

                  <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Preferred language</label>
                        <select
                          className={inputClass}
                          value={profile.language}
                          onChange={(e) => updateField("language", e.target.value)}
                        >
                          <option value="English">English (United Kingdom)</option>
                          <option value="Sinhala">සිංහල (Sinhala)</option>
                          <option value="Tamil">தமிழ் (Tamil)</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Accessibility preset</label>
                        <select
                          className={inputClass}
                          value={profile.accessibility}
                          onChange={(e) => updateField("accessibility", e.target.value)}
                        >
                          <option value="Standard">Standard default</option>
                          <option value="Large text">Large text preset</option>
                          <option value="High contrast">High contrast preset</option>
                          <option value="Screen reader support">Screen reader assistance</option>
                        </select>
                      </div>
                    </div>

                    {/* INTERACTIVE TOGGLE TILES */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-start justify-between rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-[#287da6]">
                            <Sliders size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">High contrast palette</p>
                            <p className="text-[13px] text-slate-500">
                              Increases text distinction for outdoor visibility.
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.highContrast}
                          onChange={(e) => updateField("highContrast", e.target.checked)}
                          className="h-4 w-4 rounded accent-[#287da6] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-start justify-between rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                            <EyeIcon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Large text scaling</p>
                            <p className="text-[13px] text-slate-500">
                              Enhances button labels and emergency alerts size.
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.largeText}
                          onChange={(e) => updateField("largeText", e.target.checked)}
                          className="h-4 w-4 rounded accent-[#287da6] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-start justify-between rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <Accessibility size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Screen reader optimization</p>
                            <p className="text-[13px] text-slate-500">
                              Provides ARIA landmarks and descriptive image alt-tags.
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.screenReaderSupport}
                          onChange={(e) => updateField("screenReaderSupport", e.target.checked)}
                          className="h-4 w-4 rounded accent-[#287da6] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-start justify-between rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <Volume2 size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Audio evacuation cues</p>
                            <p className="text-[13px] text-slate-500">
                              Audible sirens during severe flood and cyclone bulletins.
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.audioAssistance}
                          onChange={(e) => updateField("audioAssistance", e.target.checked)}
                          className="h-4 w-4 rounded accent-[#287da6] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. NOTIFICATIONS TAB */}
              {activeTab === "Notifications" && (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#173d5b]">Notification preferences</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Choose which channels notify you during emergencies and dispatch tracking.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAllNotifications(true)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Enable All
                      </button>
                      <button
                        onClick={() => handleToggleAllNotifications(false)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Disable All
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 divide-y divide-slate-100">
                    {[
                      {
                        key: "emergencyAlerts",
                        label: "Critical evacuation & life-safety bulletins",
                        desc: "High-priority flood warnings and immediate zone evacuation alarms",
                        badge: "Critical",
                        badgeColor: "bg-red-50 text-red-700 border-red-200",
                        val: profile.emergencyAlerts,
                      },
                      {
                        key: "requestStatusUpdates",
                        label: "Assistance request progress & dispatch updates",
                        desc: "Notifications when food, medical kits, or drivers are assigned",
                        badge: "Dispatches",
                        badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
                        val: profile.requestStatusUpdates,
                      },
                      {
                        key: "safetyNotifications",
                        label: "Regional flood level and road closure notices",
                        desc: "Hourly municipal road conditions and safe passage routes",
                        badge: "Advisories",
                        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
                        val: profile.safetyNotifications,
                      },
                      {
                        key: "messagesFromSupportTeams",
                        label: "Direct messages from relief officers & case workers",
                        desc: "Replies from municipal support coordinators",
                        badge: "Chat",
                        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
                        val: profile.messagesFromSupportTeams,
                      },
                      {
                        key: "shelterAvailabilityUpdates",
                        label: "Shelter occupancy and space availability alerts",
                        desc: "Capacity alerts for Riverton High School and Community Centers",
                        badge: "Shelters",
                        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                        val: profile.shelterAvailabilityUpdates,
                      },
                      {
                        key: "smsAlerts",
                        label: "SMS text message notifications",
                        desc: "Receive fallback alerts on phone when mobile data/internet fails",
                        badge: "SMS",
                        badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
                        val: profile.smsAlerts,
                      },
                      {
                        key: "emailAlerts",
                        label: "Email summary bulletins",
                        desc: "Daily operational recaps and verified service updates",
                        badge: "Email",
                        badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
                        val: profile.emailAlerts,
                      },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between py-4 cursor-pointer hover:bg-slate-50/50 px-2 rounded-lg transition"
                      >
                        <div className="pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#173d5b]">
                              {item.label}
                            </span>
                            <span
                              className={`rounded border px-1.5 py-0.5 text-xs font-medium ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[13px] text-slate-500">
                            {item.desc}
                          </p>
                        </div>

                        <input
                          type="checkbox"
                          checked={item.val}
                          onChange={(e) =>
                            updateField(
                              item.key as keyof CitizenProfileSettings,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded accent-[#287da6] cursor-pointer shrink-0"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. PRIVACY & DATA TAB */}
              {activeTab === "Privacy & data" && (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#173d5b]">Privacy & data protection</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Governance of personal info, responder location sharing, and export archives.
                      </p>
                    </div>
                    <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                      Encrypted
                    </span>
                  </div>

                  <div className="mt-6 space-y-5">
                    {/* Information cards */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#287da6]" />
                        <h4 className="text-sm font-bold text-[#173d5b]">
                          Government Disaster Response Protection Policy
                        </h4>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                        {profile.personalInformationPolicy ||
                          "Your personal information is strictly protected under municipal emergency protocols and shared exclusively with verified emergency responders during active crisis operations."}
                      </p>
                    </div>

                    {/* Interactive Privacy Consents */}
                    <div className="space-y-3">
                      <label className="flex items-start justify-between rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
                        <div className="pr-4">
                          <p className="text-sm font-semibold text-[#173d5b]">
                            Share live GPS coordinates with emergency rescue teams
                          </p>
                          <p className="text-[13px] text-slate-500 mt-0.5">
                            Allows first responder boats and ambulances to pinpoint your household location directly during high floods.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.shareLocationDuringDisaster}
                          onChange={(e) =>
                            updateField("shareLocationDuringDisaster", e.target.checked)
                          }
                          className="h-4 w-4 rounded accent-[#287da6] cursor-pointer shrink-0 mt-0.5"
                        />
                      </label>

                      <label className="flex items-start justify-between rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
                        <div className="pr-4">
                          <p className="text-sm font-semibold text-[#173d5b]">
                            Share household medical notes with verified paramedic crews
                          </p>
                          <p className="text-[13px] text-slate-500 mt-0.5">
                            Permits on-scene medical personnel to view elder medications or mobility limitations before arrival.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.shareMedicalWithRescuers}
                          onChange={(e) =>
                            updateField("shareMedicalWithRescuers", e.target.checked)
                          }
                          className="h-4 w-4 rounded accent-[#287da6] cursor-pointer shrink-0 mt-0.5"
                        />
                      </label>

                      <label className="flex items-start justify-between rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
                        <div className="pr-4">
                          <p className="text-sm font-semibold text-[#173d5b]">
                            Allow verified volunteer groups to contact regarding relief supplies
                          </p>
                          <p className="text-[13px] text-slate-500 mt-0.5">
                            Authorized grassroots NGOs and Red Cross community teams may coordinate grocery and clean water drop-offs.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.allowVolunteersContact}
                          onChange={(e) =>
                            updateField("allowVolunteersContact", e.target.checked)
                          }
                          className="h-4 w-4 rounded accent-[#287da6] cursor-pointer shrink-0 mt-0.5"
                        />
                      </label>

                      <label className="flex items-start justify-between rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
                        <div className="pr-4">
                          <p className="text-sm font-semibold text-[#173d5b]">
                            Anonymized data analytics for regional disaster mitigation
                          </p>
                          <p className="text-[13px] text-slate-500 mt-0.5">
                            Permits aggregate statistics (e.g. ward supply demand) to improve future district flood defences.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.dataRetentionConsent}
                          onChange={(e) =>
                            updateField("dataRetentionConsent", e.target.checked)
                          }
                          className="h-4 w-4 rounded accent-[#287da6] cursor-pointer shrink-0 mt-0.5"
                        />
                      </label>
                    </div>

                    {/* Export / Download archive */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <h4 className="text-sm font-bold text-[#173d5b]">
                          Download personal data record
                        </h4>
                        <p className="text-[13px] text-slate-500 mt-0.5">
                          Download a copy of your verified CareLink citizen identity, contact, and settings in JSON format.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportData}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-[#173d5b] hover:bg-slate-100 shadow-sm"
                      >
                        <Download size={14} className="text-[#287da6]" />
                        Export Data (JSON)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. SECURITY TAB */}
              {activeTab === "Security" && (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#173d5b]">Security & authentication</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Manage login credentials, multi-factor verification, and active login sessions.
                      </p>
                    </div>
                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                      2FA Active
                    </span>
                  </div>

                  {/* 2FA Card */}
                  <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#287da6] text-white">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#173d5b]">
                            Two-Factor Authentication (2FA)
                          </p>
                          <p className="text-[13px] text-slate-500 mt-0.5">
                            Require SMS OTP code verification when signing in from an unrecognised device.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggle2FA}
                        className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                          profile.twoFactorEnabled
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }`}
                      >
                        {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>

                  {/* CHANGE PASSWORD FORM */}
                  <div className="mt-6 max-w-xl">
                    <h4 className="text-sm font-bold text-[#173d5b] flex items-center gap-2">
                      <KeyRound size={15} className="text-[#287da6]" />
                      Change Account Password
                    </h4>
                    <p className="text-[13px] text-slate-500 mt-1 mb-4">
                      Use at least 6 characters including numbers and letters.
                    </p>

                    {passwordSuccess && (
                      <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
                        <CheckCircle size={15} />
                        {passwordSuccess}
                      </div>
                    )}

                    {passwordError && (
                      <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                        <AlertCircle size={15} />
                        {passwordError}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className={labelClass}>Current password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            className={inputClass}
                            placeholder="Enter current password (demo: Pass@1234)"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>New password</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              className={inputClass}
                              placeholder="New password"
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className={labelClass}>Confirm new password</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              className={inputClass}
                              placeholder="Confirm password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={passwordSaving}
                        className="rounded-lg bg-[#287da6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1f6486] disabled:opacity-60 transition"
                      >
                        {passwordSaving ? "Updating Password..." : "Update Password"}
                      </button>
                    </form>
                  </div>

                  {/* ACTIVE SESSIONS LIST */}
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-bold text-[#173d5b] mb-3">
                      Active Login Sessions
                    </h4>
                    <div className="space-y-3">
                      {profile.activeSessions && profile.activeSessions.length > 0 ? (
                        profile.activeSessions.map((session, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                {session.device.toLowerCase().includes("mobile") ||
                                session.device.toLowerCase().includes("ios") ? (
                                  <Smartphone size={17} />
                                ) : (
                                  <Laptop size={17} />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-[#173d5b]">
                                    {session.device}
                                  </p>
                                  {session.isCurrent && (
                                    <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-xs font-semibold text-emerald-800">
                                      This Device
                                    </span>
                                  )}
                                </div>
                                <p className="text-[13px] text-slate-400">
                                  {session.location} • Last active: {session.lastActive}
                                </p>
                              </div>
                            </div>

                            {!session.isCurrent && (
                              <button
                                type="button"
                                onClick={() => {
                                  setProfile((prev) => ({
                                    ...prev,
                                    activeSessions: prev.activeSessions.filter(
                                      (_, i) => i !== idx
                                    ),
                                  }));
                                  setHasChanges(true);
                                }}
                                className="text-sm font-medium text-red-500 hover:text-red-700"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">No other active sessions.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SAVE STATUS BANNER */}
              {saved && (
                <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-700 border border-emerald-200">
                  <CheckCircle size={16} />
                  <span>Your profile and settings have been saved successfully!</span>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
