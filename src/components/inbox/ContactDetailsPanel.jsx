import { useState } from "react";
import { format } from "date-fns";
import { Plus, X, UserRound } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  open: "border-emerald-500/50 text-emerald-300 bg-emerald-500/10",
  pending: "border-amber-500/50 text-amber-300 bg-amber-500/10",
  resolved: "border-slate-500/50 text-slate-300 bg-slate-500/10",
};

export default function ContactDetailsPanel({ conversation, members, notes, onStatusChange, onAssign, onContactUpdated }) {
  const [labelInput, setLabelInput] = useState("");
  const labels = conversation.contact_labels || [];

  const saveLabels = async (next) => {
    try {
      await api.patch(`/contacts/${conversation.contact_id}`, { labels: next });
      onContactUpdated();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const addLabel = () => {
    const l = labelInput.trim();
    if (!l || labels.includes(l)) return;
    saveLabels([...labels, l]);
    setLabelInput("");
  };

  return (
    <aside className="hidden xl:flex w-80 flex-shrink-0 border-l border-[#1E2A32] bg-[#0E1317] flex-col overflow-y-auto p-5 space-y-6" data-testid="contact-details-panel">
      <section>
        <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-3">Contact</p>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-sm font-bold">
            {(conversation.contact_name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-100 truncate">{conversation.contact_name}</p>
            <p className="font-mono text-[11px] text-slate-500">+{conversation.contact_phone}</p>
          </div>
        </div>
        {conversation.created_at && (
          <p className="text-[11px] text-slate-600 mt-2">Since {format(new Date(conversation.created_at), "dd MMM yyyy")}</p>
        )}
      </section>

      <section>
        <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-3">Status</p>
        <div className="flex gap-2">
          {["open", "pending", "resolved"].map((s) => (
            <button
              key={s}
              data-testid={`panel-status-${s}`}
              onClick={() => onStatusChange(s)}
              className={cn(
                "flex-1 h-8 rounded-full border text-[11px] font-bold uppercase tracking-wide transition-colors duration-150",
                conversation.status === s ? STATUS_STYLES[s] : "border-[#1E2A32] text-slate-500 hover:text-slate-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-3">Assigned to</p>
        <Select value={conversation.assigned_to || "unassigned"} onValueChange={(v) => onAssign(v === "unassigned" ? null : v)}>
          <SelectTrigger data-testid="panel-assignee-select" className="bg-[#131A1F] border-[#1E2A32] text-sm">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent className="bg-[#131A1F] border-[#1E2A32]">
            <SelectItem value="unassigned">
              <span className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5" /> Unassigned</span>
            </SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name} · {m.role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section>
        <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-3">Labels</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {labels.length === 0 && <span className="text-xs text-slate-600">No labels</span>}
          {labels.map((l) => (
            <span key={l} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
              {l}
              <button onClick={() => saveLabels(labels.filter((x) => x !== l))} className="hover:text-red-400 transition-colors duration-150">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            data-testid="contact-label-input"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLabel()}
            placeholder="e.g. VIP, Billing"
            className="flex-1 h-8 px-2.5 rounded-lg bg-[#131A1F] border border-[#1E2A32] text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            data-testid="contact-add-label-button"
            onClick={addLabel}
            className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center justify-center hover:bg-emerald-500/20 transition-colors duration-150"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section>
        <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-3">Internal notes ({notes.length})</p>
        <div className="space-y-2">
          {notes.length === 0 && <p className="text-xs text-slate-600">No notes yet.</p>}
          {[...notes].reverse().map((n) => (
            <div key={n.id} className="bg-[#13231B] border border-[#059669]/40 rounded-lg p-3">
              <p className="text-xs text-emerald-100 whitespace-pre-wrap">{n.text}</p>
              <p className="font-mono text-[10px] text-emerald-700 mt-1.5">
                {n.author_name} · {n.created_at ? format(new Date(n.created_at), "dd MMM, HH:mm") : ""}
              </p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
