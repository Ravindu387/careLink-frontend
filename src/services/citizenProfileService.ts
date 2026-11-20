import { request } from "./api";
import type {
  CitizenProfileSettings,
  UpdatePersonalDetailsPayload,
  UpdateContactLocationPayload,
  UpdateLanguageAccessibilityPayload,
  UpdateNotificationPreferencesPayload,
  UpdatePrivacyDataPayload,
  ChangePasswordPayload,
  UpdateFullProfilePayload,
} from "../types/citizenProfile";

export const DEFAULT_CITIZEN_PROFILE: CitizenProfileSettings = {
  id: "CPS-001",
  citizenReference: "CIT-10482",
  fullName: "Samira Khan",
  preferredName: "Samira",
  dateOfBirth: "1990-12-04",
  nationalId: "199084501234",
  gender: "Female",

  email: "samira.khan@email.com",
  phone: "+94 77 412 8088",
  address: "North Ward, Greater Riverton",
  district: "North Ward",
  city: "Greater Riverton",
  postalCode: "10230",
  emergencyContactName: "Rashid Khan",
  emergencyContactPhone: "+94 77 455 0182",
  emergencyContactRelation: "Brother",

  language: "English",
  accessibility: "Standard",
  highContrast: false,
  largeText: false,
  screenReaderSupport: false,
  audioAssistance: false,

  emergencyAlerts: true,
  requestStatusUpdates: true,
  safetyNotifications: true,
  messagesFromSupportTeams: true,
  shelterAvailabilityUpdates: true,
  smsAlerts: true,
  emailAlerts: true,

  shareLocationDuringDisaster: true,
  shareMedicalWithRescuers: true,
  allowVolunteersContact: true,
  dataRetentionConsent: true,
  personalInformationPolicy:
    "Your personal information is protected and only shared with authorised support teams when necessary.",
  dataSharingPolicy:
    "Control how your information is used when requesting assistance.",

  twoFactorEnabled: true,
  lastPasswordChange: "2026-10-20T10:00:00Z",
  lastLoginAt: new Date().toISOString(),
  activeSessions: [
    {
      device: "Chrome on Windows 11 (Current)",
      location: "Colombo / Greater Riverton",
      lastActive: "Just now",
      isCurrent: true,
    },
    {
      device: "CareLink Mobile App on iOS 18",
      location: "North Ward",
      lastActive: "3 hours ago",
      isCurrent: false,
    },
  ],
  createdAt: "2026-05-12T08:00:00Z",
  updatedAt: new Date().toISOString(),
};

export const citizenProfileService = {
  async getProfile(citizenName?: string): Promise<CitizenProfileSettings> {
    const query = citizenName
      ? `?citizenName=${encodeURIComponent(citizenName)}`
      : "";
    const response = await request<CitizenProfileSettings>(
      `/citizen/profile${query}`,
      { method: "GET" }
    );
    return response.data;
  },

  async updateFullProfile(
    payload: UpdateFullProfilePayload,
    citizenName?: string
  ): Promise<CitizenProfileSettings> {
    const query = citizenName
      ? `?citizenName=${encodeURIComponent(citizenName)}`
      : "";
    const response = await request<CitizenProfileSettings>(
      `/citizen/profile${query}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async updatePersonalDetails(
    payload: UpdatePersonalDetailsPayload,
    citizenName?: string
  ): Promise<CitizenProfileSettings> {
    const query = citizenName
      ? `?citizenName=${encodeURIComponent(citizenName)}`
      : "";
    const response = await request<CitizenProfileSettings>(
      `/citizen/profile/personal${query}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async updateContactLocation(
    payload: UpdateContactLocationPayload,
    citizenName?: string
  ): Promise<CitizenProfileSettings> {
    const query = citizenName
      ? `?citizenName=${encodeURIComponent(citizenName)}`
      : "";
    const response = await request<CitizenProfileSettings>(
      `/citizen/profile/contact${query}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async updateLanguageAccessibility(
    payload: UpdateLanguageAccessibilityPayload,
    citizenName?: string
  ): Promise<CitizenProfileSettings> {
    const query = citizenName
      ? `?citizenName=${encodeURIComponent(citizenName)}`
      : "";
    const response = await request<CitizenProfileSettings>(
      `/citizen/profile/preferences${query}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async updateNotificationPreferences(
    payload: UpdateNotificationPreferencesPayload,
    citizenName?: string
  ): Promise<CitizenProfileSettings> {
    const query = citizenName
      ? `?citizenName=${encodeURIComponent(citizenName)}`
      : "";
    const response = await request<CitizenProfileSettings>(
      `/citizen/profile/notifications${query}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async updatePrivacyData(
    payload: UpdatePrivacyDataPayload,
    citizenName?: string
  ): Promise<CitizenProfileSettings> {
    const query = citizenName
      ? `?citizenName=${encodeURIComponent(citizenName)}`
      : "";
    const response = await request<CitizenProfileSettings>(
      `/citizen/profile/privacy${query}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async changePassword(
    payload: ChangePasswordPayload,
    citizenName?: string
  ): Promise<boolean> {
    const query = citizenName
      ? `?citizenName=${encodeURIComponent(citizenName)}`
      : "";
    const response = await request<boolean>(
      `/citizen/profile/change-password${query}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return response.data ?? response.success;
  },

  async toggleTwoFactor(
    enabled: boolean,
    citizenName?: string
  ): Promise<CitizenProfileSettings> {
    const query = citizenName
      ? `?citizenName=${encodeURIComponent(citizenName)}`
      : "";
    const response = await request<CitizenProfileSettings>(
      `/citizen/profile/two-factor${query}`,
      {
        method: "POST",
        body: JSON.stringify({ enabled }),
      }
    );
    return response.data;
  },

  async resetProfile(citizenName?: string): Promise<CitizenProfileSettings> {
    const query = citizenName
      ? `?citizenName=${encodeURIComponent(citizenName)}`
      : "";
    const response = await request<CitizenProfileSettings>(
      `/citizen/profile/reset${query}`,
      {
        method: "POST",
      }
    );
    return response.data;
  },
};
