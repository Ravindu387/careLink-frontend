
import { useRef, useState } from "react";
import {
  Heart,
  Search,
  Globe,
  Bell,
  Accessibility,
  Home,
  Plus,
  ClipboardList,
  Map,
  House,
  TriangleAlert,
  Users,
  FileText,
  MessageSquare,
  Phone,
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
  Trash2,
} from "lucide-react";

interface DocumentItem {
  id: number;
  name: string;
  category: string;
  description: string;
  date: string;
  status: string;
  file?: File;
}

const initialDocuments: DocumentItem[] = [
  {
    id: 1,
    name: "Identity document",
    category: "Identity",
    description: "National ID · Samira Khan",
    date: "15 Jun 2025",
    status: "Verified",
  },
  {
    id: 2,
    name: "Medical information",
    category: "Medical",
    description: "Medication list · Mariam Khan",
    date: "18 Jun 2025",
    status: "Saved",
  },
  {
    id: 3,
    name: "Proof of address",
    category: "Address",
    description: "Utility statement · May 2025",
    date: "20 Jun 2025",
    status: "Verified",
  },
];

const navigation = [
  { name: "Home", icon: Home },
  { name: "Request Help", icon: Plus },
  { name: "My Requests", icon: ClipboardList, count: 2 },
  { name: "Nearby Support", icon: Map },
  { name: "Shelters", icon: House },
  { name: "Safety Updates", icon: TriangleAlert, count: 3 },
  { name: "My Household", icon: Users },
  { name: "My Documents", icon: FileText },
  { name: "Messages", icon: MessageSquare, count: 2 },
  { name: "Notifications", icon: Bell, count: 4 },
  { name: "Feedback", icon: Heart },
  { name: "Profile & Settings", icon: Accessibility },
];

export default function MyDocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [documents, setDocuments] =
    useState<DocumentItem[]>(initialDocuments);

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentItem | null>(null);

  const [showUpload, setShowUpload] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [category, setCategory] = useState("Identity");

  const [documentName, setDocumentName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (!uploadFile) {
      alert("Please select a document first.");
      return;
    }

    const newDocument: DocumentItem = {
      id: Date.now(),
      name: documentName.trim() || uploadFile.name,
      category,
      description: uploadFile.name,
      date: new Date().toLocaleDateString(),
      status: "Saved",
      file: uploadFile,
    };

    setDocuments((previous) => [...previous, newDocument]);

    setUploadFile(null);
    setDocumentName("");
    setCategory("Identity");
    setShowUpload(false);
  };

  const handleDownload = (doc: DocumentItem) => {
    if (!doc.file) {
      alert("This sample document does not have an attached file.");
      return;
    }

    const url = URL.createObjectURL(doc.file);
    const link = document.createElement("a");

    link.href = url;
    link.download = doc.file.name;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setDocuments((previous) =>
        previous.filter((doc) => doc.id !== id)
      );

      setSelectedDocument(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4f6] text-[#173d5b]">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[295px] flex-col bg-[#153e5e] text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-[74px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#65b9aa] text-[#153e5e]">
              <Heart size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold">ReliefOS</h1>
              <p className="text-[10px] text-sky-200">
                Citizen Support
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* ACTIVE RESPONSE */}
        <div className="mx-3 mt-4 rounded-xl border border-white/10 bg-white/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            ● Active Local Response
          </p>

          <p className="mt-2 text-xs font-bold">
            Greater Riverton Floods
          </p>

          <p className="mt-1 text-[10px] text-sky-200">
            Help centres and shelters are open
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="px-5 pb-2 pt-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-sky-300">
            Your Support
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.name === "My Documents";

            return (
              <button
                key={item.name}
                onClick={() => setSidebarOpen(false)}
                className={`flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-left text-xs transition ${
                  active
                    ? "border-[#65b9aa] bg-[#287da6] font-semibold text-white"
                    : "border-transparent text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />

                <span className="flex-1">{item.name}</span>

                {item.count && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* EMERGENCY */}
        <div className="mx-3 mb-3 rounded-xl bg-white p-3 text-[#173d5b]">
          <div className="flex items-center gap-3">
            <Phone size={20} />

            <div>
              <p className="text-[10px] font-semibold">
                Emergency help line
              </p>

              <a
                href="tel:112"
                className="text-sm font-bold text-red-600"
              >
                Call 112
              </a>
            </div>
          </div>
        </div>

        {/* PROFILE */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold">
            SK
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold">Samira Khan</p>
            <p className="text-[10px] text-sky-200">
              Citizen account
            </p>
          </div>

          <ChevronRight size={17} />
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[295px]">

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">

          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="flex max-w-[520px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
              <Search size={17} className="text-slate-400" />

              <input
                placeholder="Search help, shelters, services..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:flex">
              <Globe size={15} />
              English
            </button>

            <button className="hidden rounded-lg border border-slate-200 p-2 sm:block">
              <Accessibility size={18} />
            </button>

            <button className="relative rounded-lg border border-slate-200 p-2">
              <Bell size={18} />

              <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[9px] text-white">
                4
              </span>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#287da6] text-xs font-bold text-white">
              SK
            </div>

            <div className="hidden sm:block">
              <p className="text-[10px] font-bold">Samira</p>
              <p className="text-[9px] text-slate-400">
                North Ward
              </p>
            </div>

            <ChevronRight size={17} />
          </div>
        </header>

        {/* PAGE BODY */}
        <div className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-6">

          {/* TITLE */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                My documents
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Securely store documents you may need when requesting support.
              </p>
            </div>

            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1e668e]"
            >
              <Upload size={14} />
              Upload document
            </button>
          </section>

          {/* SECURITY NOTICE */}
          <section className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
            <Lock
              size={17}
              className="shrink-0 text-[#287da6]"
            />

            <div>
              <p className="text-[10px] font-bold">
                Encrypted and access-controlled
              </p>

              <p className="mt-1 text-[9px] text-slate-500">
                Your files are visible only to authorised staff supporting a request when the document is needed.
              </p>
            </div>
          </section>

          {/* DOCUMENT CARDS */}
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">

            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                {/* CARD TOP */}
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e9f3f8] text-[#287da6]">
                    {doc.category === "Medical" ? (
                      <Plus size={18} />
                    ) : (
                      <FileText size={18} />
                    )}
                  </div>

                  <span
                    className={`rounded-md px-2 py-1 text-[8px] font-semibold ${
                      doc.status === "Verified"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-sky-50 text-sky-700"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                {/* DETAILS */}
                <h3 className="mt-3 text-[11px] font-semibold">
                  {doc.name}
                </h3>

                <p className="mt-1 text-[9px] text-slate-500">
                  {doc.description}
                </p>

                <p className="mt-2 text-[8px] text-slate-400">
                  Uploaded {doc.date}
                </p>

                {/* ACTIONS */}
                <div className="mt-4 flex items-center gap-5 border-t border-slate-200 pt-3">

                  <button
                    onClick={() => setSelectedDocument(doc)}
                    className="flex items-center gap-1.5 text-[9px] font-semibold text-[#287da6] hover:text-[#153e5e]"
                  >
                    <Eye size={13} />
                    View
                  </button>

                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex items-center gap-1.5 text-[9px] font-semibold text-[#287da6] hover:text-[#153e5e]"
                  >
                    <Download size={13} />
                    Download
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="ml-auto text-slate-400 hover:text-red-600"
                    aria-label="Delete document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* ADD DOCUMENT CARD */}
            <button
              onClick={() => setShowUpload(true)}
              className="flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-[#a9cbd7] bg-white/60 p-5 text-center transition hover:border-[#287da6] hover:bg-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9f3f8] text-[#287da6]">
                <Upload size={19} />
              </div>

              <p className="mt-3 text-[10px] font-semibold">
                Add another document
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                PDF, JPG or PNG · Up to 10 MB
              </p>
            </button>
          </section>

          {/* BEFORE YOU UPLOAD */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

            <h3 className="text-[10px] font-bold">
              Before you upload
            </h3>

            <ul className="mt-3 space-y-2 text-[9px] text-slate-500">
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={12}
                  className="shrink-0 text-emerald-600"
                />
                Only upload documents needed for support.
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle
                  size={12}
                  className="shrink-0 text-emerald-600"
                />
                Cover unnecessary financial or private details.
              </li>

              <li className="flex items-start gap-2">
                <ShieldCheck
                  size={12}
                  className="shrink-0 text-[#287da6]"
                />
                Never upload passwords, bank PINs, or payment-card details.
              </li>
            </ul>
          </section>

          {/* FOOTER */}
          <footer className="flex flex-wrap justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support</p>
            <p>Stay safe. Stay informed.</p>
          </footer>
        </div>
      </main>

      {/* UPLOAD MODAL */}
      {showUpload && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Upload document
              </h3>

              <button onClick={() => setShowUpload(false)}>
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 space-y-4">

              <label className="block text-xs font-semibold">
                Document name

                <input
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                  className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-xs outline-none focus:border-[#287da6]"
                />
              </label>

              <label className="block text-xs font-semibold">
                Document category

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-xs outline-none"
                >
                  <option>Identity</option>
                  <option>Medical</option>
                  <option>Address</option>
                  <option>Other</option>
                </select>
              </label>

              <div>
                <p className="mb-2 text-xs font-semibold">
                  Select document
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file && file.size > 10 * 1024 * 1024) {
                      alert("File size must be less than 10 MB.");
                      e.target.value = "";
                      return;
                    }

                    setUploadFile(file || null);
                  }}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center rounded-lg border border-dashed border-[#a9cbd7] bg-slate-50 p-6 text-center hover:bg-sky-50"
                >
                  <Upload size={23} className="text-[#287da6]" />

                  <p className="mt-2 text-[10px] font-semibold">
                    {uploadFile
                      ? uploadFile.name
                      : "Click to select a file"}
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">
                    PDF, JPG or PNG · Maximum 10 MB
                  </p>
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-sky-50 p-3">
                <ShieldCheck
                  size={17}
                  className="text-[#287da6]"
                />

                <p className="text-[9px] text-slate-500">
                  Your document will be added to your personal document list.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowUpload(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs"
              >
                Cancel
              </button>

              <button
                onClick={handleUpload}
                className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e668e]"
              >
                <Upload size={13} />
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DOCUMENT MODAL */}
      {selectedDocument && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Document details
              </h3>

              <button onClick={() => setSelectedDocument(null)}>
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-lg bg-sky-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[#287da6]">
                <File size={22} />
              </div>

              <div>
                <p className="text-xs font-bold">
                  {selectedDocument.name}
                </p>

                <p className="mt-1 text-[9px] text-slate-500">
                  {selectedDocument.category}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Description</span>
                <span>{selectedDocument.description}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Uploaded date</span>
                <span>{selectedDocument.date}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-emerald-600">
                  {selectedDocument.status}
                </span>
              </div>
            </div>

            {selectedDocument.file && (
              <button
                onClick={() => handleDownload(selectedDocument)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#287da6] p-3 text-xs font-semibold text-white"
              >
                <Download size={15} />
                Download document
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
