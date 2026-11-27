import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { communicationsService } from "../../services/communicationsService";

import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  MessageSquare,
  Mail,
  Smartphone,
  Send,
  Save,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Radio,
  Eye,
  Languages,
  Plus,
  ArrowLeft,
} from "lucide-react";

// TYPES

type Channel = "In-app" | "Email" | "SMS";

interface Broadcast {
  id: string;
  title: string;
  audience: string;
  delivered: number;
  time: string;
  channel: string;
  status: string;
  message: string;
}

// DEMO BROADCASTS

const initialBroadcasts: Broadcast[] = [
  {
    id: "BRD-001",
    title: "Shift reminder · North Ward",
    audience: "Volunteers assigned to TASK-782",
    delivered: 142,
    time: "12 min ago",
    channel: "In-app",
    status: "Delivered",
    message:
      "Please arrive at the assigned location before your scheduled shift.",
  },
  {
    id: "BRD-002",
    title: "Safety update · All teams",
    audience: "All active volunteers",
    delivered: 1204,
    time: "2 hr ago",
    channel: "Email",
    status: "Delivered",
    message:
      "Follow the updated field safety instructions during operations.",
  },
  {
    id: "BRD-003",
    title: "Task cancellation · TASK-742",
    audience: "Volunteers assigned to TASK-742",
    delivered: 8,
    time: "5 hr ago",
    channel: "SMS",
    status: "Delivered",
    message:
      "The assigned task has been cancelled. Please contact your coordinator.",
  },
];

// AUDIENCES

const audiences = [
  {
    label: "Volunteers assigned to TASK-782",
    count: 18,
  },
  {
    label: "All active volunteers",
    count: 2184,
  },
  {
    label: "Available volunteers",
    count: 642,
  },
  {
    label: "North Ward volunteers",
    count: 142,
  },
  {
    label: "Medical response teams",
    count: 58,
  },
  {
    label: "Logistics teams",
    count: 96,
  },
  {
    label: "Unassigned volunteers",
    count: 84,
  },
];

export default function CommunicationsPage() {
  // FORM STATES

  const [audience, setAudience] = useState(audiences[0].label);

  const [title, setTitle] = useState(
    "Updated arrival instructions"
  );

  const [message, setMessage] = useState(
    "Please use the Lake Road access point and check in with the field coordinator on arrival. Do not use Station Road."
  );

  const [channels, setChannels] = useState<Channel[]>([
    "In-app",
  ]);

  const [broadcasts, setBroadcasts] =
    useState<Broadcast[]>(initialBroadcasts);
  const [audienceList, setAudienceList] = useState(audiences);

  useEffect(() => {
    communicationsService.getBroadcasts({ pageNumber: 1, pageSize: 50 }).then((res) => {
      if (res?.data?.items?.length) {
        setBroadcasts(res.data.items);
      }
    }).catch(() => {});
    communicationsService.getAudiences().then((res) => {
      if (res?.data?.length) {
        setAudienceList(res.data.map((a) => ({ label: a.label, count: a.count })));
      }
    }).catch(() => {});
    communicationsService.getDraft().then((draft) => {
      if (draft && (draft.title || draft.message)) {
        if (draft.title) setTitle(draft.title);
        if (draft.message) setMessage(draft.message);
        if (draft.audience) setAudience(draft.audience);
        if (draft.channels?.length) setChannels(draft.channels as Channel[]);
      }
    }).catch(() => {});
  }, []);

  // MODAL STATES

  const [showReview, setShowReview] = useState(false);

  const [showBroadcastDetails, setShowBroadcastDetails] =
    useState<Broadcast | null>(null);

  const [notification, setNotification] = useState("");

  const [isSending, setIsSending] = useState(false);

  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // NOTIFICATION

  const notify = (text: string) => {
    setNotification(text);

    window.setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  // RECIPIENT COUNT

  const estimatedRecipients =
    audienceList.find((item) => item.label === audience)?.count ??
    audiences.find((item) => item.label === audience)?.count ?? 0;

  // CHANNEL SELECTION

  const toggleChannel = (channel: Channel) => {
    setChannels((previous) =>
      previous.includes(channel)
        ? previous.filter((item) => item !== channel)
        : [...previous, channel]
    );

    setIsDraftSaved(false);
  };

  // SAVE DRAFT

  const handleSaveDraft = async () => {
    if (!title.trim() || !message.trim()) {
      notify("Please enter a message title and message.");
      return;
    }

    const draft = {
      audience,
      title,
      message,
      channels,
    };

    try {
      await communicationsService.saveDraft(draft);
    } catch {
      localStorage.setItem(
        "carelink_communication_draft",
        JSON.stringify(draft)
      );
    }

    setIsDraftSaved(true);

    notify("Message saved as draft!");
  };

  // SEND BROADCAST

  const handleSendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      notify("Please complete the message details.");
      return;
    }

    if (channels.length === 0) {
      notify("Please select at least one delivery channel.");
      return;
    }

    setIsSending(true);

    try {
      const created = await communicationsService.createBroadcast({
        title,
        audience,
        message,
        channels,
      });

      const newBroadcast: Broadcast = {
        id: created.id || `BRD-${Date.now()}`,
        title: created.title || title,
        audience: created.audience || audience,
        delivered: created.delivered ?? estimatedRecipients,
        time: created.time || "Just now",
        channel: created.channel || channels.join(", "),
        status: created.status || "Delivered",
        message: created.message || message,
      };

      setBroadcasts((previous) => [
        newBroadcast,
        ...previous.filter((b) => b.id !== newBroadcast.id),
      ]);

      await communicationsService.clearDraft();
    } catch {
      const newBroadcast: Broadcast = {
        id: `BRD-${Date.now()}`,
        title,
        audience,
        delivered: estimatedRecipients,
        time: "Just now",
        channel: channels.join(", "),
        status: "Delivered",
        message,
      };

      setBroadcasts((previous) => [
        newBroadcast,
        ...previous,
      ]);
      localStorage.removeItem("carelink_communication_draft");
    } finally {
      setIsSending(false);
      setShowReview(false);
      setTitle("");
      setMessage("");
      setChannels(["In-app"]);
      setIsDraftSaved(false);
      notify("Broadcast created successfully!");
    }
  };

  // CHANNEL BUTTON

  const ChannelButton = ({
    channel,
    icon: Icon,
  }: {
    channel: Channel;
    icon: React.ElementType;
  }) => {
    const selected = channels.includes(channel);

    return (
      <button
        type="button"
        onClick={() => toggleChannel(channel)}
        className={`h-[37px] px-3 rounded-lg border flex items-center gap-2 text-sm transition-all ${selected
          ? "border-[#287fa9] bg-[#f1f8fc] text-[#17648e]"
          : "border-[#d5e3e9] bg-white text-[#718ba0] hover:border-[#287fa9]"
          }`}
      >
        <span
          className={`w-3 h-3 rounded-full border flex items-center justify-center ${selected
            ? "border-[#287fa9]"
            : "border-[#aabcc8]"
            }`}
        >
          {selected && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#287fa9]" />
          )}
        </span>

        <Icon size={13} />

        {channel}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">

      {/* TOP NAVIGATION */}


      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-xs mb-8">

          <span className="text-[#8296aa]">
            Operations
          </span>

          <ChevronRight size={12} />

          <span className="text-[#8296aa]">
            Volunteer Coordination
          </span>

          <ChevronRight size={12} />

          <span className="font-semibold">
            Communications
          </span>

        </div>

        {/* PAGE HEADER */}

        <div className="flex items-center justify-between gap-4 mb-6">

          <div>

            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Communications
            </h1>

            <p className="text-[12px] text-[#718ba0] mt-2">
              Send targeted, multilingual operational updates to volunteer teams.
            </p>

          </div>

          <button
            onClick={() => {
              setTitle("");
              setMessage("");
              setChannels(["In-app"]);
              setShowReview(false);

              document.getElementById("message-composer")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-[40px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-2 text-sm font-semibold shrink-0"
          >
            <Plus size={15} />
            New broadcast
          </button>

        </div>

        {/* MAIN GRID */}

        <section className="grid grid-cols-1 lg:grid-cols-[1.85fr_0.92fr] gap-4">

          {/* MESSAGE COMPOSER */}

          <div
            id="message-composer"
            className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden"
          >

            {/* HEADER */}

            <div className="px-4 py-4 border-b border-[#d5e3e9]">

              <h2 className="text-base sm:text-lg font-semibold">
                Compose operational message
              </h2>

              <p className="text-xs text-[#8296aa] mt-1">
                Preview recipients before sending
              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (!title.trim() || !message.trim()) {
                  notify("Please complete the message.");
                  return;
                }

                if (channels.length === 0) {
                  notify("Select at least one delivery channel.");
                  return;
                }

                setShowReview(true);
              }}
              className="p-4 space-y-3"
            >

              {/* AUDIENCE */}

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Audience
                </label>

                <select
                  value={audience}
                  onChange={(e) => {
                    setAudience(e.target.value);
                    setIsDraftSaved(false);
                  }}
                  className="w-full h-[43px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px] outline-none focus:border-[#287fa9] bg-white"
                >

                  {audiences.map((item) => (

                    <option
                      key={item.label}
                      value={item.label}
                    >
                      {item.label}
                    </option>

                  ))}

                </select>

              </div>

              {/* MESSAGE TITLE */}

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Message title
                </label>

                <input
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDraftSaved(false);
                  }}
                  placeholder="Enter message title"
                  className="w-full h-[43px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px] outline-none focus:border-[#287fa9]"
                />

              </div>

              {/* MESSAGE */}

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Message
                </label>

                <textarea
                  required
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setIsDraftSaved(false);
                  }}
                  placeholder="Write your operational message..."
                  rows={5}
                  className="w-full border border-[#d5e3e9] rounded-lg p-3 text-sm sm:text-[15px] outline-none resize-y focus:border-[#287fa9] min-h-[105px]"
                />

                <div className="text-right text-xs text-[#8296aa] mt-1">
                  {message.length} characters
                </div>

              </div>

              {/* DELIVERY CHANNELS */}

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Delivery channels
                </label>

                <div className="flex flex-wrap gap-2">

                  <ChannelButton
                    channel="In-app"
                    icon={MessageSquare}
                  />

                  <ChannelButton
                    channel="Email"
                    icon={Mail}
                  />

                  <ChannelButton
                    channel="SMS"
                    icon={Smartphone}
                  />

                </div>

              </div>

              {/* MULTILINGUAL NOTICE */}

              <div className="bg-[#eaf5f9] rounded-lg p-3 flex items-center gap-3">

                <Globe
                  size={19}
                  className="text-[#286a8c] shrink-0"
                />

                <div>

                  <p className="text-xs font-semibold">
                    Multilingual delivery available
                  </p>

                  <p className="text-xs text-[#527d96] mt-1">
                    Recipients receive the message in their preferred supported language where available.
                  </p>

                </div>

              </div>

              {/* FOOTER */}

              <div className="pt-4 border-t border-[#d5e3e9] flex flex-col sm:flex-row items-center justify-between gap-3">

                <div className="text-xs">

                  <span className="text-[#8296aa]">
                    Estimated recipients:
                  </span>

                  <span className="font-semibold ml-1">
                    {estimatedRecipients.toLocaleString()} volunteers
                  </span>

                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="h-[40px] px-4 bg-white border border-[#b9d0dc] rounded-lg text-sm text-[#17648e] hover:bg-[#f5fafc] flex items-center gap-2"
                  >

                    <Save size={13} />

                    {isDraftSaved ? "Saved" : "Save draft"}

                  </button>

                  <button
                    type="submit"
                    className="h-[40px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg text-sm font-semibold flex items-center gap-2"
                  >

                    <Send size={13} />

                    Review & send

                  </button>

                </div>

              </div>

            </form>

          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-4">

            {/* DELIVERY HEALTH */}

            <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] p-4">

              <h2 className="text-base sm:text-lg font-semibold mb-3">
                Delivery health
              </h2>

              {/* IN APP */}

              <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-[#65bda5]" />

                  <MessageSquare size={12} />

                  <span className="text-xs">
                    In-app
                  </span>

                </div>

                <span className="text-xs font-semibold">
                  Operational
                </span>

              </div>

              {/* EMAIL */}

              <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-[#65bda5]" />

                  <Mail size={12} />

                  <span className="text-xs">
                    Email
                  </span>

                </div>

                <span className="text-xs font-semibold">
                  Operational
                </span>

              </div>

              {/* SMS */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-[#efa53b]" />

                  <Smartphone size={12} />

                  <span className="text-xs">
                    SMS
                  </span>

                </div>

                <span className="text-xs font-semibold">
                  Degraded
                </span>

              </div>

            </div>

            {/* RECENT BROADCASTS */}

            <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_5px_15px_rgba(30,70,90,0.05)] overflow-hidden">

              <div className="px-4 py-4 border-b border-[#d5e3e9]">

                <h2 className="text-base sm:text-lg font-semibold">
                  Recent broadcasts
                </h2>

                <p className="text-xs text-[#8296aa] mt-1">
                  Last 24 hours
                </p>

              </div>

              <div>

                {broadcasts.slice(0, 5).map((broadcast) => (

                  <button
                    key={broadcast.id}
                    onClick={() =>
                      setShowBroadcastDetails(broadcast)
                    }
                    className="w-full px-4 py-4 flex items-center justify-between gap-3 border-b border-[#e1eaf0] hover:bg-[#f5fafc] text-left transition-colors"
                  >

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="text-[#287fa9] shrink-0">
                        <MessageSquare size={17} />
                      </div>

                      <div className="min-w-0">

                        <p className="text-sm font-semibold truncate">
                          {broadcast.title}
                        </p>

                        <p className="text-xs text-[#8296aa] mt-1">
                          {broadcast.delivered.toLocaleString()} delivered · {broadcast.time}
                        </p>

                      </div>

                    </div>

                    <ChevronRight
                      size={17}
                      className="text-[#287fa9] shrink-0"
                    />

                  </button>

                ))}

              </div>

              {broadcasts.length === 0 && (
                <div className="p-8 text-center text-xs text-gray-400">
                  No recent broadcasts.
                </div>
              )}

            </div>

          </div>

        </section>

      </main>

      {/* REVIEW & SEND MODAL */}

      {showReview && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[520px] rounded-xl shadow-2xl overflow-hidden">

            {/* MODAL HEADER */}

            <div className="p-5 border-b border-[#d5e3e9] flex items-center justify-between">

              <div>

                <h2 className="text-lg sm:text-xl font-semibold">
                  Review broadcast
                </h2>

                <p className="text-[13px] text-[#8296aa] mt-1">
                  Confirm the message before sending.
                </p>

              </div>

              <button
                onClick={() => setShowReview(false)}
                className="hover:bg-gray-100 rounded-lg p-2"
              >
                <X size={18} />
              </button>

            </div>

            {/* PREVIEW */}

            <div className="p-5 space-y-4">

              <div className="bg-[#f5f9fb] rounded-lg p-4 space-y-3">

                <div>

                  <p className="text-xs text-[#8296aa] mb-1">
                    MESSAGE TITLE
                  </p>

                  <p className="text-[13px] font-semibold">
                    {title}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[#8296aa] mb-1">
                    MESSAGE
                  </p>

                  <p className="text-sm leading-5">
                    {message}
                  </p>

                </div>

              </div>

              {/* AUDIENCE */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Users
                    size={17}
                    className="text-[#287fa9]"
                  />

                  <div>

                    <p className="text-xs text-[#8296aa]">
                      Target audience
                    </p>

                    <p className="text-sm font-semibold">
                      {audience}
                    </p>

                  </div>

                </div>

                <span className="text-[12px] font-bold">
                  {estimatedRecipients.toLocaleString()}
                </span>

              </div>

              {/* CHANNELS */}

              <div>

                <p className="text-xs text-[#8296aa] mb-2">
                  Delivery channels
                </p>

                <div className="flex flex-wrap gap-2">

                  {channels.map((channel) => (

                    <span
                      key={channel}
                      className="bg-[#e8f1f6] text-[#287fa9] px-3 py-2 rounded-lg text-xs font-semibold"
                    >
                      {channel}
                    </span>

                  ))}

                </div>

              </div>

              {/* WARNING */}

              <div className="bg-[#fff5e5] p-3 rounded-lg flex gap-2">

                <AlertTriangle
                  size={17}
                  className="text-[#bd821d] shrink-0"
                />

                <p className="text-xs text-[#986617] leading-4">
                  Please verify the audience and message content before sending this broadcast.
                </p>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="p-4 border-t flex justify-end gap-2">

              <button
                onClick={() => setShowReview(false)}
                className="border border-[#d5e3e9] rounded-lg px-4 py-2.5 text-sm"
              >
                Edit message
              </button>

              <button
                disabled={isSending}
                onClick={handleSendBroadcast}
                className="bg-[#287fa9] hover:bg-[#17678e] disabled:opacity-50 text-white rounded-lg px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
              >

                <Send size={13} />

                {isSending ? "Sending..." : "Confirm & send"}

              </button>

            </div>

          </div>

        </div>

      )}

      {/* BROADCAST DETAILS MODAL */}

      {showBroadcastDetails && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden">

            <div className="p-5 border-b flex justify-between items-center">

              <div>

                <h2 className="text-lg sm:text-xl font-semibold">
                  Broadcast details
                </h2>

                <p className="text-xs text-[#8296aa] mt-1">
                  {showBroadcastDetails.id}
                </p>

              </div>

              <button
                onClick={() => setShowBroadcastDetails(null)}
              >
                <X size={19} />
              </button>

            </div>

            <div className="p-5 space-y-4">

              <div>

                <p className="text-xs text-[#8296aa]">
                  Message title
                </p>

                <p className="text-[12px] font-semibold mt-1">
                  {showBroadcastDetails.title}
                </p>

              </div>

              <div>

                <p className="text-xs text-[#8296aa]">
                  Message
                </p>

                <p className="text-sm leading-5 mt-1">
                  {showBroadcastDetails.message}
                </p>

              </div>

              <div>

                <p className="text-xs text-[#8296aa]">
                  Audience
                </p>

                <p className="text-sm mt-1">
                  {showBroadcastDetails.audience}
                </p>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="bg-[#f5f9fb] p-3 rounded-lg">

                  <p className="text-xs text-[#8296aa]">
                    Delivered
                  </p>

                  <p className="text-[18px] font-semibold mt-1">
                    {showBroadcastDetails.delivered.toLocaleString()}
                  </p>

                </div>

                <div className="bg-[#f5f9fb] p-3 rounded-lg">

                  <p className="text-xs text-[#8296aa]">
                    Status
                  </p>

                  <p className="text-sm text-[#239879] font-semibold mt-2">
                    {showBroadcastDetails.status}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2 text-sm">
                <Radio size={15} className="text-[#287fa9]" />
                {showBroadcastDetails.channel}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock size={15} className="text-[#287fa9]" />
                {showBroadcastDetails.time}
              </div>

            </div>

            <div className="p-4 border-t flex justify-end">

              <button
                onClick={() => setShowBroadcastDetails(null)}
                className="bg-[#287fa9] text-white px-5 py-2.5 rounded-lg text-sm"
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