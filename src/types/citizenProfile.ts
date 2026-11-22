export interface SecuritySession {
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface CitizenProfileSettings {
  id: string;
  citizenReference: string;
  fullName: string;
  preferredName: string;
  dateOfBirth: string;
  nationalId: string;
  gender: string;

  // Contact & Location
  email: string;
  phone: string;
  address: string;
  district: string;
  city?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Language & Accessibility
  language: string;
  accessibility: string;
  highContrast: boolean;
  largeText: boolean;
  screenReaderSupport: boolean;
  audioAssistance: boolean;

  // Notifications
  emergencyAlerts: boolean;
  requestStatusUpdates: boolean;
  safetyNotifications: boolean;
  messagesFromSupportTeams: boolean;
  shelterAvailabilityUpdates: boolean;
  smsAlerts: boolean;
  emailAlerts: boolean;

  // Privacy & Data
  shareLocationDuringDisaster: boolean;
  shareMedicalWithRescuers: boolean;
  allowVolunteersContact: boolean;
  dataRetentionConsent: boolean;
  personalInformationPolicy?: string;
  dataSharingPolicy?: string;

  // Security
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
  lastLoginAt?: string;
  activeSessions: SecuritySession[];

  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePersonalDetailsPayload {
  fullName: string;
  preferredName?: string;
  dateOfBirth?: string;
  nationalId?: string;
  gender?: string;
}

export interface UpdateContactLocationPayload {
  email: string;
  phone: string;
  address: string;
  district: string;
  city?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface UpdateLanguageAccessibilityPayload {
  language: string;
  accessibility: string;
  highContrast: boolean;
  largeText: boolean;
  screenReaderSupport: boolean;
  audioAssistance: boolean;
}

export interface UpdateNotificationPreferencesPayload {
  emergencyAlerts: boolean;
  requestStatusUpdates: boolean;
  safetyNotifications: boolean;
  messagesFromSupportTeams: boolean;
  shelterAvailabilityUpdates: boolean;
  smsAlerts: boolean;
  emailAlerts: boolean;
}

export interface UpdatePrivacyDataPayload {
  shareLocationDuringDisaster: boolean;
  shareMedicalWithRescuers: boolean;
  allowVolunteersContact: boolean;
  dataRetentionConsent: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateFullProfilePayload {
  fullName?: string;
  preferredName?: string;
  dateOfBirth?: string;
  nationalId?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  language?: string;
  accessibility?: string;
  highContrast?: boolean;
  largeText?: boolean;
  screenReaderSupport?: boolean;
  audioAssistance?: boolean;
  emergencyAlerts?: boolean;
  requestStatusUpdates?: boolean;
  safetyNotifications?: boolean;
  messagesFromSupportTeams?: boolean;
  shelterAvailabilityUpdates?: boolean;
  smsAlerts?: boolean;
  emailAlerts?: boolean;
  shareLocationDuringDisaster?: boolean;
  shareMedicalWithRescuers?: boolean;
  allowVolunteersContact?: boolean;
  dataRetentionConsent?: boolean;
}
