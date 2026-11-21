export interface CitizenDocument {
  id: string;
  name: string;
  category: "Identity" | "Medical" | "Address" | "Other" | string;
  description: string;
  date: string;
  status: "Verified" | "Saved" | "Under review" | string;
  fileName?: string;
  fileType?: string;
  fileSizeBytes?: number;
  fileSizeFormatted?: string;
  fileUrl?: string;
  fileData?: string;
  verificationNotes?: string;
  citizenName?: string;
  createdAt?: string;
  file?: File;
}

export interface CreateDocumentPayload {
  name: string;
  category: string;
  description?: string;
  fileName?: string;
  fileType?: string;
  fileSizeBytes?: number;
  fileData?: string;
  citizenName?: string;
}

export interface UpdateDocumentStatusPayload {
  status: "Verified" | "Saved" | "Under review" | string;
  verificationNotes?: string;
}

export interface DocumentSummary {
  totalDocuments: number;
  verifiedCount: number;
  underReviewCount: number;
  savedCount: number;
}

export interface DocumentFilterParams {
  citizenName?: string;
  category?: string;
  search?: string;
}
