import { useRef, useState, useEffect, useCallback } from "react";
import {
  Heart,
  Search,
  Globe,
  Bell,
  Accessibility,
  Plus,
  FileText,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Upload,
  Eye,
  Download,
  File,
  Lock,
  CheckCircle,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  MapPin,
  Check,
  Info,
  Calendar,
  Layers,
  FileCheck,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import {
  documentService,
  MOCK_DOCUMENTS,
  fileToBase64,
  formatFileSize,
} from "../../services/documentService";
import type {
  CitizenDocument,
  CreateDocumentPayload,
  DocumentSummary,
} from "../../types/document";

const CATEGORIES = ["All", "Identity", "Medical", "Address", "Other"];
const STATUS_OPTIONS = ["All", "Verified", "Under review", "Saved"];

export default function MyDocumentsPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Document state
  const [documents, setDocuments] = useState<CitizenDocument[]>([]);
  const [summary, setSummary] = useState<DocumentSummary>({
    totalDocuments: 0,
    verifiedCount: 0,
    underReviewCount: 0,
    savedCount: 0,
  });

  // UI & Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modals
  const [selectedDocument, setSelectedDocument] = useState<CitizenDocument | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<CitizenDocument | null>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [category, setCategory] = useState("Identity");
  const [documentName, setDocumentName] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => setFeedbackToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  // Fetch documents from backend with graceful fallback to mock data
  const fetchDocuments = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await documentService.getDocuments({
        citizenName: user?.fullName || "Samira Khan",
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
      });

      setDocuments(data);
      setIsBackendConnected(true);

      // Fetch or calculate summary
      try {
        const sum = await documentService.getSummary(user?.fullName || "Samira Khan");
        setSummary(sum);
      } catch {
        setSummary({
          totalDocuments: data.length,
          verifiedCount: data.filter((d) => d.status.toLowerCase() === "verified").length,
          underReviewCount: data.filter((d) => d.status.toLowerCase() === "under review").length,
          savedCount: data.filter((d) => d.status.toLowerCase() === "saved").length,
        });
      }
    } catch (err) {
      console.warn("Backend API offline, using local mock documents:", err);
      setIsBackendConnected(false);

      // Local fallback filtering
      let fallbackList = [...MOCK_DOCUMENTS];
      if (selectedCategory !== "All") {
        fallbackList = fallbackList.filter(
          (d) => d.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        fallbackList = fallbackList.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q) ||
            (d.fileName && d.fileName.toLowerCase().includes(q))
        );
      }

      setDocuments(fallbackList);
      setSummary({
        totalDocuments: MOCK_DOCUMENTS.length,
        verifiedCount: MOCK_DOCUMENTS.filter((d) => d.status === "Verified").length,
        underReviewCount: MOCK_DOCUMENTS.filter((d) => d.status === "Under review").length,
        savedCount: MOCK_DOCUMENTS.filter((d) => d.status === "Saved").length,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.fullName, selectedCategory, searchQuery]);

  // Initial fetch and on category change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filter documents by status
  const displayedDocuments = documents.filter((doc) => {
    if (selectedStatus === "All") return true;
    return doc.status.toLowerCase() === selectedStatus.toLowerCase();
  });

  // Handle document upload
  const handleUpload = async () => {
    if (!uploadFile) {
      setFeedbackToast({
        type: "error",
        message: "Please choose a document file to upload (PDF, JPG, or PNG).",
      });
      return;
    }

    const finalName = documentName.trim() || uploadFile.name;
    setIsUploading(true);

    try {
      let base64Data: string | undefined;
      try {
        base64Data = await fileToBase64(uploadFile);
      } catch (e) {
        console.warn("Could not encode file to base64:", e);
      }

      const payload: CreateDocumentPayload = {
        name: finalName,
        category,
        description: description.trim() || uploadFile.name,
        fileName: uploadFile.name,
        fileType: uploadFile.type || "application/pdf",
        fileSizeBytes: uploadFile.size,
        fileData: base64Data,
        citizenName: user?.fullName || "Samira Khan",
      };

      let newDoc: CitizenDocument;

      if (isBackendConnected) {
        newDoc = await documentService.createDocument(payload);
        newDoc.file = uploadFile;
        setDocuments((prev) => [newDoc, ...prev]);
      } else {
        newDoc = {
          id: `DOC-LOCAL-${Date.now()}`,
          name: finalName,
          category,
          description: description.trim() || uploadFile.name,
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status: "Saved",
          fileName: uploadFile.name,
          fileType: uploadFile.type,
          fileSizeBytes: uploadFile.size,
          fileSizeFormatted: formatFileSize(uploadFile.size),
          verificationNotes: "Pending officer verification (Stored locally).",
          citizenName: user?.fullName || "Samira Khan",
          file: uploadFile,
          fileData: base64Data,
        };
        setDocuments((prev) => [newDoc, ...prev]);
      }

      setSummary((prev) => ({
        ...prev,
        totalDocuments: prev.totalDocuments + 1,
        savedCount: prev.savedCount + 1,
      }));

      setFeedbackToast({
        type: "success",
        message: `"${finalName}" was uploaded successfully.`,
      });

      // Reset form
      setShowUpload(false);
      setUploadFile(null);
      setDocumentName("");
      setDescription("");
      setCategory("Identity");
    } catch (err: any) {
      console.error("Upload failed:", err);
      setFeedbackToast({
        type: "error",
        message: err.message || "Failed to upload document. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle document download
  const handleDownload = async (doc: CitizenDocument) => {
    try {
      // 1. If in-memory file object exists
      if (doc.file) {
        const url = URL.createObjectURL(doc.file);
        const link = document.createElement("a");
        link.href = url;
        link.download = doc.file.name;
        link.click();
        URL.revokeObjectURL(url);
        setFeedbackToast({
          type: "success",
          message: `Downloaded ${doc.file.name}`,
        });
        return;
      }

      // 2. If base64 data exists
      if (doc.fileData) {
        const cleanBase64 = doc.fileData.includes(",")
          ? doc.fileData.split(",")[1]
          : doc.fileData;
        const byteChars = atob(cleanBase64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: doc.fileType || "application/pdf",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = doc.fileName || `${doc.name}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        setFeedbackToast({
          type: "success",
          message: `Downloaded ${doc.fileName || doc.name}`,
        });
        return;
      }

      // 3. Backend download API call
      if (isBackendConnected) {
        await documentService.downloadDocument(doc.id, doc.fileName);
        setFeedbackToast({
          type: "success",
          message: `Downloaded ${doc.fileName || doc.name}`,
        });
        return;
      }

      // 4. Fallback generated record
      const summaryContent =
        `CareLink ReliefOS Official Document Record\n` +
        `===========================================\n` +
        `Document ID: ${doc.id}\n` +
        `Document Name: ${doc.name}\n` +
        `Category: ${doc.category}\n` +
        `Description: ${doc.description}\n` +
        `Citizen: ${doc.citizenName || "Samira Khan"}\n` +
        `Status: ${doc.status}\n` +
        `Verification Notes: ${doc.verificationNotes || "Registered in citizen profile."}\n` +
        `Date: ${doc.date}\n` +
        `Security Notice: Certified for disaster relief emergency support.\n`;

      const blob = new Blob([summaryContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(doc.fileName || doc.name).replace(/\.[^/.]+$/, "")}_record.txt`;
      link.click();
      URL.revokeObjectURL(url);

      setFeedbackToast({
        type: "info",
        message: `Downloaded verification record for "${doc.name}"`,
      });
    } catch (err: any) {
      console.error("Download failed:", err);
      setFeedbackToast({
        type: "error",
        message: "Failed to download document: " + err.message,
      });
    }
  };

  // Handle document deletion
  const handleDelete = async (doc: CitizenDocument) => {
    try {
      if (isBackendConnected) {
        await documentService.deleteDocument(doc.id);
      }

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));

      if (selectedDocument?.id === doc.id) {
        setSelectedDocument(null);
      }
      setDeleteConfirmDoc(null);

      // Update summary counts
      setSummary((prev) => ({
        ...prev,
        totalDocuments: Math.max(0, prev.totalDocuments - 1),
        verifiedCount:
          doc.status === "Verified"
            ? Math.max(0, prev.verifiedCount - 1)
            : prev.verifiedCount,
        underReviewCount:
          doc.status === "Under review"
            ? Math.max(0, prev.underReviewCount - 1)
            : prev.underReviewCount,
        savedCount:
          doc.status === "Saved"
            ? Math.max(0, prev.savedCount - 1)
            : prev.savedCount,
      }));

      setFeedbackToast({
        type: "success",
        message: `Document "${doc.name}" deleted.`,
      });
    } catch (err: any) {
      console.error("Delete failed:", err);
      setFeedbackToast({
        type: "error",
        message: "Failed to delete document: " + err.message,
      });
    }
  };

  // Helper for category badge icons
  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "medical":
        return <Plus size={18} className="text-rose-600" />;
      case "identity":
        return <ShieldCheck size={18} className="text-[#287da6]" />;
      case "address":
        return <MapPin size={18} className="text-emerald-600" />;
      default:
        return <FileText size={18} className="text-indigo-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="My Documents"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="min-h-screen lg:ml-[295px]">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT CONTAINER */}
        <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6">
          {/* TOAST FEEDBACK NOTIFICATION */}
          {feedbackToast && (
            <div
              className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-semibold shadow-md transition-all ${
                feedbackToast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : feedbackToast.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackToast.type === "success" ? (
                  <CheckCircle size={16} className="text-emerald-600" />
                ) : feedbackToast.type === "error" ? (
                  <AlertCircle size={16} className="text-red-600" />
                ) : (
                  <Info size={16} className="text-sky-600" />
                )}
                <span>{feedbackToast.message}</span>
              </div>
              <button
                onClick={() => setFeedbackToast(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* PAGE HEADER & CONTROLS */}
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight">
                  My Documents
                </h2>

                {/* BACKEND STATUS BADGE */}
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-xs">
                  {isBackendConnected === true ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Wifi size={11} /> Backend API Online
                      </span>
                    </>
                  ) : isBackendConnected === false ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="font-semibold text-amber-700 flex items-center gap-1">
                        <WifiOff size={11} /> Local Fallback Mode
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">Connecting...</span>
                  )}
                </div>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Securely store, manage, and verify documents required for emergency assistance.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchDocuments()}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition"
                title="Refresh documents list"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin text-[#287da6]" : "text-slate-500"}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#1e668e] transition"
              >
                <Upload size={14} />
                Upload Document
              </button>
            </div>
          </section>

          {/* SUMMARY KPI STATS CARDS */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-slate-500">
                  Total Files
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-[#287da6]">
                  <Layers size={14} />
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-[#173d5b]">
                {summary.totalDocuments}
              </p>
              <p className="text-xs text-slate-400">All registered items</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-700">
                  Verified
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={14} />
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-emerald-700">
                {summary.verifiedCount}
              </p>
              <p className="text-xs text-slate-400">Ready for instant support</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-700">
                  Under Review
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock size={14} />
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-amber-700">
                {summary.underReviewCount}
              </p>
              <p className="text-xs text-slate-400">Officer validation pending</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-sky-700">
                  Saved / Action
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <FileCheck size={14} />
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-sky-800">
                {summary.savedCount}
              </p>
              <p className="text-xs text-slate-400">Stored in household vault</p>
            </div>
          </section>

          {/* SECURITY & PRIVACY NOTICE */}
          <section className="flex items-center gap-3.5 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-emerald-50/30 p-4 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#287da6] text-white shadow-xs">
              <Lock size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#173d5b]">
                Encrypted Vault & Strict Access Control
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                Documents are encrypted at rest and in transit. Files are accessible solely to verified disaster relief coordinators when processing your specific aid requests.
              </p>
            </div>
          </section>

          {/* SEARCH, CATEGORY TABS & STATUS FILTER BAR */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Category tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-[#287da6] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search input */}
                <div className="relative flex-1 sm:w-64">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-sm sm:text-[15px] outline-none focus:border-[#287da6] focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Status select dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm sm:text-[15px] text-slate-700 outline-none focus:border-[#287da6]"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st === "All" ? "All Statuses" : st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* DOCUMENT CARDS GRID */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
              <RefreshCw size={28} className="animate-spin text-[#287da6]" />
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Loading citizen documents...
              </p>
            </div>
          ) : displayedDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileText size={24} />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-700">
                No documents found
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                {searchQuery || selectedCategory !== "All" || selectedStatus !== "All"
                  ? "Try resetting your search or filter criteria to see your documents."
                  : "You haven't uploaded any verification documents yet. Uploading ID or medical records speeds up aid distribution."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedStatus("All");
                  setShowUpload(true);
                }}
                className="mt-4 flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e668e]"
              >
                <Upload size={14} />
                Upload New Document
              </button>
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayedDocuments.map((doc) => {
                const isVerified = doc.status.toLowerCase() === "verified";
                const isUnderReview = doc.status.toLowerCase() === "under review";

                return (
                  <div
                    key={doc.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-[#287da6]/40 hover:shadow-md"
                  >
                    <div>
                      {/* CARD TOP BAR */}
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f3f8]">
                          {getCategoryIcon(doc.category)}
                        </div>

                        {/* STATUS BADGE */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                            isVerified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : isUnderReview
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : "bg-sky-50 text-sky-700 border border-sky-200/60"
                          }`}
                        >
                          {isVerified ? (
                            <CheckCircle2 size={11} className="text-emerald-600" />
                          ) : isUnderReview ? (
                            <Clock size={11} className="text-amber-600" />
                          ) : (
                            <FileCheck size={11} className="text-sky-600" />
                          )}
                          {doc.status}
                        </span>
                      </div>

                      {/* DOCUMENT TITLE & CATEGORY */}
                      <div className="mt-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#287da6]">
                          {doc.category}
                        </span>
                        <h3 className="mt-0.5 text-base font-bold text-[#173d5b]">
                          {doc.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[13px] text-slate-500">
                          {doc.description || doc.fileName}
                        </p>
                      </div>

                      {/* META INFORMATION */}
                      <div className="mt-3 flex items-center gap-3 text-[13px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {doc.date}
                        </span>
                        {doc.fileSizeFormatted && (
                          <span>• {doc.fileSizeFormatted}</span>
                        )}
                      </div>
                    </div>

                    {/* CARD ACTIONS */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedDocument(doc)}
                          className="flex items-center gap-1 font-semibold text-[#287da6] hover:text-[#153e5e] transition"
                        >
                          <Eye size={13} />
                          View
                        </button>

                        <button
                          onClick={() => handleDownload(doc)}
                          className="flex items-center gap-1 font-semibold text-[#287da6] hover:text-[#153e5e] transition"
                        >
                          <Download size={13} />
                          Download
                        </button>
                      </div>

                      <button
                        onClick={() => setDeleteConfirmDoc(doc)}
                        className="text-slate-400 hover:text-red-600 transition"
                        aria-label="Delete document"
                        title="Delete document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ADD ANOTHER DOCUMENT CARD */}
              <button
                onClick={() => setShowUpload(true)}
                className="flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-[#a9cbd7] bg-white/60 p-5 text-center transition hover:border-[#287da6] hover:bg-white group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9f3f8] text-[#287da6] transition group-hover:scale-110">
                  <Upload size={20} />
                </div>

                <p className="mt-3 text-sm font-bold text-[#173d5b]">
                  Add another document
                </p>

                <p className="mt-1 text-[13px] text-slate-400">
                  PDF, JPG or PNG · Up to 10 MB
                </p>
              </button>
            </section>
          )}

          {/* BEFORE YOU UPLOAD ADVISORY SECTION */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-base font-bold text-[#173d5b]">
              Before you upload
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <CheckCircle
                  size={15}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                <p className="text-sm text-slate-600">
                  Upload valid proof of identity or residence required for shelter and allowance allocation.
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <CheckCircle
                  size={15}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                <p className="text-sm text-slate-600">
                  Cover unnecessary financial or sensitive family details before uploading photos or scans.
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <ShieldCheck
                  size={15}
                  className="mt-0.5 shrink-0 text-[#287da6]"
                />
                <p className="text-sm text-slate-600">
                  Never upload account passwords, ATM PINs, or credit card numbers. ReliefOS will never request these.
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="flex flex-wrap justify-between gap-3 border-t border-slate-200 py-4 text-[13px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support · Disaster Response & Document Vault</p>
            <p>Protected by Relief Security Protocol v4.2</p>
          </footer>
        </div>
      </main>

      {/* UPLOAD DOCUMENT MODAL */}
      {showUpload && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-[#287da6]">
                  <Upload size={16} />
                </div>
                <h3 className="text-base font-bold text-[#173d5b]">
                  Upload New Document
                </h3>
              </div>

              <button
                onClick={() => setShowUpload(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Document Name
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="e.g. National ID Card, Water Bill, Clinic Card"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Document Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                >
                  <option value="Identity">Identity (National ID, Passport, Driver's License)</option>
                  <option value="Medical">Medical (Prescription, Medical Report, Disability Pass)</option>
                  <option value="Address">Address (Utility Bill, Council Tax, Lease)</option>
                  <option value="Other">Other (Evacuation Certificate, Transit Pass)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Description / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Samira Khan · Riverton Ward 4"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm sm:text-[15px] outline-none focus:border-[#287da6]"
                />
              </div>

              {/* FILE PICKER */}
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Select File
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        alert("File size exceeds 10 MB limit.");
                        e.target.value = "";
                        return;
                      }
                      setUploadFile(file);
                      if (!documentName.trim()) {
                        setDocumentName(
                          file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
                        );
                      }
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1.5 flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#a9cbd7] bg-slate-50/80 p-5 text-center transition hover:border-[#287da6] hover:bg-sky-50/40"
                >
                  <Upload size={22} className="text-[#287da6]" />

                  <p className="mt-2 text-sm font-semibold text-[#173d5b]">
                    {uploadFile ? uploadFile.name : "Click to select a file"}
                  </p>

                  <p className="mt-1 text-[13px] text-slate-400">
                    {uploadFile
                      ? `${formatFileSize(uploadFile.size)} · Click to change file`
                      : "PDF, JPG or PNG · Maximum 10 MB"}
                  </p>
                </button>
              </div>

              {/* SECURITY PILL */}
              <div className="flex items-center gap-2 rounded-lg bg-sky-50 p-2.5">
                <ShieldCheck size={16} className="text-[#287da6] shrink-0" />
                <p className="text-sm text-slate-600">
                  Files are saved securely in your citizen record and visible to authorized relief staff.
                </p>
              </div>
            </div>

            {/* MODAL ACTIONS */}
            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                disabled={isUploading}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e668e] disabled:opacity-50 transition"
              >
                {isUploading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DOCUMENT MODAL */}
      {selectedDocument && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#173d5b]">
                Document Details
              </h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* HEADER BANNER */}
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-sky-50 p-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs">
                {getCategoryIcon(selectedDocument.category)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-[#173d5b]">
                  {selectedDocument.name}
                </p>
                <p className="text-[13px] text-slate-500">
                  {selectedDocument.category} Document
                </p>
              </div>

              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                  selectedDocument.status.toLowerCase() === "verified"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedDocument.status.toLowerCase() === "under review"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                {selectedDocument.status}
              </span>
            </div>

            {/* DETAILS LIST */}
            <div className="mt-4 divide-y divide-slate-100 text-xs">
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Description</span>
                <span className="font-medium text-[#173d5b] text-right">
                  {selectedDocument.description || "—"}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-500">Uploaded File</span>
                <span className="font-mono text-sm text-slate-700 text-right">
                  {selectedDocument.fileName || "document.pdf"}
                </span>
              </div>

              {selectedDocument.fileSizeFormatted && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">File Size</span>
                  <span className="text-slate-700">
                    {selectedDocument.fileSizeFormatted}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-2">
                <span className="text-slate-500">Uploaded Date</span>
                <span className="text-slate-700">
                  {selectedDocument.date}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-500">Citizen Account</span>
                <span className="font-semibold text-[#173d5b]">
                  {selectedDocument.citizenName || "Samira Khan"}
                </span>
              </div>

              {selectedDocument.verificationNotes && (
                <div className="py-2">
                  <span className="text-slate-500 block mb-1">Verification Record</span>
                  <p className="rounded-lg bg-slate-50 p-2.5 text-sm text-slate-600 border border-slate-200">
                    {selectedDocument.verificationNotes}
                  </p>
                </div>
              )}
            </div>

            {/* MODAL ACTIONS */}
            <div className="mt-5 flex gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleDownload(selectedDocument)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#287da6] py-2 text-sm font-semibold text-white hover:bg-[#1e668e]"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <Trash2 size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Delete Document?
              </h3>
            </div>

            <p className="mt-3 text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-bold text-[#173d5b]">
                "{deleteConfirmDoc.name}"
              </span>
              ? This document will be removed from your profile.
            </p>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmDoc(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmDoc)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
