# CARELINK – 9-ROLE END-TO-END TEST MATRIX

This document provides the complete role-by-role verification matrix across all **9 canonical CareLink roles** (plus the Field Volunteer portal account), including authentication, JWT role/permission claims, frontend route guards (`ProtectedRoute`), sidebar navigation, backend API authorization, and cross-role data isolation.

> **Security Note:** No real production passwords, SMTP App Passwords, or API keys are exposed in this document. Seeded local evaluation credentials are documented in `CARELINK_HANDOVER_GUIDE.md`.

---

## 1. Canonical Role Authentication & Primary Dashboard Matrix

| # | Canonical Role | Seeded Test Email | Primary Frontend Route | Account Status on Startup | Login & JWT Issuance | Unauthorized (`401`) Guard | Cross-Role (`403`) Guard | Overall Status |
|---|---|---|---|---|---|---|---|---|
| 1 | **Admin** | `admin@carelink.org` | `/admin` | `Active` | **PASS** (`200 OK`) | **PASS** (`401`) | **PASS** (Full Admin Access) | **PASS** |
| 2 | **CaseManager** | `casemanager@carelink.org` | `/case-manager/dashboard` | `Active` | **PASS** (`200 OK`) | **PASS** (`401`) | **PASS** (`403` on `/api/users`) | **PASS** |
| 3 | **Citizen** | `citizen@carelink.org` | `/citizen` | `Active` | **PASS** (`200 OK`) | **PASS** (`401`) | **PASS** (`403` on `/api/users` & cross-citizen IDOR) | **PASS** |
| 4 | **EmergencyCoordinator** | `coordinator@carelink.org` | `/coordinator` | `Active` | **PASS** (`200 OK`) | **PASS** (`401`) | **PASS** (`403` on Admin-only user mutation) | **PASS** |
| 5 | **FundingOfficer** | `funding@carelink.org` | `/funding/dashboard` | `Active` | **PASS** (`200 OK`) | **PASS** (`401`) | **PASS** (`403` on `/api/users`) | **PASS** |
| 6 | **PartnerOfficer** | `partner@carelink.org` | `/partner/dashboard` | `Active` | **PASS** (`200 OK`) | **PASS** (`401`) | **PASS** (`403` on `/api/users`) | **PASS** |
| 7 | **ResourceManager** | `resourcemanager@carelink.org` | `/resources` | `Active` | **PASS** (`200 OK`) | **PASS** (`401`) | **PASS** (`403` on `/api/users`) | **PASS** |
| 8 | **ShelterAdministrator** | `shelteradmin@carelink.org` | `/shelter/dashboard` | `Active` | **PASS** (`200 OK`) | **PASS** (`401`) | **PASS** (`403` on `/api/users`) | **PASS** |
| 9 | **VolunteerCoordinator** | `volunteercoordinator@carelink.org` | `/volunteer-coordinator/dashboard` | `Active` *(Fixed in `DbInitializer`)* | **PASS** (`200 OK`) | **PASS** (`401`) | **PASS** (`403` on `/api/users`) | **PASS** |
| 10 | **Volunteer** *(Field Account)* | `volunteer@carelink.org` | `/volunteer-coordinator/dashboard` | `Active` | **PASS** (`200 OK`) | **PASS** (`401`) | **PASS** (`403` on `/api/users`) | **PASS** |

---

## 2. Detailed Per-Role Page, Feature & API Verification

### 2.1 Role 1: Admin (`Admin`)
| Page / Feature | Frontend Route | Backend Endpoint(s) | Tested Operations | Status |
|---|---|---|---|---|
| System Administration Dashboard | `/admin` | `GET /api/admin/dashboard`, `GET /api/admin/kpis` | KPI cards, system health metrics, recent activity feed | **PASS** |
| User Management & Staff Invitations | `/admin/users` | `GET /api/users`, `POST /api/users`, `POST /api/users/{id}/resend-invitation`, `PATCH /api/users/{id}/status` | List/filter users, create internal staff (single-use setup token via email, never exposed in API JSON), resend invitation, enable/disable user | **PASS** |
| Partner Organisation Verification | `/admin/users` (Pending approval tab) | `GET /api/users/{id}/partner-details`, `GET /api/users/{id}/documents/{docId}`, `POST /api/users/{id}/approve-partner`, `POST /api/users/{id}/reject-partner`, `POST /api/users/{id}/request-partner-info` | Review 3-step Partner application, download/verify uploaded certificates, approve/reject with reason, request more info | **PASS** |
| Role & Permission Matrix | `/admin/roles` | `GET /api/roles`, `PUT /api/roles/{roleName}/permissions` | View and update granular role permissions | **PASS** |
| Organisation Management | `/admin/organisations` | `GET /api/organizations`, `POST /api/organizations`, `PUT /api/organizations/{id}` | Manage humanitarian partner organisations | **PASS** |
| Crisis Event Management | `/admin/crisis-events` | `GET /api/crisis-events`, `POST /api/crisis-events`, `PUT /api/crisis-events/{id}` | Create and update active crisis events | **PASS** |
| AI Recommendation Review | `/admin/ai-recommendations` | `GET /api/ai-recommendations`, `POST /api/ai-recommendations/{id}/approve`, `POST /api/ai-recommendations/{id}/reject`, `POST /api/ai-recommendations/generate/*` | Generate Gemini AI recommendations, approve/reject with mandatory reason and audit log | **PASS** |
| Audit Logs & Security Center | `/admin/audit-logs`, `/admin/security` | `GET /api/audit-logs`, `GET /api/security-events` | Inspect immutable audit trail and security events | **PASS** |
| System Health, Multilingual & Settings | `/admin/system-health`, `/admin/multilingual`, `/admin/reports`, `/admin/notifications`, `/admin/settings` | `GET /api/system-health`, `GET /api/multilingual`, `GET /api/admin/reports`, `GET /api/admin/settings` | Inspect service diagnostics, translations, and platform settings | **PASS** |

### 2.2 Role 2: Case Manager (`CaseManager`)
| Page / Feature | Frontend Route | Backend Endpoint(s) | Tested Operations | Status |
|---|---|---|---|---|
| Case Manager Dashboard | `/case-manager/dashboard` | `GET /api/casemanagement/dashboard`, `GET /api/casemanagement/cases` | Live case metrics, priority distribution, active case table | **PASS** |
| My Cases | `/case-manager/my-cases` | `GET /api/mycases`, `GET /api/mycases/stats`, `POST /api/mycases`, `PATCH /api/mycases/{id}/status` | View assigned cases (including propagated Citizen requests), update status (`In Progress`, `Resolved`) with bi-directional Citizen sync | **PASS** |
| Priority Queue | `/case-manager/priority-queue` | `GET /api/case-manager/priority-queue`, `POST /api/case-manager/priority-queue/{id}/override` | View AI-prioritized cases, override priority with rationale *(Route collision resolved)* | **PASS** |
| Beneficiary Registry | `/case-manager/beneficiaries` | `GET /api/beneficiaryregistry`, `POST /api/beneficiaryregistry` | Search, filter, and register displaced beneficiaries | **PASS** |
| Needs Assessments | `/case-manager/assessments` | `GET /api/assessments`, `POST /api/assessments` | Record household vulnerability and needs assessments | **PASS** |
| Service Referrals | `/case-manager/referrals` | `GET /api/servicereferrals`, `POST /api/servicereferrals` | Refer beneficiaries to shelter, medical, or food services | **PASS** |
| Case Notes & Follow-ups | `/case-manager/notes` | `GET /api/casenotes`, `POST /api/casenotes` | Add chronological case notes and follow-up actions | **PASS** |
| Case Reports & Notifications | `/case-manager/reports`, `/case-manager/notifications`, `/case-manager/settings` | `GET /api/casereports`, `GET /api/case-manager/notifications`, `GET /api/casesettings` | Export case analytics and manage notifications *(Route collision resolved)* | **PASS** |

### 2.3 Role 3: Citizen (`Citizen`)
| Page / Feature | Frontend Route | Backend Endpoint(s) | Tested Operations | Status |
|---|---|---|---|---|
| Citizen Home & Relief Overview | `/citizen` | `GET /api/citizen/home` | View emergency hotlines, active alerts, nearby shelters, and personal request summary | **PASS** |
| Submit & Track Help Requests | `/citizen/requests` | `GET /api/citizen/requests`, `POST /api/citizen/requests`, `GET /api/citizen/requests/{id}`, `DELETE /api/citizen/requests/{id}` | Submit emergency request (propagates to Case Manager & Coordinator), track live status updates, enforce strict Citizen data isolation (`403` on cross-citizen IDOR) | **PASS** |
| Safe Shelters & Map Finder | `/citizen/shelters` | `GET /api/citizen/shelters`, `GET /api/citizen/shelters/summary` | Browse open shelters, available bed capacities, accessibility, and distance filters | **PASS** |
| Disaster Alerts & Announcements | `/citizen/alerts` | `GET /api/citizen/alerts` | View official flood/weather warnings and evacuation instructions | **PASS** |
| Volunteer Sign-Up | `/citizen/volunteer` | `GET /api/citizen/volunteer`, `POST /api/citizen/volunteer` | Submit field volunteer application | **PASS** |
| Citizen Notifications & Settings | `/citizen/notifications`, `/citizen/settings` | `GET /api/citizen/notifications`, `GET /api/citizen/settings`, `PUT /api/citizen/settings` | Manage personal alerts and trilingual preferences | **PASS** |
| CareLink AI Relief Assistant | Floating Widget | `POST /api/chatbot/message`, `GET /api/chatbot/conversations` | Trilingual (English, Sinhala, Tamil) AI assistance with emergency hotline prioritization | **PASS** |

### 2.4 Role 4: Emergency Coordinator (`EmergencyCoordinator`)
| Page / Feature | Frontend Route | Backend Endpoint(s) | Tested Operations | Status |
|---|---|---|---|---|
| Emergency Command Dashboard | `/coordinator` | `GET /api/coordinator/dashboard` | Operational situational awareness, active incidents, response metrics | **PASS** |
| Assistance Requests Command | `/coordinator/requests` | `GET /api/assistance-requests` (`/api/assistancerequests`), `POST /api/assistance-requests`, `PATCH /api/assistance-requests/{id}` | Triage incoming assistance requests (including Citizen submissions), update status (syncs back to Citizen & Case Manager) | **PASS** |
| Coordinator Priority Queue | `/coordinator/priority-queue` | `GET /api/coordinator/priority-queue`, `POST /api/coordinator/priority-queue/{id}/approve` | Approve or override AI triage priority queue | **PASS** |
| Incident Map & GIS View | `/coordinator/incident-map` | `GET /api/incident-map` | Inspect geospatial crisis zones and field deployments | **PASS** |
| Response Teams & Task Dispatch | `/coordinator/teams`, `/coordinator/tasks` | `GET /api/response-teams`, `GET /api/task-assignments`, `POST /api/task-assignments` | Deploy emergency response teams and track field tasks | **PASS** |
| Resource & Shelter Overview | `/coordinator/resources`, `/coordinator/shelters` | `GET /api/resource-overview`, `GET /api/shelter-overview` | Monitor cross-district stock levels and shelter capacities | **PASS** |
| Situation Reports, Notifications & Settings | `/coordinator/reports`, `/coordinator/notifications`, `/coordinator/settings` | `GET /api/situation-reports`, `GET /api/coordinator/notifications`, `GET /api/coordinator/settings` | Generate situation reports (SitReps) and operational alerts | **PASS** |

### 2.5 Role 5: Funding Officer (`FundingOfficer`)
| Page / Feature | Frontend Route | Backend Endpoint(s) | Tested Operations | Status |
|---|---|---|---|---|
| Funding & Donation Dashboard | `/funding/dashboard` | `GET /api/funding-dashboard` | View verified contributions, allocation rates, risk alerts, and export CSV *(Wired to live API)* | **PASS** |
| Donation Records | `/funding/donations` | `GET /api/donations`, `POST /api/donations` | Filter monetary/material donations, record new donations *(Wired to live API)* | **PASS** |
| Donor Management | `/funding/donors` | `GET /api/donors`, `POST /api/donors` | Register donors, track lifetime contributions and verification status *(Wired to live API)* | **PASS** |
| Resource Contributions | `/funding/resources` | `GET /api/resource-contributions`, `POST /api/resource-contributions` | Record and verify in-kind material donations *(Wired to live API)* | **PASS** |
| Fund Allocations | `/funding/allocations` | `GET /api/fund-allocations`, `POST /api/fund-allocations` | Allocate campaign funds to relief units and track disbursement *(Wired to live API)* | **PASS** |
| Expenditure Tracking | `/funding/expenditure` | `GET /api/expenditures`, `POST /api/expenditures` | Record invoices, verify receipts, and manage payment holds *(Wired to live API)* | **PASS** |
|Campaigns & Appeals | `/funding/campaigns` | `GET /api/campaigns`, `POST /api/campaigns`, `PUT /api/campaigns/{id}` | Create and track humanitarian fundraising campaigns | **PASS** |
| Flagged Transactions | `/funding/flagged` | `GET /api/flagged-transactions` | Investigate high-risk contribution or invoice variance flags *(Wired to live API)* | **PASS** |
| Transparency & Analytics Reports | `/funding/transparency`, `/funding/reports` | `GET /api/transparency-reports`, `POST /api/transparency-reports`, `GET /api/funding-reports` | Publish public accountability reports and export analytics *(Wired to live API)* | **PASS** |
| Funding Notifications & Settings | `/funding/notifications`, `/funding/settings` | `GET /api/notifications`, `GET /api/funding-settings`, `PUT /api/funding-settings` | Configure approval thresholds and notification rules *(Wired to live API)* | **PASS** |

### 2.6 Role 6: Partner Officer (`PartnerOfficer`)
| Page / Feature | Frontend Route | Backend Endpoint(s) | Tested Operations | Status |
|---|---|---|---|---|
| Partner Organisation Dashboard | `/partner/dashboard` | `GET /api/partner-dashboard` | View assigned partner tasks, resource pledges, and coordination updates | **PASS** |
| Assigned Tasks & Coordination | `/partner/tasks`, `/partner/coordination` | `GET /api/partner-tasks`, `PATCH /api/partner-tasks/{id}`, `GET /api/partner-coordination` | Update partner task progress and coordinate with NDMC | **PASS** |
| Resource Contributions & Submissions | `/partner/contributions`, `/partner/submissions` | `GET /api/partner-contributions`, `POST /api/partner-contributions`, `GET /api/partner-submissions` | Pledge and track NGO relief supplies and field reports | **PASS** |
| Partner Directory, Profile, Reports & Settings | `/partner/directory`, `/partner/profile`, `/partner/reports`, `/partner/notifications`, `/partner/settings` | `GET /api/partner-directory`, `GET /api/partner-profile`, `GET /api/partner-reports`, `GET /api/partner-notifications`, `GET /api/partner-settings` | Manage NGO profile, compliance documents, and reports | **PASS** |

### 2.7 Role 7: Resource Manager (`ResourceManager`)
| Page / Feature | Frontend Route | Backend Endpoint(s) | Tested Operations | Status |
|---|---|---|---|---|
| Resource Command Dashboard | `/resources` | `GET /api/resource-dashboard` | Monitor SKU health, low-stock alerts, active dispatches, and warehouse utilization | **PASS** |
| Inventory Management | `/resources/inventory` | `GET /api/inventory`, `POST /api/inventory`, `PUT /api/inventory/{id}`, `PATCH /api/inventory/{id}/adjust`, `DELETE /api/inventory/{id}` | Full SKU CRUD, stock adjustments, threshold status calculation | **PASS** |
| Resource Allocations | `/resources/allocations` | `GET /api/allocations`, `POST /api/allocations`, `PATCH /api/allocations/{id}/status`, `DELETE /api/allocations/{id}` | Allocate stock to shelters/wards with automatic inventory validation and stock deduction (Workflow D) | **PASS** |
| Dispatch & Logistics | `/resources/dispatch` | `GET /api/dispatches`, `POST /api/dispatches`, `PATCH /api/dispatches/{id}/status` | Schedule and track relief transport dispatches | **PASS** |
| Warehouses, Suppliers & Replenishment | `/resources/warehouses`, `/resources/suppliers`, `/resources/replenishment`, `/resources/expiry` | `GET /api/warehouses`, `GET /api/suppliers`, `GET /api/replenishment`, `GET /api/expiry-alerts` | Manage depots, supplier contracts, purchase orders, and expiring batches | **PASS** |
| Resource Reports, Notifications & Settings | `/resources/reports`, `/resources/notifications`, `/resources/settings` | `GET /api/resource-reports`, `GET /api/resource-notifications`, `GET /api/resource-settings` | Export stock analytics and configure reorder thresholds | **PASS** |

### 2.8 Role 8: Shelter Administrator (`ShelterAdministrator`)
| Page / Feature | Frontend Route | Backend Endpoint(s) | Tested Operations | Status |
|---|---|---|---|---|
| Shelter Admin Dashboard | `/shelter/dashboard` | `GET /api/shelter-dashboard` | View shelter capacity utilization, admissions, and critical alerts | **PASS** |
| Shelter Management | `/shelter/shelters` | `GET /api/shelters`, `POST /api/shelters`, `PUT /api/shelters/{id}`, `PATCH /api/shelters/{id}/occupancy`, `DELETE /api/shelters/{id}` | Register/edit shelters, support string codes (`SH-001`), enforce capacity limits *(Wired to live API)* | **PASS** |
| Occupancy Management | `/shelter/occupancy` | `GET /api/occupancy/shelters`, `POST /api/occupancy/admissions`, `PUT /api/occupancy/thresholds` | Record admissions with capacity overflow protection (Workflow E) *(Wired to live API)* | **PASS** |
| Resident Management | `/shelter/residents` | `GET /api/residents`, `POST /api/residents`, `PUT /api/residents/{id}` | Register displaced residents and track medical/mobility needs *(Wired to live API)* | **PASS** |
| Accommodation Requests | `/shelter/requests` | `GET /api/accommodation-requests`, `POST /api/accommodation-requests`, `PATCH /api/accommodation-requests/{id}/status` | Approve and assign household shelter requests *(Wired to live API)* | **PASS** |
| Room & Bed Management | `/shelter/rooms` | `GET /api/rooms`, `POST /api/rooms` | Manage dormitory rooms and individual bed statuses *(Wired to live API)* | **PASS** |
| Shelter Resource Inventory | `/shelter/inventory` | `GET /api/resources`, `POST /api/resources` | Track shelter-level food, water, bedding, and medical kits *(Wired to live API)* | **PASS** |
| Staff, Health & Safety, Maintenance | `/shelter/staff`, `/shelter/health-safety`, `/shelter/maintenance` | `GET /api/staff`, `GET /api/health-safety`, `GET /api/maintenance-requests` | Manage shelter staff shifts, medical/safety incidents, and facility repairs *(Wired to live API)* | **PASS** |
| Disaster Updates, Reports, Notifications & Settings | `/shelter/updates`, `/shelter/reports`, `/shelter/notifications`, `/shelter/settings` | `GET /api/disaster-updates`, `GET /api/shelter/reports/overview`, `GET /api/notifications`, `GET /api/settings` | Publish shelter bulletins and export shelter reports *(Wired to live API)* | **PASS** |

### 2.9 Role 9: Volunteer Coordinator (`VolunteerCoordinator`)
| Page / Feature | Frontend Route | Backend Endpoint(s) | Tested Operations | Status |
|---|---|---|---|---|
| Volunteer Coordination Dashboard | `/volunteer-coordinator/dashboard` | `GET /api/volunteer/dashboard` | Active volunteers, deployment rates, urgent task gaps | **PASS** |
| Volunteer Directory | `/volunteer-coordinator/directory` | `GET /api/volunteer/directory`, `POST /api/volunteer/directory` | Search/filter volunteers by skill, ward, verification, and availability | **PASS** |
| Task Assignments | `/volunteer-coordinator/assignments` | `GET /api/assignments`, `POST /api/assignments`, `PATCH /api/assignments/{id}` | Assign available volunteers to tasks; reject unavailable volunteers with `400 BadRequest` (Workflow C) | **PASS** |
| AI Task Matching | `/volunteer-coordinator/matching` | `GET /api/task-matching`, `POST /api/task-matching/approve` | Review and approve AI-recommended volunteer-to-task matches | **PASS** |
| Availability & Shifts | `/volunteer-coordinator/availability` | `GET /api/availability-shifts`, `POST /api/availability-shifts` | Manage shift rosters and check-in statuses | **PASS** |
| Skills & Verification | `/volunteer-coordinator/verification` | `GET /api/skills-verification`, `POST /api/skills-verification/{id}/verify` | Verify medical, rescue, and heavy-vehicle credentials | **PASS** |
| Operational Communications | `/volunteer-coordinator/communications` | `GET /api/communications/broadcasts`, `POST /api/communications/broadcasts`, `POST /api/communications/draft` | Send multilingual operational broadcasts and save drafts *(Wired to live API)* | **PASS** |
| Volunteer Notifications, Reports & Settings | `/volunteer-coordinator/notifications`, `/volunteer-coordinator/reports`, `/volunteer-coordinator/settings` | `GET /api/volunteer/notifications`, `PATCH /api/volunteer/notifications/{id}/read`, `GET /api/volunteer/reports`, `GET /api/volunteer/settings` | Manage coordination alerts, preferences, and reports *(Wired to live API)* | **PASS** |
