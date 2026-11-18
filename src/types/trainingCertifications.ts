export type TrainingStatus = "Active" | "Inactive";

export type CertificateStatus = "Valid" | "Expiring Soon" | "Expired";

export interface TrainingItem {
  id: string;
  name: string;
  requirement: string;
  duration: string;
  enrolled: number;
  completion: number;
  status: TrainingStatus;
  createdAt?: string;
}

export interface CertificateItem {
  id: string;
  volunteer: string;
  qualification: string;
  expiry: string;
  remaining: string;
  status: CertificateStatus;
  documentUrl?: string;
  createdAt?: string;
}

export interface TrainingCertStats {
  trainingCompletionRate: string;
  completionSubtitle: string;
  certificationsValid: string;
  validSubtitle: string;
  expiringSoon: string;
  expiringSubtitle: string;
  expired: string;
  expiredSubtitle: string;
}

export interface TrainingOverviewResponse {
  stats: TrainingCertStats;
  trainings: TrainingItem[];
  certificates: CertificateItem[];
}

export interface CreateTrainingPayload {
  name: string;
  requirement: string;
  duration: string;
  enrolled?: number;
  completion?: number;
}

export interface CreateCertificatePayload {
  volunteer: string;
  qualification: string;
  expiry: string;
  fileName?: string;
}
