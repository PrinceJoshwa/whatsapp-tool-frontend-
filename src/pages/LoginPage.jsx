import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Slash, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate("/inbox");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

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
            Every WhatsApp conversation,
            <span className="text-emerald-400"> one shared inbox.</span>
          </h1>
          <p className="mt-4 text-base text-slate-400 max-w-md leading-relaxed">
            Multi-tenant team inbox for incoming WhatsApp messages. Route, assign, and resolve customer conversations together.
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-slate-600">Inbound · Assign · Resolve</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
              <Slash className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-lg font-extrabold text-slate-100">Slash</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Sign in to your workspace</h2>
          <p className="mt-1.5 text-sm text-slate-400">Welcome back. Enter your work credentials.</p>

          <form onSubmit={submit} className="mt-8 space-y-5" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Work email</Label>
              <Input
                id="email"
                data-testid="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="bg-[#131A1F] border-[#1E2A32] focus-visible:ring-emerald-500 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                data-testid="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#131A1F] border-[#1E2A32] focus-visible:ring-emerald-500 h-11"
              />
            </div>
            {error && (
              <p data-testid="login-error" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              data-testid="login-submit-button"
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold text-sm transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            New workspace?{" "}
            <Link to="/signup" data-testid="goto-signup-link" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-150">
              Create a tenant
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
