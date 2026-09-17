import { useEffect, useState } from "react";
import { format } from "date-fns";
import { UserPlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function TeamPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/team");
      setMembers(res.data);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const invite = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/team/invite", form);
      toast.success(`${form.name} invited as ${form.role}`);
      setInviteOpen(false);
      setForm({ name: "", email: "", password: "", role: "agent" });
      load();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/team/${id}`, { role });
      toast.success("Role updated");
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const remove = async (id, name) => {
    try {
      await api.delete(`/team/${id}`);
      toast.success(`${name} removed`);
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-10" data-testid="team-page">
      <div className="max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Team</h1>
            <p className="mt-1 text-sm text-slate-400">Invite unlimited agents and admins to this tenant workspace.</p>
          </div>
          {isAdmin && (
            <button
              data-testid="invite-agent-modal-button"
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold text-sm transition-colors duration-150"
            >
              <UserPlus className="h-4 w-4" />
              Invite member
            </button>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-[#1E2A32] bg-[#0E1317] overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E2A32] text-left">
                  <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">Member</th>
                  <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-slate-500 hidden md:table-cell">Assigned</th>
                  <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-slate-500 hidden md:table-cell">Joined</th>
                  {isAdmin && <th className="px-5 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-[#162026] hover:bg-[#131A1F] transition-colors duration-150" data-testid="team-member-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-xs font-bold flex-shrink-0">
                          {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-100 truncate">
                            {m.name} {m.id === user?.id && <span className="text-[10px] text-emerald-400 font-mono">(you)</span>}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {isAdmin && m.id !== user?.id ? (
                        <Select value={m.role} onValueChange={(r) => changeRole(m.id, r)}>
                          <SelectTrigger data-testid="team-role-select" className="h-8 w-[110px] bg-[#131A1F] border-[#1E2A32] text-xs capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#131A1F] border-[#1E2A32]">
                            <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                            <SelectItem value="agent" className="text-xs">Agent</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide",
                            m.role === "admin"
                              ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-300"
                              : "bg-slate-500/10 border border-slate-500/40 text-slate-300"
                          )}
                        >
                          {m.role}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-slate-400">{m.assigned_count}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-slate-500 text-xs">
                      {m.created_at ? format(new Date(m.created_at), "dd MMM yyyy") : "—"}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-right">
                        {m.id !== user?.id && (
                          <button
                            data-testid="team-remove-button"
                            onClick={() => remove(m.id, m.name)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="bg-[#0E1317] border-[#1E2A32]" data-testid="invite-agent-dialog">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Invite team member</DialogTitle>
            <DialogDescription className="text-slate-500">They can sign in immediately with this email and password.</DialogDescription>
          </DialogHeader>
          <form onSubmit={invite} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Full name</Label>
              <Input
                data-testid="invite-agent-name-input"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-[#131A1F] border-[#1E2A32] focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                data-testid="invite-agent-email-input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="bg-[#131A1F] border-[#1E2A32] focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Temporary password</Label>
              <Input
                data-testid="invite-agent-password-input"
                type="text"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Share this with the member"
                className="bg-[#131A1F] border-[#1E2A32] focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Role</Label>
              <Select value={form.role} onValueChange={(r) => setForm((f) => ({ ...f, role: r }))}>
                <SelectTrigger data-testid="invite-agent-role-select" className="bg-[#131A1F] border-[#1E2A32]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#131A1F] border-[#1E2A32]">
                  <SelectItem value="agent">Agent — handles conversations</SelectItem>
                  <SelectItem value="admin">Admin — full access incl. team & settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              data-testid="invite-agent-submit-button"
              type="submit"
              disabled={busy}
              className="w-full h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold text-sm transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Send invite
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
