import { Search } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "all", label: "All", testid: "filter-status-all" },
  { key: "open", label: "Open", testid: "filter-status-open" },
  { key: "pending", label: "Pending", testid: "filter-status-pending" },
  { key: "resolved", label: "Resolved", testid: "filter-status-resolved" },
];

const STATUS_DOT = {
  open: "bg-emerald-500",
  pending: "bg-amber-500",
  resolved: "bg-slate-500",
};

function convTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "dd MMM");
}

export default function ConversationList({ conversations, activeId, onSelect, status, onStatusChange, search, onSearchChange }) {
  return (
    <>
      <div className="p-3 space-y-3 border-b border-[#1E2A32]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            data-testid="conversation-search-input"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, phone, message…"
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#131A1F] border border-[#1E2A32] text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow duration-150"
          />
        </div>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              data-testid={t.testid}
              onClick={() => onStatusChange(t.key)}
              className={cn(
                "flex-1 h-8 rounded-full text-xs font-semibold transition-colors duration-150",
                status === t.key
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" data-testid="conversation-list">
        {conversations.length === 0 && (
          <div className="p-8 text-center" data-testid="conversation-list-empty">
            <p className="text-sm text-slate-500">No conversations yet.</p>
            <p className="text-xs text-slate-600 mt-1">Incoming WhatsApp messages will appear here.</p>
          </div>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            data-testid="conversation-item"
            onClick={() => onSelect(c.id)}
            className={cn(
              "w-full text-left p-3.5 border-b border-[#162026] transition-colors duration-150 relative group",
              activeId === c.id ? "bg-[#131A1F] border-l-2 border-l-emerald-500" : "hover:bg-[#131A1F]"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-[#1F2C34] border border-[#2A3942] flex items-center justify-center text-emerald-300 text-xs font-bold flex-shrink-0">
                {(c.contact_name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100 truncate">{c.contact_name}</p>
                  <span className="font-mono text-[10px] text-slate-500 flex-shrink-0">{convTime(c.last_message_at)}</span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{c.last_message_preview || "No messages yet"}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[c.status] || "bg-slate-500")} />
                  <span className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{c.status}</span>
                  {c.assignee_name && (
                    <span className="text-[10px] text-slate-500 truncate">· {c.assignee_name}</span>
                  )}
                  {c.unread_count > 0 && (
                    <span
                      data-testid="unread-count-badge"
                      className="ml-auto h-5 min-w-[20px] px-1.5 rounded-full bg-emerald-500 text-emerald-950 text-[10px] font-bold flex items-center justify-center"
                    >
                      {c.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
