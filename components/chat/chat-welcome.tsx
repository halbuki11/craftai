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
  "pen-tool": <PenLine className="w-5 h-5" />,
  "globe": <Globe className="w-5 h-5" />,
  "book-open": <BookOpen className="w-5 h-5" />,
  "map-pin": <MapPin className="w-5 h-5" />,
  "chef-hat": <ChefHat className="w-5 h-5" />,
  "file-text": <FileText className="w-5 h-5" />,
  "scroll": <ScrollText className="w-5 h-5" />,
  "wallet": <Wallet className="w-5 h-5" />,
  "calculator": <Calculator className="w-5 h-5" />,
  "mail": <Mail className="w-5 h-5" />,
  "share-2": <Share2 className="w-5 h-5" />,
  "check-circle": <CheckCircle className="w-5 h-5" />,
  "heart-pulse": <HeartPulse className="w-5 h-5" />,
  "flame": <Flame className="w-5 h-5" />,
  "users": <Users className="w-5 h-5" />,
  "shield": <Shield className="w-5 h-5" />,
  "lightbulb": <Lightbulb className="w-5 h-5" />,
  "message-square": <MessageSquare className="w-5 h-5" />,
  "sparkles": <Code className="w-5 h-5" />,
};

interface Skill {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Top 8 skills shown as big cards, rest as small tags
const TOP_SKILLS = [
  "content-writer", "code-writer", "email-assistant", "research",
  "translator", "social-media", "math-solver", "brainstorm",
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
      .then((data) => setSkills(data.skills || []))
      .catch(() => {});
  }, []);

  const topSkills = TOP_SKILLS.map((id) => skills.find((s) => s.id === id)).filter(Boolean) as Skill[];
  const otherSkills = skills.filter((s) => !TOP_SKILLS.includes(s.id));

  const getSkillName = (skill: Skill) => {
    const key = `skill.${skill.id}` as any;
    const translated = t(key);
    return translated !== key ? translated : skill.title;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Heading */}
          <div className="text-center space-y-3">
            <motion.h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight text-white/95"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {t("welcome.howCanIHelp")}
            </motion.h1>
            <motion.p
              className="text-sm text-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {t("welcome.pickSkill")}
            </motion.p>
          </div>

          {/* Top Skills — big cards */}
          {topSkills.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {topSkills.map((skill, index) => (
                <motion.button
                  key={skill.id}
                  onClick={() => onSuggestionClick(`/${skill.id} `)}
                  className="flex flex-col items-center gap-2.5 p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] hover:border-white/[0.12] rounded-2xl transition-all group"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.04 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] group-hover:bg-white/[0.1] flex items-center justify-center transition-colors">
                    <span className="text-white/40 group-hover:text-white/80 transition-colors">
                      {ICON_MAP[skill.icon] || <MessageSquare className="w-5 h-5" />}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-white/50 group-hover:text-white/90 transition-colors text-center leading-tight">
                    {getSkillName(skill)}
                  </span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Other Skills — small tags */}
          {otherSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex flex-wrap justify-center gap-2"
            >
              {otherSkills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => onSuggestionClick(`/${skill.id} `)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] rounded-full transition-all text-xs text-white/35 hover:text-white/70"
                >
                  {getSkillName(skill)}
                </button>
              ))}
            </motion.div>
          )}

          {/* Or just type */}
          <motion.p
            className="text-center text-xs text-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            {t("welcome.orJustType")}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
