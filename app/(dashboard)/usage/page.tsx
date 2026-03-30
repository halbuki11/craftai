"use client";

import { useEffect, useState } from "react";
import { BarChart3, Zap, Cpu, Crown, Loader2, Clock, Sparkles } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";

interface UsageEntry {
  id: string;
  credits_used: number;
  credits_remaining_after: number;
  model: string;
  skill_id: string | null;
  action_type: string | null;
  source: string;
  created_at: string;
}

interface CreditData {
  balance: { credits_remaining: number; credits_total: number; period_end: string };
  subscription: { plan_id: string };
  usage: UsageEntry[];
}

const MODEL_CONFIG: Record<string, { label: string; icon: typeof Zap; color: string; bg: string }> = {
  haiku: { label: "Haiku", icon: Zap, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  sonnet: { label: "Sonnet", icon: Cpu, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  opus: { label: "Opus", icon: Crown, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
};

const SOURCE_LABELS: Record<string, string> = {
  web: "Web",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  api: "API",
};

export default function UsagePage() {
  const [data, setData] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/credits?history=true&limit=50")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const { credits_remaining, credits_total, period_end } = data.balance;
  const usage = data.usage || [];
  const usedCredits = credits_total - credits_remaining;
  const pct = credits_total > 0 ? (credits_remaining / credits_total) * 100 : 0;

  // Model breakdown
  const byModel: Record<string, number> = {};
  for (const entry of usage) {
    byModel[entry.model] = (byModel[entry.model] || 0) + entry.credits_used;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Kullanım</h1>
        <p className="text-muted-foreground mt-1">Kredi kullanım detaylarınız</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden group hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                <NumberTicker value={credits_remaining} />
              </p>
              <p className="text-sm text-muted-foreground">Kalan Kredi</p>
            </div>
          </div>
          <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={40} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden group hover:border-orange-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                <NumberTicker value={usedCredits} />
              </p>
              <p className="text-sm text-muted-foreground">Kullanılan</p>
            </div>
          </div>
          <BorderBeam colorFrom="#f97316" colorTo="#dc2626" size={40} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                <NumberTicker value={usage.length} />
              </p>
              <p className="text-sm text-muted-foreground">Toplam İstek</p>
            </div>
          </div>
          <BorderBeam colorFrom="#10b981" colorTo="#059669" size={40} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {new Date(period_end).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
              </p>
              <p className="text-sm text-muted-foreground">Dönem Sonu</p>
            </div>
          </div>
          <BorderBeam colorFrom="#3b82f6" colorTo="#6366f1" size={40} duration={12} borderWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Kredi Kullanımı</span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {credits_remaining}/{credits_total}
          </span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Model Breakdown */}
      {Object.keys(byModel).length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Model Dağılımı</h3>
          <div className="space-y-3">
            {Object.entries(byModel).map(([model, credits]) => {
              const config = MODEL_CONFIG[model] || MODEL_CONFIG.sonnet;
              const Icon = config.icon;
              const modelPct = usedCredits > 0 ? (credits / usedCredits) * 100 : 0;

              return (
                <div key={model} className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${config.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-foreground w-16">{config.label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                      style={{ width: `${modelPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground w-16 text-right">{credits} kredi</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Usage History */}
      {usage.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Son Kullanımlar</h3>
          </div>
          <div className="divide-y divide-border">
            {usage.map((entry) => {
              const config = MODEL_CONFIG[entry.model] || MODEL_CONFIG.sonnet;
              const Icon = config.icon;

              return (
                <div key={entry.id} className="flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors">
                  <div className={`p-2 rounded-xl ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {entry.skill_id || entry.action_type || "Genel"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {SOURCE_LABELS[entry.source] || entry.source} · {config.label}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">-{entry.credits_used}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
