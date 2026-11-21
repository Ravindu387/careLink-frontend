export interface VolunteerProfile {
  fullName: string;
  email: string;
  phone: string;
  area: string;
  photo?: string | null;
}

export interface AIMatchingRules {
  minimumScore: string;
  travelDistance: string;
  availability: boolean;
  verifiedSkills: boolean;
  experience: boolean;
  training: boolean;
  preventConflicts: boolean;
  humanApproval: boolean;
}

export interface VolunteerNotificationPreferences {
  assignments: boolean;
  verification: boolean;
  safety: boolean;
  aiMatching: boolean;
  communications: boolean;
  inApp: boolean;
  email: boolean;
  sms: boolean;
  urgentOnly: boolean;
}

export interface VolunteerSecuritySettings {
  twoFactor: boolean;
}

export interface VolunteerActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface VolunteerSettingsDto {
  profile: VolunteerProfile;
  matchingRules: AIMatchingRules;
  notificationSettings: VolunteerNotificationPreferences;
  security: VolunteerSecuritySettings;
  activeSessions?: VolunteerActiveSession[];
}

export interface VolunteerChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
