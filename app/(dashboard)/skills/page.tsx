"use client";

import { useEffect, useState } from "react";
import {
  Sparkles, FileText, PenTool, Code, Globe, Zap, GraduationCap, Palette, BookOpen,
  MessageSquare, Mail, Users, Search, Calculator, CheckCircle, Image, BarChart,
  Share2, Shield, Lightbulb, Loader2,
} from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";

interface Skill {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  defaultModel: string;
  creditMultiplier: number;
  requiresFile: boolean;
  minPlan: string;
  tags: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "Genel",
  analysis: "Analiz",
  writing: "Yazı",
  coding: "Kodlama",
  translation: "Çeviri",
  productivity: "Üretkenlik",
  education: "Eğitim",
  creative: "Yaratıcı",
  research: "Araştırma",
};

const ICON_MAP: Record<string, typeof Sparkles> = {
  sparkles: Sparkles, "message-square": MessageSquare, "file-text": FileText,
  "pen-tool": PenTool, mail: Mail, code: Code, globe: Globe, users: Users,
  "book-open": BookOpen, calculator: Calculator, "check-circle": CheckCircle,
  image: Image, "bar-chart": BarChart, "share-2": Share2, shield: Shield,
  lightbulb: Lightbulb, zap: Zap, "graduation-cap": GraduationCap, palette: Palette,
};

const MODEL_LABELS: Record<string, { label: string; color: string }> = {
  haiku: { label: "Haiku", color: "text-emerald-600 dark:text-emerald-400" },
  sonnet: { label: "Sonnet", color: "text-amber-600 dark:text-amber-400" },
  opus: { label: "Opus", color: "text-purple-600 dark:text-purple-400" },
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/skills")
      .then(r => r.json())
      .then(data => setSkills(data.skills || []))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(skills.map(s => s.category))];
  const filtered = filter === "all" ? skills : skills.filter(s => s.category === filter);

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
        <h1 className="text-2xl font-bold text-foreground">Yetenekler</h1>
        <p className="text-muted-foreground mt-1">
          AI asistanının kullanabileceği özel yetenekler
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === cat
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-amber-500/30"
            }`}
          >
            {cat === "all" ? "Tümü" : CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((skill, i) => {
          const Icon = ICON_MAP[skill.icon] || Sparkles;
          const model = MODEL_LABELS[skill.defaultModel] || MODEL_LABELS.sonnet;

          return (
            <div
              key={skill.id}
              className="relative bg-card border border-border rounded-2xl p-5 hover:border-amber-500/30 hover:shadow-sm transition-all group overflow-hidden"
            >
              {i === 0 && (
                <BorderBeam colorFrom="#f59e0b" colorTo="#ea580c" size={60} duration={8} borderWidth={1.5} />
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold ${model.color}`}>
                    {model.label}
                  </span>
                  {skill.creditMultiplier > 1 && (
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">
                      x{skill.creditMultiplier}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-bold text-foreground mb-1">{skill.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{skill.description}</p>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-lg">
                  {CATEGORY_LABELS[skill.category] || skill.category}
                </span>
                {skill.requiresFile && (
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">
                    Dosya gerekli
                  </span>
                )}
                {skill.minPlan !== "free" && (
                  <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-lg">
                    {skill.minPlan}+
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
