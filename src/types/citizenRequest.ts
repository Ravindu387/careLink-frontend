export interface CitizenHelpRequest {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "Sent" | "Under review" | "Help on the way" | "Help arranged" | "Completed" | "Cancelled" | string;
  priority: "Low" | "Normal" | "High" | "Urgent" | string;
  citizenName: string;
  contactPhone: string;
  address: string;
  district?: string;
  color?: "amber" | "blue" | "green" | "emerald" | "red" | string;
  immediateThreat?: boolean;
  additionalInfo?: string;
  peopleCount?: number;
  timeAgo?: string;
  progress: number; // 1 to 4
  formattedDate?: string;
  updated?: string;
  canMessage?: boolean;
  dispatchTrackingId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCitizenHelpRequestPayload {
  category: string;
  title?: string;
  situation?: string;
  description?: string;
  immediateThreat?: boolean;
  citizenName?: string;
  contactName?: string;
  contactPhone?: string;
  phone?: string;
  address?: string;
  district?: string;
  additionalInfo?: string;
  peopleCount?: number;
  priority?: string;
}

export interface CitizenRequestsSummary {
  totalRequests: number;
  activeCount: number;
  completedCount: number;
  draftsCount: number;
}

export interface CitizenRequestFilterParams {
  citizenName?: string;
  search?: string;
  status?: string;
  category?: string;
}
