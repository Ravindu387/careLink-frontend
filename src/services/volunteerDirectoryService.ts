import { request, authFetch } from "./api";
import type {
  VolunteerItem,
  VolunteerDirectoryStats,
  VolunteerDirectoryQuery,
  VolunteerDirectoryOverviewResponse,
  CreateVolunteerPayload,
  UpdateVolunteerPayload,
  VerificationStatus,
} from "../types/volunteerDirectory";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

const initialVolunteers: VolunteerItem[] = [
  {
    id: "VOL-1048",
    name: "Elena Rossi",
    skills: ["First Aid", "Logistics"],
    location: "Central Ward",
    availability: "Available now",
    verification: "Verified",
    assignment: "Evacuation Support",
    rating: "4.9",
    phone: "+94 77 123 4567",
    email: "elena.rossi@carelink.org",
    joinedDate: "2026-01-12",
    hoursContributed: 48,
  },
  {
    id: "VOL-1172",
    name: "Musa Bello",
    skills: ["Driving", "Rescue"],
    location: "North Ward",
    availability: "Available 14:00",
    verification: "Verified",
    assignment: "Unassigned",
    rating: "4.8",
    phone: "+94 77 234 5678",
    email: "musa.bello@carelink.org",
    joinedDate: "2026-02-04",
    hoursContributed: 36,
  },
  {
    id: "VOL-0934",
    name: "Lin Wei",
    skills: ["Translation", "Medical"],
    location: "Eastbank",
    availability: "Available now",
    verification: "Verified",
    assignment: "Clinic Support",
    rating: "4.9",
    phone: "+94 77 345 6789",
    email: "lin.wei@carelink.org",
    joinedDate: "2025-11-20",
    hoursContributed: 62,
  },
  {
    id: "VOL-1288",
    name: "Sara Khan",
    skills: ["Shelter Support", "Childcare"],
    location: "Central Ward",
    availability: "Available 16:00",
    verification: "Pending",
    assignment: "Unassigned",
    rating: "—",
    phone: "+94 77 456 7890",
    email: "sara.khan@carelink.org",
    joinedDate: "2026-03-01",
    hoursContributed: 12,
  },
  {
    id: "VOL-0812",
    name: "Daniel Okafor",
    skills: ["Logistics", "Warehousing"],
    location: "West District",
    availability: "Unavailable",
    verification: "Verified",
    assignment: "Supply Dispatch",
    rating: "4.7",
    phone: "+94 77 567 8901",
    email: "daniel.okafor@carelink.org",
    joinedDate: "2025-10-15",
    hoursContributed: 84,
  },
  {
    id: "VOL-1350",
    name: "Amara Silva",
    skills: ["First Aid", "Medical"],
    location: "South Ward",
    availability: "Available now",
    verification: "Verified",
    assignment: "Unassigned",
    rating: "4.8",
    phone: "+94 77 678 9012",
    email: "amara.silva@carelink.org",
    joinedDate: "2026-02-18",
    hoursContributed: 28,
  },
  {
    id: "VOL-1420",
    name: "James Carter",
    skills: ["Driving", "Logistics"],
    location: "North Ward",
    availability: "Unavailable",
    verification: "Pending",
    assignment: "Unassigned",
    rating: "—",
    phone: "+94 77 789 0123",
    email: "james.carter@carelink.org",
    joinedDate: "2026-03-10",
    hoursContributed: 8,
  },
];

function getLocalVolunteers(): VolunteerItem[] {
  try {
    const raw = localStorage.getItem("carelink_volunteer_directory");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return initialVolunteers;
}

export const volunteerDirectoryService = {
  /**
   * Retrieves volunteers with search, filtering, and pagination
   */
  async getDirectory(
    query: VolunteerDirectoryQuery = {}
  ): Promise<{ data: VolunteerDirectoryOverviewResponse; isLiveBackend: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.skill && query.skill !== "All skills") params.append("skill", query.skill);
      if (query.location && query.location !== "All locations") params.append("location", query.location);
      if (query.availability && query.availability !== "Any availability") params.append("availability", query.availability);
      if (query.verification && query.verification !== "All verification states") params.append("verification", query.verification);
      if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));

      const url = `/volunteer/directory${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await request<VolunteerDirectoryOverviewResponse>(url);

      if (response && response.success && response.data) {
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Backend offline; fallback
    }

    const all = getLocalVolunteers();
    const search = (query.search || "").toLowerCase().trim();
    const skill = query.skill || "All skills";
    const location = query.location || "All locations";
    const availability = query.availability || "Any availability";
    const verification = query.verification || "All verification states";

    const filtered = all.filter((v) => {
      const searchMatch =
        !search ||
        v.id.toLowerCase().includes(search) ||
        v.name.toLowerCase().includes(search) ||
        v.skills.join(" ").toLowerCase().includes(search) ||
        v.location.toLowerCase().includes(search);

      const skillMatch =
        skill === "All skills" || v.skills.some((s) => s.toLowerCase() === skill.toLowerCase());

      const locationMatch = location === "All locations" || v.location === location;

      const availabilityMatch =
        availability === "Any availability" ||
        (availability === "Available now"
          ? v.availability.startsWith("Available")
          : v.availability === "Unavailable");

      const verificationMatch =
        verification === "All verification states" || v.verification === verification;

      return searchMatch && skillMatch && locationMatch && availabilityMatch && verificationMatch;
    });

    const pageNumber = query.pageNumber || 1;
    const pageSize = query.pageSize || 5;
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const paged = filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    const verifiedCount = all.filter((v) => v.verification === "Verified").length;
    const availableCount = all.filter((v) => v.availability.startsWith("Available")).length;
    const assignedCount = all.filter((v) => v.assignment !== "Unassigned").length;

    const stats: VolunteerDirectoryStats = {
      totalRegistered: (2410 + all.length).toLocaleString(),
      verified: (2180 + verifiedCount).toLocaleString(),
      availableNow: (640 + availableCount).toLocaleString(),
      assigned: (380 + assignedCount).toLocaleString(),
    };

    return {
      data: {
        volunteers: paged,
        stats,
        locations: ["Central Ward", "North Ward", "Eastbank", "West District", "South Ward"],
        skills: [
          "First Aid",
          "Logistics",
          "Driving",
          "Rescue",
          "Translation",
          "Medical",
          "Shelter Support",
          "Childcare",
          "Warehousing",
        ],
        totalCount,
        pageNumber,
        pageSize,
        totalPages,
      },
      isLiveBackend: false,
    };
  },

  /**
   * Registers a new volunteer
   */
  async createVolunteer(
    payload: CreateVolunteerPayload
  ): Promise<{ data: VolunteerItem; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerItem>("/volunteer/directory", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response && response.success && response.data) {
        const local = getLocalVolunteers();
        local.unshift(response.data);
        localStorage.setItem("carelink_volunteer_directory", JSON.stringify(local));
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const newVol: VolunteerItem = {
      id: `VOL-${Math.floor(1000 + Math.random() * 9000)}`,
      name: payload.name.trim(),
      skills: payload.skills && payload.skills.length > 0 ? payload.skills : ["General Support"],
      location: payload.location.trim(),
      availability: payload.availability || "Available now",
      verification: "Pending",
      assignment: payload.assignment || "Unassigned",
      rating: "—",
      phone: payload.phone || "",
      email: payload.email || "",
      joinedDate: new Date().toISOString().slice(0, 10),
      hoursContributed: 0,
    };

    const local = getLocalVolunteers();
    local.unshift(newVol);
    localStorage.setItem("carelink_volunteer_directory", JSON.stringify(local));

    return { data: newVol, isLiveBackend: false };
  },

  /**
   * Updates volunteer profile
   */
  async updateVolunteer(
    id: string,
    payload: UpdateVolunteerPayload
  ): Promise<{ data: VolunteerItem; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerItem>(`/volunteer/directory/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (response && response.success && response.data) {
        const local = getLocalVolunteers();
        const idx = local.findIndex((v) => v.id.toLowerCase() === id.toLowerCase());
        if (idx !== -1) {
          local[idx] = response.data;
          localStorage.setItem("carelink_volunteer_directory", JSON.stringify(local));
        }
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const local = getLocalVolunteers();
    const idx = local.findIndex((v) => v.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) throw new Error("Volunteer not found");

    const updated: VolunteerItem = {
      ...local[idx],
      ...(payload.name && { name: payload.name }),
      ...(payload.location && { location: payload.location }),
      ...(payload.skills && { skills: payload.skills }),
      ...(payload.availability && { availability: payload.availability }),
      ...(payload.verification && { verification: payload.verification }),
      ...(payload.assignment && { assignment: payload.assignment }),
      ...(payload.rating && { rating: payload.rating }),
      ...(payload.phone !== undefined && { phone: payload.phone }),
      ...(payload.email !== undefined && { email: payload.email }),
    };

    local[idx] = updated;
    localStorage.setItem("carelink_volunteer_directory", JSON.stringify(local));
    return { data: updated, isLiveBackend: false };
  },

  /**
   * Updates verification status
   */
  async updateVerification(
    id: string,
    verification: VerificationStatus
  ): Promise<{ data: VolunteerItem; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerItem>(`/volunteer/directory/${id}/verification`, {
        method: "PATCH",
        body: JSON.stringify({ verification }),
      });

      if (response && response.success && response.data) {
        const local = getLocalVolunteers();
        const idx = local.findIndex((v) => v.id.toLowerCase() === id.toLowerCase());
        if (idx !== -1) {
          local[idx] = response.data;
          localStorage.setItem("carelink_volunteer_directory", JSON.stringify(local));
        }
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    return await this.updateVolunteer(id, { verification });
  },

  /**
   * Updates availability status
   */
  async updateAvailability(
    id: string,
    availability: string
  ): Promise<{ data: VolunteerItem; isLiveBackend: boolean }> {
    try {
      const response = await request<VolunteerItem>(`/volunteer/directory/${id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ availability }),
      });

      if (response && response.success && response.data) {
        const local = getLocalVolunteers();
        const idx = local.findIndex((v) => v.id.toLowerCase() === id.toLowerCase());
        if (idx !== -1) {
          local[idx] = response.data;
          localStorage.setItem("carelink_volunteer_directory", JSON.stringify(local));
        }
        return { data: response.data, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    return await this.updateVolunteer(id, { availability });
  },

  /**
   * Deletes a volunteer
   */
  async deleteVolunteer(id: string): Promise<{ success: boolean; isLiveBackend: boolean }> {
    try {
      const response = await request<boolean>(`/volunteer/directory/${id}`, {
        method: "DELETE",
      });

      if (response && response.success) {
        const local = getLocalVolunteers().filter((v) => v.id.toLowerCase() !== id.toLowerCase());
        localStorage.setItem("carelink_volunteer_directory", JSON.stringify(local));
        return { success: true, isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    const local = getLocalVolunteers().filter((v) => v.id.toLowerCase() !== id.toLowerCase());
    localStorage.setItem("carelink_volunteer_directory", JSON.stringify(local));
    return { success: true, isLiveBackend: false };
  },

  /**
   * Exports volunteer directory as CSV
   */
  async exportCsv(query: VolunteerDirectoryQuery = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.skill && query.skill !== "All skills") params.append("skill", query.skill);
      if (query.location && query.location !== "All locations") params.append("location", query.location);
      if (query.availability && query.availability !== "Any availability") params.append("availability", query.availability);
      if (query.verification && query.verification !== "All verification states") params.append("verification", query.verification);

      const res = await authFetch(`${API_BASE_URL}/volunteer/directory/export?${params.toString()}`);
      if (res.ok) {
        return await res.blob();
      }
    } catch {
      // Fallback
    }

    const { data } = await this.getDirectory({ ...query, pageSize: 1000 });
    const headers = [
      "Volunteer ID",
      "Name",
      "Skills",
      "Location",
      "Availability",
      "Verification",
      "Current Assignment",
      "Rating",
    ];

    const rows = data.volunteers.map((v) => [
      v.id,
      v.name,
      v.skills.join(" / "),
      v.location,
      v.availability,
      v.verification,
      v.assignment,
      v.rating,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  },
};
