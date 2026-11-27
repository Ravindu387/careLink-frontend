import { useState, useEffect, useCallback, useMemo } from "react";
import type { FormEvent } from "react";
import {
  Search,
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
  GraduationCap,
  Trash2,
  Server,
  RefreshCw,
  Loader2,
  Download,
  HelpCircle,
} from "lucide-react";

import { trainingCertificationsService } from "../../services/trainingCertificationsService";
import type {
  TrainingItem,
  CertificateItem,
  TrainingCertStats,
  CertificateStatus,
  TrainingStatus,
} from "../../types/trainingCertifications";

export default function TrainingCertificationsPage() {
  // Sync and backend state
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmittingTraining, setIsSubmittingTraining] = useState<boolean>(false);
  const [isSubmittingCert, setIsSubmittingCert] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // Stats
  const [stats, setStats] = useState<TrainingCertStats>({
    trainingCompletionRate: "88%",
    completionSubtitle: "Mandatory modules",
    certificationsValid: "1,842",
    validSubtitle: "Across verified volunteers",
    expiringSoon: "42",
    expiringSubtitle: "Within 30 days",
    expired: "18",
    expiredSubtitle: "Matching suspended",
  });

  // Data lists
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);

  // Filters & search
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showManageModal, setShowManageModal] = useState<boolean>(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingItem | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Forms state
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

  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  // NOTIFICATION
  const notify = (message: string) => {
    setNotification(message);
    window.setTimeout(() => {
      setNotification("");
    }, 3500);
  };

  // LOAD DATA
  const loadOverview = useCallback(async (background: boolean = false) => {
    if (background) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await trainingCertificationsService.getOverview();
      setStats(result.data.stats);
      setTrainings(result.data.trainings || []);
      setCertificates(result.data.certificates || []);
      setIsLiveBackend(result.isLiveBackend);
    } catch (err: unknown) {
      console.error("Failed to load training overview:", err);
      notify("Could not load latest training data from backend.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleRefresh = () => {
    loadOverview(true);
  };

  // FILTER TRAININGS
  const filteredTrainings = useMemo(() => {
    return trainings.filter((training) => {
      const s = search.toLowerCase().trim();
      const matchesSearch =
        !s ||
        training.id.toLowerCase().includes(s) ||
        training.name.toLowerCase().includes(s) ||
        training.requirement.toLowerCase().includes(s);

      const matchesStatus =
        filterStatus === "All" || training.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [trainings, search, filterStatus]);

  // CREATE TRAINING MODULE
  const handleCreateTraining = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTraining.name.trim()) {
      notify("Please provide a training name.");
      return;
    }

    setIsSubmittingTraining(true);
    try {
      const result = await trainingCertificationsService.createTraining({
        name: newTraining.name.trim(),
        requirement: newTraining.requirement,
        duration: newTraining.duration.trim() || "45 min",
      });

      setIsLiveBackend(result.isLiveBackend);
      setTrainings((prev) => [...prev, result.data]);
      setShowCreateModal(false);
      setNewTraining({
        name: "",
        requirement: "Required",
        duration: "",
      });

      notify("Training module created successfully!");
      loadOverview(true);
    } catch (err: unknown) {
      console.error("Create training failed:", err);
      notify("Failed to create training module.");
    } finally {
      setIsSubmittingTraining(false);
    }
  };

  // UPLOAD CERTIFICATE
  const handleUploadCertificate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadForm.volunteer.trim() || !uploadForm.qualification.trim()) {
      notify("Please provide volunteer name and qualification.");
      return;
    }

    setIsSubmittingCert(true);
    try {
      const result = await trainingCertificationsService.createCertificate({
        volunteer: uploadForm.volunteer.trim(),
        qualification: uploadForm.qualification.trim(),
        expiry: uploadForm.expiry,
        fileName: certificateFile?.name,
      });

      setIsLiveBackend(result.isLiveBackend);
      setCertificates((prev) => [result.data, ...prev]);

      setUploadForm({
        volunteer: "",
        qualification: "",
        expiry: "",
      });
      setCertificateFile(null);
      setShowUploadModal(false);

      notify("Certificate uploaded and submitted for review!");
      loadOverview(true);
    } catch (err: unknown) {
      console.error("Upload certificate failed:", err);
      notify("Failed to upload certificate.");
    } finally {
      setIsSubmittingCert(false);
    }
  };

  // TOGGLE TRAINING STATUS
  const handleToggleTrainingStatus = async (training: TrainingItem) => {
    const nextStatus: TrainingStatus =
      training.status === "Active" ? "Inactive" : "Active";

    try {
      const result = await trainingCertificationsService.updateTrainingStatus(
        training.id,
        nextStatus
      );

      setIsLiveBackend(result.isLiveBackend);
      setTrainings((prev) =>
        prev.map((item) => (item.id === training.id ? result.data : item))
      );

      if (selectedTraining && selectedTraining.id === training.id) {
        setSelectedTraining(result.data);
      }

      notify(`Training module marked as ${nextStatus}!`);
      loadOverview(true);
    } catch (err: unknown) {
      console.error("Update training status failed:", err);
      notify("Failed to update training status.");
    }
  };

  // DELETE TRAINING
  const handleDeleteTraining = async (id: string) => {
    try {
      const result = await trainingCertificationsService.deleteTraining(id);
      setIsLiveBackend(result.isLiveBackend);
      setTrainings((prev) => prev.filter((t) => t.id !== id));
      if (selectedTraining && selectedTraining.id === id) {
        setSelectedTraining(null);
      }
      setConfirmDeleteId(null);
      notify("Training module deleted.");
      loadOverview(true);
    } catch (err: unknown) {
      console.error("Delete training failed:", err);
      notify("Failed to delete training module.");
    }
  };

  // UPDATE CERTIFICATE STATUS
  const handleUpdateCertStatus = async (id: string, newStatus: CertificateStatus) => {
    try {
      const result = await trainingCertificationsService.updateCertificateStatus(
        id,
        newStatus
      );

      setIsLiveBackend(result.isLiveBackend);
      setCertificates((prev) =>
        prev.map((c) => (c.id === id ? result.data : c))
      );

      if (selectedCertificate && selectedCertificate.id === id) {
        setSelectedCertificate(result.data);
      }

      notify(`Certificate status updated to ${newStatus}.`);
      loadOverview(true);
    } catch (err: unknown) {
      console.error("Update certificate status failed:", err);
      notify("Failed to update certificate status.");
    }
  };

  // DELETE CERTIFICATE
  const handleDeleteCertificate = async (id: string) => {
    try {
      const result = await trainingCertificationsService.deleteCertificate(id);
      setIsLiveBackend(result.isLiveBackend);
      setCertificates((prev) => prev.filter((c) => c.id !== id));
      if (selectedCertificate && selectedCertificate.id === id) {
        setSelectedCertificate(null);
      }
      setConfirmDeleteId(null);
      notify("Certificate removed from queue.");
      loadOverview(true);
    } catch (err: unknown) {
      console.error("Delete certificate failed:", err);
      notify("Failed to delete certificate.");
    }
  };

  // EXPORT TRAININGS
  const handleExportTrainings = async () => {
    try {
      const blob = await trainingCertificationsService.exportTrainingsCsv(
        search,
        filterStatus
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `training-catalogue-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      notify("Training report exported!");
    } catch (err: unknown) {
      console.error("Export trainings failed:", err);
      notify("Failed to export training report.");
    }
  };

  // EXPORT CERTIFICATES
  const handleExportCertificates = async () => {
    try {
      const blob = await trainingCertificationsService.exportCertificatesCsv();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificates-queue-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      notify("Certificate records exported!");
    } catch (err: unknown) {
      console.error("Export certificates failed:", err);
      notify("Failed to export certificate records.");
    }
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
      default:
        return "bg-[#f0f4f7] text-[#557086]";
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
        <p className="text-xs text-[#8296aa]">{title}</p>
        <h2 className="text-[23px] leading-7 font-semibold text-[#123c5b]">
          {value}
        </h2>
        <p className="text-xs text-[#8296aa]">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">
        {/* BREADCRUMB & BACKEND CONNECTION STATUS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#8296aa]">Operations</span>
            <ChevronRight size={12} className="text-[#8296aa]" />
            <span className="text-[#8296aa]">Volunteer Coordination</span>
            <ChevronRight size={12} className="text-[#8296aa]" />
            <span className="font-semibold text-[#123c5b]">Training & Certifications</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                isLiveBackend
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <Server size={12} />
              <span>{isLiveBackend ? "Live Server (API)" : "Offline Demo"}</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh records"
              className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-1 text-xs text-slate-700 hover:bg-[#f5fafc] disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={isRefreshing ? "animate-spin text-[#287fa9]" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">Training & Certifications</h1>
            <p className="text-[12px] text-[#718ba0] mt-1.5">
              Maintain readiness, mandatory training, and verified qualification records in real-time.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="h-[40px] px-4 bg-white border border-[#b9d0dc] rounded-lg text-sm text-[#17648e] hover:bg-[#f5fafc] flex items-center gap-2 transition-colors"
            >
              <Upload size={14} />
              Upload certificate
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[40px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-xs"
            >
              <Plus size={15} />
              Create training
            </button>
          </div>
        </div>

        {/* STATISTICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard
            title="Training completion"
            value={stats.trainingCompletionRate}
            description={stats.completionSubtitle}
            icon={Award}
            color="bg-[#e5f5ef] text-[#239879]"
          />

          <StatCard
            title="Certifications valid"
            value={stats.certificationsValid}
            description={stats.validSubtitle}
            icon={ShieldCheck}
            color="bg-[#e8f1f6] text-[#287fa9]"
          />

          <StatCard
            title="Expiring soon"
            value={stats.expiringSoon}
            description={stats.expiringSubtitle}
            icon={Clock}
            color="bg-[#fff3df] text-[#b87813]"
          />

          <StatCard
            title="Expired"
            value={stats.expired}
            description={stats.expiredSubtitle}
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
                <h2 className="text-base sm:text-lg font-semibold text-[#123c5b]">Training catalogue</h2>
                <p className="text-xs text-[#8296aa] mt-0.5">
                  Current readiness modules ({trainings.length} total)
                </p>
              </div>

              <button
                onClick={() => setShowManageModal(true)}
                className="h-[36px] px-3.5 border border-[#b9d0dc] rounded-lg text-sm text-[#17648e] hover:bg-[#f5fafc] transition-colors font-medium"
              >
                Manage
              </button>
            </div>

            {/* SEARCH AND FILTER */}
            <div className="p-3 flex flex-wrap gap-2 border-b border-[#e1eaf0] bg-[#fafcfd]">
              <div className="flex-1 min-w-[150px] flex items-center gap-2 border border-[#d5e3e9] rounded-lg px-3 h-[34px] bg-white">
                <Search size={13} className="text-[#8296aa]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search training..."
                  className="w-full bg-transparent outline-none text-sm sm:text-[15px]"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                    <X size={12} />
                  </button>
                )}
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-[#d5e3e9] rounded-lg px-2 text-sm sm:text-[15px] outline-none bg-white cursor-pointer"
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>

              <button
                onClick={handleExportTrainings}
                className="border border-[#d5e3e9] rounded-lg px-3 text-sm text-[#287fa9] bg-white hover:bg-[#f0f7fa] flex items-center gap-1"
              >
                <Download size={11} />
                <span>Export</span>
              </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[530px] text-left">
                <thead className="bg-[#f5f8f9] border-b border-[#d5e3e9]">
                  <tr className="text-sm text-[#718ba0]">
                    <th className="px-3 py-3 font-medium">Course ID</th>
                    <th className="px-3 py-3 font-medium">Course</th>
                    <th className="px-3 py-3 font-medium">Requirement</th>
                    <th className="px-3 py-3 font-medium">Duration</th>
                    <th className="px-3 py-3 font-medium">Enrolled</th>
                    <th className="px-3 py-3 font-medium">Completion</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 w-6"></th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 size={20} className="animate-spin text-[#287fa9]" />
                          <span className="text-xs">Loading training catalogue...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTrainings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-sm text-gray-400">
                        No training modules found.
                      </td>
                    </tr>
                  ) : (
                    filteredTrainings.map((training) => (
                      <tr
                        key={training.id}
                        onClick={() => setSelectedTraining(training)}
                        className="border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer transition-colors"
                      >
                        <td className="px-3 py-3.5 text-sm font-semibold text-[#17648e] whitespace-nowrap">
                          {training.id}
                        </td>
                        <td className="px-3 py-3.5 text-sm font-medium text-[#123c5b] whitespace-nowrap">
                          {training.name}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-[#557086] whitespace-nowrap">
                          {training.requirement}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-[#557086] whitespace-nowrap">
                          {training.duration}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-[#123c5b]">
                          {training.enrolled.toLocaleString()}
                        </td>
                        <td className="px-3 py-3.5 text-sm font-medium text-[#123c5b]">
                          {training.completion}%
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              training.status === "Active"
                                ? "bg-[#e8f1f6] text-[#287fa9]"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {training.status}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <ChevronRight size={14} className="text-[#718ba0]" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CERTIFICATION ATTENTION QUEUE */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden">
            <div className="px-4 py-4 border-b border-[#d5e3e9] flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#123c5b]">Certification attention queue</h2>
                <p className="text-xs text-[#8296aa] mt-0.5">
                  Expiry and validation risks
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCertificates}
                  className="h-[32px] px-2.5 border border-[#d5e3e9] rounded-lg text-sm text-[#287fa9] bg-white hover:bg-[#f0f7fa] flex items-center gap-1"
                >
                  <Download size={11} />
                  <span>Export</span>
                </button>
                <span className="bg-[#fff3df] text-[#b87813] px-2 py-1 rounded-md text-xs font-semibold">
                  {certificates.length} records
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[530px] text-left">
                <thead className="bg-[#f5f8f9] border-b border-[#d5e3e9]">
                  <tr className="text-sm text-[#718ba0]">
                    <th className="px-3 py-3 font-medium">Certificate</th>
                    <th className="px-3 py-3 font-medium">Volunteer</th>
                    <th className="px-3 py-3 font-medium">Qualification</th>
                    <th className="px-3 py-3 font-medium">Expiry</th>
                    <th className="px-3 py-3 font-medium">Remaining</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 w-6"></th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 size={20} className="animate-spin text-[#287fa9]" />
                          <span className="text-xs">Loading certificate queue...</span>
                        </div>
                      </td>
                    </tr>
                  ) : certificates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-sm text-gray-400">
                        No certificates currently require attention.
                      </td>
                    </tr>
                  ) : (
                    certificates.map((certificate) => (
                      <tr
                        key={certificate.id}
                        onClick={() => setSelectedCertificate(certificate)}
                        className="border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer transition-colors"
                      >
                        <td className="px-3 py-3.5 text-sm font-semibold text-[#17648e] whitespace-nowrap">
                          {certificate.id}
                        </td>
                        <td className="px-3 py-3.5 text-sm font-medium text-[#123c5b] whitespace-nowrap">
                          {certificate.volunteer}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-[#557086] whitespace-nowrap">
                          {certificate.qualification}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-[#557086] whitespace-nowrap">
                          {certificate.expiry}
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                              certificate.status === "Expired"
                                ? "bg-[#fdebec] text-[#d64550]"
                                : certificate.status === "Expiring Soon"
                                ? "bg-[#fff3df] text-[#b87813]"
                                : "text-[#123c5b]"
                            }`}
                          >
                            {certificate.remaining}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${getCertificateStyle(
                              certificate.status
                            )}`}
                          >
                            {certificate.status}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <ChevronRight size={14} className="text-[#718ba0]" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* CREATE TRAINING MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#e1eaf0] flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#123c5b]">Create training</h2>
                <p className="text-[13px] text-gray-400 mt-0.5">
                  Create a new volunteer training module.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTraining} className="p-5 space-y-3.5">
              <div>
                <label className="text-sm font-semibold text-[#123c5b]">
                  Training name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={newTraining.name}
                  onChange={(e) =>
                    setNewTraining({ ...newTraining, name: e.target.value })
                  }
                  placeholder="e.g. Flood Response Safety"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#123c5b]">Requirement</label>
                <select
                  value={newTraining.requirement}
                  onChange={(e) =>
                    setNewTraining({ ...newTraining, requirement: e.target.value })
                  }
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-sm sm:text-[15px] outline-none cursor-pointer"
                >
                  <option>Required</option>
                  <option>Skill-based</option>
                  <option>Optional</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#123c5b]">Duration</label>
                <input
                  required
                  value={newTraining.duration}
                  onChange={(e) =>
                    setNewTraining({ ...newTraining, duration: e.target.value })
                  }
                  placeholder="e.g. 45 min"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287fa9]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e1eaf0]">
                <button
                  type="button"
                  disabled={isSubmittingTraining}
                  onClick={() => setShowCreateModal(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2 text-sm hover:bg-[#f0f7fa]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTraining}
                  className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingTraining && <Loader2 size={13} className="animate-spin" />}
                  <span>{isSubmittingTraining ? "Creating..." : "Create training"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD CERTIFICATE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#e1eaf0] flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#123c5b]">Upload certificate</h2>
                <p className="text-[13px] text-gray-400 mt-0.5">
                  Add a volunteer qualification record for verification.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadCertificate} className="p-5 space-y-3.5">
              <div>
                <label className="text-sm font-semibold text-[#123c5b]">
                  Volunteer name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={uploadForm.volunteer}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, volunteer: e.target.value })
                  }
                  placeholder="Enter volunteer name"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#123c5b]">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={uploadForm.qualification}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, qualification: e.target.value })
                  }
                  placeholder="e.g. First Aid Level 2"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#123c5b]">
                  Expiry date <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={uploadForm.expiry}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, expiry: e.target.value })
                  }
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2 text-sm sm:text-[15px] outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#123c5b]">
                  Certificate document
                </label>
                <label className="mt-1.5 border-2 border-dashed border-[#b9d0dc] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#f5fafc] transition-colors">
                  <Upload size={22} className="text-[#287fa9] mb-1.5" />
                  <span className="text-sm font-medium text-[#123c5b]">
                    {certificateFile ? certificateFile.name : "Click to select certificate file"}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">
                    PDF, JPG, or PNG (Max 10MB)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e1eaf0]">
                <button
                  type="button"
                  disabled={isSubmittingCert}
                  onClick={() => setShowUploadModal(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2 text-sm hover:bg-[#f0f7fa]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCert}
                  className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingCert && <Loader2 size={13} className="animate-spin" />}
                  <span>{isSubmittingCert ? "Uploading..." : "Upload certificate"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE TRAINING MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[480px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#e1eaf0] flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#123c5b]">Manage training modules</h2>
                <p className="text-[13px] text-gray-400 mt-0.5">
                  Control training module availability and module activation.
                </p>
              </div>
              <button
                onClick={() => setShowManageModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {trainings.map((training) => (
                <div
                  key={training.id}
                  className="flex items-center justify-between p-3 bg-[#f7fafb] rounded-lg border border-[#e1eaf0]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#123c5b]">{training.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {training.id} · {training.requirement} · {training.status}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleTrainingStatus(training)}
                      className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        training.status === "Active"
                          ? "bg-[#fdebec] text-[#d64550] hover:bg-[#fad8db]"
                          : "bg-[#e5f5ef] text-[#239879] hover:bg-[#d5ece3]"
                      }`}
                    >
                      {training.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteTraining(training.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      title="Delete module"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#e1eaf0] flex justify-end bg-[#fafcfd]">
              <button
                onClick={() => setShowManageModal(false)}
                className="bg-[#287fa9] text-white px-5 py-2 rounded-lg text-sm font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRAINING DETAILS MODAL */}
      {selectedTraining && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[440px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#e1eaf0] flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#17648e] bg-[#e8f1f6] px-2 py-0.5 rounded">
                  {selectedTraining.id}
                </span>
                <h2 className="text-lg sm:text-xl font-semibold text-[#123c5b] mt-1">
                  {selectedTraining.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTraining(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <BookOpen size={16} className="text-[#287fa9]" />
                <span className="text-gray-600">Requirement:</span>
                <span className="font-semibold text-[#123c5b]">{selectedTraining.requirement}</span>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap size={16} className="text-[#287fa9]" />
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold text-[#123c5b]">{selectedTraining.duration}</span>
              </div>

              <div className="flex items-center gap-3">
                <Users size={16} className="text-[#287fa9]" />
                <span className="text-gray-600">Enrolled:</span>
                <span className="font-semibold text-[#123c5b]">
                  {selectedTraining.enrolled.toLocaleString()} volunteers
                </span>
              </div>

              <div className="pt-2 border-t border-[#e1eaf0]">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500">Overall completion rate</span>
                  <span className="font-semibold text-[#123c5b]">{selectedTraining.completion}%</span>
                </div>
                <div className="h-2 bg-[#e7eef1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#65bda5] rounded-full transition-all"
                    style={{ width: `${selectedTraining.completion}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#e1eaf0] flex items-center justify-between">
                <span className="text-gray-500 text-[13px]">Module Status:</span>
                <button
                  onClick={() => handleToggleTrainingStatus(selectedTraining)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedTraining.status === "Active"
                      ? "bg-[#e5f5ef] text-[#239879] hover:bg-[#d4ede3]"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {selectedTraining.status} (Click to toggle)
                </button>
              </div>

              {confirmDeleteId === selectedTraining.id && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                  <p className="text-sm font-semibold">Delete this training module?</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleDeleteTraining(selectedTraining.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#e1eaf0] flex justify-between items-center bg-[#fafcfd]">
              <button
                onClick={() => setConfirmDeleteId(selectedTraining.id)}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedTraining(null)}
                className="bg-[#287fa9] text-white px-5 py-2 rounded-lg text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE DETAILS MODAL */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[440px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#e1eaf0] flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#17648e] bg-[#e8f1f6] px-2 py-0.5 rounded">
                  {selectedCertificate.id}
                </span>
                <h2 className="text-lg sm:text-xl font-semibold text-[#123c5b] mt-1">
                  Certificate details
                </h2>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-[#287fa9]" />
                <span className="text-gray-600">Volunteer:</span>
                <span className="font-semibold text-[#123c5b]">{selectedCertificate.volunteer}</span>
              </div>

              <div className="flex items-center gap-3">
                <Award size={16} className="text-[#287fa9]" />
                <span className="text-gray-600">Qualification:</span>
                <span className="font-semibold text-[#123c5b]">{selectedCertificate.qualification}</span>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays size={16} className="text-[#287fa9]" />
                <span className="text-gray-600">Expiry Date:</span>
                <span className="font-semibold text-[#123c5b]">{selectedCertificate.expiry}</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={16} className="text-[#287fa9]" />
                <span className="text-gray-600">Remaining Time:</span>
                <span className="font-semibold text-[#123c5b]">{selectedCertificate.remaining}</span>
              </div>

              {/* STATUS CHANGE */}
              <div className="pt-2 border-t border-[#e1eaf0]">
                <label className="text-sm font-semibold text-[#123c5b] block mb-2">
                  Validation Status:
                </label>
                <div className="flex gap-2">
                  {(["Valid", "Expiring Soon", "Expired"] as CertificateStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateCertStatus(selectedCertificate.id, st)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        selectedCertificate.status === st
                          ? "bg-[#287fa9] text-white"
                          : "border border-[#d5e2e9] bg-white text-[#123c5b] hover:bg-[#f0f7fa]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {confirmDeleteId === selectedCertificate.id && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                  <p className="text-sm font-semibold">Delete this certificate record?</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleDeleteCertificate(selectedCertificate.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#e1eaf0] flex justify-between items-center bg-[#fafcfd]">
              <button
                onClick={() => setConfirmDeleteId(selectedCertificate.id)}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="bg-[#287fa9] text-white px-5 py-2 rounded-lg text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-4 py-3 shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* FLOATING HELP BUTTON */}
      <button
        title="Help & Support"
        className="fixed bottom-4 right-4 w-10 h-10 bg-[#282828] hover:bg-black text-white rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer"
      >
        <HelpCircle size={20} />
      </button>
    </div>
  );
}
