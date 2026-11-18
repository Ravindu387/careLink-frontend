// Types for Settings feature

export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface ShelterSettingsData {
  name: string;
  location: string;
  capacity: string;
  manager: string;
  address: string;
}

export interface SecuritySettingsData {
  currentPassword?: string;
  newPassword?: string;
  twoFactor: boolean;
  loginAlerts: boolean;
}

export interface NotificationSettingsData {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  critical: boolean;
  requests: boolean;
  inventory: boolean;
  system: boolean;
}
