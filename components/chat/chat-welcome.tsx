"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PenLine, Globe, Search, MapPin, ChefHat, FileText, ScrollText,
  Wallet, Calculator, Mail, Share2, BookOpen, CheckCircle, HeartPulse,
  Flame, Users, Shield, Lightbulb, MessageSquare, Code, Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const ICON_MAP: Record<string, React.ReactNode> = {
  "pen-tool": <PenLine className="w-4 h-4" />,
  "globe": <Globe className="w-4 h-4" />,
  "book-open": <BookOpen className="w-4 h-4" />,
  "map-pin": <MapPin className="w-4 h-4" />,
  "chef-hat": <ChefHat className="w-4 h-4" />,
  "file-text": <FileText className="w-4 h-4" />,
  "scroll": <ScrollText className="w-4 h-4" />,
  "wallet": <Wallet className="w-4 h-4" />,
  "calculator": <Calculator className="w-4 h-4" />,
  "mail": <Mail className="w-4 h-4" />,
  "share-2": <Share2 className="w-4 h-4" />,
  "check-circle": <CheckCircle className="w-4 h-4" />,
  "heart-pulse": <HeartPulse className="w-4 h-4" />,
  "flame": <Flame className="w-4 h-4" />,
  "users": <Users className="w-4 h-4" />,
  "shield": <Shield className="w-4 h-4" />,
  "lightbulb": <Lightbulb className="w-4 h-4" />,
  "message-square": <MessageSquare className="w-4 h-4" />,
  "sparkles": <Code className="w-4 h-4" />,
};

interface Skill {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const SUGGESTIONS = [
  { key: "sug.scraper" as const, icon: <Code className="w-4 h-4" /> },
  { key: "sug.email" as const, icon: <Mail className="w-4 h-4" /> },
  { key: "sug.research" as const, icon: <Search className="w-4 h-4" /> },
  { key: "sug.startup" as const, icon: <Lightbulb className="w-4 h-4" /> },
];

interface ChatWelcomeProps {
  onSuggestionClick: (prompt: string) => void;
}

export function ChatWelcome({ onSuggestionClick }: ChatWelcomeProps) {
  const { t } = useI18n();
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => setSkills((data.skills || []).slice(0, 8)))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
      <div className="w-full max-w-xl mx-auto">
        <motion.div
          className="space-y-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Logo + Heading */}
          <div className="text-center space-y-4 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gemini-gradient shadow-lg"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl font-semibold tracking-tight text-white/95"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <span className="text-gemini-gradient">{t("welcome.hello")}</span>
            </motion.h1>
            <motion.h2
              className="text-2xl sm:text-3xl font-medium text-white/40 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t("welcome.howCanIHelp")}
            </motion.h2>
          </div>

          {/* Suggestion cards */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {SUGGESTIONS.map((item, index) => {
              const label = t(item.key);
              return (
                <motion.button
                  key={item.key}
                  onClick={() => onSuggestionClick(label)}
                  className="flex items-start gap-3 p-4 bg-[#1e1f20] hover:bg-white/[0.08] rounded-2xl text-left transition-all group"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <span className="text-white/40 group-hover:text-blue-400 transition-colors mt-0.5 flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors leading-snug">
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="space-y-3"
            >
              <p className="text-[11px] font-medium text-white/20 uppercase tracking-wider text-center">
                {t("welcome.skills")}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {skills.map((skill, index) => (
                  <motion.button
                    key={skill.id}
                    onClick={() => onSuggestionClick(`/${skill.id} `)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] rounded-lg transition-all group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.03 }}
                  >
                    <span className="text-white/25 group-hover:text-white/60 transition-colors">
                      {ICON_MAP[skill.icon] || <MessageSquare className="w-4 h-4" />}
                    </span>
                    <span className="text-[12px] text-white/40 group-hover:text-white/70 transition-colors">
                      {skill.title}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
