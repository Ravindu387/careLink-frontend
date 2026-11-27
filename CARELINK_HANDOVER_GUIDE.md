# CARELINK – PROJECT HANDOVER & EVALUATION GUIDE

**Project:** CareLink – Humanitarian Aid and Crisis Management Platform  
**Institution:** NSBM Green University – Software Architecture Project  
**Backend Path:** `D:\NSBM\SA-Project\careLink-backend`  
**Frontend Path:** `D:\NSBM\SA-Project\careLink-frontend`

---

## 1. Prerequisites & Local Environment Setup

| Requirement | Version / Configuration |
|---|---|
| **.NET SDK** | .NET 10.0 SDK (`net10.0`) |
| **Node.js & npm** | Node.js 20+ / npm 10+ |
| **SQL Server** | SQL Server Express (`Server=.\SQLEXPRESS;Database=CareLinkDB;Trusted_Connection=True;TrustServerCertificate=True`) |
| **Backend URL** | `http://localhost:5277` (Health Check: `http://localhost:5277/api/health`) |
| **Frontend URL** | `http://localhost:5173` (Vite `/api` proxy configured to `http://localhost:5277`) |

---

## 2. Local Secrets Configuration (`appsettings.local.json`)

For security compliance, no plaintext secrets (SMTP App Passwords or Gemini API Keys) are stored in tracked `appsettings.json` or `appsettings.Development.json` files.

Instead, local secrets are loaded from gitignored `D:\NSBM\SA-Project\careLink-backend\CareLink.API\appsettings.local.json` (or environment variables):

```json
{
  "EmailSettings": {
    "Password": "<YOUR_16_CHAR_GMAIL_APP_PASSWORD>"
  },
  "Gemini": {
    "ApiKey": "<YOUR_GEMINI_API_KEY>"
  }
}
```

- **Gmail SMTP Note:** If `EmailSettings:Password` is omitted or invalid, CareLink still creates invited staff accounts in `CareLinkDB` and displays an honest warning banner in Admin User Management with a one-click **Resend Invitation** action once SMTP is configured.
- **Gemini AI Note:** If `Gemini:ApiKey` is omitted or rate-limited, both the AI Recommendation Engine (`AiRecommendationService`) and the CareLink Trilingual Relief Assistant (`ChatbotService`) automatically fall back to deterministic, domain-grounded humanitarian intelligence without crashing.

---

## 3. Starting the Application

### 3.1 Start the Backend API (`http://localhost:5277`)
Open a terminal in `D:\NSBM\SA-Project\careLink-backend`:
```powershell
dotnet run --project "D:\NSBM\SA-Project\careLink-backend\CareLink.API\CareLink.API.csproj" --urls "http://localhost:5277"
```
On startup, `CareLink.API` automatically:
1. Applies any pending EF Core migrations to `CareLinkDB` on `.\SQLEXPRESS`.
2. Seeds and verifies all 9 canonical roles, granular role-permission claims, and the 10 default evaluation accounts (`DbInitializer.InitializeAsync`).
3. Seeds the operational humanitarian dataset (`DataSeeder.SeedAsync`).

Verify backend health at:
- `http://localhost:5277/api/health` -> returns `{"status":"Healthy","application":"CareLink Humanitarian Crisis API","version":"1.0.0"}`

### 3.2 Start the Frontend Application (`http://localhost:5173`)
Open a terminal in `D:\NSBM\SA-Project\careLink-frontend`:
```powershell
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 4. Seeded Role Accounts for Demonstration & Evaluation

All 9 canonical roles (plus a Field Volunteer account) are pre-seeded and active in `CareLinkDB`:

| # | Canonical Role | Display Name | Email / Username | Default Evaluation Password | Landing Dashboard Route |
|---|---|---|---|---|---|
| 1 | `Admin` | System Administrator | `admin@carelink.org` | `Admin@123456` | `/admin` |
| 2 | `CaseManager` | Amara Perera | `casemanager@carelink.org` | `CaseManager@123456` | `/case-manager/dashboard` |
| 3 | `Citizen` | Nithya Hansani | `citizen@carelink.org` | `Citizen@123456` | `/citizen` |
| 4 | `EmergencyCoordinator` | Rohan Fernando | `coordinator@carelink.org` | `Coordinator@123456` | `/coordinator` |
| 5 | `FundingOfficer` | Maria Kone | `funding@carelink.org` | `Funding@123456` | `/funding/dashboard` |
| 6 | `PartnerOfficer` | Kasun Jayasuriya | `partner@carelink.org` | `Partner@123456` | `/partner/dashboard` |
| 7 | `ResourceManager` | Daniel Perera | `resourcemanager@carelink.org` | `Resource@123456` | `/resources` |
| 8 | `ShelterAdministrator` | Sanjana Amarasinghe | `shelteradmin@carelink.org` | `Shelter@123456` | `/shelter/dashboard` |
| 9 | `VolunteerCoordinator` | Nadia Okafor | `volunteercoordinator@carelink.org` | `VolunteerCoord@123456` | `/volunteer-coordinator/dashboard` |
| 10 | `Volunteer` | Kavindi Silva | `volunteer@carelink.org` | `Volunteer@123456` | `/volunteer-coordinator/dashboard` |

---

## 5. Running Automated Builds & Test Suites

### 5.1 Backend Build & Automated Test Suite (106 Tests)
```powershell
dotnet build "D:\NSBM\SA-Project\careLink-backend\CareLink.Tests\CareLink.Tests.csproj"
dotnet exec "D:\NSBM\SA-Project\careLink-backend\CareLink.Tests\bin\Debug\net10.0\CareLink.Tests.dll"
```
- **Verified Result:** `Total: 106 | Passed: 106 | Failed: 0`

### 5.2 Frontend Production Build & Vitest Suite (79 Tests)
```powershell
cd "D:\NSBM\SA-Project\careLink-frontend"
npm run build
npm test
```
- **Verified Result:** `Test Files: 7 passed (7) | Tests: 79 passed (79)`

---

## 6. Recommended University Evaluation Walkthrough (10-Minute Demo Script)

1. **Public Landing Page & Trilingual AI Relief Assistant**:
   - Visit `http://localhost:5173`, inspect the humanitarian impact overview, and open the **CareLink AI Assistant** in the bottom-right corner to ask an emergency question in English, Sinhala, or Tamil.
2. **Workflow A — Citizen Request to Case Manager Resolution**:
   - Log in as **Citizen** (`citizen@carelink.org`), go to **My Requests** (`/citizen/requests`), and submit a critical emergency assistance request.
   - Log out and log in as **Case Manager** (`casemanager@carelink.org`), open **My Cases** (`/case-manager/my-cases`), locate the newly submitted Citizen request, and update its status to `In Progress` and then `Resolved`.
   - Log back in as **Citizen** to confirm the request status is now `Resolved`.
3. **Workflow B — AI Decision Support & Governance**:
   - Log in as **Admin** (`admin@carelink.org`), navigate to **AI Recommendations** (`/admin/ai-recommendations`), generate a live Crisis Analysis or Resource Recommendation, and approve or reject a recommendation with a mandatory audit rationale.
4. **Workflow F — Partner Organisation Verification & Staff Provisioning**:
   - Still logged in as **Admin**, open **User Management** (`/admin/users`) to demonstrate staff invitation creation (single-use email setup link without token leakage in the UI/API) and Partner Organisation document verification & approval.
5. **Workflows C, D & E — Operational Resource, Shelter & Volunteer Guardrails**:
   - Log in as **Resource Manager** (`resourcemanager@carelink.org`) -> allocate inventory at `/resources/allocations` and observe automatic stock deduction.
   - Log in as **Shelter Administrator** (`shelteradmin@carelink.org`) -> record a household admission at `/shelter/occupancy` and verify capacity enforcement.
   - Log in as **Volunteer Coordinator** (`volunteercoordinator@carelink.org`) -> assign an available volunteer at `/volunteer-coordinator/assignments` and send an operational broadcast at `/volunteer-coordinator/communications`.
