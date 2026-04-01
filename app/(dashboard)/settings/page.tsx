"use client";

import { useEffect, useState } from "react";
import { User, Mail, Calendar, Globe, Shield, Cpu, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function SettingsPage() {
  const { t, locale } = useI18n();
  const [user, setUser] = useState<{ email?: string; created_at?: string } | null>(null);
  const [profile, setProfile] = useState<{ timezone?: string; settings?: { preferred_model?: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setUser({ email: data.user.email, created_at: data.user.created_at });
          supabase.from("profiles").select("timezone, settings").eq("id", data.user.id).single().then(({ data: p }) => {
            setProfile(p);
          });
        }
      }).finally(() => setLoading(false));
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-white/30" />
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white/90">{t("settings.title")}</h1>
        <p className="text-white/50 mt-1">{t("settings.desc")}</p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-colors">
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white/90">{t("settings.accountInfo")}</h2>
                <p className="text-xs text-white/40">{t("settings.accountInfoDesc")}</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 text-white/50">
                <div className="p-1.5 bg-teal-500/10 rounded-lg">
                  <Mail className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-sm font-medium">{t("settings.email")}</span>
              </div>
              <span className="text-sm font-semibold text-white/90">{user.email}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 text-white/50">
                <div className="p-1.5 bg-teal-500/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-sm font-medium">{t("settings.joined")}</span>
              </div>
              <span className="text-sm font-semibold text-white/90">
                {user.created_at ? formatDate(user.created_at) : "—"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5">
              <div className="flex items-center gap-3 text-white/50">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-medium">{t("settings.status")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-emerald-400">{t("settings.active")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timezone */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-colors">
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white/90">{t("settings.timezone")}</h2>
                <p className="text-xs text-white/40">{t("settings.timezoneDesc")}</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm text-white/70">{profile?.timezone || "Europe/Istanbul"}</p>
          </div>
        </div>

        {/* AI Model */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-colors">
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white/90">{t("settings.aiModel")}</h2>
                <p className="text-xs text-white/40">{t("settings.aiModelDesc")}</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm text-white/70 capitalize">{profile?.settings?.preferred_model || "sonnet"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
