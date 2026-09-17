import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Slash, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company_name: "",
    admin_name: "",
    email: "",
    password: "",
    evolution_instance_name: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signup(form);
      navigate("/inbox");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const field = (id, label, key, props = {}) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-slate-300">{label}</Label>
      <Input
        id={id}
        required
        value={form[key]}
        onChange={set(key)}
        className="bg-[#131A1F] border-[#1E2A32] focus-visible:ring-emerald-500 h-11"
        {...props}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0B0F12]">
      <div className="hidden lg:flex flex-col justify-between w-[46%] p-12 bg-[#0E1317] border-r border-[#1E2A32]">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
            <Slash className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-100">Slash</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Spin up your tenant in <span className="text-emerald-400">under a minute.</span>
          </h1>
          <p className="mt-4 text-base text-slate-400 max-w-md leading-relaxed">
            Connect your Evolution API WhatsApp instance and start receiving customer messages in a shared team inbox. Fully isolated per tenant.
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-slate-600">Isolated · Secure · Multi-tenant</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Create your tenant workspace</h2>
          <p className="mt-1.5 text-sm text-slate-400">Company details, admin account, and Marketly connection.</p>

          <form onSubmit={submit} className="mt-8 space-y-4" data-testid="tenant-signup-form">
            {field("company", "Company name", "company_name", { "data-testid": "tenant-company-name-input", placeholder: "Acme Retail Pvt Ltd" })}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("admin_name", "Admin full name", "admin_name", { "data-testid": "tenant-admin-name-input", placeholder: "Asha Verma" })}
              {field("email", "Admin email", "email", { "data-testid": "tenant-admin-email-input", type: "email", placeholder: "admin@acme.com" })}
            </div>
            {field("password", "Admin password", "password", { "data-testid": "tenant-admin-password-input", type: "password", placeholder: "Min 6 characters" })}
            <div className="pt-2 border-t border-[#1E2A32]">
              <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-500/80 mb-4 mt-3">Evolution API WhatsApp connection</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instance" className="text-slate-300">
                    Evolution instance name <span className="text-slate-600 font-normal">(optional — can be set later in Settings)</span>
                  </Label>
                  <Input
                    id="instance"
                    data-testid="tenant-evolution-instance-input"
                    value={form.evolution_instance_name}
                    onChange={set("evolution_instance_name")}
                    placeholder="e.g. acme-prod"
                    className="bg-[#131A1F] border-[#1E2A32] focus-visible:ring-emerald-500 h-11"
                  />
                </div>
              </div>
            </div>
            {error && (
              <p data-testid="signup-error" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              data-testid="tenant-signup-submit-button"
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold text-sm transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Create workspace
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already have a workspace?{" "}
            <Link to="/login" data-testid="goto-login-link" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-150">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
