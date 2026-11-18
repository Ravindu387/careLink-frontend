import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Search,
  ChevronRight,
  Plus,
  X,
  AlertTriangle,
  BellRing,
  Megaphone,
  Archive,
  ShieldAlert,
  Clock,
  MapPin,
  UserRound,
  CheckCircle2,
  FileText,
  Send,
  Trash2,
  RotateCcw,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { disasterUpdateService } from "../../services/disasterUpdateService";
import type {
  DisasterUpdate,
  DisasterUpdateSummary,
  EmergencyContact,
  UpdateType,
} from "../../types/disasterUpdate";

const fallbackContacts: EmergencyContact[] = [
  { id: 1, name: "Disaster Management Centre", number: "117" },
  { id: 2, name: "Emergency Medical", number: "1990" },
  { id: 3, name: "Police Emergency", number: "119" },
  { id: 4, name: "CareLink Coordination", number: "011 234 8800" },
];

export default function DisasterUpdatesPage() {
  const [updates, setUpdates] = useState<DisasterUpdate[]>([]);
  const [drafts, setDrafts] = useState<DisasterUpdate[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(fallbackContacts);
  const [summary, setSummary] = useState<DisasterUpdateSummary | null>(null);

  const [activeTab, setActiveTab] = useState("All updates");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);

  const [selectedUpdate, setSelectedUpdate] = useState<DisasterUpdate | null>(null);
  const [notification, setNotification] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [newUpdate, setNewUpdate] = useState({
    title: "",
    type: "Announcement" as UpdateType,
    description: "",
    location: "Greater Riverton",
    source: "CareLink Coordination",
    instructions: "",
  });

  /* ================= FETCH DATA ================= */

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [allUpdates, allDrafts, summaryData, contacts] = await Promise.all([
        disasterUpdateService.getUpdates({ archived: showArchive, isDraft: false }),
        disasterUpdateService.getUpdates({ isDraft: true }),
        disasterUpdateService.getSummary(),
        disasterUpdateService.getEmergencyContacts(),
      ]);

      setUpdates(allUpdates || []);
      setDrafts(allDrafts || []);
      setSummary(summaryData);
      if (contacts && contacts.length > 0) {
        setEmergencyContacts(contacts);
      }
    } catch (err: any) {
      console.error("Error loading disaster updates:", err);
      setErrorMessage(
        err.message || "Failed to load disaster updates from server."
      );
    } finally {
      setLoading(false);
    }
  }, [showArchive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ================= COUNTS ================= */

  const criticalCount = summary?.criticalCount ?? updates.filter((i) => !i.archived && i.type === "Critical").length;
  const warningCount = summary?.warningCount ?? updates.filter((i) => !i.archived && i.type === "Warning").length;
  const announcementCount = summary?.announcementCount ?? updates.filter((i) => !i.archived && i.type === "Announcement").length;
  const totalActiveCount = summary?.totalActive ?? updates.filter((i) => !i.archived).length;

  /* ================= FILTER UPDATES ================= */

  const filteredUpdates = useMemo(() => {
    let result = updates;

    if (!showArchive) {
      if (activeTab === "Critical") {
        result = result.filter((item) => item.type === "Critical");
      } else if (activeTab === "Warnings") {
        result = result.filter((item) => item.type === "Warning");
      } else if (activeTab === "Announcements") {
        result = result.filter((item) => item.type === "Announcement");
      }
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((item) =>
        [
          item.id,
          item.title,
          item.description,
          item.location,
          item.source,
        ].some((value) => value.toLowerCase().includes(term))
      );
    }

    return result;
  }, [updates, activeTab, search, showArchive]);

  /* ================= CREATE ANNOUNCEMENT ================= */

  const handleCreateAnnouncement = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newUpdate.title.trim() || !newUpdate.description.trim()) {
      setErrorMessage("Please enter both title and description.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const created = await disasterUpdateService.createUpdate({
        title: newUpdate.title.trim(),
        type: newUpdate.type,
        description: newUpdate.description.trim(),
        location: newUpdate.location.trim() || "Greater Riverton",
        source: newUpdate.source.trim() || "CareLink Coordination",
        instructions:
          newUpdate.instructions.trim() || newUpdate.description.trim(),
        isDraft: false,
      });

      setActiveTab("All updates");
      setShowArchive(false);
      setShowCreateModal(false);

      setNewUpdate({
        title: "",
        type: "Announcement",
        description: "",
        location: "Greater Riverton",
        source: "CareLink Coordination",
        instructions: "",
      });

      setNotification(`Announcement ${created.id} published successfully.`);
      await loadData();
    } catch (err: any) {
      console.error("Error creating announcement:", err);
      setErrorMessage(err.message || "Failed to publish announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= SAVE DRAFT ================= */

  const saveDraft = async () => {
    if (!newUpdate.title.trim()) {
      setNotification("Enter an announcement title first.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await disasterUpdateService.createUpdate({
        title: newUpdate.title.trim(),
        type: newUpdate.type,
        description: newUpdate.description.trim(),
        location: newUpdate.location.trim() || "Greater Riverton",
        source: newUpdate.source.trim() || "CareLink Coordination",
        instructions: newUpdate.instructions.trim(),
        isDraft: true,
      });

      setShowCreateModal(false);

      setNewUpdate({
        title: "",
        type: "Announcement",
        description: "",
        location: "Greater Riverton",
        source: "CareLink Coordination",
        instructions: "",
      });

      setNotification("Draft saved successfully.");
      await loadData();
    } catch (err: any) {
      console.error("Error saving draft:", err);
      setErrorMessage(err.message || "Failed to save draft.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= ARCHIVE / RESTORE ================= */

  const toggleArchive = async (id: string) => {
    setIsArchiving(true);
    setErrorMessage("");

    try {
      const updated = await disasterUpdateService.toggleArchive(id);
      setSelectedUpdate(null);
      setNotification(
        updated.archived
          ? `Update ${id} moved to archive.`
          : `Update ${id} restored to active updates.`
      );
      await loadData();
    } catch (err: any) {
      console.error("Error changing archive status:", err);
      setErrorMessage(err.message || "Failed to change archive status.");
    } finally {
      setIsArchiving(false);
    }
  };

  /* ================= PUBLISH DRAFT ================= */

  const publishDraft = async (draft: DisasterUpdate) => {
    try {
      const published = await disasterUpdateService.publishDraft(draft.id);
      setShowDrafts(false);
      setNotification(`Draft published successfully as ${published.id}.`);
      await loadData();
    } catch (err: any) {
      console.error("Error publishing draft:", err);
      setErrorMessage(err.message || "Failed to publish draft.");
    }
  };

  /* ================= DELETE DRAFT ================= */

  const deleteDraft = async (id: string) => {
    try {
      await disasterUpdateService.deleteUpdate(id);
      setDrafts((prev) => prev.filter((item) => item.id !== id));
      setNotification("Draft deleted.");
      await loadData();
    } catch (err: any) {
      console.error("Error deleting draft:", err);
      setErrorMessage(err.message || "Failed to delete draft.");
    }
  };

  /* ================= CRITICAL ALERT FOR BANNER ================= */

  const activeCriticalAlert =
    summary?.latestCriticalAlert ||
    updates.find((item) => !item.archived && item.type === "Critical");

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-4 pb-8">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[8px] mb-6">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="text-slate-400">Shelter Administration</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="font-semibold">Disaster Updates</span>
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[21px] font-normal">Disaster Updates</h1>

            <p className="text-[9px] text-slate-500 mt-1.5">
              Publish and monitor verified disaster alerts, safety guidance, and announcements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData()}
              title="Refresh updates"
              className="h-[31px] px-3 bg-white border border-[#aac4d2] text-[#1c638a] rounded-md text-[9px] font-semibold flex items-center gap-1.5 hover:bg-slate-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={() => {
                setShowArchive(!showArchive);
                setActiveTab("All updates");
              }}
              className={`h-[31px] px-3 bg-white border border-[#aac4d2] rounded-md text-[9px] font-semibold flex items-center gap-2 hover:bg-slate-50 ${
                showArchive ? "border-[#2785b7] text-[#2785b7]" : ""
              }`}
            >
              <Archive size={12} />
              {showArchive ? "Active updates" : "Archived updates"}
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[31px] px-3 bg-[#1c638a] text-white rounded-md text-[9px] font-semibold hover:bg-[#144665] flex items-center gap-2"
            >
              <Plus size={13} />
              Create announcement
            </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-3 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-500 hover:text-red-800"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* CRITICAL ALERT BANNER */}
        {!showArchive && activeCriticalAlert && (
          <section className="bg-[#fff7f7] border border-[#ffb8be] border-l-[3px] border-l-[#ef4755] rounded-lg p-3 flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-[#ffebed] text-[#ef4755] rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-flex bg-[#fdebed] text-[#d83d4b] rounded px-2 py-1 text-[7px] font-bold mb-1">
                CRITICAL ALERT
              </span>

              <h2 className="text-[11px] font-semibold">
                {activeCriticalAlert.title}
              </h2>

              <p className="text-[8px] text-slate-500 mt-1">
                {activeCriticalAlert.description}
              </p>

              <p className="text-[7px] text-slate-400 mt-2">
                Published by {activeCriticalAlert.publishedBy} ·{" "}
                {activeCriticalAlert.date}, {activeCriticalAlert.time}
              </p>
            </div>

            <button
              onClick={() => setSelectedUpdate(activeCriticalAlert)}
              className="h-[30px] px-3 bg-white border border-[#aac4d2] rounded-md text-[8px] font-semibold whitespace-nowrap hover:bg-slate-50"
            >
              View instructions
            </button>
          </section>
        )}

        {/* MAIN TWO COLUMN AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3.5fr)_minmax(230px,0.9fr)] gap-2.5">
          {/* LEFT SIDE */}
          <section className="min-w-0">
            {/* TABS */}
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto">
              {["All updates", "Critical", "Warnings", "Announcements"].map(
                (tab) => {
                  const count =
                    tab === "Critical"
                      ? criticalCount
                      : tab === "Warnings"
                      ? warningCount
                      : tab === "Announcements"
                      ? announcementCount
                      : totalActiveCount;

                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setShowArchive(false);
                      }}
                      className={`px-2.5 py-2 rounded-md border text-[8px] whitespace-nowrap transition ${
                        activeTab === tab && !showArchive
                          ? "bg-[#1c638a] text-white border-[#1c638a]"
                          : "bg-white text-slate-500 border-[#d5e3e9] hover:border-[#45b99b]"
                      }`}
                    >
                      {tab}
                      <span className="ml-1 opacity-70">{count}</span>
                    </button>
                  );
                }
              )}
            </div>

            {/* SEARCH */}
            <div className="relative mb-2">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search disaster updates..."
                className="w-full h-9 bg-white border border-[#d5e3e9] rounded-lg pl-9 pr-3 text-[9px] outline-none focus:border-[#45b99b]"
              />
            </div>

            {/* UPDATE LIST */}
            <div className="space-y-2 relative">
              {loading && (
                <div className="bg-white/80 border border-[#d5e3e9] rounded-lg py-12 text-center flex items-center justify-center gap-2 text-[#1c638a] text-xs font-semibold">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Loading disaster updates...</span>
                </div>
              )}

              {!loading &&
                filteredUpdates.map((item) => (
                  <UpdateCard
                    key={item.id}
                    update={item}
                    onClick={() => setSelectedUpdate(item)}
                  />
                ))}

              {!loading && filteredUpdates.length === 0 && (
                <div className="bg-white border border-[#d5e3e9] rounded-lg py-14 text-center">
                  <BellRing size={28} className="mx-auto text-slate-300" />
                  <p className="text-xs font-semibold mt-3">No updates found</p>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Try changing your search or selected tab.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT SIDE PANEL */}
          <aside className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm p-3 h-fit">
            {/* EMERGENCY CONTACTS */}
            <h2 className="text-[10px] font-semibold mb-3">
              Emergency contacts
            </h2>

            <div className="divide-y divide-slate-200">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.name}
                  className="py-2 flex items-center justify-between gap-2"
                >
                  <span className="text-[8px] text-slate-600">
                    {contact.name}
                  </span>

                  <a
                    href={`tel:${contact.number.replace(/\s/g, "")}`}
                    className="text-[8px] font-semibold text-[#1c638a] whitespace-nowrap hover:underline"
                  >
                    {contact.number}
                  </a>
                </div>
              ))}
            </div>

            {/* PUBLISHING CONTROLS */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <h2 className="text-[10px] font-semibold mb-3">
                Publishing controls
              </h2>

              <p className="text-[8px] text-slate-500 leading-relaxed">
                Only authorised administrators can publish critical alerts.
              </p>

              <button
                onClick={() => setShowDrafts(true)}
                className="mt-2 h-[29px] px-3 bg-white border border-[#aac4d2] rounded-md text-[8px] font-semibold hover:bg-slate-50 flex items-center gap-2"
              >
                <FileText size={12} />
                View {drafts.length} drafts
              </button>
            </div>

            {/* QUICK SUMMARY */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <h2 className="text-[10px] font-semibold mb-3">Update summary</h2>

              <SummaryItem
                icon={<AlertTriangle size={12} />}
                label="Critical alerts"
                value={criticalCount}
                color="red"
              />

              <SummaryItem
                icon={<ShieldAlert size={12} />}
                label="Warnings"
                value={warningCount}
                color="orange"
              />

              <SummaryItem
                icon={<Megaphone size={12} />}
                label="Announcements"
                value={announcementCount}
                color="blue"
              />
            </div>
          </aside>
        </div>
      </main>

      {/* CREATE ANNOUNCEMENT MODAL */}
      {showCreateModal && (
        <Modal
          title="Create announcement"
          subtitle="Publish a verified disaster update or safety announcement."
          onClose={() => setShowCreateModal(false)}
        >
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <FormInput
              label="Announcement title"
              placeholder="Enter announcement title"
              value={newUpdate.title}
              onChange={(v) => setNewUpdate({ ...newUpdate, title: v })}
            />

            <FormSelect
              label="Update type"
              value={newUpdate.type}
              options={["Critical", "Warning", "Announcement", "Update"]}
              onChange={(v) =>
                setNewUpdate({
                  ...newUpdate,
                  type: v as UpdateType,
                })
              }
            />

            <FormInput
              label="Location / Area"
              placeholder="Example: North Ward"
              value={newUpdate.location}
              onChange={(v) => setNewUpdate({ ...newUpdate, location: v })}
            />

            <FormSelect
              label="Publishing source"
              value={newUpdate.source}
              options={[
                "CareLink Coordination",
                "National Disaster Authority",
                "Municipal Operations",
                "Meteorological Service",
              ]}
              onChange={(v) => setNewUpdate({ ...newUpdate, source: v })}
            />

            <FormTextarea
              label="Update description"
              placeholder="Write the announcement details..."
              value={newUpdate.description}
              onChange={(v) =>
                setNewUpdate({
                  ...newUpdate,
                  description: v,
                })
              }
            />

            <FormTextarea
              label="Safety instructions"
              placeholder="Enter instructions for affected residents..."
              value={newUpdate.instructions}
              onChange={(v) =>
                setNewUpdate({
                  ...newUpdate,
                  instructions: v,
                })
              }
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowCreateModal(false)}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={saveDraft}
                className="flex-1 h-10 border border-[#aac4d2] rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Save draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-10 bg-[#1c638a] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[#144665] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
                {isSubmitting ? "Publishing..." : "Publish"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* UPDATE DETAILS PANEL */}
      {selectedUpdate && (
        <div className="fixed inset-0 z-40 bg-black/30 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Update details</h2>

              <button
                onClick={() => setSelectedUpdate(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-7">
              <div className="w-14 h-14 bg-[#eaf3f8] text-[#287da7] rounded-xl flex items-center justify-center">
                {selectedUpdate.type === "Critical" ? (
                  <AlertTriangle size={25} />
                ) : selectedUpdate.type === "Warning" ? (
                  <ShieldAlert size={25} />
                ) : (
                  <BellRing size={25} />
                )}
              </div>

              <div className="mt-4">
                <TypeBadge type={selectedUpdate.type} />
              </div>

              <h3 className="text-lg font-semibold mt-3">
                {selectedUpdate.title}
              </h3>

              <p className="text-[10px] text-slate-400 mt-2">
                {selectedUpdate.id}
              </p>
            </div>

            <div className="mt-7 space-y-4">
              <DetailRow
                icon={<MapPin size={15} />}
                label="Location"
                value={selectedUpdate.location}
              />

              <DetailRow
                icon={<Clock size={15} />}
                label="Published"
                value={`${selectedUpdate.date} · ${selectedUpdate.time}`}
              />

              <DetailRow
                icon={<UserRound size={15} />}
                label="Published by"
                value={selectedUpdate.publishedBy}
              />

              <DetailRow
                icon={<FileText size={15} />}
                label="Source"
                value={selectedUpdate.source}
              />
            </div>

            <div className="mt-7">
              <h3 className="text-xs font-semibold mb-2">Update description</h3>

              <p className="bg-[#f5f9fa] rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
                {selectedUpdate.description}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-semibold mb-2">Safety instructions</h3>

              <p className="bg-[#fff8ed] border border-[#f5dfb9] rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
                {selectedUpdate.instructions}
              </p>
            </div>

            <div className="mt-7 space-y-2">
              <button
                disabled={isArchiving}
                onClick={() => {
                  toggleArchive(selectedUpdate.id);
                }}
                className="w-full h-10 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50"
              >
                {isArchiving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : selectedUpdate.archived ? (
                  <>
                    <RotateCcw size={14} />
                    Restore update
                  </>
                ) : (
                  <>
                    <Archive size={14} />
                    Archive update
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedUpdate(null)}
                className="w-full h-10 bg-[#1c638a] text-white rounded-lg text-xs font-semibold hover:bg-[#144665]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAFTS MODAL */}
      {showDrafts && (
        <Modal
          title="Draft announcements"
          subtitle="Review and publish saved announcements."
          onClose={() => setShowDrafts(false)}
        >
          <div className="space-y-3">
            {drafts.length === 0 && (
              <div className="text-center py-10">
                <FileText size={28} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold mt-3">No saved drafts</p>
              </div>
            )}

            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="border border-slate-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-semibold">{draft.title}</h3>
                  <TypeBadge type={draft.type} />
                </div>

                <p className="text-[9px] text-slate-500 mt-1">
                  {draft.description}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => publishDraft(draft)}
                    className="flex-1 bg-[#1c638a] text-white rounded-md py-2 text-[9px] font-semibold hover:bg-[#144665]"
                  >
                    Publish
                  </button>

                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="px-3 py-2 border border-slate-200 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50"
                    title="Delete draft"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          <p className="text-xs flex-1">{notification}</p>
          <button
            onClick={() => setNotification("")}
            className="text-white/70 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= UPDATE CARD ================= */

function UpdateCard({
  update,
  onClick,
}: {
  update: DisasterUpdate;
  onClick: () => void;
}) {
  const iconStyles: Record<UpdateType, string> = {
    Critical: "bg-[#fdebed] text-[#ef5260]",
    Warning: "bg-[#fff4df] text-[#d18a18]",
    Announcement: "bg-[#eaf3f8] text-[#287da7]",
    Update: "bg-[#eaf3f8] text-[#287da7]",
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-[#d5e3e9] rounded-lg shadow-sm p-3 flex items-center gap-2.5 text-left hover:border-[#45b99b] hover:shadow-md transition min-h-[98px]"
    >
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
          iconStyles[update.type] || iconStyles.Announcement
        }`}
      >
        {update.type === "Critical" || update.type === "Warning" ? (
          <AlertTriangle size={16} />
        ) : (
          <BellRing size={15} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <TypeBadge type={update.type} />

          <span className="text-[7px] text-slate-400 whitespace-nowrap">
            {update.date} · {update.time}
          </span>
        </div>

        <h3 className="text-[9px] font-semibold mt-2 truncate">
          {update.title}
        </h3>

        <p className="text-[8px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
          {update.description}
        </p>

        <p className="text-[7px] text-slate-400 mt-2">Source: {update.source}</p>
      </div>

      <ChevronRight size={14} className="text-slate-400 shrink-0" />
    </button>
  );
}

/* ================= TYPE BADGE ================= */

function TypeBadge({ type }: { type: UpdateType }) {
  const styles: Record<UpdateType, string> = {
    Critical: "bg-[#fdebed] text-[#d83d4b]",
    Warning: "bg-[#fff4df] text-[#b7791f]",
    Announcement: "bg-[#eaf3f8] text-[#287da7]",
    Update: "bg-[#eaf3f8] text-[#287da7]",
  };

  return (
    <span
      className={`inline-flex px-2 py-1 rounded text-[7px] font-semibold whitespace-nowrap ${
        styles[type] || styles.Announcement
      }`}
    >
      {type}
    </span>
  );
}

/* ================= SUMMARY ITEM ================= */

function SummaryItem({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  color: "red" | "orange" | "blue";
}) {
  const styles = {
    red: "text-[#e34b59] bg-[#fdebed]",
    orange: "text-[#d18a18] bg-[#fff4df]",
    blue: "text-[#287da7] bg-[#eaf3f8]",
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center ${styles[color]}`}
        >
          {icon}
        </div>

        <span className="text-[8px] text-slate-600">{label}</span>
      </div>

      <span className="text-[9px] font-semibold">{value}</span>
    </div>
  );
}

/* ================= FORM COMPONENTS ================= */

function FormInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>

      <input
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormTextarea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>

      <textarea
        required
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b] resize-none"
      />
    </div>
  );
}

/* ================= MODAL ================= */

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/* ================= DETAIL ROW ================= */

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
      <div className="text-[#2785b7]">{icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-[9px] text-slate-400">{label}</p>
        <p className="text-xs font-semibold mt-1 break-words">{value}</p>
      </div>
    </div>
  );
}
