import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Package,
  Truck,
  Bell,
  ShieldCheck,
  ChevronRight,
  Menu,
  Search,
  Settings,
  ChartNoAxesCombined,
  ClipboardList,
  GitBranch,
  ArrowLeftRight,
  ShoppingCart,
  BriefcaseBusiness,
  AlertTriangle,
  Clock3,
  Check,
  Save,
  Warehouse,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { settingsService } from "../../services/settingsService";
import type {
  ProfileSettings,
  InventoryRulesSettings,
  DispatchPreferencesSettings,
  NotificationPreferencesSettings,
  SecuritySettings
} from "../../types/settings";

type SettingTab =
  | "Profile"
  | "Inventory Rules"
  | "Dispatch Preferences"
  | "Notifications"
  | "Security";

const navigation = [
  { label: "Resource Dashboard", path: "/resource-manager/dashboard", icon: ChartNoAxesCombined },
  { label: "Inventory", path: "/resource-manager/inventory", icon: Package },
  { label: "Warehouses", path: "/resource-manager/warehouses", icon: Warehouse },
  { label: "Resource Requests", path: "/resource-manager/requests", icon: ClipboardList, count: 18 },
  { label: "Allocations", path: "/resource-manager/allocations", icon: GitBranch, count: 7 },
  { label: "Dispatch & Tracking", path: "/resource-manager/dispatch", icon: Truck, count: 12 },
  { label: "Stock Transfers", path: "/resource-manager/transfers", icon: ArrowLeftRight },
  { label: "Procurement", path: "/resource-manager/procurement", icon: ShoppingCart },
  { label: "Suppliers", path: "/resource-manager/suppliers", icon: BriefcaseBusiness },
  { label: "Alerts", path: "/resource-manager/alerts", icon: AlertTriangle, count: 9 },
  { label: "Reports & Analytics", path: "/resource-manager/reports", icon: ChartNoAxesCombined },
  { label: "Audit Log", path: "/resource-manager/audit-log", icon: Clock3 },
  { label: "Settings", path: "/resource-manager/settings", icon: Settings }
];

const tabs: {
  name: SettingTab;
  icon: typeof UserRound;
}[] = [
  { name: "Profile", icon: UserRound },
  { name: "Inventory Rules", icon: Package },
  { name: "Dispatch Preferences", icon: Truck },
  { name: "Notifications", icon: Bell },
  { name: "Security", icon: ShieldCheck }
];

const inputStyle =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs text-[#173d5b] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const defaultProfile: ProfileSettings = {
  fullName: "Daniel Perera",
  email: "daniel@logistics.gov",
  phone: "+94 77 412 8088",
  warehouse: "Central Logistics Hub"
};

const defaultInventory: InventoryRulesSettings = {
  lowStock: "20",
  criticalStock: "5",
  expiryDays: "30",
  autoReorder: true,
  trackExpiry: true,
  allowNegative: false
};

const defaultDispatch: DispatchPreferencesSettings = {
  defaultVehicle: "Truck",
  approval: "Manager approval required",
  proof: true,
  tracking: true,
  delayAlert: true
};

const defaultNotifications: NotificationPreferencesSettings = {
  email: true,
  system: true,
  critical: true,
  lowStock: true,
  dispatch: false,
  weekly: true
};

const defaultSecurity: SecuritySettings = {
  twoFactor: true,
  sessionTimeout: "30 minutes",
  loginAlerts: true
};

export default function SettingsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SettingTab>("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [profile, setProfile] = useState<ProfileSettings>(defaultProfile);
  const [inventory, setInventory] = useState<InventoryRulesSettings>(defaultInventory);
  const [dispatch, setDispatch] = useState<DispatchPreferencesSettings>(defaultDispatch);
  const [notifications, setNotifications] = useState<NotificationPreferencesSettings>(defaultNotifications);
  const [security, setSecurity] = useState<SecuritySettings>(defaultSecurity);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getSettings();
      if (data) {
        if (data.profile) setProfile(data.profile);
        if (data.inventory) setInventory(data.inventory);
        if (data.dispatch) setDispatch(data.dispatch);
        if (data.notifications) setNotifications(data.notifications);
        if (data.security) setSecurity(data.security);
        if (data.updatedAt) setLastUpdated(data.updatedAt);
      }
      setIsBackendConnected(true);
    } catch (error) {
      console.warn("Backend unavailable, loading local settings defaults:", error);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    const settingsData = {
      profile,
      inventory,
      dispatch,
      notifications,
      security
    };

    try {
      const response = await settingsService.updateSettings(settingsData);
      if (response?.updatedAt) {
        setLastUpdated(response.updatedAt);
      }
      setIsBackendConnected(true);
      setSaved(true);
      setStatusMessage({
        type: "success",
        text: "Settings saved successfully to backend server."
      });
      setTimeout(() => {
        setSaved(false);
        setStatusMessage(null);
      }, 4000);
    } catch (error) {
      console.warn("Failed to save to backend, saved locally:", error);
      setSaved(true);
      setStatusMessage({
        type: "info",
        text: "Changes saved in current session (backend API offline)."
      });
      setTimeout(() => {
        setSaved(false);
        setStatusMessage(null);
      }, 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all settings to defaults?")) {
      return;
    }

    setIsSaving(true);
    try {
      const data = await settingsService.resetSettings();
      if (data) {
        if (data.profile) setProfile(data.profile);
        if (data.inventory) setInventory(data.inventory);
        if (data.dispatch) setDispatch(data.dispatch);
        if (data.notifications) setNotifications(data.notifications);
        if (data.security) setSecurity(data.security);
        if (data.updatedAt) setLastUpdated(data.updatedAt);
      }
      setIsBackendConnected(true);
      setStatusMessage({
        type: "success",
        text: "All settings have been reset to system defaults."
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (error) {
      console.warn("Failed to reset via backend, resetting locally:", error);
      setProfile(defaultProfile);
      setInventory(defaultInventory);
      setDispatch(defaultDispatch);
      setNotifications(defaultNotifications);
      setSecurity(defaultSecurity);
      setStatusMessage({
        type: "info",
        text: "Settings reset to defaults locally."
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (field: keyof ProfileSettings, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const Toggle = ({
    checked,
    onChange
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-[#287da7]" : "bg-slate-300"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );

  const Field = ({
    label,
    value,
    onChange,
    type = "text"
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
  }) => (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold text-[#173d5b]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={inputStyle}
      />
    </label>
  );

  const SelectField = ({
    label,
    value,
    options,
    onChange
  }: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
  }) => (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold text-[#173d5b]">
        {label}
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={inputStyle}
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );

  const ToggleRow = ({
    title,
    description,
    checked,
    onChange
  }: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div>
        <p className="text-xs font-semibold text-[#173d5b]">{title}</p>
        <p className="mt-1 text-[10px] text-slate-400">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#173d5b]">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#143d5e] text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-[74px] items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#62b7a8] text-[#143d5e]">
            <Package size={23} />
          </div>

          <div>
            <h1 className="text-xl font-bold">ReliefOS</h1>
            <p className="text-[10px] text-sky-200">Resource Management</p>
          </div>
        </div>

        {/* OPERATION */}
        <div className="mx-4 mt-4 rounded-lg border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Operation
          </p>
          <p className="mt-2 text-xs font-bold">Monsoon Floods 2025</p>
          <p className="mt-1 text-[10px] text-sky-200">Greater Riverton · Level 4</p>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Logistics Operations
          </p>

          {navigation.map(item => {
            const Icon = item.icon;
            const active = item.label === "Settings";

            return (
              <button
                key={item.label}
                onClick={() => {
                  if (active) return;
                  if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[11px] transition ${
                  active
                    ? "border-l-[3px] border-[#62b7a8] bg-[#287ba5] font-semibold text-white"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />
                <span className="flex-1">{item.label}</span>

                {"count" in item && item.count && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* USER */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold">
            {profile.fullName
              ? profile.fullName
                  .split(" ")
                  .map(n => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "DP"}
          </div>
          <div className="flex-1 truncate">
            <p className="text-xs font-bold truncate">{profile.fullName || "Daniel Perera"}</p>
            <p className="text-[10px] text-sky-200">Resource Manager</p>
          </div>
          <ChevronRight size={18} />
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* MAIN */}
      <main className="min-h-screen lg:ml-[280px]">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 lg:px-7">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="flex max-w-[480px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
            <Search size={16} className="text-slate-400" />
            <input
              placeholder="Search resources, requests, dispatches..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden border-r border-slate-200 pr-5 text-right md:block">
              <p className="text-[9px] uppercase text-slate-400">Primary Hub</p>
              <p className="text-[10px] font-bold">{profile.warehouse || "Central Logistics Hub"}</p>
            </div>

            <button className="rounded-lg border p-2.5 hover:bg-slate-50" title="Security Status">
              <ShieldCheck size={18} />
            </button>

            <button className="relative rounded-lg border p-2.5 hover:bg-slate-50" title="Alerts">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">
                9
              </span>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287ba5] text-xs font-bold text-white">
              {profile.fullName
                ? profile.fullName
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "DP"}
            </div>

            <div className="hidden sm:block">
              <p className="text-[10px] font-bold">{profile.fullName || "Daniel P."}</p>
              <p className="text-[9px] text-slate-400">Resource Manager</p>
            </div>

            <ChevronRight size={17} className="hidden sm:block text-slate-400" />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="space-y-6 p-4 sm:p-6 lg:p-7">
          {/* BREADCRUMB & BACKEND BADGE */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <div>
              Resource Operations
              <ChevronRight size={12} className="mx-1 inline" />
              <span className="font-semibold text-[#173d5b]">Settings</span>
            </div>

            <div className="flex items-center gap-2">
              {isBackendConnected === true && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  API Connected
                </span>
              )}
              {isBackendConnected === false && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Offline Mode
                </span>
              )}
              {lastUpdated && (
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Last saved: {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* STATUS NOTIFICATION BANNER */}
          {statusMessage && (
            <div
              className={`flex items-center gap-3 rounded-lg border p-3.5 text-xs transition-all ${
                statusMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : statusMessage.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-sky-600 shrink-0" />
              )}
              <span className="flex-1 font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* TITLE & ACTIONS */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
              <p className="mt-2 text-xs text-slate-500">
                Manage logistics preferences, thresholds, notifications, and access security.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving || isLoading}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                title="Reset all settings to default values"
              >
                <RotateCcw size={14} />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="flex items-center gap-2 rounded-lg bg-[#287ba5] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1d668e] disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : saved ? (
                  <Check size={15} />
                ) : (
                  <Save size={15} />
                )}
                <span>
                  {isSaving ? "Saving..." : saved ? "Changes saved" : "Save changes"}
                </span>
              </button>
            </div>
          </div>

          {/* SETTINGS LAYOUT */}
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-8">
              <Loader2 size={28} className="animate-spin text-[#287ba5]" />
              <p className="text-xs text-slate-500">Loading settings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[272px_minmax(0,1fr)]">
              {/* SETTINGS MENU */}
              <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.name;

                  return (
                    <button
                      key={tab.name}
                      type="button"
                      onClick={() => setActiveTab(tab.name)}
                      className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-4 text-left text-[11px] transition last:mb-0 ${
                        active
                          ? "bg-[#e6f0f6] font-semibold text-[#287ba5]"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={19} />
                      <span className="flex-1">{tab.name}</span>
                      <ChevronRight size={17} />
                    </button>
                  );
                })}
              </div>

              {/* SETTINGS CONTENT */}
              <div className="min-h-[256px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                {/* PROFILE */}
                {activeTab === "Profile" && (
                  <div>
                    <h3 className="text-sm font-semibold">Profile</h3>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Configure profile for your Resource Manager workspace.
                    </p>

                    <div className="my-5 border-t border-slate-200" />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field
                        label="Full name"
                        value={profile.fullName}
                        onChange={v => updateProfile("fullName", v)}
                      />

                      <Field
                        label="Email address"
                        value={profile.email}
                        onChange={v => updateProfile("email", v)}
                        type="email"
                      />

                      <Field
                        label="Contact number"
                        value={profile.phone}
                        onChange={v => updateProfile("phone", v)}
                      />

                      <SelectField
                        label="Primary warehouse"
                        value={profile.warehouse}
                        options={[
                          "Central Logistics Hub",
                          "North District Hub",
                          "Eastbank Warehouse",
                          "West Coast Depot"
                        ]}
                        onChange={v => updateProfile("warehouse", v)}
                      />
                    </div>
                  </div>
                )}

                {/* INVENTORY RULES */}
                {activeTab === "Inventory Rules" && (
                  <div>
                    <h3 className="text-sm font-semibold">Inventory Rules</h3>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Configure stock thresholds and inventory management rules.
                    </p>

                    <div className="my-5 border-t border-slate-200" />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field
                        label="Low stock threshold (units)"
                        value={inventory.lowStock}
                        onChange={v =>
                          setInventory(p => ({ ...p, lowStock: v }))
                        }
                        type="number"
                      />

                      <Field
                        label="Critical stock threshold (units)"
                        value={inventory.criticalStock}
                        onChange={v =>
                          setInventory(p => ({ ...p, criticalStock: v }))
                        }
                        type="number"
                      />

                      <Field
                        label="Expiry warning (days)"
                        value={inventory.expiryDays}
                        onChange={v =>
                          setInventory(p => ({ ...p, expiryDays: v }))
                        }
                        type="number"
                      />
                    </div>

                    <div className="mt-5">
                      <ToggleRow
                        title="Automatic reorder alerts"
                        description="Notify managers when stock reaches reorder levels."
                        checked={inventory.autoReorder}
                        onChange={v =>
                          setInventory(p => ({ ...p, autoReorder: v }))
                        }
                      />

                      <ToggleRow
                        title="Track expiry dates"
                        description="Monitor resources approaching their expiry dates."
                        checked={inventory.trackExpiry}
                        onChange={v =>
                          setInventory(p => ({ ...p, trackExpiry: v }))
                        }
                      />

                      <ToggleRow
                        title="Allow negative inventory"
                        description="Permit stock quantities below zero."
                        checked={inventory.allowNegative}
                        onChange={v =>
                          setInventory(p => ({ ...p, allowNegative: v }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* DISPATCH PREFERENCES */}
                {activeTab === "Dispatch Preferences" && (
                  <div>
                    <h3 className="text-sm font-semibold">Dispatch Preferences</h3>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Configure dispatch, delivery, tracking, and approval preferences.
                    </p>

                    <div className="my-5 border-t border-slate-200" />

                    <SelectField
                      label="Default vehicle type"
                      value={dispatch.defaultVehicle}
                      options={["Truck", "Van", "Tanker", "Motorcycle"]}
                      onChange={v =>
                        setDispatch(p => ({
                          ...p,
                          defaultVehicle: v
                        }))
                      }
                    />

                    <div className="mt-4">
                      <SelectField
                        label="Dispatch approval"
                        value={dispatch.approval}
                        options={[
                          "Manager approval required",
                          "Automatic approval",
                          "Admin approval required"
                        ]}
                        onChange={v =>
                          setDispatch(p => ({
                            ...p,
                            approval: v
                          }))
                        }
                      />
                    </div>

                    <div className="mt-5">
                      <ToggleRow
                        title="Proof of delivery"
                        description="Require proof of delivery for completed dispatches."
                        checked={dispatch.proof}
                        onChange={v =>
                          setDispatch(p => ({ ...p, proof: v }))
                        }
                      />

                      <ToggleRow
                        title="Live dispatch tracking"
                        description="Enable live tracking of active deliveries."
                        checked={dispatch.tracking}
                        onChange={v =>
                          setDispatch(p => ({ ...p, tracking: v }))
                        }
                      />

                      <ToggleRow
                        title="Dispatch delay alerts"
                        description="Notify managers when deliveries are delayed."
                        checked={dispatch.delayAlert}
                        onChange={v =>
                          setDispatch(p => ({
                            ...p,
                            delayAlert: v
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS */}
                {activeTab === "Notifications" && (
                  <div>
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Manage alerts and communication preferences.
                    </p>

                    <div className="my-5 border-t border-slate-200" />

                    <ToggleRow
                      title="Email notifications"
                      description="Receive important updates through email."
                      checked={notifications.email}
                      onChange={v =>
                        setNotifications(p => ({ ...p, email: v }))
                      }
                    />

                    <ToggleRow
                      title="System notifications"
                      description="Receive notifications inside the platform."
                      checked={notifications.system}
                      onChange={v =>
                        setNotifications(p => ({ ...p, system: v }))
                      }
                    />

                    <ToggleRow
                      title="Critical alerts"
                      description="Get immediate notifications for critical incidents."
                      checked={notifications.critical}
                      onChange={v =>
                        setNotifications(p => ({ ...p, critical: v }))
                      }
                    />

                    <ToggleRow
                      title="Low stock notifications"
                      description="Receive alerts when inventory is running low."
                      checked={notifications.lowStock}
                      onChange={v =>
                        setNotifications(p => ({ ...p, lowStock: v }))
                      }
                    />

                    <ToggleRow
                      title="Dispatch updates"
                      description="Receive dispatch and delivery updates."
                      checked={notifications.dispatch}
                      onChange={v =>
                        setNotifications(p => ({ ...p, dispatch: v }))
                      }
                    />

                    <ToggleRow
                      title="Weekly summary"
                      description="Receive a weekly resource management summary."
                      checked={notifications.weekly}
                      onChange={v =>
                        setNotifications(p => ({ ...p, weekly: v }))
                      }
                    />
                  </div>
                )}

                {/* SECURITY */}
                {activeTab === "Security" && (
                  <div>
                    <h3 className="text-sm font-semibold">Security</h3>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Manage account access and workspace security.
                    </p>

                    <div className="my-5 border-t border-slate-200" />

                    <div className="mb-5 flex items-center gap-3 rounded-lg bg-[#eaf3f7] p-4">
                      <ShieldCheck size={25} className="text-sky-700" />
                      <div>
                        <p className="text-xs font-semibold">Account security</p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          Protect your Resource Manager account.
                        </p>
                      </div>
                    </div>

                    <ToggleRow
                      title="Two-factor authentication"
                      description="Require additional verification during login."
                      checked={security.twoFactor}
                      onChange={v =>
                        setSecurity(p => ({ ...p, twoFactor: v }))
                      }
                    />

                    <ToggleRow
                      title="Login alerts"
                      description="Receive alerts when a new login is detected."
                      checked={security.loginAlerts}
                      onChange={v =>
                        setSecurity(p => ({ ...p, loginAlerts: v }))
                      }
                    />

                    <div className="mt-5">
                      <SelectField
                        label="Session timeout"
                        value={security.sessionTimeout}
                        options={[
                          "15 minutes",
                          "30 minutes",
                          "1 hour",
                          "2 hours"
                        ]}
                        onChange={v =>
                          setSecurity(p => ({
                            ...p,
                            sessionTimeout: v
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <p className="flex items-center gap-2">
              <ShieldCheck size={13} />
              ReliefOS Resource Management System
            </p>
            <p>Settings &amp; Preferences</p>
          </div>
        </div>
      </main>
    </div>
  );
}
