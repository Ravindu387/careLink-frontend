
import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Search,
  Globe,
  Bell,
  CircleHelp,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Home,
  BedDouble,
  Check,
  Clock,
  Building2,
  Settings2,
  Trash2,
  Users,
  Save,
  CheckCircle2,
} from "lucide-react";

/* ================= TYPES ================= */

type BedStatus =
  | "Available"
  | "Occupied"
  | "Reserved"
  | "Unavailable";

type Room = {
  id: string;
  name: string;
  shelter: string;
  floor: string;
  type: string;
  beds: {
    id: string;
    status: BedStatus;
    resident?: string;
  }[];
};

/* ================= SAMPLE DATA ================= */

const initialRooms: Room[] = [
  {
    id: "RM-001",
    name: "Room A-01",
    shelter: "Riverton Central School",
    floor: "Ground floor",
    type: "Family Room",
    beds: [
      { id: "B-01", status: "Occupied", resident: "Nimali Perera" },
      { id: "B-02", status: "Occupied", resident: "Saman Perera" },
      { id: "B-03", status: "Available" },
      { id: "B-04", status: "Reserved" },
    ],
  },
  {
    id: "RM-002",
    name: "Room A-02",
    shelter: "Riverton Central School",
    floor: "Ground floor",
    type: "Accessible Room",
    beds: [
      { id: "B-01", status: "Occupied", resident: "Fathima Rizna" },
      { id: "B-02", status: "Available" },
      { id: "B-03", status: "Available" },
    ],
  },
  {
    id: "RM-003",
    name: "Room B-07",
    shelter: "Riverton Central School",
    floor: "First floor",
    type: "Shared Dormitory",
    beds: [
      { id: "B-01", status: "Occupied" },
      { id: "B-02", status: "Occupied" },
      { id: "B-03", status: "Occupied" },
      { id: "B-04", status: "Available" },
      { id: "B-05", status: "Reserved" },
      { id: "B-06", status: "Available" },
    ],
  },
  {
    id: "RM-004",
    name: "Room C-11",
    shelter: "North Community Hall",
    floor: "First floor",
    type: "Women & Children",
    beds: [
      { id: "B-01", status: "Occupied" },
      { id: "B-02", status: "Unavailable" },
      { id: "B-03", status: "Available" },
      { id: "B-04", status: "Available" },
    ],
  },
];

const shelters = [
  "Riverton Central School",
  "North Community Hall",
  "St. Mary Civic Centre",
  "Lakeside Sports Hall",
];

const floors = [
  "Ground floor",
  "First floor",
  "Second floor",
];

const roomTypes = [
  "Family Room",
  "Accessible Room",
  "Shared Dormitory",
  "Women & Children",
  "General Room",
];

const bedStatuses: BedStatus[] = [
  "Available",
  "Occupied",
  "Reserved",
  "Unavailable",
];

/* ================= MAIN COMPONENT ================= */

export default function RoomBedManagementPage() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const [selectedShelter, setSelectedShelter] =
    useState("Riverton Central School");

  const [selectedFloor, setSelectedFloor] =
    useState("All floors");

  const [selectedType, setSelectedType] =
    useState("All room types");

  const [search, setSearch] = useState("");

  const [roomModal, setRoomModal] = useState(false);
  const [bedModal, setBedModal] = useState(false);
  const [manageModal, setManageModal] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [selectedBed, setSelectedBed] = useState<{
    roomId: string;
    bedId: string;
  } | null>(null);

  const [successMessage, setSuccessMessage] = useState("");

  const [newRoom, setNewRoom] = useState({
    name: "",
    shelter: "Riverton Central School",
    floor: "Ground floor",
    type: "Family Room",
    bedCount: "4",
  });

  const [newBed, setNewBed] = useState({
    roomId: "RM-001",
    count: "2",
  });

  /* ================= SUMMARY ================= */

  const totalRooms = rooms.length;

  const allBeds = rooms.flatMap((room) => room.beds);

  const totalBeds = allBeds.length;

  const availableBeds = allBeds.filter(
    (bed) => bed.status === "Available"
  ).length;

  const reservedBeds = allBeds.filter(
    (bed) => bed.status === "Reserved"
  ).length;

  const unavailableBeds = allBeds.filter(
    (bed) => bed.status === "Unavailable"
  ).length;

  const occupiedBeds = allBeds.filter(
    (bed) => bed.status === "Occupied"
  ).length;

  /* ================= FILTERING ================= */

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesShelter =
        selectedShelter === "All shelters" ||
        room.shelter === selectedShelter;

      const matchesFloor =
        selectedFloor === "All floors" ||
        room.floor === selectedFloor;

      const matchesType =
        selectedType === "All room types" ||
        room.type === selectedType;

      const matchesSearch =
        room.name.toLowerCase().includes(search.toLowerCase()) ||
        room.shelter.toLowerCase().includes(search.toLowerCase()) ||
        room.id.toLowerCase().includes(search.toLowerCase());

      return (
        matchesShelter &&
        matchesFloor &&
        matchesType &&
        matchesSearch
      );
    });
  }, [
    rooms,
    selectedShelter,
    selectedFloor,
    selectedType,
    search,
  ]);

  /* ================= BED STATUS UPDATE ================= */

  const updateBedStatus = (
    roomId: string,
    bedId: string,
    status: BedStatus
  ) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              beds: room.beds.map((bed) =>
                bed.id === bedId
                  ? {
                      ...bed,
                      status,
                      resident:
                        status === "Occupied"
                          ? bed.resident || "New resident"
                          : undefined,
                    }
                  : bed
              ),
            }
          : room
      )
    );

    setSelectedBed(null);
    setSuccessMessage(`${bedId} updated to ${status}.`);

    setSelectedRoom((prev) => {
      if (!prev || prev.id !== roomId) return prev;

      return {
        ...prev,
        beds: prev.beds.map((bed) =>
          bed.id === bedId
            ? {
                ...bed,
                status,
                resident:
                  status === "Occupied"
                    ? bed.resident || "New resident"
                    : undefined,
              }
            : bed
        ),
      };
    });
  };

  /* ================= ADD ROOM ================= */

  const handleAddRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const count = Number(newRoom.bedCount);

    if (!newRoom.name.trim() || count < 1 || count > 100) return;

    const room: Room = {
      id: `RM-${Date.now().toString().slice(-5)}`,
      name: newRoom.name,
      shelter: newRoom.shelter,
      floor: newRoom.floor,
      type: newRoom.type,
      beds: Array.from({ length: count }, (_, index) => ({
        id: `B-${String(index + 1).padStart(2, "0")}`,
        status: "Available" as BedStatus,
      })),
    };

    setRooms((prev) => [...prev, room]);

    setSelectedShelter("All shelters");
    setSelectedFloor("All floors");
    setSelectedType("All room types");
    setSearch("");

    setNewRoom({
      name: "",
      shelter: "Riverton Central School",
      floor: "Ground floor",
      type: "Family Room",
      bedCount: "4",
    });

    setRoomModal(false);
    setSuccessMessage("New room added successfully.");
  };

  /* ================= ADD BEDS ================= */

  const handleAddBeds = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const count = Number(newBed.count);

    if (count < 1 || count > 100) return;

    const room = rooms.find((r) => r.id === newBed.roomId);
    if (!room) return;

    const existingNumbers = room.beds
      .map((bed) => Number(bed.id.split("-")[1]))
      .filter(Number.isFinite);

    const lastNumber = Math.max(0, ...existingNumbers);

    setRooms((prev) =>
      prev.map((r) =>
        r.id === newBed.roomId
          ? {
              ...r,
              beds: [
                ...r.beds,
                ...Array.from({ length: count }, (_, index) => ({
                  id: `B-${String(lastNumber + index + 1).padStart(2, "0")}`,
                  status: "Available" as BedStatus,
                })),
              ],
            }
          : r
      )
    );

    setBedModal(false);
    setNewBed({ roomId: "RM-001", count: "2" });
    setSuccessMessage(`${count} new beds added successfully.`);
  };

  /* ================= MANAGE ROOM ================= */

  const openManageRoom = (room: Room) => {
    setSelectedRoom(room);
    setManageModal(true);
  };

  const deleteRoom = () => {
    if (!selectedRoom) return;

    if (
      selectedRoom.beds.some(
        (bed) => bed.status === "Occupied" || bed.status === "Reserved"
      )
    ) {
      setSuccessMessage(
        "Cannot delete a room containing occupied or reserved beds."
      );
      return;
    }

    setRooms((prev) =>
      prev.filter((room) => room.id !== selectedRoom.id)
    );

    setManageModal(false);
    setSelectedRoom(null);
    setSuccessMessage("Room deleted successfully.");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60] font-sans">

      {/* ================= MAIN CONTENT ================= */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-7">
          <span className="text-slate-400">CareLink</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="text-slate-400">Shelter Administration</span>
          <ChevronRight size={11} className="text-slate-400" />
          <span className="font-semibold">Room & Bed Management</span>
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

          <div>
            <h1 className="text-[23px] md:text-[25px] font-normal">
              Room & Bed Management
            </h1>

            <p className="text-[11px] text-slate-500 mt-2">
              Visually manage rooms, beds, reservations, and safe accommodation assignments.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={() => setRoomModal(true)}
              className="h-9 px-4 border border-[#aac4d2] bg-white rounded-lg text-[10px] font-semibold hover:bg-slate-50"
            >
              Add room
            </button>

            <button
              onClick={() => setBedModal(true)}
              className="h-9 px-4 bg-[#1c638a] text-white rounded-lg text-[10px] font-semibold flex items-center gap-2 hover:bg-[#144665]"
            >
              <Plus size={14} />
              Add beds
            </button>
          </div>
        </div>

        {/* ================= KPI CARDS ================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">

          <KpiCard
            icon={<Home size={19} />}
            color="blue"
            title="Rooms"
            value={totalRooms.toString()}
            description="Currently registered"
          />

          <KpiCard
            icon={<BedDouble size={19} />}
            color="blue"
            title="Total beds"
            value={totalBeds.toLocaleString()}
            description="Across registered rooms"
          />

          <KpiCard
            icon={<Check size={19} />}
            color="green"
            title="Available beds"
            value={availableBeds.toString()}
            description="Safe to assign"
          />

          <KpiCard
            icon={<Clock size={19} />}
            color="orange"
            title="Reserved / unavailable"
            value={(reservedBeds + unavailableBeds).toString()}
            description={`${reservedBeds} reserved · ${unavailableBeds} unavailable`}
          />
        </section>

        {/* ================= FILTERS + LEGEND ================= */}

        <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-3">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

            <FilterSelect
              value={selectedShelter}
              options={["All shelters", ...shelters]}
              onChange={setSelectedShelter}
            />

            <FilterSelect
              value={selectedFloor}
              options={["All floors", ...floors]}
              onChange={setSelectedFloor}
            />

            <FilterSelect
              value={selectedType}
              options={["All room types", ...roomTypes]}
              onChange={setSelectedType}
            />
          </div>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 px-1">

            {bedStatuses.map((status) => (
              <LegendItem key={status} status={status} />
            ))}
          </div>
        </section>

        {/* ================= ROOM GRID ================= */}

        {filteredRooms.length > 0 ? (
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">

            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onManage={() => openManageRoom(room)}
                onBedClick={(bedId) =>
                  setSelectedBed({ roomId: room.id, bedId })
                }
              />
            ))}
          </section>
        ) : (
          <div className="bg-white border border-[#d5e3e9] rounded-xl py-16 text-center">
            <Building2 size={30} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-semibold mt-3">
              No rooms found
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Try changing your filters or add a new room.
            </p>
            <button
              onClick={() => setRoomModal(true)}
              className="mt-4 px-4 py-2 bg-[#1c638a] text-white rounded-lg text-xs"
            >
              Add room
            </button>
          </div>
        )}

        {/* ================= OCCUPANCY SUMMARY ================= */}

        <section className="mt-4 bg-white border border-[#d5e3e9] rounded-xl p-4">

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold">
              Overall bed distribution
            </h3>
            <span className="text-[9px] text-slate-400">
              {totalBeds} total beds
            </span>
          </div>

          <div className="h-3 rounded-full overflow-hidden flex bg-slate-100">

            {totalBeds > 0 && (
              <>
                <div
                  className="bg-[#e96772]"
                  style={{ width: `${(occupiedBeds / totalBeds) * 100}%` }}
                />
                <div
                  className="bg-[#50bda1]"
                  style={{ width: `${(availableBeds / totalBeds) * 100}%` }}
                />
                <div
                  className="bg-[#f3b947]"
                  style={{ width: `${(reservedBeds / totalBeds) * 100}%` }}
                />
                <div
                  className="bg-[#aab5bf]"
                  style={{ width: `${(unavailableBeds / totalBeds) * 100}%` }}
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">

            <SummaryItem
              color="bg-[#e96772]"
              label="Occupied"
              value={occupiedBeds}
            />

            <SummaryItem
              color="bg-[#50bda1]"
              label="Available"
              value={availableBeds}
            />

            <SummaryItem
              color="bg-[#f3b947]"
              label="Reserved"
              value={reservedBeds}
            />

            <SummaryItem
              color="bg-[#aab5bf]"
              label="Unavailable"
              value={unavailableBeds}
            />
          </div>
        </section>
      </main>

      {/* ================= ADD ROOM MODAL ================= */}

      {roomModal && (
        <Modal
          title="Add new room"
          subtitle="Register a room in a shelter facility."
          onClose={() => setRoomModal(false)}
        >
          <form onSubmit={handleAddRoom} className="space-y-4">

            <FormInput
              label="Room name / number"
              placeholder="Example: Room A-03"
              value={newRoom.name}
              onChange={(v) =>
                setNewRoom({ ...newRoom, name: v })
              }
            />

            <FormSelect
              label="Shelter"
              value={newRoom.shelter}
              options={shelters.map((s) => ({
                value: s,
                label: s,
              }))}
              onChange={(v) =>
                setNewRoom({ ...newRoom, shelter: v })
              }
            />

            <FormSelect
              label="Floor"
              value={newRoom.floor}
              options={floors.map((f) => ({
                value: f,
                label: f,
              }))}
              onChange={(v) =>
                setNewRoom({ ...newRoom, floor: v })
              }
            />

            <FormSelect
              label="Room type"
              value={newRoom.type}
              options={roomTypes.map((t) => ({
                value: t,
                label: t,
              }))}
              onChange={(v) =>
                setNewRoom({ ...newRoom, type: v })
              }
            />

            <FormInput
              label="Initial bed count"
              type="number"
              value={newRoom.bedCount}
              onChange={(v) =>
                setNewRoom({ ...newRoom, bedCount: v })
              }
            />

            <ModalActions
              onCancel={() => setRoomModal(false)}
              submitLabel="Add room"
            />
          </form>
        </Modal>
      )}

      {/* ================= ADD BEDS MODAL ================= */}

      {bedModal && (
        <Modal
          title="Add beds"
          subtitle="Add new beds to an existing room."
          onClose={() => setBedModal(false)}
        >
          <form onSubmit={handleAddBeds} className="space-y-4">

            <FormSelect
              label="Select room"
              value={newBed.roomId}
              options={rooms.map((room) => ({
                value: room.id,
                label: `${room.name} · ${room.shelter}`,
              }))}
              onChange={(v) =>
                setNewBed({ ...newBed, roomId: v })
              }
            />

            <FormInput
              label="Number of beds to add"
              type="number"
              value={newBed.count}
              onChange={(v) =>
                setNewBed({ ...newBed, count: v })
              }
            />

            <ModalActions
              onCancel={() => setBedModal(false)}
              submitLabel="Add beds"
            />
          </form>
        </Modal>
      )}

      {/* ================= MANAGE ROOM MODAL ================= */}

      {manageModal && selectedRoom && (
        <Modal
          title={`Manage ${selectedRoom.name}`}
          subtitle={`${selectedRoom.shelter} · ${selectedRoom.floor}`}
          onClose={() => setManageModal(false)}
        >
          <div className="space-y-3">

            <div className="grid grid-cols-2 gap-3">

              <div className="bg-[#f4f8fa] rounded-lg p-3">
                <p className="text-[9px] text-slate-500">
                  Total beds
                </p>
                <p className="text-xl font-bold">
                  {selectedRoom.beds.length}
                </p>
              </div>

              <div className="bg-[#f4f8fa] rounded-lg p-3">
                <p className="text-[9px] text-slate-500">
                  Available beds
                </p>
                <p className="text-xl font-bold text-[#269a77]">
                  {selectedRoom.beds.filter(
                    (b) => b.status === "Available"
                  ).length}
                </p>
              </div>
            </div>

            <h3 className="text-xs font-semibold pt-2">
              Room beds
            </h3>

            {selectedRoom.beds.map((bed) => (
              <div
                key={bed.id}
                className="flex items-center justify-between border border-slate-100 rounded-lg p-3"
              >
                <div>
                  <p className="text-xs font-semibold">{bed.id}</p>
                  <p className="text-[9px] text-slate-400 mt-1">
                    {bed.resident || "No resident assigned"}
                  </p>
                </div>

                <select
                  value={bed.status}
                  onChange={(e) =>
                    updateBedStatus(
                      selectedRoom.id,
                      bed.id,
                      e.target.value as BedStatus
                    )
                  }
                  className="border border-slate-200 rounded-md px-2 py-1.5 text-[9px] outline-none"
                >
                  {bedStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
            ))}

            <button
              onClick={deleteRoom}
              className="w-full mt-3 border border-red-200 text-red-600 rounded-lg py-2.5 text-xs font-semibold flex justify-center items-center gap-2 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Delete room
            </button>

            <button
              onClick={() => setManageModal(false)}
              className="w-full border border-slate-200 rounded-lg py-2.5 text-xs font-semibold hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* ================= BED STATUS MODAL ================= */}

      {selectedBed && (
        <Modal
          title={`Manage bed ${selectedBed.bedId}`}
          subtitle="Update bed availability and assignment status."
          onClose={() => setSelectedBed(null)}
        >
          <div className="space-y-3">

            {bedStatuses.map((status) => (
              <button
                key={status}
                onClick={() =>
                  updateBedStatus(
                    selectedBed.roomId,
                    selectedBed.bedId,
                    status
                  )
                }
                className="w-full flex items-center justify-between border border-slate-200 rounded-lg p-3 text-xs hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <StatusDot status={status} />
                  {status}
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* ================= SUCCESS MESSAGE ================= */}

      {successMessage && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#123e60] text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">

          <CheckCircle2 size={17} className="shrink-0" />

          <p className="text-xs">{successMessage}</p>

          <button onClick={() => setSuccessMessage("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= ROOM CARD ================= */

function RoomCard({
  room,
  onManage,
  onBedClick,
}: {
  room: Room;
  onManage: () => void;
  onBedClick: (bedId: string) => void;
}) {
  const available = room.beds.filter(
    (b) => b.status === "Available"
  ).length;

  return (
    <article className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">

      {/* ROOM HEADER */}

      <div className="px-3.5 py-3 border-b border-slate-200 flex items-center justify-between gap-3">

        <div className="min-w-0">
          <h3 className="text-[10px] font-bold">{room.name}</h3>

          <p className="text-[8px] text-slate-400 mt-1">
            {room.type} · {room.floor}
          </p>
        </div>

        <span className="px-2 py-1 rounded-md bg-[#e5f8f1] text-[#168d6c] text-[8px] font-semibold whitespace-nowrap">
          {available} available
        </span>
      </div>

      {/* BED GRID */}

      <div className="p-3.5 min-h-[98px]">

        <div className="flex flex-wrap gap-2">

          {room.beds.map((bed) => (
            <button
              key={bed.id}
              onClick={() => onBedClick(bed.id)}
              title={`${bed.id} · ${bed.status}`}
              className={`w-[90px] h-[70px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition hover:scale-[1.03] ${bedStyle(bed.status)}`}
            >
              <BedDouble size={17} strokeWidth={1.8} />

              <span className="text-[8px] font-semibold">
                {bed.id}
              </span>

              <span className="text-[7px]">
                {bed.status}
              </span>
            </button>
          ))}

        </div>
      </div>

      {/* ROOM FOOTER */}

      <div className="px-3.5 py-2.5 border-t border-slate-200 flex justify-between items-center">

        <p className="text-[8px] text-slate-400">
          {room.beds.length} total beds
        </p>

        <button
          onClick={onManage}
          className="text-[8px] text-[#28749b] hover:underline font-medium"
        >
          Manage room
        </button>
      </div>
    </article>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function KpiCard({
  icon,
  color,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  color: "blue" | "green" | "orange";
  title: string;
  value: string;
  description: string;
}) {
  const styles = {
    blue: "bg-[#eaf3f8] text-[#287da7]",
    green: "bg-[#e5f8f1] text-[#37b18d]",
    orange: "bg-[#fff4df] text-[#e2a02d]",
  };

  return (
    <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm p-3.5 flex items-center gap-3 min-h-[77px]">

      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${styles[color]}`}>
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] text-slate-500">{title}</p>
        <h3 className="text-[21px] font-bold leading-tight mt-0.5">
          {value}
        </h3>
        <p className="text-[8px] text-slate-400 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:min-w-[145px] h-9 appearance-none bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-8 text-[9px] outline-none focus:border-[#45b99b] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
}

function bedStyle(status: BedStatus) {
  const styles: Record<BedStatus, string> = {
    Available: "bg-[#e4f6f0] text-[#179b78] hover:bg-[#d4efe5]",
    Occupied: "bg-[#fdebed] text-[#e64d59] hover:bg-[#f9dce0]",
    Reserved: "bg-[#fff4dc] text-[#b47a13] hover:bg-[#ffedc5]",
    Unavailable: "bg-[#edf1f3] text-[#718493] hover:bg-[#e2e9ed]",
  };

  return styles[status];
}

function StatusDot({ status }: { status: BedStatus }) {
  const styles: Record<BedStatus, string> = {
    Available: "bg-[#50bda1]",
    Occupied: "bg-[#e96772]",
    Reserved: "bg-[#f3b947]",
    Unavailable: "bg-[#aab5bf]",
  };

  return (
    <span className={`w-2.5 h-2.5 rounded-sm ${styles[status]}`} />
  );
}

function LegendItem({ status }: { status: BedStatus }) {
  return (
    <div className="flex items-center gap-1.5">
      <StatusDot status={status} />
      <span className="text-[8px] text-slate-500">{status}</span>
    </div>
  );
}

function SummaryItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-sm ${color}`} />
      <span className="text-[9px] text-slate-500">{label}</span>
      <span className="text-[10px] font-bold ml-auto">{value}</span>
    </div>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">
        {label}
      </label>

      <input
        required
        type={type}
        min={type === "number" ? 1 : undefined}
        max={type === "number" ? 100 : undefined}
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
  options: { value: string; label: string }[];
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

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

function ModalActions({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex gap-3 pt-3">

      <button
        type="button"
        onClick={onCancel}
        className="flex-1 border border-slate-200 rounded-lg py-3 text-xs font-semibold hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="flex-1 bg-[#1c638a] text-white rounded-lg py-3 text-xs font-semibold hover:bg-[#144665]"
      >
        {submitLabel}
      </button>
    </div>
  );
}
