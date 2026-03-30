"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import Link from "next/link";

interface CreditData {
  balance: { credits_remaining: number; credits_total: number };
  subscription: { plan_id: string };
}

export function CreditBadge() {
  const [data, setData] = useState<CreditData | null>(null);

  useEffect(() => {
    fetch("/api/credits")
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const { credits_remaining, credits_total } = data.balance;
  const pct = credits_total > 0 ? (credits_remaining / credits_total) * 100 : 0;
  const isLow = pct < 20;

  return (
    <Link
      href="/usage"
      className="block rounded-xl border border-border p-3 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className={`w-3.5 h-3.5 ${isLow ? 'text-red-500' : 'text-amber-500'}`} />
          <span className="text-xs font-bold text-foreground">Kredi</span>
        </div>
        <span className={`text-xs font-bold ${isLow ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
          {credits_remaining}/{credits_total}
        </span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  );
}
