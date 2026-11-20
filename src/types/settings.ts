export interface ProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  warehouse: string;
}

export interface InventoryRulesSettings {
  lowStock: string;
  criticalStock: string;
  expiryDays: string;
  autoReorder: boolean;
  trackExpiry: boolean;
  allowNegative: boolean;
}

export interface DispatchPreferencesSettings {
  defaultVehicle: string;
  approval: string;
  proof: boolean;
  tracking: boolean;
  delayAlert: boolean;
}

export interface NotificationPreferencesSettings {
  email: boolean;
  system: boolean;
  critical: boolean;
  lowStock: boolean;
  dispatch: boolean;
  weekly: boolean;
}

export interface SecuritySettings {
  twoFactor: boolean;
  sessionTimeout: string;
  loginAlerts: boolean;
}

export interface ResourceManagerSettings {
  profile: ProfileSettings;
  inventory: InventoryRulesSettings;
  dispatch: DispatchPreferencesSettings;
  notifications: NotificationPreferencesSettings;
  security: SecuritySettings;
  updatedAt?: string;
}

export interface UpdateSettingsPayload {
  profile?: ProfileSettings;
  inventory?: InventoryRulesSettings;
  dispatch?: DispatchPreferencesSettings;
  notifications?: NotificationPreferencesSettings;
  security?: SecuritySettings;
}
