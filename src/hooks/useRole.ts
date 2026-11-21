import { useAuth } from "../context/AuthContext";

export function useRole(roleOrRoles?: string | string[]) {
  const { roles, hasRole, hasAnyRole } = useAuth();

  const isAllowed = !roleOrRoles
    ? true
    : Array.isArray(roleOrRoles)
      ? hasAnyRole(roleOrRoles)
      : hasRole(roleOrRoles);

  const isAdmin = hasRole("Admin") || hasRole("SystemAdmin");
  const isCoordinator = hasRole("EmergencyCoordinator") || hasRole("IncidentManager");
  const isPartner = hasRole("PartnerOfficer");
  const isVolunteer = hasRole("Volunteer") || hasRole("VolunteerCoordinator");
  const isCitizen = hasRole("Citizen");

  return {
    isAllowed,
    hasRole,
    hasAnyRole,
    roles,
    isAdmin,
    isCoordinator,
    isPartner,
    isVolunteer,
    isCitizen,
  };
}
