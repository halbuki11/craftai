"use client";

import { useEffect, useState } from "react";
import { Key, Plus, Copy, Trash2, Loader2, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiKeysPage() {
  const { t, locale } = useI18n();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/keys")
      .then((r) => r.json())
      .then((data) => setKeys(data.keys || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName || "Default" }),
      });
      const data = await res.json();
      if (data.key) {
        setNewKey(data.key);
        setKeyName("");
        // Refresh list
        const listRes = await fetch("/api/keys");
        const listData = await listRes.json();
        setKeys(listData.keys || []);
      }
    } catch {
      toast.error("Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    try {
      await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success("Key revoked");
    } catch {
      toast.error("Failed");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white/90">{t("api.title")}</h1>
        <p className="text-white/50 mt-1">{t("api.desc")}</p>
      </div>

      {/* New key alert */}
      {newKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
          <p className="text-sm text-emerald-400 font-medium">{t("api.copyWarning")}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-black/30 rounded-lg text-xs text-white/90 font-mono break-all">
              {newKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newKey);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="text-xs text-white/30 hover:text-white/60">
            Dismiss
          </button>
        </div>
      )}

      {/* Create key */}
      <div className="flex gap-2">
        <input
          type="text"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          placeholder={t("api.keyName")}
          className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-5 py-2.5 bg-white text-[#131314] text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center gap-2"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {t("api.createKey")}
        </button>
      </div>

      {/* Keys list */}
      {keys.length === 0 && !newKey ? (
        <div className="text-center py-16">
          <Key className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-sm text-white/30">{t("api.noKeys")}</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/[0.06]">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center gap-3 p-4">
                <div className="p-2 bg-violet-500/10 rounded-xl">
                  <Key className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90">{k.name}</p>
                  <p className="text-xs text-white/40 font-mono">{k.key_prefix}</p>
                </div>
                <div className="text-right text-xs text-white/30 mr-3">
                  {k.last_used_at
                    ? new Date(k.last_used_at).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { day: "numeric", month: "short" })
                    : "Never used"}
                </div>
                <button
                  onClick={() => handleRevoke(k.id)}
                  className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title={t("api.revoke")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage example */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white/90">Quick Start</h3>
        <pre className="px-3 py-3 bg-black/30 rounded-lg text-xs text-white/70 font-mono overflow-x-auto whitespace-pre">{`curl -X POST https://aimaa.cloud/api/v1/chat \\
  -H "Authorization: Bearer craft_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello!", "model": "haiku"}'`}</pre>
      </div>
    </div>
  );
}
