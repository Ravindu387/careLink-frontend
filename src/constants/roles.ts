export type AppRole =
  | "Admin"
  | "CaseManager"
  | "Citizen"
  | "EmergencyCoordinator"
  | "FundingOfficer"
  | "PartnerOfficer"
  | "ResourceManager"
  | "ShelterAdministrator"
  | "VolunteerCoordinator";

export const OFFICIAL_ROLES: readonly AppRole[] = [
  "Admin",
  "CaseManager",
  "Citizen",
  "EmergencyCoordinator",
  "FundingOfficer",
  "PartnerOfficer",
  "ResourceManager",
  "ShelterAdministrator",
  "VolunteerCoordinator",
] as const;

export const ROLE_BASE_PATHS: Record<AppRole, string> = {
  Admin: "/admin",
  CaseManager: "/case-manager",
  Citizen: "/citizen",
  EmergencyCoordinator: "/emergency-coordinator",
  FundingOfficer: "/funding-officer",
  PartnerOfficer: "/partner",
  ResourceManager: "/resource-manager",
  ShelterAdministrator: "/shelter-admin",
  VolunteerCoordinator: "/volunteer-coordinator",
};

export const ROLE_DASHBOARD_PATHS: Record<AppRole, string> = {
  Admin: "/admin/dashboard",
  CaseManager: "/case-manager/dashboard",
  Citizen: "/citizen/dashboard",
  EmergencyCoordinator: "/emergency-coordinator/dashboard",
  FundingOfficer: "/funding-officer/dashboard",
  PartnerOfficer: "/partner/dashboard",
  ResourceManager: "/resource-manager/dashboard",
  ShelterAdministrator: "/shelter-admin/dashboard",
  VolunteerCoordinator: "/volunteer-coordinator/dashboard",
};

export const ROLE_DISPLAY_LABELS: Record<AppRole, string> = {
  Admin: "System Administrator",
  CaseManager: "Case Manager",
  Citizen: "Citizen",
  EmergencyCoordinator: "Emergency Coordinator",
  FundingOfficer: "Funding Officer",
  PartnerOfficer: "Partner Officer",
  ResourceManager: "Resource Manager",
  ShelterAdministrator: "Shelter Administrator",
  VolunteerCoordinator: "Volunteer Coordinator",
};

/**
 * Normalizes a backend Identity role or display label into one of the 9 official CareLink AppRoles.
 * Returns null if the role string is missing or unrecognized (never falls back to a default role).
 */
export function normalizeAppRole(rawRole?: string | null): AppRole | null {
  if (!rawRole || typeof rawRole !== "string") {
    return null;
  }

  const cleaned = rawRole.trim().toLowerCase().replace(/[\s_-]+/g, "");

  switch (cleaned) {
    case "admin":
    case "systemadmin":
    case "systemadministrator":
    case "administrator":
      return "Admin";

    case "casemanager":
    case "incidentmanager":
      return "CaseManager";

    case "citizen":
    case "affectedcitizen":
      return "Citizen";

    case "emergencycoordinator":
    case "coordinator":
      return "EmergencyCoordinator";

    case "fundingofficer":
    case "donor":
      return "FundingOfficer";

    case "partnerofficer":
    case "partner":
    case "partnerorganisation":
    case "partnerorganization":
    case "partnerorganisationofficer":
    case "partnerorganizationofficer":
      return "PartnerOfficer";

    case "resourcemanager":
    case "logisticsmanager":
      return "ResourceManager";

    case "shelteradministrator":
    case "shelteradmin":
      return "ShelterAdministrator";

    case "volunteercoordinator":
    case "volunteer":
      return "VolunteerCoordinator";

    default:
      return null;
  }
}

/**
 * Normalizes an array of backend role claims into unique canonical AppRoles.
 */
export function normalizeUserRoles(rawRoles?: string[] | null): AppRole[] {
  if (!Array.isArray(rawRoles) || rawRoles.length === 0) {
    return [];
  }

  const seen = new Set<AppRole>();
  const result: AppRole[] = [];

  for (const raw of rawRoles) {
    const normalized = normalizeAppRole(raw);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }

  return result;
}

/**
 * Resolves the primary canonical AppRole from the user's authenticated role claims.
 * Returns null if the user has no valid role claims.
 */
export function resolvePrimaryRole(rawRoles?: string[] | null): AppRole | null {
  const normalized = normalizeUserRoles(rawRoles);
  if (normalized.length === 0) {
    return null;
  }
  return normalized[0];
}

/**
 * Returns the exact dashboard route for the user's authenticated role claims,
 * or null if no valid role is present.
 */
export function getDashboardPathForRoles(
  rawRoles?: string[] | null
): string | null {
  const primary = resolvePrimaryRole(rawRoles);
  if (!primary) {
    return null;
  }
  return ROLE_DASHBOARD_PATHS[primary];
}

/**
 * Checks whether a target pathname belongs to one of the user's authorized role route prefixes.
 */
export function isPathAllowedForRoles(
  pathname: string | undefined | null,
  rawRoles?: string[] | null
): boolean {
  if (!pathname || typeof pathname !== "string") {
    return false;
  }

  const userRoles = normalizeUserRoles(rawRoles);
  if (userRoles.length === 0) {
    return false;
  }

  const cleanPath = pathname.trim();
  if (
    cleanPath === "/" ||
    cleanPath.startsWith("/login") ||
    cleanPath.startsWith("/register") ||
    cleanPath.startsWith("/access-denied") ||
    cleanPath.startsWith("/setup-")
  ) {
    return false;
  }

  return userRoles.some((role) => {
    const base = ROLE_BASE_PATHS[role];
    return cleanPath === base || cleanPath.startsWith(`${base}/`);
  });
}

/**
 * Formats a raw role string into a clean human-readable title.
 */
export function formatRoleLabel(rawRole?: string | null): string {
  const normalized = normalizeAppRole(rawRole);
  if (normalized) {
    return ROLE_DISPLAY_LABELS[normalized];
  }
  return rawRole || "Unassigned";
}
