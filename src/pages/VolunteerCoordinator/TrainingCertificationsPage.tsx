import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  Plus,
  Award,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Upload,
  X,
  BookOpen,
  Users,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  MoreHorizontal,
  Settings,
} from "lucide-react";

// TYPES

type TrainingStatus = "Active" | "Inactive";

type CertificateStatus = "Valid" | "Expiring Soon" | "Expired";

interface Training {
  id: string;
  name: string;
  requirement: string;
  duration: string;
  enrolled: number;
  completion: number;
  status: TrainingStatus;
}

interface Certificate {
  id: string;
  volunteer: string;
  qualification: string;
  expiry: string;
  remaining: string;
  status: CertificateStatus;
}

// TRAINING DATA

const initialTrainings: Training[] = [
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

// CERTIFICATE DATA

const initialCertificates: Certificate[] = [
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

// MAIN COMPONENT

export default function TrainingCertificationsPage() {
  const [trainings, setTrainings] =
    useState<Training[]>(initialTrainings);

  const [certificates, setCertificates] =
    useState<Certificate[]>(initialCertificates);

  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);

  const [showManageModal, setShowManageModal] = useState(false);

  const [selectedTraining, setSelectedTraining] =
    useState<Training | null>(null);

  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);

  const [notification, setNotification] = useState("");

  const [filterStatus, setFilterStatus] = useState("All");

  const [newTraining, setNewTraining] = useState({
    name: "",
    requirement: "Required",
    duration: "",
  });

  const [uploadForm, setUploadForm] = useState({
    volunteer: "",
    qualification: "",
    expiry: "",
  });

  const [certificateFile, setCertificateFile] =
    useState<File | null>(null);

  // NOTIFICATION

  const notify = (message: string) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  // FILTER TRAININGS

  const filteredTrainings = useMemo(() => {
    return trainings.filter((training) => {
      const matchesSearch = [
        training.id,
        training.name,
        training.requirement,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === "All" ||
        training.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [trainings, search, filterStatus]);

  // CREATE TRAINING

  const handleCreateTraining = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const training: Training = {
      id: `TRN-${Date.now().toString().slice(-4)}`,
      name: newTraining.name,
      requirement: newTraining.requirement,
      duration: newTraining.duration,
      enrolled: 0,
      completion: 0,
      status: "Active",
    };

    setTrainings((prev) => [...prev, training]);

    setNewTraining({
      name: "",
      requirement: "Required",
      duration: "",
    });

    setShowCreateModal(false);

    notify("Training module created successfully!");
  };

  // UPLOAD CERTIFICATE

  const handleUploadCertificate = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!certificateFile) {
      notify("Please select a certificate file.");
      return;
    }

    const certificate: Certificate = {
      id: `CERT-${Date.now().toString().slice(-4)}`,
      volunteer: uploadForm.volunteer,
      qualification: uploadForm.qualification,
      expiry: uploadForm.expiry,
      remaining: "Pending review",
      status: "Valid",
    };

    setCertificates((prev) => [
      certificate,
      ...prev,
    ]);

    setUploadForm({
      volunteer: "",
      qualification: "",
      expiry: "",
    });

    setCertificateFile(null);

    setShowUploadModal(false);

    notify("Certificate uploaded for review!");
  };

  // EXPORT TRAINING REPORT

  const handleExport = () => {
    const headers = [
      "Course ID",
      "Course",
      "Requirement",
      "Duration",
      "Enrolled",
      "Completion",
      "Status",
    ];

    const rows = filteredTrainings.map((training) => [
      training.id,
      training.name,
      training.requirement,
      training.duration,
      training.enrolled,
      `${training.completion}%`,
      training.status,
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
    link.download = "training-catalogue.csv";
    link.click();

    URL.revokeObjectURL(url);

    notify("Training report exported!");
  };

  // STATUS STYLES

  const getCertificateStyle = (status: CertificateStatus) => {
    switch (status) {
      case "Valid":
        return "bg-[#e8f1f6] text-[#287fa9]";

      case "Expiring Soon":
        return "bg-[#fff3df] text-[#b87813]";

      case "Expired":
        return "bg-[#fdebec] text-[#d64550]";
    }
  };

  // REUSABLE STAT CARD

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }) => (
    <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 shadow-[0_5px_15px_rgba(30,70,90,0.05)] flex items-center gap-3 min-h-[86px]">

      <div
        className={`w-[41px] h-[41px] rounded-lg flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0">

        <p className="text-[9px] text-[#8296aa]">
          {title}
        </p>

        <h2 className="text-[23px] leading-7 font-semibold text-[#123c5b]">
          {value}
        </h2>

        <p className="text-[8px] text-[#8296aa]">
          {description}
        </p>

      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">

      {/* TOP NAVIGATION */}


      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-8">

          <span className="text-[#8296aa]">
            Operations
          </span>

          <ChevronRight size={12} />

          <span className="text-[#8296aa]">
            Volunteer Coordination
          </span>

          <ChevronRight size={12} />

          <span className="font-semibold">
            Training & Certifications
          </span>

        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div>

            <h1 className="text-[27px] font-normal">
              Training & Certifications
            </h1>

            <p className="text-[12px] text-[#718ba0] mt-2">
              Maintain readiness, mandatory training, and verified qualification records.
            </p>

          </div>

          <div className="flex gap-2">

            <button
              onClick={() => setShowUploadModal(true)}
              className="h-[40px] px-4 bg-white border border-[#b9d0dc] rounded-lg text-[10px] text-[#17648e] hover:bg-[#f5fafc] flex items-center gap-2"
            >
              <Upload size={14} />
              Upload certificate
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[40px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-[10px] font-semibold"
            >
              <Plus size={15} />
              Create training
            </button>

          </div>

        </div>

        {/* STATISTICS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">

          <StatCard
            title="Training completion"
            value="88%"
            description="Mandatory modules"
            icon={Award}
            color="bg-[#e5f5ef] text-[#239879]"
          />

          <StatCard
            title="Certifications valid"
            value="1,842"
            description="Across verified volunteers"
            icon={ShieldCheck}
            color="bg-[#e8f1f6] text-[#287fa9]"
          />

          <StatCard
            title="Expiring soon"
            value="42"
            description="Within 30 days"
            icon={Clock}
            color="bg-[#fff3df] text-[#b87813]"
          />

          <StatCard
            title="Expired"
            value="18"
            description="Matching suspended"
            icon={AlertTriangle}
            color="bg-[#fdebec] text-[#d64550]"
          />

        </section>

        {/* MAIN GRID */}

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* TRAINING CATALOGUE */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden">

            {/* HEADER */}

            <div className="px-4 py-4 border-b border-[#d5e3e9] flex items-center justify-between">

              <div>

                <h2 className="text-[13px] font-medium">
                  Training catalogue
                </h2>

                <p className="text-[9px] text-[#8296aa] mt-1">
                  Current readiness modules
                </p>

              </div>

              <button
                onClick={() => setShowManageModal(true)}
                className="h-[40px] px-4 border border-[#b9d0dc] rounded-lg text-[10px] text-[#17648e] hover:bg-[#f5fafc]"
              >
                Manage
              </button>

            </div>

            {/* SEARCH AND FILTER */}

            <div className="p-3 flex flex-wrap gap-2 border-b border-[#e1eaf0]">

              <div className="flex-1 min-w-[150px] flex items-center gap-2 border border-[#d5e3e9] rounded-lg px-3 h-[34px]">

                <Search size={13} className="text-[#8296aa]" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search training..."
                  className="w-full bg-transparent outline-none text-[9px]"
                />

              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-[#d5e3e9] rounded-lg px-2 text-[9px] outline-none"
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>

              <button
                onClick={handleExport}
                className="border border-[#d5e3e9] rounded-lg px-3 text-[9px] text-[#287fa9]"
              >
                Export
              </button>

            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[530px] text-left">

                <thead className="bg-[#f5f8f9] border-b border-[#d5e3e9]">

                  <tr className="text-[9px] text-[#718ba0]">

                    <th className="px-3 py-3 font-medium">Course ID</th>

                    <th className="px-3 py-3 font-medium">Course</th>

                    <th className="px-3 py-3 font-medium">Requirement</th>

                    <th className="px-3 py-3 font-medium">Duration</th>

                    <th className="px-3 py-3 font-medium">Enrolled</th>

                    <th className="px-3 py-3 font-medium">Completion</th>

                    <th className="px-3 py-3 font-medium">Status</th>

                    <th className="px-3 py-3"></th>

                  </tr>

                </thead>

                <tbody>

                  {filteredTrainings.map((training) => (

                    <tr
                      key={training.id}
                      onClick={() => setSelectedTraining(training)}
                      className="border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer"
                    >

                      <td className="px-3 py-4 text-[9px] font-semibold whitespace-nowrap">
                        {training.id}
                      </td>

                      <td className="px-3 py-4 text-[9px] whitespace-nowrap">
                        {training.name}
                      </td>

                      <td className="px-3 py-4 text-[9px] whitespace-nowrap">
                        {training.requirement}
                      </td>

                      <td className="px-3 py-4 text-[9px] whitespace-nowrap">
                        {training.duration}
                      </td>

                      <td className="px-3 py-4 text-[9px]">
                        {training.enrolled.toLocaleString()}
                      </td>

                      <td className="px-3 py-4 text-[9px]">
                        {training.completion}%
                      </td>

                      <td className="px-3 py-4">

                        <span className="bg-[#e8f1f6] text-[#287fa9] px-2 py-1.5 rounded-md text-[8px] font-semibold">
                          {training.status}
                        </span>

                      </td>

                      <td className="px-3 py-4">
                        <ChevronRight
                          size={15}
                          className="text-[#718ba0]"
                        />
                      </td>

                    </tr>

                  ))}

                  {filteredTrainings.length === 0 && (

                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-10 text-xs text-gray-400"
                      >
                        No training modules found.
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* CERTIFICATION ATTENTION QUEUE */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden">

            <div className="px-4 py-4 border-b border-[#d5e3e9] flex items-center justify-between">

              <div>

                <h2 className="text-[13px] font-medium">
                  Certification attention queue
                </h2>

                <p className="text-[9px] text-[#8296aa] mt-1">
                  Expiry and validation risks
                </p>

              </div>

              <span className="bg-[#fff3df] text-[#b87813] px-2 py-1.5 rounded-md text-[8px] font-semibold">
                {certificates.length} records
              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[530px] text-left">

                <thead className="bg-[#f5f8f9] border-b border-[#d5e3e9]">

                  <tr className="text-[9px] text-[#718ba0]">

                    <th className="px-3 py-3 font-medium">Certificate</th>

                    <th className="px-3 py-3 font-medium">Volunteer</th>

                    <th className="px-3 py-3 font-medium">Qualification</th>

                    <th className="px-3 py-3 font-medium">Expiry</th>

                    <th className="px-3 py-3 font-medium">Remaining</th>

                    <th className="px-3 py-3 font-medium">Status</th>

                    <th className="px-3 py-3"></th>

                  </tr>

                </thead>

                <tbody>

                  {certificates.map((certificate) => (

                    <tr
                      key={certificate.id}
                      onClick={() => setSelectedCertificate(certificate)}
                      className="border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer"
                    >

                      <td className="px-3 py-4 text-[9px] font-semibold whitespace-nowrap">
                        {certificate.id}
                      </td>

                      <td className="px-3 py-4 text-[9px] whitespace-nowrap">
                        {certificate.volunteer}
                      </td>

                      <td className="px-3 py-4 text-[9px] whitespace-nowrap">
                        {certificate.qualification}
                      </td>

                      <td className="px-3 py-4 text-[9px] whitespace-nowrap">
                        {certificate.expiry}
                      </td>

                      <td className="px-3 py-4">

                        <span className={`px-2 py-1.5 rounded-md text-[8px] font-semibold whitespace-nowrap ${
                          certificate.status === "Expired"
                            ? "bg-[#fdebec] text-[#d64550]"
                            : certificate.status === "Expiring Soon"
                            ? "bg-[#fff3df] text-[#b87813]"
                            : "text-[#123c5b]"
                        }`}>
                          {certificate.remaining}
                        </span>

                      </td>

                      <td className="px-3 py-4">

                        <span className={`px-2 py-1.5 rounded-md text-[8px] font-semibold whitespace-nowrap ${getCertificateStyle(certificate.status)}`}>
                          {certificate.status}
                        </span>

                      </td>

                      <td className="px-3 py-4">

                        <ChevronRight
                          size={15}
                          className="text-[#718ba0]"
                        />

                      </td>

                    </tr>

                  ))}

                  {certificates.length === 0 && (

                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-10 text-xs text-gray-400"
                      >
                        No certificates found.
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </section>

      </main>

      {/* CREATE TRAINING MODAL */}

      {showCreateModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl">

            <div className="p-5 border-b flex justify-between items-center">

              <div>
                <h2 className="text-[17px] font-semibold">
                  Create training
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  Create a new volunteer training module.
                </p>
              </div>

              <button onClick={() => setShowCreateModal(false)}>
                <X size={19} />
              </button>

            </div>

            <form
              onSubmit={handleCreateTraining}
              className="p-5 space-y-4"
            >

              <div>

                <label className="text-[11px] font-medium">
                  Training name
                </label>

                <input
                  required
                  value={newTraining.name}
                  onChange={(e) =>
                    setNewTraining({
                      ...newTraining,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter training name"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none focus:border-[#287fa9]"
                />

              </div>

              <div>

                <label className="text-[11px] font-medium">
                  Requirement
                </label>

                <select
                  value={newTraining.requirement}
                  onChange={(e) =>
                    setNewTraining({
                      ...newTraining,
                      requirement: e.target.value,
                    })
                  }
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                >
                  <option>Required</option>
                  <option>Skill-based</option>
                  <option>Optional</option>
                </select>

              </div>

              <div>

                <label className="text-[11px] font-medium">
                  Duration
                </label>

                <input
                  required
                  value={newTraining.duration}
                  onChange={(e) =>
                    setNewTraining({
                      ...newTraining,
                      duration: e.target.value,
                    })
                  }
                  placeholder="e.g. 45 min"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />

              </div>

              <div className="flex justify-end gap-2 pt-3">

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2.5 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#287fa9] text-white rounded-lg px-5 py-2.5 text-xs"
                >
                  Create training
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* UPLOAD CERTIFICATE MODAL */}

      {showUploadModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl">

            <div className="p-5 border-b flex justify-between items-center">

              <div>

                <h2 className="text-[17px] font-semibold">
                  Upload certificate
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  Add a volunteer qualification record.
                </p>

              </div>

              <button onClick={() => setShowUploadModal(false)}>
                <X size={19} />
              </button>

            </div>

            <form
              onSubmit={handleUploadCertificate}
              className="p-5 space-y-4"
            >

              <div>

                <label className="text-[11px] font-medium">
                  Volunteer name
                </label>

                <input
                  required
                  value={uploadForm.volunteer}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      volunteer: e.target.value,
                    })
                  }
                  placeholder="Enter volunteer name"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />

              </div>

              <div>

                <label className="text-[11px] font-medium">
                  Qualification
                </label>

                <input
                  required
                  value={uploadForm.qualification}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      qualification: e.target.value,
                    })
                  }
                  placeholder="e.g. First Aid Level 2"
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />

              </div>

              <div>

                <label className="text-[11px] font-medium">
                  Expiry date
                </label>

                <input
                  required
                  type="date"
                  value={uploadForm.expiry}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      expiry: e.target.value,
                    })
                  }
                  className="w-full mt-2 border border-[#d5e3e9] rounded-lg p-3 text-xs outline-none"
                />

              </div>

              <div>

                <label className="text-[11px] font-medium">
                  Certificate document
                </label>

                <label className="mt-2 border-2 border-dashed border-[#b9d0dc] rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-[#f5fafc]">

                  <Upload
                    size={24}
                    className="text-[#287fa9] mb-2"
                  />

                  <span className="text-[10px] font-medium">
                    {certificateFile
                      ? certificateFile.name
                      : "Click to upload certificate"}
                  </span>

                  <span className="text-[9px] text-gray-400 mt-1">
                    PDF, JPG or PNG
                  </span>

                  <input
                    required
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setCertificateFile(
                        e.target.files?.[0] ?? null
                      )
                    }
                    className="hidden"
                  />

                </label>

              </div>

              <div className="flex justify-end gap-2 pt-3">

                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2.5 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#287fa9] text-white rounded-lg px-5 py-2.5 text-xs"
                >
                  Upload certificate
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* MANAGE TRAINING MODAL */}

      {showManageModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b flex justify-between items-center">

              <div>

                <h2 className="text-[17px] font-semibold">
                  Manage training
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  Control training module availability.
                </p>

              </div>

              <button onClick={() => setShowManageModal(false)}>
                <X size={19} />
              </button>

            </div>

            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">

              {trainings.map((training) => (

                <div
                  key={training.id}
                  className="flex items-center justify-between p-3 bg-[#f7fafb] rounded-lg"
                >

                  <div>

                    <p className="text-[10px] font-semibold">
                      {training.name}
                    </p>

                    <p className="text-[9px] text-gray-400 mt-1">
                      {training.id} · {training.status}
                    </p>

                  </div>

                  <button
                    onClick={() => {
                      setTrainings((prev) =>
                        prev.map((item) =>
                          item.id === training.id
                            ? {
                                ...item,
                                status:
                                  item.status === "Active"
                                    ? "Inactive"
                                    : "Active",
                              }
                            : item
                        )
                      );

                      notify("Training status updated!");
                    }}
                    className={`text-[9px] px-3 py-2 rounded-lg ${
                      training.status === "Active"
                        ? "bg-[#fdebec] text-[#d64550]"
                        : "bg-[#e5f5ef] text-[#239879]"
                    }`}
                  >
                    {training.status === "Active"
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                </div>

              ))}

            </div>

            <div className="p-4 border-t flex justify-end">

              <button
                onClick={() => setShowManageModal(false)}
                className="bg-[#287fa9] text-white px-5 py-2 rounded-lg text-xs"
              >
                Done
              </button>

            </div>

          </div>

        </div>

      )}

      {/* TRAINING DETAILS MODAL */}

      {selectedTraining && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[420px] rounded-xl shadow-2xl">

            <div className="p-5 border-b flex justify-between items-center">

              <div>
                <h2 className="text-[16px] font-semibold">
                  Training details
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  {selectedTraining.id}
                </p>
              </div>

              <button onClick={() => setSelectedTraining(null)}>
                <X size={19} />
              </button>

            </div>

            <div className="p-5 space-y-4">

              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-[#287fa9]" />
                <span className="text-xs">
                  {selectedTraining.name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap size={18} className="text-[#287fa9]" />
                <span className="text-xs">
                  {selectedTraining.requirement}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#287fa9]" />
                <span className="text-xs">
                  {selectedTraining.duration}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Users size={18} className="text-[#287fa9]" />
                <span className="text-xs">
                  {selectedTraining.enrolled.toLocaleString()} enrolled
                </span>
              </div>

              <div>

                <div className="flex justify-between text-[10px] mb-2">
                  <span>Completion rate</span>
                  <span className="font-semibold">
                    {selectedTraining.completion}%
                  </span>
                </div>

                <div className="h-2 bg-[#e7eef1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#65bda5] rounded-full"
                    style={{
                      width: `${selectedTraining.completion}%`,
                    }}
                  />
                </div>

              </div>

            </div>

            <div className="p-4 border-t flex justify-end">

              <button
                onClick={() => setSelectedTraining(null)}
                className="bg-[#287fa9] text-white px-5 py-2 rounded-lg text-xs"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* CERTIFICATE DETAILS MODAL */}

      {selectedCertificate && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[420px] rounded-xl shadow-2xl">

            <div className="p-5 border-b flex justify-between items-center">

              <div>

                <h2 className="text-[16px] font-semibold">
                  Certificate details
                </h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  {selectedCertificate.id}
                </p>

              </div>

              <button onClick={() => setSelectedCertificate(null)}>
                <X size={19} />
              </button>

            </div>

            <div className="p-5 space-y-4">

              <div className="flex items-center gap-3">
                <Users size={17} className="text-[#287fa9]" />
                <span className="text-xs">
                  {selectedCertificate.volunteer}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Award size={17} className="text-[#287fa9]" />
                <span className="text-xs">
                  {selectedCertificate.qualification}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays size={17} className="text-[#287fa9]" />
                <span className="text-xs">
                  Expiry: {selectedCertificate.expiry}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck size={17} className="text-[#287fa9]" />
                <span className="text-xs">
                  {selectedCertificate.status}
                </span>
              </div>

              <span className={`inline-flex px-3 py-1.5 rounded-md text-[9px] font-semibold ${getCertificateStyle(selectedCertificate.status)}`}>
                {selectedCertificate.status}
              </span>

            </div>

            <div className="p-4 border-t flex justify-end">

              <button
                onClick={() => setSelectedCertificate(null)}
                className="bg-[#287fa9] text-white px-5 py-2 rounded-lg text-xs"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* TOAST NOTIFICATION */}

      {notification && (

        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-5 py-3 shadow-xl text-xs flex items-center gap-2">

          <CheckCircle2 size={15} />

          {notification}

        </div>

      )}

      {/* HELP BUTTON */}

      <button className="fixed bottom-4 right-4 w-10 h-10 bg-[#282828] hover:bg-black text-white rounded-full flex items-center justify-center shadow-lg">

        <HelpCircle size={21} />

      </button>

    </div>
  );
}