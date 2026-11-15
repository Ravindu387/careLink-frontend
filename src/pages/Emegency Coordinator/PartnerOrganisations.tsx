
import { useMemo, useState } from "react";
import {
  Building2,
  Package,
  Handshake,
  ShieldCheck,
  Search,
  Download,
  Plus,
  Filter,
  ChevronRight,
  X,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";

interface Partner {
  id: string;
  name: string;
  type: string;
  region: string;
  role: string;
  verification: "Verified" | "Pending" | "Rejected";
  status: "Active" | "Inactive";
  email: string;
  phone: string;
}

const initialPartners: Partner[] = [
  {
    id: "ORG-001",
    name: "National Disaster Authority",
    type: "Government",
    region: "Greater Riverton",
    role: "Lead Coordinator",
    verification: "Verified",
    status: "Active",
    email: "contact@nda.org",
    phone: "+94 11 234 5678",
  },
  {
    id: "ORG-014",
    name: "CareLink Shelter Network",
    type: "Local NGO",
    region: "Central - North",
    role: "Shelter Operations",
    verification: "Verified",
    status: "Active",
    email: "info@carelink.org",
    phone: "+94 11 234 5679",
  },
  {
    id: "ORG-027",
    name: "Global Relief Network",
    type: "International NGO",
    region: "4 districts",
    role: "Food - Medical",
    verification: "Verified",
    status: "Active",
    email: "support@globalrelief.org",
    phone: "+94 11 234 5680",
  },
  {
    id: "ORG-042",
    name: "Emergency Logistics Unit",
    type: "Government",
    region: "Central Region",
    role: "Transport - Warehousing",
    verification: "Verified",
    status: "Active",
    email: "logistics@example.org",
    phone: "+94 11 234 5681",
  },
];

const verificationStyles: Record<string, string> = {
  Verified: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
};

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-600",
};

export default function PartnerOrganisations() {
  const [partners, setPartners] = useState(initialPartners);

  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All operational areas");
  const [status, setStatus] = useState("All statuses");
  const [availability, setAvailability] = useState("Any availability");

  const [showFilters, setShowFilters] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedPartner, setSelectedPartner] =
    useState<Partner | null>(null);

  const [organisationName, setOrganisationName] = useState("");
  const [organisationType, setOrganisationType] =
    useState("Local NGO");
  const [organisationEmail, setOrganisationEmail] = useState("");
  const [organisationPhone, setOrganisationPhone] = useState("");
  const [organisationRegion, setOrganisationRegion] =
    useState("Greater Riverton");
  const [organisationRole, setOrganisationRole] =
    useState("Shelter Operations");

  const [message, setMessage] = useState("");

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch = [
        partner.id,
        partner.name,
        partner.type,
        partner.region,
        partner.role,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesArea =
        area === "All operational areas" ||
        partner.region.includes(area);

      const matchesStatus =
        status === "All statuses" ||
        partner.status === status;

      const matchesAvailability =
        availability === "Any availability" ||
        partner.verification === availability;

      return (
        matchesSearch &&
        matchesArea &&
        matchesStatus &&
        matchesAvailability
      );
    });
  }, [partners, search, area, status, availability]);

  const addPartner = () => {
    if (
      !organisationName.trim() ||
      !organisationEmail.trim() ||
      !organisationPhone.trim()
    ) {
      setMessage("Please complete all required fields.");
      return;
    }

    const newPartner: Partner = {
      id: `ORG-${String(partners.length + 1).padStart(3, "0")}`,
      name: organisationName.trim(),
      type: organisationType,
      region: organisationRegion,
      role: organisationRole,
      verification: "Pending",
      status: "Active",
      email: organisationEmail.trim(),
      phone: organisationPhone.trim(),
    };

    setPartners((previous) => [...previous, newPartner]);

    setMessage("Partner invitation created successfully!");

    setOrganisationName("");
    setOrganisationEmail("");
    setOrganisationPhone("");

    setTimeout(() => {
      setShowInvite(false);
      setMessage("");
    }, 1200);
  };

  const exportCSV = () => {
    const headers = [
      "Organisation ID",
      "Organisation",
      "Type",
      "Operational Regions",
      "Response Role",
      "Verification",
      "Status",
      "Email",
      "Phone",
    ];

    const rows = filteredPartners.map((p) => [
      p.id,
      p.name,
      p.type,
      p.region,
      p.role,
      p.verification,
      p.status,
      p.email,
      p.phone,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "partner-organisations.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setArea("All operational areas");
    setStatus("All statuses");
    setAvailability("Any availability");
  };

  return (
    <div className="min-h-screen bg-[#edf4f7] px-4 py-6 sm:px-6 lg:px-7">

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#153f5e]">
            Partner Organisations
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Coordinate verified organisations, responsibilities,
            resources, and shared operations.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b8d0df] bg-white px-4 py-2.5 text-xs text-[#175477] hover:bg-sky-50"
          >
            <Download size={15} />
            Export
          </button>

          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 rounded-lg bg-[#287da5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#216789]"
          >
            <Plus size={15} />
            Invite partner
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          icon={<Building2 size={19} />}
          title="Active partners"
          value="48"
          description="Across 6 sectors"
          color="blue"
        />

        <SummaryCard
          icon={<Package size={19} />}
          title="Shared resources"
          value="218"
          description="Verified contributions"
          color="blue"
        />

        <SummaryCard
          icon={<Handshake size={19} />}
          title="Collaboration requests"
          value="14"
          description="5 awaiting response"
          color="amber"
        />

        <SummaryCard
          icon={<ShieldCheck size={19} />}
          title="Verification coverage"
          value="96%"
          description="2 reviews pending"
          color="green"
        />

      </div>

      {/* Search and filters */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_repeat(3,minmax(130px,auto))_auto]">

        <div className="flex items-center gap-2 rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5">
          <Search size={15} className="shrink-0 text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partners..."
            className="w-full min-w-0 bg-transparent text-[10px] outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>All operational areas</option>
          <option>Greater Riverton</option>
          <option>Central</option>
          <option>North</option>
          <option>Eastbank</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>All statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="rounded-lg border border-[#d5e2e9] bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none"
        >
          <option>Any availability</option>
          <option>Verified</option>
          <option>Pending</option>
          <option>Rejected</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-lg border border-sky-600 bg-white px-3 py-2.5 text-[10px] font-medium text-sky-700 hover:bg-sky-50"
        >
          <Filter size={13} />
          More filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d5e2e9] bg-white p-3">
          <p className="text-[10px] text-slate-500">
            Showing organisations based on selected filters.
          </p>

          <button
            onClick={clearFilters}
            className="text-[10px] font-semibold text-sky-700 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Organisations table */}
      <section className="overflow-hidden rounded-xl border border-[#d5e2e9] bg-white shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">

            <thead className="border-b border-[#d5e2e9] bg-[#f7fafb]">
              <tr>
                {[
                  "Organisation ID",
                  "Organisation",
                  "Type",
                  "Operational Regions",
                  "Response Role",
                  "Verification",
                  "Status",
                  "",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-3 py-3 text-[9px] font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredPartners.map((partner) => (
                <tr
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner)}
                  className="cursor-pointer border-b border-slate-100 transition hover:bg-[#f0f6f8]"
                >
                  <td className="whitespace-nowrap px-3 py-4 text-[10px] font-semibold text-[#153f5e]">
                    {partner.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-600">
                    {partner.name}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-600">
                    {partner.type}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-600">
                    {partner.region}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-[9px] text-slate-600">
                    {partner.role}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <span
                      className={`rounded-md px-2 py-1 text-[8px] font-semibold ${verificationStyles[partner.verification]}`}
                    >
                      {partner.verification}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <span
                      className={`rounded-md px-2 py-1 text-[8px] font-semibold ${statusStyles[partner.status]}`}
                    >
                      {partner.status}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <ChevronRight
                      size={16}
                      className="text-slate-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPartners.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No partner organisations found.
          </div>
        )}

        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-[9px] text-slate-500">
            Showing {filteredPartners.length} of {partners.length} organisations
          </p>
        </div>
      </section>

      {/* Partner details modal */}
      {selectedPartner && (
        <Modal onClose={() => setSelectedPartner(null)}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#153f5e]">
              Organisation details
            </h2>

            <button onClick={() => setSelectedPartner(null)}>
              <X size={19} className="text-slate-500" />
            </button>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <Building2 size={28} className="mb-3 text-sky-600" />

            <h3 className="font-semibold text-[#153f5e]">
              {selectedPartner.name}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {selectedPartner.id} · {selectedPartner.type}
            </p>

            <div className="mt-5 space-y-4 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin size={15} />
                {selectedPartner.region}
              </p>

              <p className="flex items-center gap-2">
                <Handshake size={15} />
                {selectedPartner.role}
              </p>

              <p className="flex items-center gap-2">
                <Mail size={15} />
                {selectedPartner.email}
              </p>

              <p className="flex items-center gap-2">
                <Phone size={15} />
                {selectedPartner.phone}
              </p>

              <p className="flex items-center gap-2">
                <CheckCircle2 size={15} />
                {selectedPartner.verification}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedPartner(null)}
            className="mt-4 w-full rounded-lg bg-[#153f5e] py-3 text-xs font-semibold text-white hover:bg-[#205879]"
          >
            Close details
          </button>
        </Modal>
      )}

      {/* Invite partner modal */}
      {showInvite && (
        <Modal onClose={() => setShowInvite(false)}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#153f5e]">
                Invite partner
              </h2>
              <p className="mt-1 text-[10px] text-slate-500">
                Register a new partner organisation.
              </p>
            </div>

            <button onClick={() => setShowInvite(false)}>
              <X size={19} className="text-slate-500" />
            </button>
          </div>

          <div className="space-y-3">

            <FormInput
              label="Organisation name"
              value={organisationName}
              onChange={setOrganisationName}
              placeholder="Enter organisation name"
            />

            <FormInput
              label="Email address"
              value={organisationEmail}
              onChange={setOrganisationEmail}
              placeholder="Enter email address"
              type="email"
            />

            <FormInput
              label="Contact number"
              value={organisationPhone}
              onChange={setOrganisationPhone}
              placeholder="Enter phone number"
            />

            <FormSelect
              label="Organisation type"
              value={organisationType}
              onChange={setOrganisationType}
              options={[
                "Government",
                "Local NGO",
                "International NGO",
                "Private Organisation",
                "Community Organisation",
              ]}
            />

            <FormSelect
              label="Operational region"
              value={organisationRegion}
              onChange={setOrganisationRegion}
              options={[
                "Greater Riverton",
                "Central Ward",
                "North Ward",
                "Eastbank",
                "West District",
              ]}
            />

            <FormSelect
              label="Response role"
              value={organisationRole}
              onChange={setOrganisationRole}
              options={[
                "Shelter Operations",
                "Food - Medical",
                "Lead Coordinator",
                "Transport - Warehousing",
                "Emergency Assistance",
              ]}
            />

            {message && (
              <p className={`text-xs ${
                message.includes("successfully")
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}>
                {message}
              </p>
            )}

            <button
              onClick={addPartner}
              className="w-full rounded-lg bg-[#153f5e] py-3 text-xs font-semibold text-white hover:bg-[#205879]"
            >
              Send invitation
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Reusable summary card
function SummaryCard({
  icon,
  title,
  value,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color: "blue" | "amber" | "green";
}) {
  const colors = {
    blue: "bg-sky-100 text-sky-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-emerald-100 text-emerald-600",
  };

  return (
    <div className="rounded-xl border border-[#d5e2e9] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-3 ${colors[color]}`}>
          {icon}
        </div>

        <div>
          <p className="text-[9px] text-slate-500">{title}</p>
          <h2 className="text-2xl font-semibold text-[#153f5e]">
            {value}
          </h2>
          <p className="text-[9px] text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable modal
function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        {children}
      </div>
    </div>
  );
}

// Reusable form input
function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-slate-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-sky-500"
      />
    </div>
  );
}

// Reusable form select
function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-slate-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs outline-none focus:border-sky-500"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
