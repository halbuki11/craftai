"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/context";

interface Plan {
  id: string;
  name: string;
  tokens: string;
  tokensNum: number;
  price: number;
  modelKeys: string[];
  highlightKey?: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tokens: "50K",
    tokensNum: 50000,
    price: 0,
    modelKeys: ["Claude 4.5 Haiku", "GPT-4o Mini"],
    highlightKey: "sub.tryIt",
  },
  {
    id: "pro",
    name: "Pro",
    tokens: "2M",
    tokensNum: 2000000,
    price: 19,
    modelKeys: ["Claude 4.5 Haiku", "Claude Sonnet 4.6", "GPT-4o", "GPT-4o Mini"],
    highlightKey: "sub.popular",
    popular: true,
  },
];

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function SubscriptionPage() {
  const { t } = useI18n();
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [tokensUsed, setTokensUsed] = useState(0);
  const [tokensTotal, setTokensTotal] = useState(100000);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((data) => {
        setCurrentPlan(data.subscription?.plan_id || "free");
        if (data.balance) {
          setTokensTotal(data.balance.credits_total || 50000);
          setTokensUsed((data.balance.credits_total || 0) - (data.balance.credits_remaining || 0));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(planId: string) {
    if (planId === "free") return;
    setUpgrading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || t("common.error"));
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setUpgrading(null);
    }
  }

  async function handleManage() {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error(t("common.error"));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  const usagePercent = tokensTotal > 0 ? Math.min(100, (tokensUsed / tokensTotal) * 100) : 0;

  // Helper to resolve model display text
  const resolveLabel = (key: string) => {
    const map: Record<string, string> = {
      "sub.allModels": t("sub.allModels"),
      "sub.includingOpus": t("sub.includingOpus"),
      "sub.prioritySupport": t("sub.prioritySupport"),
    };
    return map[key] || key;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white">{t("sub.plans")}</h1>
        <p className="text-sm text-white/40 mt-1">
          {t("sub.tokenPool")}
        </p>
      </div>

      {/* Current Usage */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white/70">{t("sub.tokenUsage")}</span>
          <span className="text-xs text-white/40">
            {formatTokens(tokensUsed)} / {formatTokens(tokensTotal)} {t("sub.used")}
          </span>
        </div>
        <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <p className="text-[11px] text-white/25 mt-2">
          {formatTokens(Math.max(0, tokensTotal - tokensUsed))} {t("sub.remaining")}
        </p>
      </div>

      {currentPlan !== "free" && (
        <div className="text-center">
          <button
            onClick={handleManage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            {t("sub.manage")}
          </button>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-white/[0.02] border rounded-2xl overflow-hidden transition-all ${
                plan.popular
                  ? "border-violet-500/30 shadow-lg shadow-violet-500/5"
                  : isCurrent
                  ? "border-emerald-500/30"
                  : "border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-bold text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded-full">
                    {t("sub.popular")}
                  </span>
                </div>
              )}

              <div className="p-5 space-y-4">
                {/* Name */}
                <div>
                  <span className="text-sm font-semibold text-white">{plan.name}</span>
                  {plan.highlightKey && !plan.popular && (
                    <span className="text-[10px] text-white/30 ml-2">{t(plan.highlightKey as any)}</span>
                  )}
                </div>

                {/* Tokens */}
                <div>
                  <span className="text-3xl font-bold text-white">{plan.tokens}</span>
                  <span className="text-xs text-white/30 ml-1">{t("sub.tokensMonth")}</span>
                </div>

                {/* Price */}
                <div>
                  <span className="text-lg font-semibold text-white">
                    {plan.price === 0 ? t("sub.free") : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-xs text-white/30">{t("sub.month")}</span>}
                </div>

                {/* Models */}
                <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                  {plan.modelKeys.map((m) => (
                    <div key={m} className="flex items-center gap-2 text-xs text-white/60">
                      <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      {resolveLabel(m)}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-1">
                  {isCurrent ? (
                    <div className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-medium text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      {t("sub.currentPlan")}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading === plan.id || plan.id === "free"}
                      className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 ${
                        plan.popular
                          ? "bg-white text-[#1E1F23] hover:bg-white/90 shadow-lg shadow-white/10"
                          : "bg-white/[0.05] text-white/70 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      {upgrading === plan.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          {plan.id === "free" ? t("sub.current") : t("sub.upgrade")}
                          {plan.id !== "free" && <ArrowRight className="w-3 h-3" />}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
