export interface HouseholdMember {
  id: string | number;
  initials: string;
  name: string;
  role: string;
  support: string;
  age?: number;
  medicalNotes?: string;
  dietaryNotes?: string;
  createdAt?: string;
}

export interface ReadinessItem {
  key: string;
  title: string;
  isCompleted: boolean;
  actionText?: string;
}

export interface HouseholdSummary {
  totalMembers: number;
  supportNeededCount: number;
  readinessCompletedCount: number;
  readinessTotalCount: number;
  readinessPercentage: number;
}

export interface HouseholdProfile {
  id: string;
  citizenName: string;
  citizenId: string;
  address: string;
  ward: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  members: HouseholdMember[];
  readinessChecklist: ReadinessItem[];
  summary: HouseholdSummary;
}

export interface CreateHouseholdMemberPayload {
  name: string;
  role: string;
  support: string;
  age?: number;
  medicalNotes?: string;
  dietaryNotes?: string;
}

export interface UpdateHouseholdMemberPayload {
  name: string;
  role: string;
  support: string;
  age?: number;
  medicalNotes?: string;
  dietaryNotes?: string;
}

export interface UpdateAddressPayload {
  address: string;
  ward?: string;
  city?: string;
}

export interface UpdateEmergencyContactPayload {
  contactName: string;
  contactPhone: string;
  relationship?: string;
}

export interface ToggleReadinessPayload {
  key: string;
  isCompleted?: boolean;
}
