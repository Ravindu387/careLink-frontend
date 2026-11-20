export type FeedbackCategory =
  | "Using the citizen portal"
  | "Requesting help"
  | "Finding nearby support"
  | "Shelter services"
  | "Safety updates"
  | "Communication and support"
  | "Accessibility"
  | "Other";

export type FeedbackStatus = "Submitted" | "Under Review" | "Acknowledged" | "Resolved";

export interface FeedbackItem {
  id: string;
  category: string;
  rating: number;
  comment: string;
  anonymous: boolean;
  submittedBy: string;
  status: FeedbackStatus | string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateFeedbackPayload {
  category: string;
  rating: number;
  comment: string;
  anonymous: boolean;
  submittedBy?: string;
}

export interface UpdateFeedbackStatusPayload {
  status: string;
}

export interface FeedbackSummary {
  totalCount: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  lowRatingCount: number;
}
