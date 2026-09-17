import { useState } from "react";
import { format } from "date-fns";
import { FileText, Download, StickyNote, CheckCheck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { mediaUrl } from "@/lib/api";

export default function MessageBubble({ message: m }) {
  const [lightbox, setLightbox] = useState(false);
  const time = m.created_at ? format(new Date(m.created_at), "HH:mm") : "";
  const outbound = m.direction === "outbound";

  if (m.is_note || m.type === "note") {
    return (
      <div className="msg-enter flex justify-center my-3" data-testid="message-bubble-internal-note">
        <div className="max-w-[75%] bg-[#13231B] border border-[#059669]/60 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <StickyNote className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Internal note</span>
            <span className="text-[10px] text-emerald-600">· {m.author_name || "Agent"}</span>
          </div>
          <p className="text-[13.5px] leading-relaxed text-emerald-100 whitespace-pre-wrap">{m.text}</p>
          <p className="font-mono text-[10px] text-emerald-700 mt-1.5 select-none">{time}</p>
        </div>
      </div>
    );
  }

  const bubbleBase = outbound
    ? "max-w-[80%] sm:max-w-[70%] rounded-2xl rounded-tr-sm border border-emerald-700/50 bg-[#0B3B30] text-emerald-50"
    : "max-w-[80%] sm:max-w-[70%] rounded-2xl rounded-tl-sm border border-[#2A3942]/40 bg-[#1F2C34] text-slate-100";

  return (
    <div className={`msg-enter flex my-1.5 px-1 ${outbound ? "justify-end" : "justify-start"}`} data-testid={outbound ? "message-bubble-outbound" : "message-bubble-inbound"}>
      <div className={bubbleBase}>
        {m.type === "text" && (
          <div className="px-4 py-2.5" data-testid="message-bubble-text">
            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
          </div>
        )}

        {m.type === "image" && (
          <div className="p-1.5" data-testid="message-bubble-image">
            <button onClick={() => setLightbox(true)} className="block rounded-xl overflow-hidden border border-[#2A3942]/60 max-w-sm">
              <img src={mediaUrl(m.media_url)} alt={m.caption || "attachment"} className="max-h-64 w-auto object-cover" loading="lazy" />
            </button>
            {m.caption && <p className="px-2.5 pt-1.5 pb-1 text-[13px] text-slate-200">{m.caption}</p>}
            <Dialog open={lightbox} onOpenChange={setLightbox}>
              <DialogContent className="max-w-3xl bg-[#0B0F12] border-[#1E2A32] p-2">
                <img src={mediaUrl(m.media_url)} alt={m.caption || "attachment"} className="w-full h-auto rounded-lg" />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {m.type === "audio" && (
          <div className="p-3 max-w-xs" data-testid="message-bubble-audio">
            <audio controls src={mediaUrl(m.media_url)} className="w-64 h-9" preload="none" />
          </div>
        )}

        {m.type === "video" && (
          <div className="p-1.5" data-testid="message-bubble-video">
            <video controls src={mediaUrl(m.media_url)} className="rounded-xl max-w-sm w-full bg-black border border-[#2A3942]/60" preload="metadata" />
            {m.caption && <p className="px-2.5 pt-1.5 pb-1 text-[13px] text-slate-200">{m.caption}</p>}
          </div>
        )}

        {m.type === "document" && (
          <div className="p-3 flex items-center gap-3 max-w-xs" data-testid="message-bubble-document">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-slate-100 truncate">{m.filename || "Document"}</p>
              {m.caption && <p className="text-xs text-slate-400 truncate">{m.caption}</p>}
            </div>
            {m.media_url && (
              <a
                href={mediaUrl(m.media_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-300 hover:bg-emerald-500/25 transition-colors duration-150 flex-shrink-0"
              >
                <Download className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {!["text", "image", "audio", "video", "document"].includes(m.type) && (
          <div className="px-4 py-2.5">
            <p className="text-[13.5px] text-slate-300">{m.text || `[${m.type}]`}</p>
          </div>
        )}

        <p className="font-mono text-[10px] text-slate-500 px-3 pb-1.5 text-right select-none">{time}</p>
      </div>
    </div>
  );
}
