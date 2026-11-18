export interface FundingSettings {
  fullName: string;
  email: string;
  contact: string;
  currency: string;
  approvalLimit: number;
  requireApproval: boolean;
  dualApproval: boolean;
  autoVerification: boolean;
  restrictedAllocation: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  smsNotifications: boolean;
  notifyDonations: boolean;
  notifyApprovals: boolean;
  notifyCampaigns: boolean;
  notifySecurity: boolean;
  twoFactorEnabled: boolean;
  activeDevice: string;
  lastPasswordUpdate: string;
}

export interface ChangeFundingPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}
