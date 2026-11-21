import { request } from "./api";
import type {
  CitizenDocument,
  CreateDocumentPayload,
  UpdateDocumentStatusPayload,
  DocumentSummary,
  DocumentFilterParams,
} from "../types/document";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const MOCK_DOCUMENTS: CitizenDocument[] = [
  {
    id: "1",
    name: "Identity document",
    category: "Identity",
    description: "National ID · Samira Khan",
    date: "15 Jun 2025",
    status: "Verified",
    fileName: "national_identity_card_samira.pdf",
    fileType: "application/pdf",
    fileSizeFormatted: "1.2 MB",
    verificationNotes: "Verified by Civil Registration Officer Elena Vance on 16 Jun 2025.",
    citizenName: "Samira Khan",
  },
  {
    id: "2",
    name: "Medical information",
    category: "Medical",
    description: "Medication list · Mariam Khan",
    date: "18 Jun 2025",
    status: "Saved",
    fileName: "prescription_and_mobility_records.pdf",
    fileType: "application/pdf",
    fileSizeFormatted: "820 KB",
    verificationNotes: "Uploaded for emergency shelter special mobility and prescription accommodation.",
    citizenName: "Samira Khan",
  },
  {
    id: "3",
    name: "Proof of address",
    category: "Address",
    description: "Utility statement · May 2025",
    date: "20 Jun 2025",
    status: "Verified",
    fileName: "water_board_utility_statement_may2025.pdf",
    fileType: "application/pdf",
    fileSizeFormatted: "2.0 MB",
    verificationNotes: "Address confirmed: North Ward Sector 4, Riverton.",
    citizenName: "Samira Khan",
  },
  {
    id: "4",
    name: "Emergency Evacuation Pass",
    category: "Other",
    description: "Municipal Council Priority Transit Authorization",
    date: "21 Jun 2025",
    status: "Verified",
    fileName: "riverton_evacuation_pass_2025.pdf",
    fileType: "application/pdf",
    fileSizeFormatted: "512 KB",
    verificationNotes: "Official transit clearance for flood evacuation corridor B.",
    citizenName: "Samira Khan",
  },
];

export const documentService = {
  async getDocuments(params?: DocumentFilterParams): Promise<CitizenDocument[]> {
    const query = new URLSearchParams();
    if (params?.citizenName) query.append("citizenName", params.citizenName);
    if (params?.category && params.category !== "All") {
      query.append("category", params.category);
    }
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<CitizenDocument[]>(`/documents${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getDocumentById(id: string): Promise<CitizenDocument> {
    const response = await request<CitizenDocument>(`/documents/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async createDocument(payload: CreateDocumentPayload): Promise<CitizenDocument> {
    const response = await request<CitizenDocument>("/documents", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateStatus(
    id: string,
    payload: UpdateDocumentStatusPayload
  ): Promise<CitizenDocument> {
    const response = await request<CitizenDocument>(`/documents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteDocument(id: string): Promise<boolean> {
    const response = await request<boolean>(`/documents/${id}`, {
      method: "DELETE",
    });
    return response.data ?? response.success;
  },

  async getSummary(citizenName?: string): Promise<DocumentSummary> {
    const query = citizenName ? `?citizenName=${encodeURIComponent(citizenName)}` : "";
    const response = await request<DocumentSummary>(`/documents/summary${query}`, {
      method: "GET",
    });
    return response.data;
  },

  getDownloadUrl(id: string): string {
    return `${API_BASE_URL}/documents/${id}/download`;
  },

  async downloadDocument(id: string, fallbackFileName?: string): Promise<void> {
    const token = localStorage.getItem("carelink_token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fallbackFileName || `document_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
