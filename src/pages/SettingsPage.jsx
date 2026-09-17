import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Copy, Eye, EyeOff, RefreshCw, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function CopyButton({ text, testid }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      data-testid={testid}
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      }}
      className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center justify-center hover:bg-emerald-500/20 transition-colors duration-150 flex-shrink-0"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function Card({ title, children, testid }) {
  return (
    <section className="rounded-xl border border-[#1E2A32] bg-[#0E1317] p-6" data-testid={testid}>
      <h2 className="text-base font-bold tracking-tight text-slate-100 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { user, tenant, refreshTenant } = useAuth();
  const [showKey, setShowKey] = useState(false);
  const [regenBusy, setRegenBusy] = useState(false);
  const [instanceName, setInstanceName] = useState(tenant?.evolution_instance_name || "");
  const [savingInstance, setSavingInstance] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [evoState, setEvoState] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    setInstanceName(tenant?.evolution_instance_name || "");
  }, [tenant?.evolution_instance_name]);

  if (!tenant) return null;

  const webhookUrl = `${process.env.REACT_APP_BACKEND_URL}/api/webhook/inbound/${tenant.id}`;
  const maskedKey = tenant.api_key ? `${tenant.api_key.slice(0, 7)}${"•".repeat(24)}` : "";
  const curlSample = `curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"919812345001","name":"Test Customer","type":"text","text":"Hello from webhook"}'`;

  const regenerate = async () => {
    if (!window.confirm("Regenerate the API key? The old key will stop working immediately.")) return;
    setRegenBusy(true);
    try {
      await api.post("/tenant/regenerate-key");
      await refreshTenant();
      toast.success("API key regenerated");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setRegenBusy(false);
    }
  };

  const saveInstance = async () => {
    setSavingInstance(true);
    try {
      await api.patch("/tenant", { evolution_instance_name: instanceName.trim() });
      await refreshTenant();
      toast.success("Instance name saved");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSavingInstance(false);
    }
  };

  const configureWebhook = async () => {
    setConfiguring(true);
    try {
      const res = await api.post("/tenant/webhook/configure");
      toast.success(`Webhook configured on Evolution for this instance`);
      console.log(res.data.webhook_url);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setConfiguring(false);
    }
  };

  const checkStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await api.get("/tenant/evolution/status");
      setEvoState(res.data.state || "unknown");
      if (res.data.error) toast.error(res.data.error);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setCheckingStatus(false);
    }
  };

  const connectWhatsApp = async () => {
    setQrLoading(true);
    try {
      const res = await api.get("/tenant/evolution/qrcode");
      if (res.data.state === "open") {
        setEvoState("open");
        toast.success("Instance is already connected");
        return;
      }
      if (!res.data.base64) {
        toast.error("No QR available yet — the instance may still be starting. Try again in a few seconds.");
        return;
      }
      setQrImage(res.data.base64);
      setQrOpen(true);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-10" data-testid="settings-page">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">Workspace identity, API access, and Evolution API integration.</p>
        </div>

        <Card title="Tenant identity" testid="tenant-identity-card">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Company</dt>
              <dd className="mt-1 font-semibold text-slate-100" data-testid="settings-company-name">{tenant.company_name}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Created</dt>
              <dd className="mt-1 text-slate-300">{tenant.created_at ? format(new Date(tenant.created_at), "dd MMM yyyy, HH:mm") : "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Tenant ID</dt>
              <dd className="mt-1 font-mono text-xs text-emerald-300 break-all" data-testid="settings-tenant-id">{tenant.id}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Tenant API key" testid="api-key-card">
          <p className="text-xs text-slate-500 mb-3">Auto-generated unique key for this tenant. Keep it secret.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs text-slate-200 bg-[#131A1F] border border-[#1E2A32] rounded-lg px-3.5 py-2.5 truncate" data-testid="api-key-display">
              {showKey ? tenant.api_key : maskedKey}
            </code>
            <button
              data-testid="api-key-reveal-button"
              onClick={() => setShowKey((s) => !s)}
              className="h-8 w-8 rounded-lg bg-[#131A1F] border border-[#1E2A32] text-slate-400 flex items-center justify-center hover:text-slate-200 transition-colors duration-150 flex-shrink-0"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <CopyButton text={tenant.api_key} testid="api-key-copy-button" />
            {isAdmin && (
              <button
                data-testid="api-key-regenerate-button"
                onClick={regenerate}
                disabled={regenBusy}
                className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 flex items-center justify-center hover:bg-amber-500/20 transition-colors duration-150 disabled:opacity-50 flex-shrink-0"
                title="Regenerate key"
              >
                {regenBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </button>
            )}
          </div>
        </Card>

        <Card title="Evolution API WhatsApp instance" testid="evolution-config-card">
          <div className="space-y-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">Instance name</p>
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <input
                    data-testid="evolution-instance-input"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                    placeholder="e.g. acme-prod"
                    className="flex-1 h-10 px-3.5 rounded-lg bg-[#131A1F] border border-[#1E2A32] font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    data-testid="evolution-instance-save-button"
                    onClick={saveInstance}
                    disabled={savingInstance}
                    className="h-10 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold text-xs transition-colors duration-150 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingInstance && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save
                  </button>
                </div>
              ) : (
                <code className="font-mono text-xs text-slate-200" data-testid="evolution-instance-display">{tenant.evolution_instance_name || "Not configured"}</code>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                data-testid="evolution-webhook-configure-button"
                onClick={configureWebhook}
                disabled={configuring || !tenant.evolution_instance_name}
                className="h-9 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-colors duration-150 disabled:opacity-40 flex items-center gap-1.5"
              >
                {configuring && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Configure webhook
              </button>
              <button
                data-testid="evolution-status-button"
                onClick={checkStatus}
                disabled={checkingStatus || !tenant.evolution_instance_name}
                className="h-9 px-4 rounded-full bg-[#131A1F] border border-[#1E2A32] text-slate-300 text-xs font-semibold hover:text-emerald-300 hover:border-emerald-500/40 transition-colors duration-150 disabled:opacity-40 flex items-center gap-1.5"
              >
                {checkingStatus && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Check connection
              </button>
              <button
                data-testid="evolution-connect-button"
                onClick={connectWhatsApp}
                disabled={qrLoading || !tenant.evolution_instance_name}
                className="h-9 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 text-xs font-bold transition-colors duration-150 disabled:opacity-40 flex items-center gap-1.5"
              >
                {qrLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Connect WhatsApp
              </button>
              {evoState && (
                <span data-testid="evolution-status-badge" className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${evoState === "open" ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-300" : "bg-amber-500/10 border border-amber-500/40 text-amber-300"}`}>
                  {evoState === "open" ? "Connected" : evoState}
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card title="Inbound webhook" testid="webhook-url-card">
          <p className="text-xs text-slate-500 mb-3">Point your Marketly instance's inbound message webhook to this URL.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs text-emerald-300 bg-[#131A1F] border border-[#1E2A32] rounded-lg px-3.5 py-2.5 truncate" data-testid="webhook-url-display">
              {webhookUrl}
            </code>
            <CopyButton text={webhookUrl} testid="webhook-url-copy-button" />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mt-5 mb-2">Test payload</p>
          <pre className="font-mono text-[11px] leading-relaxed text-slate-400 bg-[#0B0F12] border border-[#1E2A32] rounded-lg p-4 overflow-x-auto" data-testid="webhook-curl-sample">
            {curlSample}
          </pre>
        </Card>
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="bg-[#0E1317] border-[#1E2A32] max-w-sm" data-testid="evolution-qr-dialog">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Scan with WhatsApp</DialogTitle>
            <DialogDescription className="text-slate-500">
              Open WhatsApp → Linked devices → Link a device, then scan this QR code. QR codes expire quickly — refresh if needed.
            </DialogDescription>
          </DialogHeader>
          {qrImage && (
            <img src={qrImage} alt="WhatsApp QR code" data-testid="evolution-qr-image" className="w-full rounded-lg bg-white p-3" />
          )}
          <button
            data-testid="evolution-qr-refresh-button"
            onClick={connectWhatsApp}
            disabled={qrLoading}
            className="w-full h-10 rounded-full bg-[#131A1F] border border-[#1E2A32] text-slate-300 text-xs font-semibold hover:text-emerald-300 hover:border-emerald-500/40 transition-colors duration-150 disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {qrLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Refresh QR
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
