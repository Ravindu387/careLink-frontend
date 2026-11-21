import { request } from "./api";
import type {
  HouseholdMember,
  ReadinessItem,
  HouseholdSummary,
  HouseholdProfile,
  CreateHouseholdMemberPayload,
  UpdateHouseholdMemberPayload,
  UpdateAddressPayload,
  UpdateEmergencyContactPayload,
  ToggleReadinessPayload,
} from "../types/household";

export const MOCK_HOUSEHOLD: HouseholdProfile = {
  id: "HH-001",
  citizenName: "Samira Khan",
  citizenId: "CIT-001",
  address: "54 Riverside Lane, North Ward, Greater Riverton",
  ward: "North Ward",
  city: "Greater Riverton",
  emergencyContactName: "Rashid Khan",
  emergencyContactPhone: "+94 77 455 0182",
  emergencyContactRelationship: "Brother",
  members: [
    {
      id: "1",
      initials: "SK",
      name: "Samira Khan",
      role: "You · Primary contact",
      support: "No support needs",
      age: 34,
    },
    {
      id: "2",
      initials: "AK",
      name: "Amir Khan",
      role: "Household member",
      support: "Limited mobility",
      age: 68,
      medicalNotes: "Requires wheelchair access and ground-floor shelter placement.",
    },
    {
      id: "3",
      initials: "LK",
      name: "Layla Khan",
      role: "Household member",
      support: "Asthma inhaler",
      age: 12,
      medicalNotes: "Requires salbutamol inhaler; dust-free environment requested.",
    },
    {
      id: "4",
      initials: "MK",
      name: "Mariam Khan",
      role: "Household member",
      support: "Daily medication",
      age: 64,
      medicalNotes: "Hypertension and diabetes medication maintenance.",
    },
  ],
  readinessChecklist: [
    { key: "members_added", title: "Household members added", isCompleted: true, actionText: "Review" },
    { key: "support_reviewed", title: "Support needs reviewed", isCompleted: true, actionText: "Review" },
    { key: "emergency_contact", title: "Emergency contact added", isCompleted: true, actionText: "Review" },
    { key: "documents_uploaded", title: "Important documents uploaded", isCompleted: false, actionText: "Add now" },
  ],
  summary: {
    totalMembers: 4,
    supportNeededCount: 3,
    readinessCompletedCount: 3,
    readinessTotalCount: 4,
    readinessPercentage: 75,
  },
};

export const householdService = {
  async getProfile(citizenName?: string): Promise<HouseholdProfile> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<HouseholdProfile>(`/household${query}`, {
      method: "GET",
    });
    return response.data;
  },

  async getMembers(citizenName?: string): Promise<HouseholdMember[]> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<HouseholdMember[]>(`/household/members${query}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getMemberById(id: string | number, citizenName?: string): Promise<HouseholdMember> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<HouseholdMember>(`/household/members/${id}${query}`, {
      method: "GET",
    });
    return response.data;
  },

  async addMember(
    payload: CreateHouseholdMemberPayload,
    citizenName?: string
  ): Promise<HouseholdMember> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<HouseholdMember>(`/household/members${query}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateMember(
    id: string | number,
    payload: UpdateHouseholdMemberPayload,
    citizenName?: string
  ): Promise<HouseholdMember> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<HouseholdMember>(`/household/members/${id}${query}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteMember(id: string | number, citizenName?: string): Promise<boolean> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<boolean>(`/household/members/${id}${query}`, {
      method: "DELETE",
    });
    return response.data ?? response.success;
  },

  async updateAddress(
    payload: UpdateAddressPayload,
    citizenName?: string
  ): Promise<HouseholdProfile> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<HouseholdProfile>(`/household/address${query}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateEmergencyContact(
    payload: UpdateEmergencyContactPayload,
    citizenName?: string
  ): Promise<HouseholdProfile> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<HouseholdProfile>(`/household/emergency-contact${query}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async toggleReadiness(
    payload: ToggleReadinessPayload,
    citizenName?: string
  ): Promise<ReadinessItem[]> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<ReadinessItem[]>(`/household/readiness/toggle${query}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data || [];
  },

  async getSummary(citizenName?: string): Promise<HouseholdSummary> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<HouseholdSummary>(`/household/summary${query}`, {
      method: "GET",
    });
    return response.data;
  },
};
