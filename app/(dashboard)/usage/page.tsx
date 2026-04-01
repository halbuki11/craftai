"use client";

import { useEffect, useState } from "react";
import { BarChart3, Zap, Cpu, Crown, Loader2, Clock, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

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
  haiku: { label: "Haiku", icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  sonnet: { label: "Sonnet", icon: Cpu, color: "text-teal-400", bg: "bg-teal-500/10" },
  opus: { label: "Opus", icon: Crown, color: "text-sky-400", bg: "bg-cyan-500/10" },
};

const SOURCE_LABELS: Record<string, string> = {
  web: "Web",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  api: "API",
};

export default function UsagePage() {
  const { t, locale } = useI18n();
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
        <Loader2 className="w-8 h-8 animate-spin text-white/30" />
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
        <h1 className="text-2xl font-bold text-white/90">{t("usage.title")}</h1>
        <p className="text-white/50 mt-1">{t("usage.desc")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 rounded-xl">
              <Zap className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white/90">{credits_remaining}</p>
              <p className="text-sm text-white/50">{t("usage.remaining")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl">
              <BarChart3 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white/90">{usedCredits}</p>
              <p className="text-sm text-white/50">{t("usage.used")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white/90">{usage.length}</p>
              <p className="text-sm text-white/50">{t("usage.totalRequests")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl">
              <Clock className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white/90">
                {new Date(period_end).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { day: "numeric", month: "short" })}
              </p>
              <p className="text-sm text-white/50">{t("usage.periodEnd")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white/70">{t("usage.creditUsage")}</span>
          <span className="text-sm font-bold text-teal-400">
            {credits_remaining}/{credits_total}
          </span>
        </div>
        <div className="w-full h-3 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Model Breakdown */}
      {Object.keys(byModel).length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/90 mb-4">{t("usage.modelBreakdown")}</h3>
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
                  <span className="text-xs font-semibold text-white/70 w-14 sm:w-16">{config.label}</span>
                  <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                      style={{ width: `${modelPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white/40 w-20 text-right">{credits} {t("usage.credits")}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Usage Chart */}
      {usage.length > 0 && (() => {
        // Group usage by day for last 7 days
        const days: Record<string, number> = {};
        const now = new Date();
        for (let d = 6; d >= 0; d--) {
          const date = new Date(now);
          date.setDate(date.getDate() - d);
          days[date.toISOString().slice(0, 10)] = 0;
        }
        for (const entry of usage) {
          const day = entry.created_at.slice(0, 10);
          if (days[day] !== undefined) days[day] += entry.credits_used;
        }
        const dayEntries = Object.entries(days);
        const maxDay = Math.max(...Object.values(days), 1);
        const avgPerDay = Math.round(Object.values(days).reduce((a, b) => a + b, 0) / 7);
        const peakDayKey = dayEntries.reduce((a, b) => (b[1] > a[1] ? b : a), dayEntries[0]);

        return (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/90">{t("usage.dailyUsage")}</h3>
              <div className="flex gap-4 text-xs text-white/40">
                <span>{t("usage.avgPerDay")}: <span className="text-white/70 font-semibold">{avgPerDay}</span></span>
                <span>{t("usage.peakDay")}: <span className="text-white/70 font-semibold">{new Date(peakDayKey[0]).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { weekday: "short" })}</span></span>
              </div>
            </div>
            <div className="flex items-end gap-2 h-32">
              {dayEntries.map(([day, val]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-teal-500 to-cyan-500 rounded-t-md transition-all duration-500 min-h-[2px]"
                      style={{ height: `${(val / maxDay) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/30">
                    {new Date(day).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { weekday: "narrow" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Usage History */}
      {usage.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="text-sm font-bold text-white/90">{t("usage.recentUsage")}</h3>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {usage.map((entry) => {
              const config = MODEL_CONFIG[entry.model] || MODEL_CONFIG.sonnet;
              const Icon = config.icon;

              return (
                <div key={entry.id} className="flex items-center gap-3 p-4 hover:bg-white/[0.05] transition-colors">
                  <div className={`p-2 rounded-xl ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90">
                      {entry.skill_id || entry.action_type || t("usage.general")}
                    </p>
                    <p className="text-xs text-white/40">
                      {SOURCE_LABELS[entry.source] || entry.source} · {config.label}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white/90">-{entry.credits_used}</p>
                    <p className="text-xs text-white/40">
                      {new Date(entry.created_at).toLocaleTimeString(locale === "tr" ? "tr-TR" : "en-US", { hour: "2-digit", minute: "2-digit" })}
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
