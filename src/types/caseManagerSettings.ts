export interface UserProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  area: string;
  profileImage?: string | null;
}

export interface QueuePreferences {
  defaultPriority: string;
  defaultCategory: string;
  defaultStatus: string;
  autoRefresh: boolean;
  showCriticalFirst: boolean;
  showMyCasesOnly: boolean;
}

export interface NotificationPreferencesSettings {
  inAppNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  criticalAlerts: boolean;
  assignmentAlerts: boolean;
  evidenceUpdates: boolean;
  escalationAlerts: boolean;
  aiRecommendations: boolean;
}

export interface SecuritySettings {
  twoFactor: boolean;
  loginAlerts: boolean;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface CaseManagerSettingsDto {
  profile: UserProfileSettings;
  queue: QueuePreferences;
  notifications: NotificationPreferencesSettings;
  security: SecuritySettings;
  activeSessions: ActiveSession[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
