import { useState } from "react";
import {
  HeartHandshake,
  AlertCircle,
  Clock,
  CheckCircle2,
  MapPin,
  PlusCircle,
  FileText,
  Shield,
  Phone,
  Home,
  LogOut,
  Send,
  Building2,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PermissionGuard from "../../components/common/PermissionGuard";

type AssistanceRequest = {
  id: string;
  category: "Food" | "Medical" | "Shelter" | "Evacuation" | "Clothing";
  description: string;
  status: "Submitted" | "Verified" | "Assigned" | "Resolved";
  urgency: "High" | "Medium" | "Low";
  location: string;
  createdAt: string;
};

const initialRequests: AssistanceRequest[] = [
  {
    id: "REQ-2026-081",
    category: "Food",
    description: "Emergency dry ration kits and clean bottled drinking water for family of 4.",
    status: "Verified",
    urgency: "High",
    location: "Kolonnawa, Western Province",
    createdAt: "2026-11-17 09:30",
  },
  {
    id: "REQ-2026-042",
    category: "Medical",
    description: "Insulin prescription and basic first-aid supplies for elderly evacuee.",
    status: "Assigned",
    urgency: "High",
    location: "Kelaniya Relief Center",
    createdAt: "2026-11-15 14:15",
  },
];

const nearbyShelters = [
  {
    name: "Central Community Hall Shelter",
    location: "Colombo 05",
    capacity: "350 Evacuees",
    availableBeds: 42,
    status: "Open",
    contact: "+94 11 258 0000",
  },
  {
    name: "St. Thomas Relief Campus",
    location: "Mount Lavinia",
    capacity: "500 Evacuees",
    availableBeds: 110,
    status: "Open",
    contact: "+94 11 271 2233",
  },
];

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<AssistanceRequest[]>(initialRequests);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCategory, setNewCategory] = useState<AssistanceRequest["category"]>("Food");
  const [newUrgency, setNewUrgency] = useState<AssistanceRequest["urgency"]>("High");
  const [newLocation, setNewLocation] = useState(user?.address || "");
  const [newDescription, setNewDescription] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim() || !newLocation.trim()) return;

    const newReq: AssistanceRequest = {
      id: `REQ-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      category: newCategory,
      description: newDescription.trim(),
      status: "Submitted",
      urgency: newUrgency,
      location: newLocation.trim(),
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setRequests([newReq, ...requests]);
    setNewDescription("");
    setShowNewModal(false);
    setSubmittedFeedback(true);
    setTimeout(() => setSubmittedFeedback(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Topbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123B5C] text-white shadow-sm">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <span className="text-base font-bold text-[#123B5C]">CareLink</span>
              <span className="ml-2 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                Citizen Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-semibold text-slate-800">{user?.fullName || "Citizen User"}</div>
              <div className="text-[13px] text-slate-500">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-rose-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Welcome Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#123B5C] to-[#1D5E8C] p-6 text-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
                Welcome, {user?.fullName?.split(" ")[0] || "Citizen"}
              </h1>
              <p className="mt-1 text-sm text-sky-100 sm:text-sm">
                Request emergency assistance, monitor verification progress, and access nearby shelter information.
              </p>
            </div>

            <PermissionGuard permission="Requests.Create">
              <button
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-teal-600"
              >
                <PlusCircle className="h-4 w-4" />
                Submit Assistance Request
              </button>
            </PermissionGuard>
          </div>
        </div>

        {submittedFeedback && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Your emergency assistance request has been submitted to the National Emergency Coordination queue.
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left 2 Cols: My Assistance Requests */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">My Assistance Requests</h2>
                  <p className="text-xs text-slate-500">Live operational status and assigned field teams</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {requests.length} Requests
                </span>
              </div>

              {requests.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-sm font-medium text-slate-600">No active assistance requests.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:border-[#123B5C]/30 hover:shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#123B5C]">{req.id}</span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                              req.urgency === "High"
                                ? "bg-rose-50 text-rose-700"
                                : req.urgency === "Medium"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {req.urgency} Urgency
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                            {req.category}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            req.status === "Resolved"
                              ? "bg-emerald-50 text-emerald-700"
                              : req.status === "Assigned"
                                ? "bg-indigo-50 text-indigo-700"
                                : req.status === "Verified"
                                  ? "bg-teal-50 text-teal-700"
                                  : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {req.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-700">{req.description}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {req.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {req.createdAt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Safe Shelters & Hotline */}
          <div className="space-y-6">
            {/* Nearby Shelters */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#123B5C]" />
                  <h3 className="text-base font-bold text-slate-900">Nearby Shelters</h3>
                </div>
                <span className="text-[13px] text-slate-400">Live verified</span>
              </div>

              <div className="space-y-3">
                {nearbyShelters.map((s, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-800">{s.name}</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-800">
                        {s.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[13px] text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {s.location}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-600">{s.availableBeds} beds available</span>
                      <a href={`tel:${s.contact}`} className="font-semibold text-teal-700 hover:underline">
                        {s.contact}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Hotline Card */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-200/80 p-2 text-amber-800">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Emergency Crisis Hotline</h4>
                  <p className="mt-0.5 text-sm text-amber-800">
                    For life-threatening emergencies, immediate evacuation, or ambulance dispatch.
                  </p>
                  <div className="mt-3 text-lg font-black text-amber-950">117 / +94 11 213 6136</div>
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-[#123B5C]" />
                <h3 className="text-base font-bold text-slate-900">My Profile Information</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-semibold text-slate-800">{user?.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-800">{user?.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-semibold text-slate-800">{user?.phoneNumber || "Not provided"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Address</span>
                  <span className="font-semibold text-slate-800">{user?.address || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Create Assistance Request */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-base font-bold text-slate-900">Submit Emergency Assistance Request</h3>
            <p className="mt-1 text-xs text-slate-500">
              Provide accurate location and details to assist emergency responders.
            </p>

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Assistance Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm sm:text-[15px] text-slate-800 focus:border-[#123B5C] focus:outline-hidden"
                  >
                    <option value="Food">Food & Dry Rations</option>
                    <option value="Medical">Medical Assistance / Prescription</option>
                    <option value="Shelter">Temporary Shelter / Bedding</option>
                    <option value="Evacuation">Flood / Disaster Evacuation</option>
                    <option value="Clothing">Clothing & Essentials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Urgency Level</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm sm:text-[15px] text-slate-800 focus:border-[#123B5C] focus:outline-hidden"
                  >
                    <option value="High">High (Immediate threat)</option>
                    <option value="Medium">Medium (Within 12 hours)</option>
                    <option value="Low">Low (General relief)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Current Location / Address</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Street address, landmark, Grama Niladhari division"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm sm:text-[15px] text-slate-800 focus:border-[#123B5C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Details of Assistance Needed</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe your family size, specific medical needs, or urgent rescue requirements..."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm sm:text-[15px] text-slate-800 focus:border-[#123B5C] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-[#123B5C] px-5 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0E2E48]"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
