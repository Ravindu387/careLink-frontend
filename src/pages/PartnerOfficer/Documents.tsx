
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  BriefcaseBusiness,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Plus,
  Search,
  Filter,
  ChevronRight,
  X,
  FileText,
  Upload,
  Eye,
  FileCheck,
} from "lucide-react";

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  owner: string;
  updated: string;
  version: string;
  visibility: string;
  status: string;
  fileName?: string;
  fileUrl?: string;
};

const initialDocuments: DocumentItem[] = [
  {
    id: "DOC-0412",
    name: "Partner response plan - Floods 2025",
    type: "Operational Plan",
    owner: "Sara Khan",
    updated: "22 Jun - 12:18",
    version: "v3.2",
    visibility: "Shared with NDA",
    status: "Published",
  },
  {
    id: "DOC-0408",
    name: "North Ward distribution schedule",
    type: "Schedule",
    owner: "Michael Torres",
    updated: "22 Jun - 10:42",
    version: "v2.1",
    visibility: "8 organisations",
    status: "Published",
  },
  {
    id: "DOC-0397",
    name: "WASH Technical assessment",
    type: "Assessment",
    owner: "Nadia Silva",
    updated: "21 Jun - 17:28",
    version: "v1.0",
    visibility: "Internal",
    status: "Approved",
  },
  {
    id: "DOC-0388",
    name: "Data sharing agreement",
    type: "Agreement",
    owner: "Sara Khan",
    updated: "19 Jun - 14:10",
    version: "v1.4",
    visibility: "NDA · CareLink",
    status: "Awaiting Signature",
  },
  {
    id: "DOC-0382",
    name: "Emergency shelter assessment",
    type: "Assessment",
    owner: "Michael Torres",
    updated: "18 Jun - 11:30",
    version: "v1.2",
    visibility: "Internal",
    status: "Under Review",
  },
  {
    id: "DOC-0375",
    name: "Food distribution agreement",
    type: "Agreement",
    owner: "Nadia Silva",
    updated: "17 Jun - 09:15",
    version: "v2.0",
    visibility: "Shared with NDA",
    status: "Archived",
  },
];

const tabs = ["All", "Needs action", "Active", "Completed", "Archived"];

const Documents = () => {
  const [documents, setDocuments] = useState(initialDocuments);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All document types");
  const [ownerFilter, setOwnerFilter] = useState("All owners");
  const [visibilityFilter, setVisibilityFilter] = useState("All visibility");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentItem | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Search and filters
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const searchableText = [
        doc.id,
        doc.name,
        doc.type,
        doc.owner,
        doc.visibility,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Needs action" &&
          ["Awaiting Signature", "Under Review"].includes(doc.status)) ||
        (activeTab === "Active" &&
          ["Published", "Approved"].includes(doc.status)) ||
        (activeTab === "Completed" && doc.status === "Approved") ||
        (activeTab === "Archived" && doc.status === "Archived");

      return (
        matchesSearch &&
        matchesTab &&
        (typeFilter === "All document types" ||
          doc.type === typeFilter) &&
        (ownerFilter === "All owners" ||
          doc.owner === ownerFilter) &&
        (visibilityFilter === "All visibility" ||
          doc.visibility === visibilityFilter) &&
        (statusFilter === "All statuses" ||
          doc.status === statusFilter)
      );
    });
  }, [
    documents,
    search,
    activeTab,
    typeFilter,
    ownerFilter,
    visibilityFilter,
    statusFilter,
  ]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocuments.length / pageSize)
  );

  const displayedDocuments = filteredDocuments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // CSV Export
  const exportCSV = () => {
    const headers = [
      "Document ID",
      "Document",
      "Type",
      "Owner",
      "Updated",
      "Version",
      "Visibility",
      "Status",
    ];

    const rows = filteredDocuments.map((doc) => [
      doc.id,
      doc.name,
      doc.type,
      doc.owner,
      doc.updated,
      doc.version,
      doc.visibility,
      doc.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "partner-documents.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Upload document
  const handleUpload = (doc: DocumentItem) => {
    setDocuments((prev) => [doc, ...prev]);
    setActiveTab("All");
    setSearch("");
    setTypeFilter("All document types");
    setOwnerFilter("All owners");
    setVisibilityFilter("All visibility");
    setStatusFilter("All statuses");
    setCurrentPage(1);
    setShowUploadModal(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setTypeFilter("All document types");
    setOwnerFilter("All owners");
    setVisibilityFilter("All visibility");
    setStatusFilter("All statuses");
    setActiveTab("All");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">

      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

        <div>
          <p className="mb-3 text-xs text-slate-500">
            Partner Coordination
            <span className="mx-2">›</span>
            <span className="font-semibold text-[#153e5b]">
              Documents
            </span>
          </p>

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Documents
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage controlled operational plans, assessments,
            agreements, schedules, and shared files.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-2.5 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
          >
            <Download size={15} />
            Export
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            <Plus size={16} />
            Upload Document
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<BriefcaseBusiness size={20} />}
          title="Active records"
          value="48"
          subtitle="Organisation-scoped"
          color="blue"
        />

        <StatCard
          icon={<Clock size={20} />}
          title="Needs review"
          value="3"
          subtitle="Assigned to your team"
          color="orange"
        />

        <StatCard
          icon={<ShieldCheck size={20} />}
          title="Verified"
          value="96%"
          subtitle="Current assurance"
          color="green"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Due soon"
          value="2"
          subtitle="Within 30 days"
          color="orange"
        />

      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#d4e1e7]">

        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`relative whitespace-nowrap pb-4 text-xs ${
              activeTab === tab
                ? "font-semibold text-[#267ba4]"
                : "text-slate-500 hover:text-[#267ba4]"
            }`}
          >
            {tab}

            {tab === "All" && (
              <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px]">
                48
              </span>
            )}

            {tab === "Needs action" && (
              <span className="ml-1.5 rounded-full bg-[#e5eff4] px-1.5 py-0.5 text-[9px]">
                7
              </span>
            )}

            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#267ba4]" />
            )}
          </button>
        ))}

      </div>

      {/* Search and Filters */}
      <div className="mb-3 flex flex-col gap-2 xl:flex-row">

        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search documents..."
            className="w-full rounded-lg border border-[#d3e1e8] bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-[#267ba4]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All document types</option>
          <option>Operational Plan</option>
          <option>Schedule</option>
          <option>Assessment</option>
          <option>Agreement</option>
          <option>Report</option>
          <option>Other</option>
        </select>

        <select
          value={ownerFilter}
          onChange={(e) => {
            setOwnerFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All owners</option>
          <option>Sara Khan</option>
          <option>Michael Torres</option>
          <option>Nadia Silva</option>
        </select>

        <select
          value={visibilityFilter}
          onChange={(e) => {
            setVisibilityFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All visibility</option>
          <option>Shared with NDA</option>
          <option>8 organisations</option>
          <option>Internal</option>
          <option>NDA · CareLink</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-[#d3e1e8] bg-white px-3 py-3 text-xs text-slate-600 outline-none"
        >
          <option>All statuses</option>
          <option>Published</option>
          <option>Approved</option>
          <option>Awaiting Signature</option>
          <option>Under Review</option>
          <option>Archived</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#b9d0dc] bg-white px-4 py-3 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
        >
          <Filter size={15} />
          More filters
        </button>

      </div>

      {/* More Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d3e1e8] bg-white p-4">
          <div>
            <p className="text-xs font-semibold text-[#153e5b]">
              Additional filters
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Refine documents using the filters above.
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs font-medium text-[#267ba4]"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Documents Table */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">

            <thead className="bg-[#f5f8fa]">
              <tr className="border-b border-[#d7e5eb] text-[10px] text-slate-500">
                {[
                  "Document ID",
                  "Document",
                  "Type",
                  "Owner",
                  "Updated",
                  "Version",
                  "Visibility",
                  "Status",
                  "",
                ].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {displayedDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className="cursor-pointer border-b border-[#e2ebef] text-[10px] text-slate-600 transition hover:bg-[#f5fafc]"
                >
                  <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#153e5b]">
                    {doc.id}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {doc.name}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {doc.type}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {doc.owner}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {doc.updated}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {doc.version}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    {doc.visibility}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4">
                    <StatusBadge status={doc.status} />
                  </td>

                  <td className="px-3 py-4">
                    <ChevronRight
                      size={17}
                      className="text-[#64849a]"
                    />
                  </td>
                </tr>
              ))}

              {displayedDocuments.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">

          <p className="text-[10px] text-slate-400">
            Showing{" "}
            {filteredDocuments.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(
              currentPage * pageSize,
              filteredDocuments.length
            )}{" "}
            of {filteredDocuments.length} documents
          </p>

          <div className="flex items-center gap-1">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`h-8 w-8 rounded-lg border text-[10px] ${
                  currentPage === number
                    ? "border-[#267ba4] bg-[#267ba4] text-white"
                    : "border-[#d3e1e8] text-slate-600 hover:bg-slate-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              className="rounded-lg border border-[#d3e1e8] px-3 py-2 text-[10px] text-slate-500 disabled:opacity-40"
            >
              Next
            </button>

          </div>
        </div>
      </div>

      {/* Document Details Modal */}
      {selectedDocument && (
        <DocumentDetailsModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleUpload}
        />
      )}

    </div>
  );
};

// Statistics Card
function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-[#e8f2f8] text-[#2783b1]",
    green: "bg-[#e5f6f0] text-[#299b7d]",
    orange: "bg-[#fff4df] text-[#d69b30]",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#d7e5eb] bg-white p-4 shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-[9px] text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-[#153e5b]">{value}</p>
        <p className="text-[9px] text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Published: "bg-[#e5f6f0] text-[#299b7d]",
    Approved: "bg-[#e5f6f0] text-[#299b7d]",
    "Awaiting Signature": "bg-[#fff4df] text-[#bd8229]",
    "Under Review": "bg-[#e8f2f8] text-[#267ba4]",
    Archived: "bg-slate-100 text-slate-500",
  };

  return (
    <span className={`rounded-md px-2 py-1 text-[9px] font-medium ${styles[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

// Detail Item
function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-xs font-medium text-[#153e5b]">
        {value}
      </p>
    </div>
  );
}

// Document Details Modal
function DocumentDetailsModal({
  document,
  onClose,
}: {
  document: DocumentItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#267ba4]">
              {document.id}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#153e5b]">
              Document Details
            </h2>
          </div>

          <button onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-lg bg-[#f5f8fa] p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f2f8] text-[#267ba4]">
            <FileText size={22} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#153e5b]">
              {document.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {document.type}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Detail label="Document ID" value={document.id} />
          <Detail label="Owner" value={document.owner} />
          <Detail label="Updated" value={document.updated} />
          <Detail label="Version" value={document.version} />
          <Detail label="Visibility" value={document.visibility} />
          <Detail label="Status" value={document.status} />
        </div>

        {document.fileName && (
          <div className="mt-5 rounded-lg bg-[#f5f8fa] p-3">
            <p className="text-[10px] text-slate-400">Uploaded file</p>
            <p className="mt-1 break-all text-xs font-medium text-[#153e5b]">
              {document.fileName}
            </p>
          </div>
        )}

        <div className="mt-7 flex gap-2">
          {document.fileUrl && (
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#b9d0dc] py-3 text-xs font-medium text-[#267ba4] hover:bg-slate-50"
            >
              <Eye size={15} />
              View File
            </a>
          )}

          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-[#267ba4] py-3 text-xs font-medium text-white hover:bg-[#1c668a]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Upload Document Modal
function UploadDocumentModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (doc: DocumentItem) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Operational Plan");
  const [owner, setOwner] = useState("Sara Khan");
  const [visibility, setVisibility] = useState("Internal");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;

    const fileUrl = URL.createObjectURL(file);

    const newDoc: DocumentItem = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      type,
      owner,
      updated: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      version: "v1.0",
      visibility,
      status: "Under Review",
      fileName: file.name,
      fileUrl,
    };

    onSubmit(newDoc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#153e5b]">
              Upload Document
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Upload a document to your organisation workspace.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Document Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#267ba4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Document Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            >
              <option>Operational Plan</option>
              <option>Schedule</option>
              <option>Assessment</option>
              <option>Agreement</option>
              <option>Report</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Document Owner
            </label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            >
              <option>Sara Khan</option>
              <option>Michael Torres</option>
              <option>Nadia Silva</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none"
            >
              <option>Internal</option>
              <option>Shared with NDA</option>
              <option>8 organisations</option>
              <option>NDA · CareLink</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Select Document
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#b9d0dc] bg-[#f7fafc] p-6 transition hover:border-[#267ba4]">

              {file ? (
                <>
                  <FileCheck size={30} className="text-emerald-600" />
                  <p className="mt-2 max-w-full break-all text-xs font-medium text-[#153e5b]">
                    {file.name}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <Upload size={28} className="text-[#267ba4]" />
                  <p className="mt-2 text-xs font-medium text-[#153e5b]">
                    Click to upload a file
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    PDF, DOC, DOCX, XLS, XLSX
                  </p>
                </>
              )}

              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                required
                className="hidden"
                onChange={(e) =>
                  setFile(e.target.files?.[0] ?? null)
                }
              />
            </label>
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!file}
            className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={14} />
            Upload Document
          </button>
        </div>

      </form>
    </div>
  );
}

export default Documents;
