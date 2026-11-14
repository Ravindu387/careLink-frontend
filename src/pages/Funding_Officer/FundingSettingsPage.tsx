
import { useState } from "react";
import {
  Menu,
  Search,
  Globe,
  Bell,
  CircleHelp,
  ChevronRight,
  Users,
  ShieldCheck,
  Settings as SettingsIcon,
  Check,
  Save,
  Lock,
  Mail,
  Smartphone,
  Clock,
  Shield,
} from "lucide-react";

type TabType =
  | "profile"
  | "funding"
  | "notifications"
  | "security";

type Profile = {
  fullName: string;
  email: string;
  contact: string;
  currency: string;
};

type NotificationSettings = {
  email: boolean;
  inApp: boolean;
  sms: boolean;
  donations: boolean;
  approvals: boolean;
  campaigns: boolean;
  security: boolean;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const [profile, setProfile] = useState<Profile>({
    fullName: "Maria Kone",
    email: "maria@reliefos.org",
    contact: "+94 77 412 8041",
    currency: "USD",
  });

  const [fundingControls, setFundingControls] = useState({
    approvalLimit: "50000",
    requireApproval: true,
    dualApproval: true,
    autoVerification: false,
    restrictedAllocation: true,
  });

  const [notifications, setNotifications] =
    useState<NotificationSettings>({
      email: true,
      inApp: true,
      sms: false,
      donations: true,
      approvals: true,
      campaigns: true,
      security: true,
    });

  const [showSaved, setShowSaved] = useState(false);

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
      icon: Bell,
    },
    {
      id: "security" as TabType,
      label: "Security & Sessions",
      icon: SettingsIcon,
    },
  ];

  const updateProfile = (
    field: keyof Profile,
    value: string
  ) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleNotification = (
    field: keyof NotificationSettings
  ) => {
    setNotifications((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSave = () => {
    // Connect this function to your backend API when available.
    setShowSaved(true);

    window.setTimeout(() => {
      setShowSaved(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60]">

      {/* MAIN CONTENT */}

      <main className="max-w-[1700px] mx-auto px-5 md:px-[37px] py-5">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[11px] mb-10">

          <span className="text-slate-500">
            Operations
          </span>

          <ChevronRight size={14} />

          <span className="text-slate-500">
            Funding & Donations
          </span>

          <ChevronRight size={14} />

          <span className="font-semibold text-[#123e60]">
            Settings
          </span>

        </div>

        {/* PAGE HEADING */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">

          <div>
            <h1 className="text-[30px] font-medium tracking-tight">
              Settings
            </h1>

            <p className="text-[14px] text-slate-500 mt-1">
              Manage funding preferences, approval thresholds,
              notifications, and account security.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="h-[50px] px-5 bg-[#287ba5] hover:bg-[#1e6489] text-white rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold shadow-sm"
          >
            {showSaved ? (
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

        {/* SETTINGS LAYOUT */}

        <div className="grid grid-cols-1 lg:grid-cols-[337px_minmax(0,1fr)] gap-[17px] items-start">

          {/* SIDEBAR */}

          <aside className="bg-white border border-[#d5e3e9] rounded-xl p-[10px] shadow-sm">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1">

              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full min-h-[59px] px-4 rounded-lg flex items-center gap-3 text-left transition-colors ${
                      active
                        ? "bg-[#e7f1f6] text-[#287ba5]"
                        : "text-slate-500 hover:bg-[#f4f8fa]"
                    }`}
                  >

                    <Icon
                      size={23}
                      strokeWidth={1.8}
                    />

                    <span className="flex-1 text-[12px] font-medium">
                      {tab.label}
                    </span>

                    <ChevronRight size={20} />

                  </button>
                );
              })}

            </div>

          </aside>

          {/* RIGHT CONTENT */}

          <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm p-5 md:p-7 min-w-0">

            {/* PROFILE SETTINGS */}

            {activeTab === "profile" && (
              <div>

                <div className="mb-5">

                  <h2 className="text-[16px] font-medium">
                    Profile
                  </h2>

                  <p className="text-[12px] text-slate-500 mt-1">
                    Configure profile for your Funding Officer workspace.
                  </p>

                </div>

                <div className="border-t border-[#d5e3e9] pt-1">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

                    {/* FULL NAME */}

                    <div>
                      <label className="block text-[11px] font-semibold mb-2">
                        Full name
                      </label>

                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) =>
                          updateProfile("fullName", e.target.value)
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
                        value={profile.email}
                        onChange={(e) =>
                          updateProfile("email", e.target.value)
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
                        value={profile.contact}
                        onChange={(e) =>
                          updateProfile("contact", e.target.value)
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
                        value={profile.currency}
                        onChange={(e) =>
                          updateProfile("currency", e.target.value)
                        }
                        className="w-full h-[53px] px-3 rounded-xl border border-[#d5e3e9] text-[12px] outline-none bg-white focus:border-[#287ba5]"
                      >
                        <option value="USD">
                          USD · US Dollar
                        </option>

                        <option value="LKR">
                          LKR · Sri Lankan Rupee
                        </option>

                        <option value="EUR">
                          EUR · Euro
                        </option>

                        <option value="GBP">
                          GBP · British Pound
                        </option>

                      </select>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* FUNDING CONTROLS */}

            {activeTab === "funding" && (
              <div>

                <SectionHeading
                  title="Funding Controls"
                  description="Configure financial approval rules and allocation permissions."
                />

                <div className="border-t border-[#d5e3e9] pt-5 space-y-6">

                  <div>
                    <label className="block text-[11px] font-semibold mb-2">
                      Approval threshold (USD)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={fundingControls.approvalLimit}
                      onChange={(e) =>
                        setFundingControls((prev) => ({
                          ...prev,
                          approvalLimit: e.target.value,
                        }))
                      }
                      className="w-full max-w-[400px] h-[48px] px-3 border border-[#d5e3e9] rounded-xl text-[12px] outline-none focus:border-[#287ba5]"
                    />

                    <p className="text-[10px] text-slate-400 mt-2">
                      Transactions above this amount require additional approval.
                    </p>
                  </div>

                  <div className="space-y-4">

                    <SettingToggle
                      title="Require approval"
                      description="Require manual approval before funds are allocated."
                      checked={fundingControls.requireApproval}
                      onChange={() =>
                        setFundingControls((prev) => ({
                          ...prev,
                          requireApproval: !prev.requireApproval,
                        }))
                      }
                    />

                    <SettingToggle
                      title="Dual approval"
                      description="Require two authorised officers for high-value transactions."
                      checked={fundingControls.dualApproval}
                      onChange={() =>
                        setFundingControls((prev) => ({
                          ...prev,
                          dualApproval: !prev.dualApproval,
                        }))
                      }
                    />

                    <SettingToggle
                      title="Automatic verification"
                      description="Allow eligible records to pass automatic initial verification."
                      checked={fundingControls.autoVerification}
                      onChange={() =>
                        setFundingControls((prev) => ({
                          ...prev,
                          autoVerification: !prev.autoVerification,
                        }))
                      }
                    />

                    <SettingToggle
                      title="Restricted allocation"
                      description="Only allow allocations to approved humanitarian purposes."
                      checked={fundingControls.restrictedAllocation}
                      onChange={() =>
                        setFundingControls((prev) => ({
                          ...prev,
                          restrictedAllocation: !prev.restrictedAllocation,
                        }))
                      }
                    />

                  </div>

                </div>

              </div>
            )}

            {/* NOTIFICATION PREFERENCES */}

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
                        checked={notifications.email}
                        onChange={() => toggleNotification("email")}
                      />

                      <SettingToggle
                        title="In-app notifications"
                        description="Receive alerts directly in your CareLink workspace."
                        checked={notifications.inApp}
                        onChange={() => toggleNotification("inApp")}
                      />

                      <SettingToggle
                        title="SMS notifications"
                        description="Receive important alerts through text messages."
                        checked={notifications.sms}
                        onChange={() => toggleNotification("sms")}
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
                        checked={notifications.donations}
                        onChange={() => toggleNotification("donations")}
                      />

                      <SettingToggle
                        title="Funding approvals"
                        description="Approval requests and allocation decisions."
                        checked={notifications.approvals}
                        onChange={() => toggleNotification("approvals")}
                      />

                      <SettingToggle
                        title="Campaign updates"
                        description="Campaign progress, targets and deadlines."
                        checked={notifications.campaigns}
                        onChange={() => toggleNotification("campaigns")}
                      />

                      <SettingToggle
                        title="Security alerts"
                        description="Important account and security notifications."
                        checked={notifications.security}
                        onChange={() => toggleNotification("security")}
                      />

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* SECURITY SETTINGS */}

            {activeTab === "security" && (
              <div>

                <SectionHeading
                  title="Security & Sessions"
                  description="Manage your account security and active sessions."
                />

                <div className="border-t border-[#d5e3e9] pt-5 space-y-5">

                  <div className="flex items-center gap-3 p-4 bg-[#edf6fa] rounded-xl">

                    <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center text-[#287ba5]">
                      <Shield size={22} />
                    </div>

                    <div>
                      <p className="text-[12px] font-semibold">
                        Account security
                      </p>

                      <p className="text-[10px] text-slate-500 mt-1">
                        Keep your funding account protected.
                      </p>
                    </div>

                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[#e4edf1]">

                    <div className="flex items-center gap-3">
                      <Lock size={19} className="text-[#287ba5]" />

                      <div>
                        <p className="text-[12px] font-semibold">
                          Password
                        </p>

                        <p className="text-[10px] text-slate-500">
                          Last updated recently
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        alert("Connect password change API here.")
                      }
                      className="px-4 py-2 border border-[#b9cfda] rounded-lg text-[10px]"
                    >
                      Change password
                    </button>

                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[#e4edf1]">

                    <div className="flex items-center gap-3">
                      <ShieldCheck size={19} className="text-[#159b79]" />

                      <div>
                        <p className="text-[12px] font-semibold">
                          Two-factor authentication
                        </p>

                        <p className="text-[10px] text-slate-500">
                          Additional protection for your account.
                        </p>
                      </div>
                    </div>

                    <span className="bg-[#e5f6f0] text-[#159b79] px-3 py-2 rounded-lg text-[10px] font-semibold">
                      Enabled
                    </span>

                  </div>

                  <div className="pt-2">

                    <h3 className="text-[12px] font-semibold mb-4">
                      Active session
                    </h3>

                    <div className="border border-[#d5e3e9] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 bg-[#e8f1f6] rounded-lg flex items-center justify-center text-[#287ba5]">
                          <Smartphone size={20} />
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold">
                            Windows · Chrome
                          </p>

                          <p className="text-[10px] text-slate-500 mt-1">
                            Current device · Active now
                          </p>
                        </div>

                      </div>

                      <span className="text-[10px] text-[#159b79] font-semibold">
                        <Check size={13} className="inline mr-1" />
                        Current session
                      </span>

                    </div>

                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-2">
                    <Clock size={14} />
                    Security settings are managed by your account administrator.
                  </div>

                </div>

              </div>
            )}

          </section>

        </div>

        {/* SAVE SUCCESS MESSAGE */}

        {showSaved && (
          <div className="fixed bottom-6 right-6 bg-[#143e5d] text-white rounded-xl px-5 py-3 shadow-xl flex items-center gap-3 z-50">

            <Check size={18} className="text-[#57d6ad]" />

            <div>
              <p className="text-[12px] font-semibold">
                Changes saved
              </p>

              <p className="text-[10px] text-slate-300">
                Your settings have been updated.
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
      <h2 className="text-[16px] font-medium">
        {title}
      </h2>

      <p className="text-[12px] text-slate-500 mt-1">
        {description}
      </p>
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
        <p className="text-[12px] font-medium">
          {title}
        </p>

        <p className="text-[10px] text-slate-500 mt-1">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`w-[43px] h-[24px] shrink-0 rounded-full p-[3px] transition-colors ${
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
