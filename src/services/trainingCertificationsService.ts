import { request, authFetch } from "./api";
import type {
  TrainingItem,
  CertificateItem,
  TrainingCertStats,
  TrainingOverviewResponse,
  CreateTrainingPayload,
  CreateCertificatePayload,
  TrainingStatus,
  CertificateStatus,
} from "../types/trainingCertifications";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const initialTrainings: TrainingItem[] = [
  {
    id: "TRN-104",
    name: "Flood Response Safety",
    requirement: "Required",
    duration: "45 min",
    enrolled: 1986,
    completion: 92,
    status: "Active",
  },
  {
    id: "TRN-108",
    name: "Safeguarding Essentials",
    requirement: "Required",
    duration: "60 min",
    enrolled: 1742,
    completion: 86,
    status: "Active",
  },
  {
    id: "TRN-112",
    name: "First Aid Refresher",
    requirement: "Skill-based",
    duration: "90 min",
    enrolled: 486,
    completion: 78,
    status: "Active",
  },
  {
    id: "TRN-117",
    name: "Radio Communications",
    requirement: "Optional",
    duration: "30 min",
    enrolled: 328,
    completion: 64,
    status: "Active",
  },
];

const initialCertificates: CertificateItem[] = [
  {
    id: "CERT-2048",
    volunteer: "Musa Bello",
    qualification: "Heavy Vehicle Licence",
    expiry: "28 Jun 2025",
    remaining: "6 days",
    status: "Expiring Soon",
  },
  {
    id: "CERT-1992",
    volunteer: "Elena Rossi",
    qualification: "First Aid Level 2",
    expiry: "12 Aug 2025",
    remaining: "51 days",
    status: "Valid",
  },
  {
    id: "CERT-1841",
    volunteer: "Theo Martin",
    qualification: "Rescue Operations",
    expiry: "20 Jun 2025",
    remaining: "Expired",
    status: "Expired",
  },
];

function getLocalTrainings(): TrainingItem[] {
  try {
    const raw = localStorage.getItem("carelink_training_modules");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return initialTrainings;
}

function getLocalCertificates(): CertificateItem[] {
  try {
    const raw = localStorage.getItem("carelink_certificates");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return initialCertificates;
}

function calculateLocalStats(trainings: TrainingItem[], certs: CertificateItem[]): TrainingCertStats {
  const activeTrainings = trainings.filter((t) => t.status === "Active");
  const avgCompletion =
    activeTrainings.length > 0
      ? Math.round(activeTrainings.reduce((acc, t) => acc + t.completion, 0) / activeTrainings.length)
      : 88;

  const validCount = certs.filter((c) => c.status === "Valid").length;
  const expiringSoonCount = certs.filter((c) => c.status === "Expiring Soon").length;
  const expiredCount = certs.filter((c) => c.status === "Expired").length;

  return {
    trainingCompletionRate: `${avgCompletion}%`,
    completionSubtitle: "Mandatory modules",
    certificationsValid: (1840 + validCount).toLocaleString(),
    validSubtitle: "Across verified volunteers",
    expiringSoon: (40 + expiringSoonCount).toString(),
    expiringSubtitle: "Within 30 days",
    expired: (17 + expiredCount).toString(),
    expiredSubtitle: "Matching suspended",
  };
}

export const trainingCertificationsService = {
  /**
   * Retrieves full overview: stats, trainings, and certificates
   */
  async getOverview(): Promise<{ data: TrainingOverviewResponse; isLiveBackend: boolean }> {
    try {
      const response = await request<TrainingOverviewResponse>("/volunteer/training/overview");
      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    const trainings = getLocalTrainings();
    const certificates = getLocalCertificates();
    const stats = calculateLocalStats(trainings, certificates);

    return {
      data: {
        stats,
        trainings,
        certificates,
      },
      isLiveBackend: false,
    };
  },

  /**
   * Retrieves trainings list
   */
  async getTrainings(
    search?: string,
    status?: string
  ): Promise<{ data: TrainingItem[]; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status && status !== "All") params.append("status", status);

      const url = `/volunteer/training/modules${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<TrainingItem[]>(url);

      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const s = (search || "").toLowerCase().trim();
    const filtered = getLocalTrainings().filter((t) => {
      const searchMatch =
        !s ||
        t.id.toLowerCase().includes(s) ||
        t.name.toLowerCase().includes(s) ||
        t.requirement.toLowerCase().includes(s);
      const statusMatch = !status || status === "All" || t.status === status;
      return searchMatch && statusMatch;
    });

    return { data: filtered, isLiveBackend: false };
  },

  /**
   * Creates a new training module
   */
  async createTraining(
    payload: CreateTrainingPayload
  ): Promise<{ data: TrainingItem; isLiveBackend: boolean }> {
    try {
      const response = await request<TrainingItem>("/volunteer/training/modules", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response && response.success && response.data) {
        const local = getLocalTrainings();
        local.push(response.data);
        localStorage.setItem("carelink_training_modules", JSON.stringify(local));
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const newModule: TrainingItem = {
      id: `TRN-${Math.floor(100 + Math.random() * 900)}`,
      name: payload.name.trim(),
      requirement: payload.requirement || "Required",
      duration: payload.duration || "45 min",
      enrolled: payload.enrolled || 0,
      completion: payload.completion || 0,
      status: "Active",
    };

    const local = getLocalTrainings();
    local.push(newModule);
    localStorage.setItem("carelink_training_modules", JSON.stringify(local));

    return { data: newModule, isLiveBackend: false };
  },

  /**
   * Updates training module status (Active / Inactive)
   */
  async updateTrainingStatus(
    id: string,
    status: TrainingStatus
  ): Promise<{ data: TrainingItem; isLiveBackend: boolean }> {
    try {
      const response = await request<TrainingItem>(`/volunteer/training/modules/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      if (response && response.success && response.data) {
        const local = getLocalTrainings();
        const idx = local.findIndex((t) => t.id === id);
        if (idx !== -1) {
          local[idx] = response.data;
          localStorage.setItem("carelink_training_modules", JSON.stringify(local));
        }
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const local = getLocalTrainings();
    const idx = local.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Training module not found");

    const updated = { ...local[idx], status };
    local[idx] = updated;
    localStorage.setItem("carelink_training_modules", JSON.stringify(local));
    return { data: updated, isLiveBackend: false };
  },

  /**
   * Deletes training module
   */
  async deleteTraining(id: string): Promise<{ success: boolean; isLiveBackend: boolean }> {
    try {
      const response = await request<boolean>(`/volunteer/training/modules/${id}`, {
        method: "DELETE",
      });

      if (response && response.success) {
        const local = getLocalTrainings().filter((t) => t.id !== id);
        localStorage.setItem("carelink_training_modules", JSON.stringify(local));
        return { success: true, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const local = getLocalTrainings().filter((t) => t.id !== id);
    localStorage.setItem("carelink_training_modules", JSON.stringify(local));
    return { success: true, isLiveBackend: false };
  },

  /**
   * Exports training catalogue as CSV
   */
  async exportTrainingsCsv(search?: string, status?: string): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status && status !== "All") params.append("status", status);

      const res = await authFetch(`${API_BASE_URL}/volunteer/training/modules/export?${params.toString()}`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const { data: trainings } = await this.getTrainings(search, status);
    const headers = ["Course ID", "Course", "Requirement", "Duration", "Enrolled", "Completion", "Status"];
    const rows = trainings.map((t) => [
      t.id,
      t.name,
      t.requirement,
      t.duration,
      t.enrolled,
      `${t.completion}%`,
      t.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  },

  /**
   * Retrieves certificates queue
   */
  async getCertificates(
    search?: string,
    status?: string
  ): Promise<{ data: CertificateItem[]; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status && status !== "All") params.append("status", status);

      const url = `/volunteer/training/certificates${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<CertificateItem[]>(url);

      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const s = (search || "").toLowerCase().trim();
    const filtered = getLocalCertificates().filter((c) => {
      const searchMatch =
        !s ||
        c.id.toLowerCase().includes(s) ||
        c.volunteer.toLowerCase().includes(s) ||
        c.qualification.toLowerCase().includes(s);
      const statusMatch = !status || status === "All" || c.status === status;
      return searchMatch && statusMatch;
    });

    return { data: filtered, isLiveBackend: false };
  },

  /**
   * Uploads/creates a certificate
   */
  async createCertificate(
    payload: CreateCertificatePayload
  ): Promise<{ data: CertificateItem; isLiveBackend: boolean }> {
    try {
      const response = await request<CertificateItem>("/volunteer/training/certificates", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response && response.success && response.data) {
        const local = getLocalCertificates();
        local.unshift(response.data);
        localStorage.setItem("carelink_certificates", JSON.stringify(local));
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const newCert: CertificateItem = {
      id: `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
      volunteer: payload.volunteer.trim(),
      qualification: payload.qualification.trim(),
      expiry: payload.expiry || "Pending",
      remaining: "Pending review",
      status: "Valid",
      documentUrl: payload.fileName ? `/documents/${payload.fileName}` : undefined,
    };

    const local = getLocalCertificates();
    local.unshift(newCert);
    localStorage.setItem("carelink_certificates", JSON.stringify(local));

    return { data: newCert, isLiveBackend: false };
  },

  /**
   * Updates certificate status (Valid, Expiring Soon, Expired)
   */
  async updateCertificateStatus(
    id: string,
    status: CertificateStatus
  ): Promise<{ data: CertificateItem; isLiveBackend: boolean }> {
    try {
      const response = await request<CertificateItem>(`/volunteer/training/certificates/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      if (response && response.success && response.data) {
        const local = getLocalCertificates();
        const idx = local.findIndex((c) => c.id === id);
        if (idx !== -1) {
          local[idx] = response.data;
          localStorage.setItem("carelink_certificates", JSON.stringify(local));
        }
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const local = getLocalCertificates();
    const idx = local.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Certificate not found");

    const updated = { ...local[idx], status };
    local[idx] = updated;
    localStorage.setItem("carelink_certificates", JSON.stringify(local));
    return { data: updated, isLiveBackend: false };
  },

  /**
   * Deletes certificate
   */
  async deleteCertificate(id: string): Promise<{ success: boolean; isLiveBackend: boolean }> {
    try {
      const response = await request<boolean>(`/volunteer/training/certificates/${id}`, {
        method: "DELETE",
      });

      if (response && response.success) {
        const local = getLocalCertificates().filter((c) => c.id !== id);
        localStorage.setItem("carelink_certificates", JSON.stringify(local));
        return { success: true, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const local = getLocalCertificates().filter((c) => c.id !== id);
    localStorage.setItem("carelink_certificates", JSON.stringify(local));
    return { success: true, isLiveBackend: false };
  },

  /**
   * Exports certificates queue as CSV
   */
  async exportCertificatesCsv(search?: string, status?: string): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status && status !== "All") params.append("status", status);

      const res = await authFetch(`${API_BASE_URL}/volunteer/training/certificates/export?${params.toString()}`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const { data: certs } = await this.getCertificates(search, status);
    const headers = ["Certificate ID", "Volunteer", "Qualification", "Expiry", "Remaining", "Status"];
    const rows = certs.map((c) => [c.id, c.volunteer, c.qualification, c.expiry, c.remaining, c.status]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  },
};
