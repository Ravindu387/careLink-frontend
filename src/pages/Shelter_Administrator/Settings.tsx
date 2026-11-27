
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { apiClient } from "../../services/api";

import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronRight,
  Users,
  House,
  Settings,
  ShieldCheck,
  Upload,
  Eye,
  EyeOff,
  Check,
  Save,
  X,
  Mail,
  Smartphone,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

type SettingsTab =
  | "profile"
  | "shelter"
  | "security"
  | "notifications";

type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
  role: string;
};

type ShelterData = {
  name: string;
  location: string;
  capacity: string;
  manager: string;
  address: string;
};

type SecurityPreferences = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactor: boolean;
  loginAlerts: boolean;
};

// FIX: Shared notification type
type NotificationPreferences = {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  critical: boolean;
  requests: boolean;
  inventory: boolean;
  system: boolean;
};

// ============================================
// MAIN SETTINGS PAGE
// ============================================

export default function SettingsPage() {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("profile");

  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    apiClient.get<any>("/settings").then((res) => {
      if (res?.profile) setProfile((prev) => ({ ...prev, ...res.profile }));
      if (res?.shelter) setShelter((prev) => ({ ...prev, ...res.shelter }));
    }).catch(() => {});
  }, []);

  const [profile, setProfile] = useState<ProfileData>({
    fullName: "Sanjana Amarasinghe",
    email: "sanjana@carelink.org",
    phone: "+94 77 321 8490",
    role: "Shelter Administrator",
  });

  const [shelter, setShelter] = useState<ShelterData>({
    name: "Riverton Central School",
    location: "Central District",
    capacity: "660",
    manager: "Sanjana Amarasinghe",
    address: "Riverton, Greater Riverton",
  });

  const [security, setSecurity] =
    useState<SecurityPreferences>({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactor: true,
      loginAlerts: true,
    });

  // FIX: Explicitly define the state type
  const [notifications, setNotifications] =
    useState<NotificationPreferences>({
      inApp: true,
      email: true,
      sms: false,
      critical: true,
      requests: true,
      inventory: true,
      system: false,
    });

  // ============================================
  // UPDATE FUNCTIONS
  // ============================================

  const updateProfile = (
    key: keyof ProfileData,
    value: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateShelter = (
    key: keyof ShelterData,
    value: string
  ) => {
    setShelter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ============================================
  // SAVE SETTINGS
  // ============================================

  const handleSave = () => {
    if (
      activeTab === "security" &&
      security.newPassword &&
      security.newPassword !== security.confirmPassword
    ) {
      alert("New password and confirm password do not match.");
      return;
    }

    apiClient.put("/settings", {
      profile,
      shelter,
      notifications,
    }).catch(() => {});

    setSaved(true);
  };

  // ============================================
  // SIDEBAR MENU
  // ============================================

  const menuItems = [
    {
      id: "profile" as SettingsTab,
      label: "Profile Settings",
      icon: Users,
    },
    {
      id: "shelter" as SettingsTab,
      label: "Shelter Settings",
      icon: House,
    },
    {
      id: "security" as SettingsTab,
      label: "Security Settings",
      icon: Settings,
    },
    {
      id: "notifications" as SettingsTab,
      label: "Notification Settings",
      icon: Bell,
    },
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60]">

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-8 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-sm mb-9">
          <span className="text-slate-500">CareLink</span>

          <ChevronRight
            size={12}
            className="text-slate-400"
          />

          <span className="text-slate-500">
            Shelter Administration
          </span>

          <ChevronRight
            size={12}
            className="text-slate-400"
          />

          <span className="font-semibold">
            Settings
          </span>
        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Settings
            </h1>

            <p className="text-xs text-slate-500 mt-1.5">
              Manage your profile, shelter configuration,
              security, and notifications.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="h-10 px-5 bg-[#1c638a] hover:bg-[#164d6d] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            {saved ? (
              <Check size={15} />
            ) : (
              <Save size={15} />
            )}

            {saved ? "Saved successfully" : "Save changes"}
          </button>
        </div>

        {/* SETTINGS LAYOUT */}

        <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-4 items-start">

          {/* LEFT SIDEBAR */}

          <aside className="bg-white rounded-xl border border-[#d7e4e9] p-2 shadow-sm">

            <div className="flex md:flex-col gap-1 overflow-x-auto">

              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSaved(false);
                    }}
                    className={`min-w-fit w-full h-[50px] px-3.5 flex items-center justify-between rounded-lg transition ${
                      active
                        ? "bg-[#e6f1f5] text-[#1c638a] font-semibold"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={19} />

                      <span className="text-sm">
                        {item.label}
                      </span>
                    </span>

                    <ChevronRight size={15} />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* RIGHT CONTENT */}

          <section className="bg-white rounded-xl border border-[#d7e4e9] shadow-sm p-5 md:p-6 min-h-[345px]">

            {activeTab === "profile" && (
              <ProfileSettings
                profile={profile}
                updateProfile={updateProfile}
              />
            )}

            {activeTab === "shelter" && (
              <ShelterSettings
                shelter={shelter}
                updateShelter={updateShelter}
              />
            )}

            {activeTab === "security" && (
              <SecuritySettings
                security={security}
                setSecurity={setSecurity}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationSettings
                notifications={notifications}
                setNotifications={setNotifications}
              />
            )}
          </section>
        </div>

        {/* SUCCESS MESSAGE */}

        {saved && (
          <div className="fixed bottom-5 right-5 bg-[#123e60] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 text-xs z-50">
            <Check size={16} className="text-[#35d3a5]" />
            Settings saved successfully.
            <button
              onClick={() => setSaved(false)}
              className="ml-2"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================
// PROFILE SETTINGS
// ============================================

function ProfileSettings({
  profile,
  updateProfile,
}: {
  profile: ProfileData;
  updateProfile: (
    key: keyof ProfileData,
    value: string
  ) => void;
}) {
  return (
    <div>
      <SectionHeading
        title="Profile Settings"
        description="Update your profile settings for CareLink shelter operations."
      />

      <div className="border-t border-[#d7e4e9] pt-4 mt-5">

        {/* PROFILE PHOTO */}

        <div className="flex items-center justify-between mb-5">

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#1c638a] text-white flex items-center justify-center font-bold text-sm">
              SA
            </div>

            <div>
              <p className="text-sm font-semibold">
                Profile photo
              </p>

              <p className="text-xs text-slate-400 mt-1">
                JPG or PNG · maximum 2 MB
              </p>
            </div>
          </div>

          <label className="h-10 px-4 border border-[#aac4d2] rounded-lg flex items-center gap-2 text-sm font-semibold text-[#1c638a] hover:bg-slate-50 cursor-pointer">
            <Upload size={15} />
            Upload photo

            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
            />
          </label>
        </div>

        {/* PROFILE FORM */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">

          <FormField
            label="Full name"
            value={profile.fullName}
            onChange={(v) =>
              updateProfile("fullName", v)
            }
          />

          <FormField
            label="Email address"
            value={profile.email}
            onChange={(v) =>
              updateProfile("email", v)
            }
            type="email"
          />

          <FormField
            label="Contact number"
            value={profile.phone}
            onChange={(v) =>
              updateProfile("phone", v)
            }
          />

          <FormField
            label="Role"
            value={profile.role}
            onChange={(v) =>
              updateProfile("role", v)
            }
            disabled
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// SHELTER SETTINGS
// ============================================

function ShelterSettings({
  shelter,
  updateShelter,
}: {
  shelter: ShelterData;
  updateShelter: (
    key: keyof ShelterData,
    value: string
  ) => void;
}) {
  return (
    <div>
      <SectionHeading
        title="Shelter Settings"
        description="Manage your registered shelter information and operational configuration."
      />

      <div className="border-t border-slate-200 mt-5 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

        <FormField
          label="Shelter name"
          value={shelter.name}
          onChange={(v) =>
            updateShelter("name", v)
          }
        />

        <FormField
          label="District"
          value={shelter.location}
          onChange={(v) =>
            updateShelter("location", v)
          }
        />

        <FormField
          label="Total capacity"
          value={shelter.capacity}
          onChange={(v) =>
            updateShelter("capacity", v)
          }
          type="number"
        />

        <FormField
          label="Shelter manager"
          value={shelter.manager}
          onChange={(v) =>
            updateShelter("manager", v)
          }
        />

        <div className="sm:col-span-2">
          <FormField
            label="Shelter address"
            value={shelter.address}
            onChange={(v) =>
              updateShelter("address", v)
            }
          />
        </div>
      </div>

      <div className="mt-6 bg-[#eef8f5] rounded-lg p-4 flex items-start gap-3">
        <House
          size={18}
          className="text-[#35b48e]"
        />

        <div>
          <p className="text-sm font-semibold">
            Shelter configuration
          </p>

          <p className="text-[13px] text-slate-500 mt-1">
            Changes to shelter capacity should be verified
            by an authorised administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECURITY SETTINGS
// ============================================

function SecuritySettings({
  security,
  setSecurity,
  showPassword,
  setShowPassword,
}: {
  security: SecurityPreferences;
  setSecurity: Dispatch<
    SetStateAction<SecurityPreferences>
  >;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}) {
  const passwordFields: {
    label: string;
    key:
      | "currentPassword"
      | "newPassword"
      | "confirmPassword";
  }[] = [
    {
      label: "Current password",
      key: "currentPassword",
    },
    {
      label: "New password",
      key: "newPassword",
    },
    {
      label: "Confirm new password",
      key: "confirmPassword",
    },
  ];

  return (
    <div>
      <SectionHeading
        title="Security Settings"
        description="Manage your password, authentication, and account security."
      />

      <div className="border-t border-slate-200 mt-5 pt-5">

        <h3 className="text-base font-semibold mb-4">
          Change password
        </h3>

        {passwordFields.map((field) => (
          <div key={field.key} className="mb-4">

            <label className="block text-sm font-semibold mb-2">
              {field.label}
            </label>

            <div className="relative">
              <input
                type={
                  showPassword ? "text" : "password"
                }
                value={security[field.key]}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-full h-10 border border-[#d7e4e9] rounded-lg px-3 pr-10 text-sm sm:text-[15px] outline-none focus:border-[#35b48e]"
                placeholder={field.label}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>
        ))}

        <div className="border-t border-slate-200 mt-6 pt-5">

          <h3 className="text-base font-semibold mb-3">
            Account protection
          </h3>

          <ToggleRow
            label="Two-factor authentication"
            description="Require additional verification when signing in."
            checked={security.twoFactor}
            onChange={(v) =>
              setSecurity((prev) => ({
                ...prev,
                twoFactor: v,
              }))
            }
          />

          <ToggleRow
            label="Login alerts"
            description="Receive alerts when a new device accesses your account."
            checked={security.loginAlerts}
            onChange={(v) =>
              setSecurity((prev) => ({
                ...prev,
                loginAlerts: v,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// NOTIFICATION SETTINGS
// ============================================

function NotificationSettings({
  notifications,
  setNotifications,
}: {
  notifications: NotificationPreferences;

  // FIX: Same type as useState
  setNotifications: Dispatch<
    SetStateAction<NotificationPreferences>
  >;
}) {
  const update = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // FIX: Explicitly typed keys
  const notificationOptions: {
    label: string;
    key: keyof NotificationPreferences;
  }[] = [
    {
      label: "Critical alerts",
      key: "critical",
    },
    {
      label: "Accommodation requests",
      key: "requests",
    },
    {
      label: "Inventory updates",
      key: "inventory",
    },
    {
      label: "System updates",
      key: "system",
    },
  ];

  return (
    <div>
      <SectionHeading
        title="Notification Settings"
        description="Choose how you receive operational notifications and alerts."
      />

      <div className="border-t border-slate-200 mt-5 pt-5">

        {/* DELIVERY CHANNELS */}

        <h3 className="text-base font-semibold mb-3">
          Delivery channels
        </h3>

        <ToggleRow
          icon={<Bell size={15} />}
          label="In-app notifications"
          description="Receive alerts inside your CareLink dashboard."
          checked={notifications.inApp}
          onChange={(v) => update("inApp", v)}
        />

        <ToggleRow
          icon={<Mail size={15} />}
          label="Email notifications"
          description="Receive operational updates by email."
          checked={notifications.email}
          onChange={(v) => update("email", v)}
        />

        <ToggleRow
          icon={<Smartphone size={15} />}
          label="SMS notifications"
          description="Receive important alerts through SMS."
          checked={notifications.sms}
          onChange={(v) => update("sms", v)}
        />

        {/* NOTIFICATION CATEGORIES */}

        <div className="border-t border-slate-200 mt-5 pt-5">

          <h3 className="text-base font-semibold mb-3">
            Notification categories
          </h3>

          {notificationOptions.map((option) => (
            <ToggleRow
              key={option.key}
              label={option.label}
              checked={notifications[option.key]}
              onChange={(v) =>
                update(option.key, v)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SHARED SECTION HEADING
// ============================================

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold">
        {title}
      </h2>

      <p className="text-[13px] text-slate-500 mt-4">
        {description}
      </p>
    </div>
  );
}

// ============================================
// SHARED FORM FIELD
// ============================================

function FormField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[43px] border border-[#d7e4e9] rounded-lg px-3 text-sm sm:text-[15px] outline-none focus:border-[#35b48e] disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );
}

// ============================================
// SHARED TOGGLE ROW
// ============================================

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex justify-between items-center gap-4 py-3 border-b border-slate-100">

      <div className="flex items-center gap-2">

        {icon && (
          <span className="text-[#287da7]">
            {icon}
          </span>
        )}

        <div>
          <p className="text-sm font-medium">
            {label}
          </p>

          {description && (
            <p className="text-xs text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-10 h-[22px] rounded-full relative shrink-0 transition ${
          checked
            ? "bg-[#35b48e]"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition ${
            checked
              ? "left-[21px]"
              : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
