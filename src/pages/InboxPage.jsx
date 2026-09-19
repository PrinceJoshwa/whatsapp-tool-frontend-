import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import api, { apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ConversationList from "@/components/inbox/ConversationList";
import ChatThread from "@/components/inbox/ChatThread";
import ContactDetailsPanel from "@/components/inbox/ContactDetailsPanel";

const SIMULATIONS = [
  { name: "Aarav Sharma", phone: "919812345001", type: "text", text: "Hi, my order #4821 hasn't arrived yet. Can you check the status?" },
  { name: "Priya Nair", phone: "919812345002", type: "image", media_url: "https://picsum.photos/seed/slash-img/640/420", caption: "This is how the parcel arrived — box is damaged" },
  { name: "Rohan Mehta", phone: "919812345003", type: "audio", media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Sara Iyer", phone: "919812345004", type: "document", media_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", filename: "invoice-march.pdf", caption: "Attaching the invoice you asked for" },
  { name: "Vikram Rao", phone: "919812345005", type: "video", media_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", caption: "Recording of the defect" },
  { name: "Aarav Sharma", phone: "919812345001", type: "text", text: "Any update on this? It's been 3 days." },
];

export default function InboxPage() {
  const { tenant } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [simBusy, setSimBusy] = useState(false);
  const selectedIdRef = useRef(null);
  selectedIdRef.current = selectedId;

  const fetchConversations = useCallback(async () => {
    try {
      const params = {};
      if (status !== "all") params.status = status;
      if (search) params.search = search;
      const res = await api.get("/conversations", { params });
      setConversations(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [status, search]);

  const fetchMessages = useCallback(async (cid) => {
    if (!cid) return;
    try {
      const res = await api.get(`/conversations/${cid}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    api.get("/team").then((res) => setMembers(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchConversations();
    const t = setInterval(() => {
      fetchConversations();
      if (selectedIdRef.current) fetchMessages(selectedIdRef.current);
    }, 5000);
    return () => clearInterval(t);
  }, [fetchConversations, fetchMessages]);

  const selectConversation = (cid) => {
    setSelectedId(cid);
    setMessages([]);
    fetchMessages(cid).then(fetchConversations);
  };

  const selected = conversations.find((c) => c.id === selectedId) || null;

  const patchConversation = async (patch) => {
    if (!selectedId) return;
    try {
      await api.patch(`/conversations/${selectedId}`, patch);
      await fetchConversations();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const addNote = async (body) => {
    try {
      const res = await api.post(`/conversations/${selectedId}/notes`, { body });
      setMessages((m) => [...m, res.data]);
      toast.success("Internal note added");
    } catch (e) {
      toast.error(apiError(e));
      throw e;
    }
  };

  const sendReply = async (text) => {
    try {
      const res = await api.post(`/conversations/${selectedId}/send`, { text });
      setMessages((m) => [...m, res.data]);
      fetchConversations();
    } catch (e) {
      toast.error(apiError(e));
      throw e;
    }
  };

  const sendFile = async (file, caption) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("caption", caption || "");
      const res = await api.post(`/conversations/${selectedId}/send-file`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setMessages((m) => [...m, res.data]);
      fetchConversations();
      toast.success("Attachment sent");
    } catch (e) {
      toast.error(apiError(e));
      throw e;
    }
  };

  const sendLink = async (url, caption) => {
    try {
      const res = await api.post(`/conversations/${selectedId}/send-link`, { url, caption });
      setMessages((m) => [...m, res.data]);
      fetchConversations();
      toast.success("Link attachment sent");
    } catch (e) {
      toast.error(apiError(e));
      throw e;
    }
  };

  const simulate = async () => {
    if (!tenant?.id) return;
    setSimBusy(true);
    try {
      const payload = SIMULATIONS[Math.floor(Math.random() * SIMULATIONS.length)];
      await api.post(`/webhook/inbound/${tenant.id}`, { ...payload, message_id: `sim_${Date.now()}` });
      await fetchConversations();
      if (selectedIdRef.current) fetchMessages(selectedIdRef.current);
      toast.success(`Inbound ${payload.type} message received from ${payload.name}`);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSimBusy(false);
    }
  };

  return (
    <div className="h-full flex" data-testid="inbox-page">
      <div className={`${selectedId ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-[#1E2A32] bg-[#0E1317]/60 flex-col`}>
        <div className="p-3 border-b border-[#1E2A32] flex items-center justify-between gap-2">
          <h1 className="text-base font-bold tracking-tight text-slate-100">Team Inbox</h1>
          <button
            data-testid="simulate-webhook-button"
            onClick={simulate}
            disabled={simBusy}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-colors duration-150 disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5" />
            {simBusy ? "Sending…" : "Simulate inbound"}
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          activeId={selectedId}
          onSelect={selectConversation}
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
        />
      </div>

      <ChatThread
        conversation={selected}
        messages={messages}
        members={members}
        onStatusChange={(s) => patchConversation({ status: s })}
        onAssign={(uid) => patchConversation({ assigned_to: uid })}
        onAddNote={addNote}
        onSendReply={sendReply}
        onSendFile={sendFile}
        onSendLink={sendLink}
        onBack={() => setSelectedId(null)}
      />

      {selected && (
        <ContactDetailsPanel
          conversation={selected}
          members={members}
          notes={messages.filter((m) => m.is_note)}
          onStatusChange={(s) => patchConversation({ status: s })}
          onAssign={(uid) => patchConversation({ assigned_to: uid })}
          onContactUpdated={fetchConversations}
          onDeleted={() => {
            setSelectedId(null);
            setMessages([]);
            fetchConversations();
          }}
        />
      )}
    </div>
  );
}
