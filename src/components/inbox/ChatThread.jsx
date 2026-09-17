import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Link2, MessageSquareText, Paperclip, SendHorizonal, ShieldCheck, X } from "lucide-react";
import MessageBubble from "@/components/inbox/MessageBubble";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ChatThread({ conversation, messages, members, onStatusChange, onAssign, onAddNote, onSendReply, onSendFile, onSendLink, onBack }) {
  const [note, setNote] = useState("");
  const [reply, setReply] = useState("");
  const [mode, setMode] = useState("reply");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);
  const lastIdRef = useRef(null);

  useEffect(() => {
    const last = messages[messages.length - 1];
    const key = conversation ? `${conversation.id}:${last?.id || "none"}:${messages.length}` : null;
    if (key && key !== lastIdRef.current) {
      lastIdRef.current = key;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, conversation]);

  if (!conversation) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center chat-wallpaper" data-testid="chat-empty-state">
        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <MessageSquareText className="h-8 w-8 text-emerald-400" />
        </div>
        <p className="mt-4 text-base font-semibold text-slate-300">Select a conversation</p>
        <p className="mt-1 text-sm text-slate-500 max-w-xs text-center">
          Incoming WhatsApp messages appear in the list. Pick one to view the thread and add internal notes.
        </p>
      </div>
    );
  }

  const submitNote = async (e) => {
    e.preventDefault();
    if (!note.trim() || sending) return;
    setSending(true);
    try {
      await onAddNote(note.trim());
      setNote("");
    } catch {
      /* toasted upstream */
    } finally {
      setSending(false);
    }
  };

  const submitReply = async (e) => {
    e?.preventDefault();
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      await onSendReply(reply.trim());
      setReply("");
    } catch {
      /* toasted upstream */
    } finally {
      setSending(false);
    }
  };

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || sending) return;
    setSending(true);
    try {
      await onSendFile(file, reply.trim());
      setReply("");
    } catch {
      /* toasted upstream */
    } finally {
      setSending(false);
    }
  };

  const submitLink = async () => {
    if (!linkUrl.trim() || sending) return;
    setSending(true);
    try {
      await onSendLink(linkUrl.trim(), reply.trim());
      setLinkUrl("");
      setLinkOpen(false);
      setReply("");
    } catch {
      /* toasted upstream */
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0B0F12]" data-testid="chat-thread">
      <div className="border-b border-[#1E2A32] bg-[#0E1317]/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 flex-wrap">
        <button onClick={onBack} className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-[#131A1F]" data-testid="chat-back-button">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-100 truncate" data-testid="chat-contact-name">{conversation.contact_name}</p>
          <p className="font-mono text-[11px] text-slate-500" data-testid="chat-contact-phone">+{conversation.contact_phone}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={conversation.status} onValueChange={onStatusChange}>
            <SelectTrigger data-testid="chat-status-select" className="h-8 w-[120px] bg-[#131A1F] border-[#1E2A32] text-xs capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#131A1F] border-[#1E2A32]">
              <SelectItem value="open" className="text-xs">Open</SelectItem>
              <SelectItem value="pending" className="text-xs">Pending</SelectItem>
              <SelectItem value="resolved" className="text-xs">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={conversation.assigned_to || "unassigned"} onValueChange={(v) => onAssign(v === "unassigned" ? null : v)}>
            <SelectTrigger data-testid="chat-assignee-select" className="h-8 w-[150px] bg-[#131A1F] border-[#1E2A32] text-xs">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent className="bg-[#131A1F] border-[#1E2A32]">
              <SelectItem value="unassigned" className="text-xs">Unassigned</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="px-4 py-2 bg-[#13231B]/60 border-b border-[#1E2A32] flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <p className="text-[11px] text-emerald-300/80">Connected via Evolution API — replies are delivered to the customer's WhatsApp. Switch to Internal note for team-only memos.</p>
      </div>

      <div className="flex-1 overflow-y-auto chat-wallpaper px-3 py-4" data-testid="message-feed">
        {messages.length === 0 && (
          <p className="text-center text-xs text-slate-600 mt-8">No messages in this conversation yet.</p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[#1E2A32] bg-[#0E1317] p-3">
        <div className="flex gap-1 mb-2.5">
          <button
            data-testid="composer-mode-reply"
            onClick={() => setMode("reply")}
            className={`h-7 px-3 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors duration-150 ${mode === "reply" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40" : "text-slate-500 border border-transparent hover:text-slate-300"}`}
          >
            Reply
          </button>
          <button
            data-testid="composer-mode-note"
            onClick={() => setMode("note")}
            className={`h-7 px-3 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors duration-150 ${mode === "note" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40" : "text-slate-500 border border-transparent hover:text-slate-300"}`}
          >
            Internal note
          </button>
        </div>

        {mode === "reply" ? (
          <form onSubmit={submitReply} className="space-y-2">
            {linkOpen && (
              <div className="flex items-center gap-2">
                <input
                  data-testid="reply-link-input"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://… paste a media or document link"
                  className="flex-1 h-9 px-3 rounded-lg bg-[#0B0F12] border border-[#1E2A32] text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button type="button" data-testid="reply-link-send-button" onClick={submitLink} disabled={!linkUrl.trim() || sending} className="h-9 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-colors duration-150 disabled:opacity-40">
                  Attach link
                </button>
                <button type="button" onClick={() => setLinkOpen(false)} className="h-9 w-9 rounded-lg text-slate-500 hover:text-slate-300 flex items-center justify-center">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input ref={fileRef} type="file" className="hidden" data-testid="reply-file-input" onChange={onPickFile} />
              <button type="button" data-testid="reply-attach-button" onClick={() => fileRef.current?.click()} title="Attach file (image, video, audio, document)" className="h-10 w-10 rounded-full bg-[#131A1F] border border-[#1E2A32] text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40 flex items-center justify-center transition-colors duration-150 flex-shrink-0">
                <Paperclip className="h-4 w-4" />
              </button>
              <button type="button" data-testid="reply-link-button" onClick={() => setLinkOpen((o) => !o)} title="Attach a link" className="h-10 w-10 rounded-full bg-[#131A1F] border border-[#1E2A32] text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40 flex items-center justify-center transition-colors duration-150 flex-shrink-0">
                <Link2 className="h-4 w-4" />
              </button>
              <div className="flex-1">
                <textarea
                  data-testid="reply-input"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitReply(e);
                    }
                  }}
                  rows={2}
                  placeholder="Reply to customer on WhatsApp…"
                  className="w-full rounded-xl bg-[#131A1F] border border-[#1E2A32] px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none transition-shadow duration-150"
                />
              </div>
              <button
                data-testid="reply-send-button"
                type="submit"
                disabled={!reply.trim() || sending}
                className="h-10 w-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 flex items-center justify-center transition-colors duration-150 disabled:opacity-40 flex-shrink-0"
              >
                <SendHorizonal className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitNote} className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                data-testid="internal-note-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitNote(e);
                  }
                }}
                rows={2}
                placeholder="Internal note — never sent to the customer…"
                className="w-full rounded-xl bg-[#13231B] border border-[#059669]/40 px-3.5 py-2.5 text-sm text-emerald-100 placeholder:text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none transition-shadow duration-150"
              />
            </div>
            <button
              data-testid="internal-note-submit-button"
              type="submit"
              disabled={!note.trim() || sending}
              className="h-10 w-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 flex items-center justify-center transition-colors duration-150 disabled:opacity-40 flex-shrink-0"
            >
              <SendHorizonal className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
