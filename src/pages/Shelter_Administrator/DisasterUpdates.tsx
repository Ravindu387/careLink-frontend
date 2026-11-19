
import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Search,
  Globe,
  Bell,
  CircleHelp,
  ChevronRight,
  Plus,
  X,
  AlertTriangle,
  BellRing,
  Megaphone,
  Archive,
  Phone,
  ShieldAlert,
  Clock,
  MapPin,
  UserRound,
  CheckCircle2,
  FileText,
  Eye,
  Send,
  Trash2,
  RotateCcw,
} from "lucide-react";

/* ================= TYPES ================= */

type UpdateType =
  | "Critical"
  | "Warning"
  | "Announcement"
  | "Update";

type DisasterUpdate = {
  id: string;
  type: UpdateType;
  title: string;
  description: string;
  source: string;
  date: string;
  time: string;
  location: string;
  publishedBy: string;
  instructions: string;
  archived: boolean;
};

/* ================= SAMPLE DATA ================= */

const initialUpdates: DisasterUpdate[] = [
  {
    id: "DU-101",
    type: "Critical",
    title: "Flood warning upgraded for North Ward",
    description:
      "Water levels expected to rise another 0.5m by 18:00. Begin priority evacuation procedures.",
    source: "National Disaster Authority",
    date: "22 Jun",
    time: "13:15",
    location: "North Ward",
    publishedBy: "National Disaster Authority",
    instructions:
      "Residents in low-lying areas must move to designated safe shelters immediately. Follow evacuation routes and listen to emergency personnel.",
    archived: false,
  },
  {
    id: "DU-102",
    type: "Warning",
    title: "Station Road access restricted",
    description:
      "The eastern approach to Riverton Central is closed. Use Lake Road entrance.",
    source: "Municipal Operations",
    date: "22 Jun",
    time: "12:40",
    location: "Riverton Central",
    publishedBy: "Municipal Operations",
    instructions:
      "Avoid Station Road. Emergency vehicles should use Lake Road entrance until further notice.",
    archived: false,
  },
  {
    id: "DU-103",
    type: "Update",
    title: "New clean water distribution point",
    description:
      "A verified distribution point is operational at Central Market from 14:00.",
    source: "CareLink Coordination",
    date: "22 Jun",
    time: "11:30",
    location: "Central Market",
    publishedBy: "CareLink Coordination",
    instructions:
      "Residents can collect clean drinking water at the Central Market distribution point. Bring personal water containers.",
    archived: false,
  },
  {
    id: "DU-104",
    type: "Update",
    title: "Weather outlook for the next 24 hours",
    description:
      "Heavy rainfall is expected to reduce after midnight. Continue monitoring official alerts.",
    source: "Meteorological Service",
    date: "22 Jun",
    time: "09:00",
    location: "Greater Riverton",
    publishedBy: "Meteorological Service",
    instructions:
      "Continue monitoring official weather announcements. Avoid unnecessary travel during heavy rainfall.",
    archived: false,
  },
  {
    id: "DU-105",
    type: "Announcement",
    title: "Emergency medical support available",
    description:
      "Additional medical support teams are available at North Community Hall.",
    source: "CareLink Coordination",
    date: "22 Jun",
    time: "08:30",
    location: "North Community",
    publishedBy: "CareLink Coordination",
    instructions:
      "Residents requiring urgent medical assistance should contact the emergency medical team at North Community Hall.",
    archived: false,
  },
];

const emergencyContacts = [
  { name: "Disaster Management Centre", number: "117" },
  { name: "Emergency Medical", number: "1990" },
  { name: "Police Emergency", number: "119" },
  { name: "CareLink Coordination", number: "011 234 8800" },
];

/* ================= MAIN COMPONENT ================= */

export default function DisasterUpdatesPage() {
  const [updates, setUpdates] =
    useState<DisasterUpdate[]>(initialUpdates);

  const [activeTab, setActiveTab] = useState("All updates");
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);

  const [selectedUpdate, setSelectedUpdate] =
    useState<DisasterUpdate | null>(null);

  const [notification, setNotification] = useState("");

  const [drafts, setDrafts] = useState<DisasterUpdate[]>([]);

  const [newUpdate, setNewUpdate] = useState({
    title: "",
    type: "Announcement" as UpdateType,
    description: "",
    location: "Greater Riverton",
    source: "CareLink Coordination",
    instructions: "",
  });

  /* ================= FILTER COUNTS ================= */

  const activeUpdates = updates.filter((item) => !item.archived);
  const archivedUpdates = updates.filter((item) => item.archived);

  const criticalCount = activeUpdates.filter(
    (item) => item.type === "Critical"
  ).length;

  const warningCount = activeUpdates.filter(
    (item) => item.type === "Warning"
  ).length;

  const announcementCount = activeUpdates.filter(
    (item) => item.type === "Announcement"
  ).length;

  /* ================= FILTER UPDATES ================= */

  const filteredUpdates = useMemo(() => {
    let result = updates.filter((item) =>
      showArchive ? item.archived : !item.archived
    );

    if (!showArchive) {
      if (activeTab === "Critical") {
        result = result.filter((item) => item.type === "Critical");
      } else if (activeTab === "Warnings") {
        result = result.filter((item) => item.type === "Warning");
      } else if (activeTab === "Announcements") {
        result = result.filter(
          (item) => item.type === "Announcement"
        );
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

  const handleCreateAnnouncement = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const nextId =
      Math.max(
        0,
        ...updates.map(
          (item) => Number(item.id.replace("DU-", "")) || 0
        )
      ) + 1;

    const announcement: DisasterUpdate = {
      id: `DU-${String(nextId).padStart(3, "0")}`,
      type: newUpdate.type,
      title: newUpdate.title.trim(),
      description: newUpdate.description.trim(),
      source: newUpdate.source,
      date: "22 Jun",
      time: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      location: newUpdate.location,
      publishedBy: "Sanjana A.",
      instructions:
        newUpdate.instructions.trim() ||
        newUpdate.description.trim(),
      archived: false,
    };

    setUpdates((prev) => [announcement, ...prev]);

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

    setNotification("Announcement published successfully.");
  };

  /* ================= SAVE DRAFT ================= */

  const saveDraft = () => {
    if (!newUpdate.title.trim()) {
      setNotification("Enter an announcement title first.");
      return;
    }

    const draft: DisasterUpdate = {
      id: `DRAFT-${Date.now()}`,
      type: newUpdate.type,
      title: newUpdate.title.trim(),
      description: newUpdate.description.trim(),
      source: newUpdate.source,
      date: "22 Jun",
      time: "--:--",
      location: newUpdate.location,
      publishedBy: "Sanjana A.",
      instructions: newUpdate.instructions,
      archived: false,
    };

    setDrafts((prev) => [...prev, draft]);
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
  };

  /* ================= ARCHIVE / RESTORE ================= */

  const toggleArchive = (id: string) => {
    setUpdates((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, archived: !item.archived }
          : item
      )
    );

    setSelectedUpdate(null);
    setNotification("Update archive status changed.");
  };

  /* ================= PUBLISH DRAFT ================= */

  const publishDraft = (draft: DisasterUpdate) => {
    const published: DisasterUpdate = {
      ...draft,
      id: `DU-${String(
        Math.max(
          0,
          ...updates.map(
            (item) =>
              Number(item.id.replace("DU-", "")) || 0
          )
        ) + 1
      ).padStart(3, "0")}`,
      date: "22 Jun",
      time: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setUpdates((prev) => [published, ...prev]);
    setDrafts((prev) => prev.filter((item) => item.id !== draft.id));
    setShowDrafts(false);
    setNotification("Draft published successfully.");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-4 pb-8">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[8px] mb-6">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="text-slate-400">
            Shelter Administration
          </span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="font-semibold">Disaster Updates</span>
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

          <div>
            <h1 className="text-[21px] font-normal">
              Disaster Updates
            </h1>

            <p className="text-[9px] text-slate-500 mt-1.5">
              Publish and monitor verified disaster alerts, safety guidance, and announcements.
            </p>
          </div>

          <div className="flex gap-2">

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

        {/* CRITICAL ALERT BANNER */}

        {!showArchive && (
          <section className="bg-[#fff7f7] border border-[#ffb8be] border-l-[3px] border-l-[#ef4755] rounded-lg p-3 flex items-center gap-3 mb-3">

            <div className="w-9 h-9 bg-[#ffebed] text-[#ef4755] rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>

            <div className="flex-1 min-w-0">

              <span className="inline-flex bg-[#fdebed] text-[#d83d4b] rounded px-2 py-1 text-[7px] font-bold mb-1">
                CRITICAL ALERT
              </span>

              <h2 className="text-[11px] font-semibold">
                Immediate evacuation order - Riverside North
              </h2>

              <p className="text-[8px] text-slate-500 mt-1">
                Residents in low-lying zones N2 and N3 must move to assigned shelters before 16:00.
              </p>

              <p className="text-[7px] text-slate-400 mt-2">
                Published by National Disaster Authority · 22 Jun, 13:28
              </p>
            </div>

            <button
              onClick={() => {
                const critical = activeUpdates.find(
                  (item) => item.type === "Critical"
                );

                if (critical) setSelectedUpdate(critical);
                else setNotification("No active critical alert found.");
              }}
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
                          : activeUpdates.length;

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
                      <span className="ml-1 opacity-70">
                        {count}
                      </span>
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

            <div className="space-y-2">

              {filteredUpdates.map((item) => (
                <UpdateCard
                  key={item.id}
                  update={item}
                  onClick={() => setSelectedUpdate(item)}
                />
              ))}

              {filteredUpdates.length === 0 && (
                <div className="bg-white border border-[#d5e3e9] rounded-lg py-14 text-center">
                  <BellRing
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="text-xs font-semibold mt-3">
                    No updates found
                  </p>

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

              <h2 className="text-[10px] font-semibold mb-3">
                Update summary
              </h2>

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
          <form
            onSubmit={handleCreateAnnouncement}
            className="space-y-4"
          >

            <FormInput
              label="Announcement title"
              placeholder="Enter announcement title"
              value={newUpdate.title}
              onChange={(v) =>
                setNewUpdate({ ...newUpdate, title: v })
              }
            />

            <FormSelect
              label="Update type"
              value={newUpdate.type}
              options={[
                "Critical",
                "Warning",
                "Announcement",
                "Update",
              ]}
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
              onChange={(v) =>
                setNewUpdate({ ...newUpdate, location: v })
              }
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
              onChange={(v) =>
                setNewUpdate({ ...newUpdate, source: v })
              }
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
                onClick={() => setShowCreateModal(false)}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveDraft}
                className="flex-1 h-10 border border-[#aac4d2] rounded-lg text-xs font-semibold"
              >
                Save draft
              </button>

              <button
                type="submit"
                className="flex-1 h-10 bg-[#1c638a] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Send size={13} />
                Publish
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
              <h2 className="text-lg font-semibold">
                Update details
              </h2>

              <button onClick={() => setSelectedUpdate(null)}>
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
              <h3 className="text-xs font-semibold mb-2">
                Update description
              </h3>

              <p className="bg-[#f5f9fa] rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
                {selectedUpdate.description}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-semibold mb-2">
                Safety instructions
              </h3>

              <p className="bg-[#fff8ed] border border-[#f5dfb9] rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
                {selectedUpdate.instructions}
              </p>
            </div>

            <div className="mt-7 space-y-2">

              <button
                onClick={() => {
                  toggleArchive(selectedUpdate.id);
                }}
                className="w-full h-10 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-50"
              >
                {selectedUpdate.archived ? (
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
                className="w-full h-10 bg-[#1c638a] text-white rounded-lg text-xs font-semibold"
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
                <FileText
                  size={28}
                  className="mx-auto text-slate-300"
                />
                <p className="text-xs font-semibold mt-3">
                  No saved drafts
                </p>
              </div>
            )}

            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="border border-slate-200 rounded-lg p-3"
              >
                <h3 className="text-xs font-semibold">
                  {draft.title}
                </h3>

                <p className="text-[9px] text-slate-500 mt-1">
                  {draft.description}
                </p>

                <div className="flex items-center gap-2 mt-3">

                  <button
                    onClick={() => publishDraft(draft)}
                    className="flex-1 bg-[#1c638a] text-white rounded-md py-2 text-[9px] font-semibold"
                  >
                    Publish
                  </button>

                  <button
                    onClick={() => {
                      setDrafts((prev) =>
                        prev.filter((item) => item.id !== draft.id)
                      );
                      setNotification("Draft deleted.");
                    }}
                    className="px-3 border border-slate-200 rounded-md text-slate-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* NOTIFICATION */}

      {notification && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">

          <CheckCircle2 size={16} />

          <p className="text-xs">{notification}</p>

          <button onClick={() => setNotification("")}>
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

      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${iconStyles[update.type]}`}>
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

        <p className="text-[8px] text-slate-500 mt-1 leading-relaxed">
          {update.description}
        </p>

        <p className="text-[7px] text-slate-400 mt-2">
          Source: {update.source}
        </p>
      </div>

      <ChevronRight
        size={14}
        className="text-slate-400 shrink-0"
      />
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
    <span className={`inline-flex px-2 py-1 rounded text-[7px] font-semibold whitespace-nowrap ${styles[type]}`}>
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
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${styles[color]}`}>
          {icon}
        </div>

        <span className="text-[8px] text-slate-600">
          {label}
        </span>
      </div>

      <span className="text-[9px] font-semibold">
        {value}
      </span>
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
      <label className="block text-xs font-medium mb-1.5">
        {label}
      </label>

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
      <label className="block text-xs font-medium mb-1.5">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#45b99b]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
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
      <label className="block text-xs font-medium mb-1.5">
        {label}
      </label>

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
            <p className="text-[10px] text-slate-400 mt-1">
              {subtitle}
            </p>
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
        <p className="text-xs font-semibold mt-1 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
