import { useState, useEffect } from "react";
import {
  ChevronRight,
  Users,
  ShieldCheck,
  Settings as SettingsIcon,
  Check,
  Save,
  Lock,
  Smartphone,
  Clock,
  Shield,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { fundingSettingsService } from "../../services/fundingSettingsService";
import type { FundingSettings } from "../../types/fundingSettings";

type TabType = "profile" | "funding" | "notifications" | "security";

export default function FundingSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const [settings, setSettings] = useState<FundingSettings>({
    fullName: "Maria Kone",
    email: "maria@reliefos.org",
    contact: "+94 77 412 8041",
    currency: "USD",
    approvalLimit: 50000,
    requireApproval: true,
    dualApproval: true,
    autoVerification: false,
    restrictedAllocation: true,
    emailNotifications: true,
    inAppNotifications: true,
    smsNotifications: false,
    notifyDonations: true,
    notifyApprovals: true,
    notifyCampaigns: true,
    notifySecurity: true,
    twoFactorEnabled: true,
    activeDevice: "Windows · Chrome",
    lastPasswordUpdate: "Recently",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const tabs = [
    {
      id: "profile" as TabType,
      label: "Profile",
      icon: Users,
    },
    {
      id: "funding" as TabType,
      label: "Funding Controls",
      icon: ShieldCheck,
    },
    {
      id: "notifications" as TabType,
      label: "Notification Preferences",
      icon: SettingsIcon,
    },
    {
      id: "security" as TabType,
      label: "Security & Sessions",
      icon: Shield,
    },
  ];

  const fetchSettings = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fundingSettingsService.getSettings();
      setSettings(data);
    } catch (err: unknown) {
      console.error("Failed to load funding settings:", err);
      setFetchError(
        err instanceof Error ? err.message : "Failed to load settings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveErrorMessage(null);
    try {
      const updated = await fundingSettingsService.updateSettings(settings);
      setSettings(updated);
      setShowSavedToast(true);
      window.setTimeout(() => {
        setShowSavedToast(false);
      }, 3500);
    } catch (err: unknown) {
      console.error("Failed to update funding settings:", err);
      setSaveErrorMessage(
        err instanceof Error ? err.message : "Failed to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fundingSettingsService.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(res.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSettings((prev) => ({
        ...prev,
        lastPasswordUpdate: "Just now",
      }));
      window.setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(null);
      }, 1800);
    } catch (err: unknown) {
      console.error("Failed to change password:", err);
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password. Please verify current password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60]">
      {/* MAIN CONTENT */}
      <main className="max-w-[1700px] mx-auto px-5 md:px-[37px] py-5">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[11px] mb-6">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={14} />
          <span className="text-slate-500">Funding & Donations</span>
          <ChevronRight size={14} />
          <span className="font-semibold text-[#123e60]">Settings</span>
        </div>

        {/* PAGE HEADING */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[30px] font-medium tracking-tight">Settings</h1>
            <p className="text-[14px] text-slate-500 mt-1">
              Manage funding preferences, approval thresholds, notifications, and account security.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="h-[50px] px-5 bg-[#287ba5] hover:bg-[#1e6489] disabled:opacity-50 text-white rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Saving...
                </>
              ) : showSavedToast ? (
                <>
                  <Check size={17} />
                  Saved successfully
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {fetchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-[13px]">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={fetchSettings}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {saveErrorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-[13px]">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0" />
              <span>{saveErrorMessage}</span>
            </div>
            <button
              onClick={() => setSaveErrorMessage(null)}
              className="text-red-600 hover:text-red-800 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* SETTINGS LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[337px_minmax(0,1fr)] gap-[17px] items-start">
          {/* SIDEBAR TABS */}
          <aside className="bg-white border border-[#d5e3e9] rounded-xl p-[10px] shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full min-h-[59px] px-4 rounded-lg flex items-center gap-3 text-left transition-colors cursor-pointer ${
                      active
                        ? "bg-[#e7f1f6] text-[#287ba5]"
                        : "text-slate-500 hover:bg-[#f4f8fa]"
                    }`}
                  >
                    <Icon size={23} strokeWidth={1.8} />
                    <span className="flex-1 text-[12px] font-medium">{tab.label}</span>
                    <ChevronRight size={20} />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* MAIN FORM CONTENT */}
          <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm p-5 md:p-7 min-w-0">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-[#287ba5]" />
                <p className="text-[13px]">Loading funding settings...</p>
              </div>
            ) : (
              <>
                {/* PROFILE TAB */}
                {activeTab === "profile" && (
                  <div>
                    <div className="mb-5">
                      <h2 className="text-[16px] font-medium">Profile</h2>
                      <p className="text-[12px] text-slate-500 mt-1">
                        Configure profile for your Funding Officer workspace.
                      </p>
                    </div>

                    <div className="border-t border-[#d5e3e9] pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                        {/* FULL NAME */}
                        <div>
                          <label className="block text-[11px] font-semibold mb-2">
                            Full name
                          </label>
                          <input
                            type="text"
                            value={settings.fullName}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                fullName: e.target.value,
                              }))
                            }
                            className="w-full h-[53px] px-3 rounded-xl border border-[#d5e3e9] text-[12px] outline-none focus:border-[#287ba5]"
                          />
                        </div>

                        {/* EMAIL */}
                        <div>
                          <label className="block text-[11px] font-semibold mb-2">
                            Email address
                          </label>
                          <input
                            type="email"
                            value={settings.email}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="w-full h-[53px] px-3 rounded-xl border border-[#d5e3e9] text-[12px] outline-none focus:border-[#287ba5]"
                          />
                        </div>

                        {/* CONTACT */}
                        <div>
                          <label className="block text-[11px] font-semibold mb-2">
                            Contact number
                          </label>
                          <input
                            type="tel"
                            value={settings.contact}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                contact: e.target.value,
                              }))
                            }
                            className="w-full h-[53px] px-3 rounded-xl border border-[#d5e3e9] text-[12px] outline-none focus:border-[#287ba5]"
                          />
                        </div>

                        {/* CURRENCY */}
                        <div>
                          <label className="block text-[11px] font-semibold mb-2">
                            Reporting currency
                          </label>
                          <select
                            value={settings.currency}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                currency: e.target.value,
                              }))
                            }
                            className="w-full h-[53px] px-3 rounded-xl border border-[#d5e3e9] text-[12px] outline-none bg-white focus:border-[#287ba5]"
                          >
                            <option value="USD">USD · US Dollar</option>
                            <option value="LKR">LKR · Sri Lankan Rupee</option>
                            <option value="EUR">EUR · Euro</option>
                            <option value="GBP">GBP · British Pound</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FUNDING CONTROLS TAB */}
                {activeTab === "funding" && (
                  <div>
                    <SectionHeading
                      title="Funding Controls"
                      description="Configure financial approval rules and allocation permissions."
                    />

                    <div className="border-t border-[#d5e3e9] pt-5 space-y-6">
                      <div>
                        <label className="block text-[11px] font-semibold mb-2">
                          Approval threshold ({settings.currency})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={settings.approvalLimit}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              approvalLimit: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-full max-w-[400px] h-[48px] px-3 border border-[#d5e3e9] rounded-xl text-[12px] outline-none focus:border-[#287ba5]"
                        />
                        <p className="text-[10px] text-slate-400 mt-2">
                          Transactions above this amount require additional supervisory approval.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <SettingToggle
                          title="Require approval"
                          description="Require manual approval before funds are allocated."
                          checked={settings.requireApproval}
                          onChange={() =>
                            setSettings((prev) => ({
                              ...prev,
                              requireApproval: !prev.requireApproval,
                            }))
                          }
                        />

                        <SettingToggle
                          title="Dual approval"
                          description="Require two authorised officers for high-value transactions."
                          checked={settings.dualApproval}
                          onChange={() =>
                            setSettings((prev) => ({
                              ...prev,
                              dualApproval: !prev.dualApproval,
                            }))
                          }
                        />

                        <SettingToggle
                          title="Automatic verification"
                          description="Allow eligible records to pass automatic initial verification."
                          checked={settings.autoVerification}
                          onChange={() =>
                            setSettings((prev) => ({
                              ...prev,
                              autoVerification: !prev.autoVerification,
                            }))
                          }
                        />

                        <SettingToggle
                          title="Restricted allocation"
                          description="Only allow allocations to approved humanitarian purposes."
                          checked={settings.restrictedAllocation}
                          onChange={() =>
                            setSettings((prev) => ({
                              ...prev,
                              restrictedAllocation: !prev.restrictedAllocation,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === "notifications" && (
                  <div>
                    <SectionHeading
                      title="Notification Preferences"
                      description="Manage how you receive funding updates and important alerts."
                    />

                    <div className="border-t border-[#d5e3e9] pt-5 space-y-6">
                      <div>
                        <h3 className="text-[12px] font-semibold mb-4">
                          Delivery channels
                        </h3>

                        <div className="space-y-4">
                          <SettingToggle
                            title="Email notifications"
                            description="Receive updates through your registered email address."
                            checked={settings.emailNotifications}
                            onChange={() =>
                              setSettings((prev) => ({
                                ...prev,
                                emailNotifications: !prev.emailNotifications,
                              }))
                            }
                          />

                          <SettingToggle
                            title="In-app notifications"
                            description="Receive alerts directly in your CareLink workspace."
                            checked={settings.inAppNotifications}
                            onChange={() =>
                              setSettings((prev) => ({
                                ...prev,
                                inAppNotifications: !prev.inAppNotifications,
                              }))
                            }
                          />

                          <SettingToggle
                            title="SMS notifications"
                            description="Receive important alerts through text messages."
                            checked={settings.smsNotifications}
                            onChange={() =>
                              setSettings((prev) => ({
                                ...prev,
                                smsNotifications: !prev.smsNotifications,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="border-t border-[#d5e3e9] pt-5">
                        <h3 className="text-[12px] font-semibold mb-4">
                          Notification categories
                        </h3>

                        <div className="space-y-4">
                          <SettingToggle
                            title="Donation updates"
                            description="New donations and contribution records."
                            checked={settings.notifyDonations}
                            onChange={() =>
                              setSettings((prev) => ({
                                ...prev,
                                notifyDonations: !prev.notifyDonations,
                              }))
                            }
                          />

                          <SettingToggle
                            title="Funding approvals"
                            description="Approval requests and allocation decisions."
                            checked={settings.notifyApprovals}
                            onChange={() =>
                              setSettings((prev) => ({
                                ...prev,
                                notifyApprovals: !prev.notifyApprovals,
                              }))
                            }
                          />

                          <SettingToggle
                            title="Campaign updates"
                            description="Campaign progress, targets and deadlines."
                            checked={settings.notifyCampaigns}
                            onChange={() =>
                              setSettings((prev) => ({
                                ...prev,
                                notifyCampaigns: !prev.notifyCampaigns,
                              }))
                            }
                          />

                          <SettingToggle
                            title="Security alerts"
                            description="Important account and security notifications."
                            checked={settings.notifySecurity}
                            onChange={() =>
                              setSettings((prev) => ({
                                ...prev,
                                notifySecurity: !prev.notifySecurity,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECURITY TAB */}
                {activeTab === "security" && (
                  <div>
                    <SectionHeading
                      title="Security & Sessions"
                      description="Manage your account security and active sessions."
                    />

                    <div className="border-t border-[#d5e3e9] pt-5 space-y-5">
                      <div className="flex items-center gap-3 p-4 bg-[#edf6fa] rounded-xl">
                        <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center text-[#287ba5] shrink-0">
                          <Shield size={22} />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold">Account security</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Keep your funding officer account protected with multi-factor authentication and strong credentials.
                          </p>
                        </div>
                      </div>

                      {/* PASSWORD ROW */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[#e4edf1]">
                        <div className="flex items-center gap-3">
                          <Lock size={19} className="text-[#287ba5] shrink-0" />
                          <div>
                            <p className="text-[12px] font-semibold">Password</p>
                            <p className="text-[10px] text-slate-500">
                              Last updated: {settings.lastPasswordUpdate}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPasswordError(null);
                            setPasswordSuccess(null);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                            setIsPasswordModalOpen(true);
                          }}
                          className="px-4 py-2 border border-[#b9cfda] hover:bg-[#edf6fa] rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Change password
                        </button>
                      </div>

                      {/* 2FA ROW */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[#e4edf1]">
                        <div className="flex items-center gap-3">
                          <ShieldCheck size={19} className="text-[#159b79] shrink-0" />
                          <div>
                            <p className="text-[12px] font-semibold">
                              Two-factor authentication
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Additional protection for your financial authority account.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              twoFactorEnabled: !prev.twoFactorEnabled,
                            }))
                          }
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                            settings.twoFactorEnabled
                              ? "bg-[#e5f6f0] text-[#159b79] hover:bg-[#d5eee5]"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {settings.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </button>
                      </div>

                      {/* ACTIVE SESSIONS */}
                      <div className="pt-2">
                        <h3 className="text-[12px] font-semibold mb-4">
                          Active session
                        </h3>

                        <div className="border border-[#d5e3e9] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#e8f1f6] rounded-lg flex items-center justify-center text-[#287ba5] shrink-0">
                              <Smartphone size={20} />
                            </div>

                            <div>
                              <p className="text-[11px] font-semibold">
                                {settings.activeDevice || "Windows · Chrome"}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Current device · Active now
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] text-[#159b79] font-semibold flex items-center gap-1">
                            <Check size={13} />
                            Current session
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-2">
                        <Clock size={14} />
                        Security settings are managed in compliance with organizational financial policies.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* CHANGE PASSWORD MODAL */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-[#d5e3e9] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#e4edf1] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#edf6fa] flex items-center justify-center text-[#287ba5]">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold">Change Password</h3>
                    <p className="text-[11px] text-slate-400">Update your security credentials</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-[12px]">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-700 text-[12px]">
                  <Check size={16} className="shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold mb-1.5 text-slate-700">
                    Current password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full h-[46px] px-3 rounded-xl border border-[#d5e3e9] text-[12px] outline-none focus:border-[#287ba5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1.5 text-slate-700">
                    New password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full h-[46px] px-3 rounded-xl border border-[#d5e3e9] text-[12px] outline-none focus:border-[#287ba5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1.5 text-slate-700">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full h-[46px] px-3 rounded-xl border border-[#d5e3e9] text-[12px] outline-none focus:border-[#287ba5]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e4edf1] mt-5">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 h-[42px] rounded-xl border border-[#d5e3e9] text-[12px] font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 h-[42px] bg-[#287ba5] hover:bg-[#1e6489] disabled:opacity-50 text-white rounded-xl text-[12px] font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SAVE SUCCESS FLOATING TOAST */}
        {showSavedToast && (
          <div className="fixed bottom-6 right-6 bg-[#143e5d] text-white rounded-xl px-5 py-3 shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
            <Check size={18} className="text-[#57d6ad]" />
            <div>
              <p className="text-[12px] font-semibold">Changes saved</p>
              <p className="text-[10px] text-slate-300">
                Your settings have been updated successfully.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ====================================
// SECTION HEADING
// ====================================

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-[16px] font-medium">{title}</h2>
      <p className="text-[12px] text-slate-500 mt-1">{description}</p>
    </div>
  );
}

// ====================================
// REUSABLE TOGGLE COMPONENT
// ====================================

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[12px] font-medium">{title}</p>
        <p className="text-[10px] text-slate-500 mt-1">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`w-[43px] h-[24px] shrink-0 rounded-full p-[3px] transition-colors cursor-pointer ${
          checked ? "bg-[#287ba5]" : "bg-slate-300"
        }`}
      >
        <span
          className={`block w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[19px]" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
