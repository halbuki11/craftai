"use client";

import { useEffect, useState } from "react";
import {
  Sparkles, FileText, PenTool, Code, Globe, Zap, GraduationCap, Palette, BookOpen,
  MessageSquare, Mail, Users, Search, Calculator, CheckCircle, Image, BarChart,
  Share2, Shield, Lightbulb, Loader2,
} from "lucide-react";

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
  general: "General",
  analysis: "Analysis",
  writing: "Writing",
  coding: "Coding",
  translation: "Translation",
  productivity: "Productivity",
  education: "Education",
  creative: "Creative",
  research: "Research",
};

const ICON_MAP: Record<string, typeof Sparkles> = {
  sparkles: Sparkles, "message-square": MessageSquare, "file-text": FileText,
  "pen-tool": PenTool, mail: Mail, code: Code, globe: Globe, users: Users,
  "book-open": BookOpen, calculator: Calculator, "check-circle": CheckCircle,
  image: Image, "bar-chart": BarChart, "share-2": Share2, shield: Shield,
  lightbulb: Lightbulb, zap: Zap, "graduation-cap": GraduationCap, palette: Palette,
};

const MODEL_LABELS: Record<string, { label: string; color: string }> = {
  haiku: { label: "Haiku", color: "text-emerald-400" },
  sonnet: { label: "Sonnet", color: "text-violet-400" },
  opus: { label: "Opus", color: "text-indigo-400" },
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
        <Loader2 className="w-8 h-8 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white/90">Skills</h1>
        <p className="text-white/50 mt-1">
          Custom skills the AI assistant can use
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
                ? "bg-white text-[#1E1F23]"
                : "bg-white/[0.05] border border-white/[0.06] text-white/50 hover:text-white/70 hover:border-white/[0.1]"
            }`}
          >
            {cat === "all" ? "All" : CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((skill) => {
          const Icon = ICON_MAP[skill.icon] || Sparkles;
          const model = MODEL_LABELS[skill.defaultModel] || MODEL_LABELS.sonnet;

          return (
            <div
              key={skill.id}
              className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-violet-500/10 rounded-xl">
                  <Icon className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold ${model.color}`}>
                    {model.label}
                  </span>
                  {skill.creditMultiplier > 1 && (
                    <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
                      x{skill.creditMultiplier}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-bold text-white/90 mb-1">{skill.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed mb-3">{skill.description}</p>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg">
                  {CATEGORY_LABELS[skill.category] || skill.category}
                </span>
                {skill.requiresFile && (
                  <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg">
                    File required
                  </span>
                )}
                {skill.minPlan !== "free" && (
                  <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg">
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
