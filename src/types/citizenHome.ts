export interface CitizenRequest {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  citizenName: string;
  contactPhone: string;
  address: string;
  color: string;
  timeAgo: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCitizenRequestPayload {
  category: string;
  description?: string;
  citizenName?: string;
  contactPhone?: string;
  address?: string;
  priority?: string;
}

export interface UpdateCitizenRequestStatusPayload {
  status: string;
}

export interface NearbyFacility {
  id: string;
  name: string;
  category: string;
  distance: string;
  hours: string;
  status: string;
  address: string;
  phone: string;
  services: string[];
}

export interface CrisisOperation {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  region: string;
  activeAlertTitle: string;
  activeAlertDescription: string;
  activeAlertSeverity: string;
  helpline: string;
}

export interface HelpCategory {
  title: string;
  description: string;
  iconKey: string;
}

export interface CitizenHomeSummary {
  activeRequestsCount: number;
  nearbyFacilitiesCount: number;
  activeAlertsCount: number;
  unreadNotificationsCount: number;
}

export interface CitizenHomeOverview {
  operation: CrisisOperation;
  activeRequests: CitizenRequest[];
  nearbyFacilities: NearbyFacility[];
  categories: HelpCategory[];
  summary: CitizenHomeSummary;
}
