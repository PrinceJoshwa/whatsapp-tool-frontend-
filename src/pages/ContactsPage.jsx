import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, Pencil, Loader2, X, Plus } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", labels: [], notes: "" });
  const [labelInput, setLabelInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/contacts", { params: search ? { search } : {} });
      setContacts(res.data);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name || "", labels: c.labels || [], notes: c.notes || "" });
    setLabelInput("");
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/contacts/${editing.id}`, form);
      toast.success("Contact updated");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-10" data-testid="contacts-page">
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Contacts</h1>
        <p className="mt-1 text-sm text-slate-400">Auto-created from incoming WhatsApp messages. Edit names, labels, and notes.</p>

        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            data-testid="contacts-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or label…"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#131A1F] border border-[#1E2A32] text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow duration-150"
          />
        </div>

        <div className="mt-6 rounded-xl border border-[#1E2A32] bg-[#0E1317] overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
          ) : contacts.length === 0 ? (
            <p className="p-10 text-center text-sm text-slate-500" data-testid="contacts-empty">No contacts found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E2A32] text-left">
                  <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">Contact</th>
                  <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-slate-500 hidden md:table-cell">Labels</th>
                  <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-slate-500 hidden lg:table-cell">Conversations</th>
                  <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-slate-500 hidden lg:table-cell">Added</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-[#162026] hover:bg-[#131A1F] transition-colors duration-150" data-testid="contact-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#1F2C34] border border-[#2A3942] flex items-center justify-center text-emerald-300 text-xs font-bold flex-shrink-0">
                          {(c.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-100 truncate">{c.name}</p>
                          <p className="font-mono text-[11px] text-slate-500">+{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(c.labels || []).map((l) => (
                          <span key={l} className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">{l}</span>
                        ))}
                        {(!c.labels || c.labels.length === 0) && <span className="text-xs text-slate-600">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-slate-400">{c.conversation_count}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 text-xs">
                      {c.created_at ? format(new Date(c.created_at), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        data-testid="contact-edit-name-button"
                        onClick={() => openEdit(c)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors duration-150"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-[#0E1317] border-[#1E2A32]" data-testid="contact-edit-dialog">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Edit contact</DialogTitle>
            <DialogDescription className="text-slate-500">Update the contact name, labels, and CRM notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Name</Label>
              <Input
                data-testid="contact-name-input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-[#131A1F] border-[#1E2A32] focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Labels</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.labels.map((l) => (
                  <span key={l} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
                    {l}
                    <button onClick={() => setForm((f) => ({ ...f, labels: f.labels.filter((x) => x !== l) }))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  data-testid="contact-label-dialog-input"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const l = labelInput.trim();
                      if (l && !form.labels.includes(l)) setForm((f) => ({ ...f, labels: [...f.labels, l] }));
                      setLabelInput("");
                    }
                  }}
                  placeholder="Add label, press Enter"
                  className="bg-[#131A1F] border-[#1E2A32] focus-visible:ring-emerald-500"
                />
                <button
                  data-testid="contact-label-dialog-add"
                  type="button"
                  onClick={() => {
                    const l = labelInput.trim();
                    if (l && !form.labels.includes(l)) setForm((f) => ({ ...f, labels: [...f.labels, l] }));
                    setLabelInput("");
                  }}
                  className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center justify-center hover:bg-emerald-500/20 transition-colors duration-150 flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Notes</Label>
              <Textarea
                data-testid="contact-notes-input"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={4}
                placeholder="CRM notes about this customer…"
                className="bg-[#131A1F] border-[#1E2A32] focus-visible:ring-emerald-500 resize-none"
              />
            </div>
            <button
              data-testid="contact-save-button"
              onClick={save}
              disabled={saving}
              className="w-full h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold text-sm transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save contact
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
