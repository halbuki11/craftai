"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Mail, ArrowRight, LoaderIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/context";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useI18n();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-xl shadow-teal-500/20 mb-5">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {t("auth.resetPassword")}
        </h1>
        <p className="text-sm text-white/40 mt-1.5">
          {t("auth.resetDesc")}
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-sm text-emerald-400">{t("auth.resetSent")}</p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("auth.backToLogin")}
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50">{t("auth.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-[#1E1F23] rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 shadow-lg shadow-white/10"
            >
              {loading ? (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t("auth.sendReset")}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("auth.backToLogin")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
