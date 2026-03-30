"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Loader2, Sparkles, Zap, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  credits_per_month: number;
  price_monthly: number;
  allowed_models: string[];
  features: Record<string, boolean>;
}

const PLAN_ICONS: Record<string, typeof Zap> = {
  free: Zap,
  starter: Sparkles,
  pro: Crown,
  business: CreditCard,
};

const PLAN_COLORS: Record<string, { gradient: string; text: string; bg: string }> = {
  free: { gradient: "from-gray-500 to-gray-600", text: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-900/30" },
  starter: { gradient: "from-amber-500 to-orange-600", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  pro: { gradient: "from-purple-500 to-indigo-600", text: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  business: { gradient: "from-emerald-500 to-teal-600", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
};

const MODEL_LABELS: Record<string, string> = {
  haiku: "Haiku 4.5",
  sonnet: "Sonnet 4.6",
  opus: "Opus 4.6",
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/credits").then(r => r.json()),
      fetch("/api/skills").then(r => r.json()), // just to warm up
    ]).then(([creditsData]) => {
      setCurrentPlan(creditsData.subscription?.plan_id || "free");
    }).finally(() => setLoading(false));

    // Fetch plans from hardcoded data (no API needed for static plans)
    setPlans([
      { id: "free", name: "Free", credits_per_month: 20, price_monthly: 0, allowed_models: ["haiku"], features: {} },
      { id: "starter", name: "Starter", credits_per_month: 500, price_monthly: 900, allowed_models: ["haiku", "sonnet"], features: {} },
      { id: "pro", name: "Pro", credits_per_month: 2000, price_monthly: 2900, allowed_models: ["haiku", "sonnet", "opus"], features: {} },
      { id: "business", name: "Business", credits_per_month: 10000, price_monthly: 9900, allowed_models: ["haiku", "sonnet", "opus"], features: {} },
    ]);
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
        toast.error(data.error || "Ödeme sayfası oluşturulamadı");
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setUpgrading(null);
    }
  }

  async function handleManage() {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Portal açılamadı");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Abonelik</h1>
        <p className="text-muted-foreground mt-1">Planınızı seçin ve kredinizi yönetin</p>
      </div>

      {currentPlan !== "free" && (
        <Button variant="outline" onClick={handleManage} className="rounded-xl">
          <CreditCard className="w-4 h-4 mr-2" />
          Aboneliği Yönet
        </Button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.id] || Zap;
          const colors = PLAN_COLORS[plan.id] || PLAN_COLORS.free;
          const isCurrent = currentPlan === plan.id;
          const isPopular = plan.id === "pro";

          return (
            <div
              key={plan.id}
              className={`relative bg-card border rounded-2xl overflow-hidden transition-all ${
                isCurrent ? "border-amber-500 shadow-lg shadow-amber-500/10" : "border-border hover:border-amber-500/30"
              }`}
            >
              {isPopular && (
                <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={60} duration={8} borderWidth={1.5} />
              )}

              {/* Header */}
              <div className={`bg-gradient-to-r ${colors.gradient} px-4 py-3`}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white">{plan.name}</span>
                  {isCurrent && (
                    <span className="ml-auto text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">
                      Mevcut
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Price */}
                <div>
                  <span className="text-2xl font-bold text-foreground">
                    {plan.price_monthly === 0 ? "Ücretsiz" : `$${(plan.price_monthly / 100).toFixed(0)}`}
                  </span>
                  {plan.price_monthly > 0 && (
                    <span className="text-xs text-muted-foreground">/ay</span>
                  )}
                </div>

                {/* Credits */}
                <p className={`text-sm font-bold ${colors.text}`}>
                  {plan.credits_per_month.toLocaleString()} kredi/ay
                </p>

                {/* Models */}
                <div className="space-y-1.5">
                  {plan.allowed_models.map((m) => (
                    <div key={m} className="flex items-center gap-2 text-xs text-foreground">
                      <Check className="w-3 h-3 text-emerald-500" />
                      {MODEL_LABELS[m] || m}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {isCurrent ? (
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    Aktif Plan
                  </div>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id || plan.id === "free"}
                    className={`w-full rounded-xl text-xs h-9 ${plan.id === "free" ? "" : `bg-gradient-to-r ${colors.gradient} hover:opacity-90`}`}
                    variant={plan.id === "free" ? "outline" : "default"}
                  >
                    {upgrading === plan.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        Yükselt
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
