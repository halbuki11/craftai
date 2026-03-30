"use client";

import { useState } from "react";
import { Cpu, Zap, Crown, Lock } from "lucide-react";
import { toast } from "sonner";

const MODELS = [
  { id: "haiku", name: "Haiku 4.5", credits: 1, icon: Zap, desc: "Hızlı ve ekonomik", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  { id: "sonnet", name: "Sonnet 4.6", credits: 3, icon: Cpu, desc: "Dengeli performans", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "opus", name: "Opus 4.6", credits: 10, icon: Crown, desc: "En güçlü model", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
];

interface ModelSelectorProps {
  currentModel: string;
  allowedModels: string[];
}

export function ModelSelector({ currentModel, allowedModels }: ModelSelectorProps) {
  const [selected, setSelected] = useState(currentModel);
  const [saving, setSaving] = useState(false);

  async function handleSelect(modelId: string) {
    if (!allowedModels.includes(modelId)) return;
    if (modelId === selected) return;

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_model: modelId }),
      });
      if (!res.ok) throw new Error();
      setSelected(modelId);
      toast.success("Model güncellendi");
    } catch {
      toast.error("Model güncellenemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {MODELS.map((model) => {
        const Icon = model.icon;
        const isSelected = selected === model.id;
        const isLocked = !allowedModels.includes(model.id);

        return (
          <button
            key={model.id}
            onClick={() => handleSelect(model.id)}
            disabled={isLocked || saving}
            className={`relative p-4 rounded-2xl border text-left transition-all ${
              isSelected
                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-sm"
                : isLocked
                  ? "border-border opacity-50 cursor-not-allowed"
                  : "border-border hover:border-amber-500/30 hover:bg-accent/30"
            }`}
          >
            {isLocked && (
              <div className="absolute top-3 right-3">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
            <div className={`p-2 rounded-xl ${model.bg} w-fit mb-3`}>
              <Icon className={`w-4 h-4 ${model.color}`} />
            </div>
            <p className="text-sm font-bold text-foreground">{model.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{model.desc}</p>
            <p className={`text-xs font-bold mt-2 ${model.color}`}>
              {model.credits} kredi/istek
            </p>
          </button>
        );
      })}
    </div>
  );
}
